import type { Endpoint } from "payload";
import { PluginOptions } from "../../types";
import { payloadCrowdinSyncTranslationsApi } from "../../api/translations";
import { getLocalizedFields } from "../../utilities";

import { CrowdinCollectionDirectory } from "../../payload-types";

export const getReviewFieldsEndpoint = ({
  pluginOptions,
}: {
  pluginOptions: PluginOptions;
}): Endpoint => ({
  path: `/:id/fields`,
  method: "get",
  handler: async (req) => {
    const articleDirectory = await req.payload.findByID({
      id: typeof req.routeParams?.["id"] === 'string' ? req.routeParams?.["id"] : ``,
      collection: "crowdin-article-directories",
    });
    const global =
      (articleDirectory["crowdinCollectionDirectory"] as CrowdinCollectionDirectory).collectionSlug === "globals";
    const translationsApi = new payloadCrowdinSyncTranslationsApi(
      pluginOptions,
      req.payload
    );
    try {
      const collectionConfig = translationsApi.getCollectionConfig(global ? articleDirectory["name"] : (articleDirectory["crowdinCollectionDirectory"] as any).collectionSlug, global)
      const response = {
        fields: collectionConfig.fields,
        localizedFields: getLocalizedFields({ fields: collectionConfig.fields })
      }
      return Response.json(response);
    } catch (error) {
      return Response.error()
    }
  },
});
