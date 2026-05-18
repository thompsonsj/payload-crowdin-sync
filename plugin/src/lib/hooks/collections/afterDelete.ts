import type {
  CollectionAfterDeleteHook,
  CollectionConfig,
  CollectionSlug,
  GlobalSlug,
} from 'payload';
import { PluginOptions } from '../../types';
import { filesApiByDocument } from '../../api/files/by-document';
import { isCrowdinActive } from '../../api/helpers';
import { getLocalizedFields } from '../../utilities';

interface CommonArgs {
  pluginOptions: PluginOptions;
}

interface Args extends CommonArgs {
  collection: CollectionConfig;
}

export const getAfterDeleteHook =
  ({ collection, pluginOptions }: Args): CollectionAfterDeleteHook =>
  async ({
    req, // full express request
    doc, // deleted document
    collection: collectionFromHook,
  }) => {
    /**
     * Abort if token not set and not in test mode
     */
    if (!pluginOptions.token && process.env['NODE_ENV'] !== 'test') {
      return doc;
    }

    const sanitizedCollection =
      req.payload.collections[collection.slug]?.config ??
      collectionFromHook;

    if (!sanitizedCollection) {
      return doc;
    }

    /**
     * Abort if a document condition has been set and returns false
     */
    const active = isCrowdinActive({
      doc,
      slug: sanitizedCollection.slug,
      global: false,
      pluginOptions,
    });

    if (!active) {
      return doc;
    }

    const localizedFields = getLocalizedFields({
      fields: sanitizedCollection.fields,
    });

    if (localizedFields.length === 0) {
      return doc;
    }

    /**
     * Delete Crowdin assets only when an article directory already exists.
     * Do not create directories on delete (orphaned refs must not block deletion).
     */
    const global = false;
    const apiByDocument = new filesApiByDocument({
      document: doc,
      collectionSlug: sanitizedCollection.slug as CollectionSlug | GlobalSlug,
      global,
      pluginOptions,
      req: req,
    });

    await apiByDocument.deleteCrowdinAssetsIfPresent();
    return doc;
  };
