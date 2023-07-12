import { Endpoint } from "payload/config";
import { GlobalConfig, CollectionConfig, SanitizedCollectionConfig, SanitizedGlobalConfig } from "payload/types";
import { PluginOptions } from "../../types";
import { buildCrowdinJsonObject, getLocalizedFields } from "../../utilities";

export const getReviewFieldsEndpoint = ({
  pluginOptions,
  type = "fields",
}: {
  pluginOptions: PluginOptions;
  type?: "fields" | "json";
}): Endpoint => ({
  path: `/:id/${type}`,
  method: "get",
  handler: async (req, res, next) => {
    const articleDirectory = await req.payload.findByID({
      id: req.params.id,
      collection: req.collection?.config.slug as string,
    });
    const global =
      articleDirectory.crowdinCollectionDirectory.collectionSlug === "globals";
    let collectionConfig:
      | SanitizedGlobalConfig
      | SanitizedCollectionConfig
      | undefined;
    if (global) {
      collectionConfig = req.payload.config.globals.find(
        (col: GlobalConfig) => col.slug === articleDirectory.name,
      );
    } else {
      collectionConfig = req.payload.config.collections.find(
        (col: CollectionConfig) => col.slug === articleDirectory.crowdinCollectionDirectory.collectionSlug,
      );
    }
    if (!collectionConfig)
      throw new Error(`Collection not found in payload config`);

    let document: any;
    if (global) {
      document = await req.payload.findGlobal({
        slug: articleDirectory.name,
        locale: req.params.locale,
      });
    } else {
      document = await req.payload.findByID({
        collection: articleDirectory.crowdinCollectionDirectory.collectionSlug,
        id: articleDirectory.name,
        locale: req.params.locale,
      });
    }
    const fields = getLocalizedFields({ fields: collectionConfig.fields })
    //try {
    if (type === "fields") {
      res.status(200).send(fields);
    } else {
      const translations = buildCrowdinJsonObject({
        doc: document,
        fields,
      });
      res.status(200).send(translations);
    }
    //} catch (error) {
      //res.status(400).send(error);
   // }
  },
});
