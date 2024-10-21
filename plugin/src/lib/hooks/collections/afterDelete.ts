import { CollectionAfterDeleteHook } from "payload/types";
import { payloadCrowdinSyncFilesApi } from "../../api/payload-crowdin-sync/files";
import { PluginOptions } from "../../types";
import { filesApiByDocument } from "../../api/payload-crowdin-sync/files/by-document";
import { Config } from "payload/config";

interface CommonArgs {
  pluginOptions: PluginOptions;
}

interface Args extends CommonArgs {}

export const getAfterDeleteHook =
  ({ pluginOptions }: Args): CollectionAfterDeleteHook =>
  async ({
    req, // full express request
    id, // id of document to delete
    doc, // deleted document
    collection,
  }) => {
    /**
     * Abort if token not set and not in test mode
     */
    if (!pluginOptions.token && process.env['NODE_ENV'] !== "test") {
      return doc;
    }

    /**
     * Initialize Crowdin client sourceFilesApi
     */
    const global = false; // delete only on collections by nature.
    const apiByDocument = new filesApiByDocument(
      {
        document: doc,
        collectionSlug: collection.slug as keyof Config['collections'] | keyof Config['globals'],
        global,
        pluginOptions,
        req: req
      },
    );
    const filesApi = await apiByDocument.get()

    await filesApi.deleteFilesAndDirectory();
  };
