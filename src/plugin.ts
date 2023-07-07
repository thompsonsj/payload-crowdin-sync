import type { Config } from 'payload/config'
import type { PluginOptions } from './types'
import { getAfterChangeHook, getGlobalAfterChangeHook } from './hooks/collections/afterChange'
import { getFields } from './fields/getFields'
import CrowdInFiles from './collections/CrowdInFiles'
import CrowdInCollectionDirectories from './collections/CrowdInCollectionDirectories'
import CrowdInArticleDirectories from './collections/CrowdInArticleDirectories'
import CrowdInGlobalTranslations from './collections/CrowdInTranslations'
import { 
  containsLocalizedFields,
} from './utilities'
import { getReviewTranslationEndpoint } from './endpoints/globals/reviewTranslation'

/**
 * This plugin extends all collections that contain localized fields
 * by uploading all translation-enabled field content in the default
 * language to CrowdIn for translation. CrowdIn translations are
 * are synced to fields in all other locales (except the default language).
 * 
 **/

export const crowdInSync =
  (pluginOptions: PluginOptions) =>
  (config: Config): Config => {
    const initFunctions: (() => void)[] = []

    return {
      ...config,
      admin: {
        ...(config.admin || {}),
      },
      collections: [
        ...(config.collections || []).map(existingCollection => {

          if (containsLocalizedFields({ fields: existingCollection.fields })) {
            const fields = getFields({
              collection: existingCollection,
            })

            return {
              ...existingCollection,
              hooks: {
                ...(existingCollection.hooks || {}),
                afterChange: [
                  ...(existingCollection.hooks?.afterChange || []),
                  getAfterChangeHook({
                    collection: existingCollection,
                    pluginOptions,
                  }),
                ],
              },
              fields,
            }
          }

          return existingCollection
        }),
        CrowdInFiles,
        CrowdInCollectionDirectories,
        CrowdInArticleDirectories,
        {
          ...CrowdInGlobalTranslations,
          fields: [
            ...(CrowdInGlobalTranslations.fields || []),
            {
              name: 'excludeLocales',
              type: 'select',
              options: Object.keys(pluginOptions.localeMap),
              hasMany: true,
              admin: {
                description: 'Select locales to exclude from translation synchronization.',
              }
            },
          ],
          endpoints: [
            ...(CrowdInGlobalTranslations.endpoints || []),
            getReviewTranslationEndpoint(pluginOptions),
            getReviewTranslationEndpoint(pluginOptions, 'update'),
          ],
        },
      ],
      globals: [
        ...(config.globals || []).map(existingGlobal => {

          if (containsLocalizedFields({ fields: existingGlobal.fields })) {
            const fields = getFields({
              collection: existingGlobal,
            })
            return {
              ...existingGlobal,
              hooks: {
                ...(existingGlobal.hooks || {}),
                afterChange: [
                  ...(existingGlobal.hooks?.afterChange || []),
                  getGlobalAfterChangeHook({
                    global: existingGlobal,
                    pluginOptions,
                  }),
                ],
              },
              fields,
            }
          }

          return existingGlobal
        }),
      ],
      onInit: async payload => {
        initFunctions.forEach(fn => fn())
        if (config.onInit) await config.onInit(payload)
      },
    }
  }
