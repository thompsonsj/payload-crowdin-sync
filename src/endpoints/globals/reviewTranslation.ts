import { Endpoint } from "payload/config";
import { PluginOptions } from "../../types";
import { payloadCrowdinSyncTranslationsApi } from "../../api/payload-crowdin-sync/translations";

export const getReviewTranslationEndpoint = ({
  pluginOptions,
  type = "review",
}: {
  pluginOptions: PluginOptions;
  type?: "review" | "update";
}): Endpoint => ({
  path: `/:id/${type}`,
  method: "get",
  handler: async (req, res, next) => {
    const articleDirectory = await req.payload.findByID({
      id: req.params.id,
      collection: req.collection?.config.slug as string,
    });
    const global =
      (articleDirectory.crowdinCollectionDirectory as any)?.collectionSlug as string === "globals";
    const translationsApi = new payloadCrowdinSyncTranslationsApi(
      pluginOptions,
      req.payload
    );
    try {
      const translations = await translationsApi.updateTranslation({
        documentId: !global ? articleDirectory.name as string : ``,
        collection: global
          ? articleDirectory.name as string
          : (articleDirectory.crowdinCollectionDirectory as any)?.collectionSlug as string,
        global,
        dryRun: type === "update" ? false : true,
        excludeLocales: articleDirectory.excludeLocales as string[] || [],
      });
      res.status(200).send(translations);
    } catch (error) {
      res.status(400).send(error);
    }
  },
});
