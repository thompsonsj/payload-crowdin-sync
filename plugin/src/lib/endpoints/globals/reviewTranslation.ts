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
    const update = await updatePayloadTranslation({
      articleDirectoryId: req.params['id'],
      pluginOptions,
      payload: req.payload,
      draft: req.query["draft"] === 'true' ? true : false,
      dryRun: type === "update" ? false : true,
    })
    
    res.status(update.status).send(update);
  },
});
