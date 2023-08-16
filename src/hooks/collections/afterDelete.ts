import { CollectionAfterDeleteHook } from "payload/types";
import { payloadCrowdinSyncFilesApi } from "../../api/payload-crowdin-sync/files";
import { PluginOptions } from "../../types";

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
  }) => {
    /**
     * Abort if token not set and not in test mode
     */
    if (!pluginOptions.token && process.env.NODE_ENV !== "test") {
      return doc;
    }

    /**
     * Initialize Crowdin client sourceFilesApi
     */
    const filesApi = new payloadCrowdinSyncFilesApi(pluginOptions, req.payload);

    const files = await filesApi.getFilesByDocumentID(`${id}`);

    for (const file of files) {
      await filesApi.deleteFile(file);
    }
  };
