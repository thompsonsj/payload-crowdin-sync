import type { Config } from 'payload/config'
import type { PluginOptions } from './types'
import { getAfterChangeHook, getGlobalAfterChangeHook } from './hooks/collections/afterChange'
import { getFields } from './fields/getFields'
import CrowdInFiles from './collections/CrowdInFiles'
import CrowdInCollectionDirectories from './collections/CrowdInCollectionDirectories'
import CrowdInArticleDirectories from './collections/CrowdInArticleDirectories'
import { 
  containsLocalizedFields,
  getLocalizedFields,
  isLocalizedField
} from './utilities'

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
    const {
      projectId,
      directoryId,
      localeMap,
      collections: allCollectionOptions
    } = pluginOptions

    const initFunctions: (() => void)[] = []

    return {
      ...config,
      admin: {
        ...(config.admin || {}),
      },
      collections: [
        ...(config.collections || []).map(existingCollection => {

          if (containsLocalizedFields(existingCollection.fields)) {
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
                    projectId: projectId,
                    directoryId: directoryId,
                    collection: existingCollection,
                    localizedFields: getLocalizedFields(existingCollection)
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
      ],
      globals: [
        ...(config.globals || []).map(existingGlobal => {

          if (containsLocalizedFields(existingGlobal.fields)) {
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
                    projectId: projectId,
                    directoryId: directoryId,
                    global: existingGlobal,
                    localizedFields: getLocalizedFields(existingGlobal)
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
