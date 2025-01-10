import type { Endpoint } from "payload";
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
  handler: async (req) => {
    const locale = req.query['locale']
    const excludeLocales = locale ? Object.keys(pluginOptions.localeMap || {}).filter(payloadLocale => payloadLocale !== locale) : undefined
    const update = await updatePayloadTranslation({
      articleDirectoryId: typeof req.routeParams?.['id'] === 'string' ? req.routeParams['id'] : '',
      pluginOptions,
      payload: req.payload,
      draft: req.query["draft"] === 'true' ? true : false,
      dryRun: type === "update" ? false : true,
      excludeLocales,
    })
    
    return Response.json(update);
  },
});
