import type {
  CollectionAfterChangeHook,
  CollectionConfig,
  Field,
  GlobalConfig,
  GlobalAfterChangeHook,
  PayloadRequest,
  CollectionSlug,
  GlobalSlug,
} from 'payload';
import { PluginOptions } from '../../types.js';
import { getLocalizedFields, isLocalizedField } from '../../utilities/index.js';
import { isCrowdinActive } from '../../api/helpers.js';
import { filesApiByDocument } from '../../api/files/by-document.js';
import { syncDocumentSource } from '../../api/adapters/index.js';

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
    const operation = previousDoc ? 'update' : 'create';
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
  // Allow internal local API calls to suppress re-entry into this hook.
  // This prevents recursive afterChange runs when we do bookkeeping updates
  // (e.g. backfilling polymorphic links on `crowdin-article-directories`) as part of the Crowdin sync flow.
  if ((req as any)?.context?.triggerAfterChange === false) {
    return doc;
  }
  /**
   * Abort if token not set and not in test mode
   */
  if (!pluginOptions.token) {
    return doc;
  }

  const sanitizedCollection = global
    ? req.payload.globals.config.find(
        (config) => config.slug === collection.slug,
      )
    : req.payload.collections[collection.slug].config;

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
    pluginOptions,
  });

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
   * Initialize Crowdin client sourceFilesApi
   */
  const apiByDocument = new filesApiByDocument({
    document: doc,
    collectionSlug: sanitizedCollection.slug as CollectionSlug | GlobalSlug,
    global,
    pluginOptions,
    req: req,
  });
  const filesApi = await apiByDocument.get();

  await syncDocumentSource({
    writer: {
      writeJson: (args) => filesApi.createOrUpdateJsonFile(args),
      writeHtml: (args) => filesApi.createOrUpdateHtmlFile(args),
      deleteHtml: (args) => filesApi.deleteHtmlFile(args),
    },
    collection: sanitizedCollection,
    fields: localizedFields,
    doc,
    previousDoc,
    alwaysUpdate: process.env['PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE'] === 'true',
    isLocalized: isLocalizedField,
  });

  return doc;
};
