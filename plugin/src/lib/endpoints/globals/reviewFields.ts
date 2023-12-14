import { Endpoint } from "payload/config";
import { PluginOptions } from "../../types";
import { payloadCrowdinSyncTranslationsApi } from "../../api/payload-crowdin-sync/translations";
import { getLocalizedFields } from "../../utilities";

import { CrowdinCollectionDirectory } from "../../payload-types";

export const getReviewFieldsEndpoint = ({
  pluginOptions,
}: {
  pluginOptions: PluginOptions;
}): Endpoint => ({
  path: `/:id/fields`,
  method: "get",
  handler: async (req, res, next) => {
    const articleDirectory = await req.payload.findByID({
      id: req.params.id,
      collection: req.collection?.config.slug as string,
    });
    const global =
      (articleDirectory.crowdinCollectionDirectory as CrowdinCollectionDirectory).collectionSlug === "globals";
    const translationsApi = new payloadCrowdinSyncTranslationsApi(
      pluginOptions,
      req.payload
    );
    try {
      const collectionConfig = await translationsApi.getCollectionConfig(global ? articleDirectory.name : (articleDirectory.crowdinCollectionDirectory as any).collectionSlug, global)
      const response = {
        fields: collectionConfig.fields,
        localizedFields: getLocalizedFields({ fields: collectionConfig.fields })
      }
      res.status(200).send(response);
    } catch (error) {
      res.status(400).send(error);
    }
  },
});
