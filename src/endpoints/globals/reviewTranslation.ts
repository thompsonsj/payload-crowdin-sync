import { Endpoint } from 'payload/config'
import { PluginOptions } from '../../types'
import { payloadCrowdInSyncTranslationsApi } from '../../api/payload-crowdin-sync/translations'

export const getReviewTranslationEndpoint = ({
  pluginOptions,
  global = false,
  type = 'review',
}: {pluginOptions: PluginOptions, global?: boolean, type?: 'review' | 'update'}): Endpoint => ({
  path: `/:id/${type}`,
  method: "get",
  handler: async (req, res, next) => {
    const translation = await req.payload.findByID({
      id: req.params.id,
      collection: req.collection?.config.slug as string,
    })
    const translationsApi = new payloadCrowdInSyncTranslationsApi(
      pluginOptions,
      req.payload,
    )
    try {
      const translations = await translationsApi.updateTranslation({
        documentId: !global && translation.documentId,
        collection: global ? translation.slug as string : translation.collection as string,
        global,
        dryRun: type === 'update' ? false : true,
        excludeLocales: translation.excludeLocales || [],
      })
      res.status(200).send(translations);
    } catch (error) {
      res.status(400).send(error);
    }
  },
})
