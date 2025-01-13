import type {
  CollectionAfterChangeHook,
  CollectionConfig,
  Field,
  GlobalConfig,
  GlobalAfterChangeHook,
  PayloadRequest,
  CollectionSlug,
  GlobalSlug,
} from "payload";
import { Descendant } from "slate";
import { PluginOptions } from "../../types";
import {
  buildCrowdinHtmlObject,
  buildCrowdinJsonObject,
  fieldChanged,
} from "../../utilities";
import deepEqual from "deep-equal";
import { getLocalizedFields } from "../../utilities";
import {
  isCrowdinActive,
} from "../../api/helpers";
import { filesApiByDocument } from "../../api/files/by-document";

/**
 * Update Crowdin collections and make updates in Crowdin
 *
 * This functionality used to be split into field hooks.
 * However, it is more reliable to loop through localized
 * fields and perform opeerations in one place. The
 * asynchronous nature of operations means that
 * we need to be careful updates are not made sooner than
 * expected.
 */

interface CommonArgs {
  pluginOptions: PluginOptions;
}

interface Args extends CommonArgs {
  collection: CollectionConfig;
}

interface GlobalArgs extends CommonArgs {
  global: GlobalConfig;
}

export const getGlobalAfterChangeHook =
  ({ global, pluginOptions }: GlobalArgs): GlobalAfterChangeHook =>
  async ({
    doc, // full document data
    previousDoc, // document data before updating the collection
    req, // full express request
  }) => {
    const operation = previousDoc ? "update" : "create";
    return performAfterChange({
      doc,
      req,
      previousDoc,
      operation,
      collection: global,
      global: true,
      pluginOptions,
    });
  };

export const getAfterChangeHook =
  ({ collection, pluginOptions }: Args): CollectionAfterChangeHook =>
  async ({
    doc, // full document data
    req, // full express request
    previousDoc, // document data before updating the collection
    operation, // name of the operation ie. 'create', 'update'
  }) => {
    return performAfterChange({
      doc,
      req,
      previousDoc,
      operation,
      collection,
      pluginOptions,
    });
  };

interface IPerformChange {
  doc: any;
  req: PayloadRequest;
  previousDoc: any;
  operation: string;
  collection: CollectionConfig | GlobalConfig;
  global?: boolean;
  pluginOptions: PluginOptions;
}

const performAfterChange = async ({
  doc, // full document data
  req, // full express request
  previousDoc,
  operation,
  collection,
  global = false,
  pluginOptions,
}: IPerformChange) => {
  /**
   * Abort if token not set and not in test mode
   */
  if (!pluginOptions.token) {
    return doc;
  }

  const sanitizedCollection = global ? req.payload.globals.config.find(config => config.slug === collection.slug) : req.payload.collections[collection.slug].config

  if (!sanitizedCollection) {
    return doc;
  }

  /**
   * Abort if a document condition has been set and returns false
   */
  const active = isCrowdinActive({
    doc,
    slug: sanitizedCollection.slug,
    global,
    pluginOptions
  })

  if (!active) {
    return doc;
  }

  const localizedFields: Field[] = getLocalizedFields({
    fields: sanitizedCollection.fields,
  });

  /**
   * Abort if there are no fields to localize
   */
  if (localizedFields.length === 0) {
    return doc;
  }

  /**
   * Abort if locale is unavailable or this
   * is an update from the API to the source
   * locale.
   */
  if (!req.locale || req.locale !== pluginOptions.sourceLocale) {
    return doc;
  }

  /**
   * Prepare JSON objects
   *
   * `text` fields are compiled into a single JSON file
   * on Crowdin. Prepare previous and current objects.
   */
  const currentCrowdinJsonData = buildCrowdinJsonObject({
    doc,
    fields: localizedFields,
  });
  const prevCrowdinJsonData = buildCrowdinJsonObject({
    doc: previousDoc,
    fields: localizedFields,
  });

  /**
   * Initialize Crowdin client sourceFilesApi
   */
  const apiByDocument = new filesApiByDocument(
    {
      document: doc,
      collectionSlug: sanitizedCollection.slug as CollectionSlug | GlobalSlug,
      global,
      pluginOptions,
      req: req
    },
  );
  const filesApi = await apiByDocument.get()

  // START: function definitions

  const createOrUpdateJsonSource = async () => {
    if (
      (!deepEqual(currentCrowdinJsonData, prevCrowdinJsonData) &&
        Object.keys(currentCrowdinJsonData).length !== 0) ||
      process.env['PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE'] === "true"
    ) {
      await filesApi.createOrUpdateJsonFile({
        fileData: currentCrowdinJsonData
      });
    }
  };

  /**
   * Recursively send rich text fields to Crowdin as HTML
   *
   * Name these HTML files with dot notation. Examples:
   *
   * * `localizedRichTextField`
   * * `groupField.localizedRichTextField`
   * * `arrayField[0].localizedRichTextField`
   * * `arrayField[1].localizedRichTextField`
   */
  const createOrUpdateHtmlSource = async () => {
    const currentCrowdinHtmlData = buildCrowdinHtmlObject({
      doc,
      fields: localizedFields,
    });
    const prevCrowdinHtmlData = buildCrowdinHtmlObject({
      doc: previousDoc,
      fields: localizedFields,
    });
    await Promise.allSettled(Object.keys(currentCrowdinHtmlData).map(async (name) => {
      const currentValue = currentCrowdinHtmlData[name];
      const prevValue = prevCrowdinHtmlData[name];
      if (
        !fieldChanged(prevValue, currentValue, "richText") &&
        process.env['PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE'] !== "true"
      ) {
        return;
      }
      await filesApi.createOrUpdateHtmlFile({
        name,
        value: currentValue as Descendant[],
        collection: sanitizedCollection,
      });
    }));
  };
  // END: function definitions

  await createOrUpdateJsonSource();
  await createOrUpdateHtmlSource();

  return doc;
};
