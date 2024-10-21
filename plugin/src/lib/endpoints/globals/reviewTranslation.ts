import { Endpoint } from "payload/config";
import { PluginOptions } from "../../types";
import { updatePayloadTranslation } from "../../api/helpers";

export const getReviewTranslationEndpoint = ({
  pluginOptions,
  type = "review",
}: {
  pluginOptions: PluginOptions;
  type?: "review" | "update";
}): Endpoint => ({
  path: `/:id/${type}`,
  method: "get",
  handler: async (req, res) => {
    const locale = req.query['locale']
    const excludeLocales = locale ? Object.keys(pluginOptions.localeMap || {}).filter(payloadLocale => payloadLocale !== locale) : undefined
    const update = await updatePayloadTranslation({
      articleDirectoryId: req.params['id'],
      pluginOptions,
      payload: req.payload,
      draft: req.query["draft"] === 'true' ? true : false,
      dryRun: type === "update" ? false : true,
      excludeLocales,
    })
    
    res.status(update.status).send(update);
  },
});
