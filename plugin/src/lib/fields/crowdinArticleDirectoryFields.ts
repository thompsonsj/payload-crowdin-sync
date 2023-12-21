import { Field } from "payload/types"
import { PluginOptions, isCollectionOrGlobalConfigObject } from "../types"
import { getCollectionDirectorySlug } from "../api/helpers"

export const crowdinArticleDirectoryFields = ({
  pluginOptions
}:{
  pluginOptions: PluginOptions
}): Field[] => [
  {
    name: "excludeLocales",
    type: "select",
    options: Object.keys(pluginOptions.localeMap),
    hasMany: true,
    admin: {
      description:
        "Select locales to exclude from translation synchronization.",
    },
  },
  {
    name: 'collectionGlobalSlug',
    type: "json",
    access: {
      create: () => false,
      // update: () => false,
    },
    admin: {
      // hidden: true,
      description: 'Determine the collection/global slug from the Crowdin Collection directory.',
    },
    hooks: {
      beforeChange: [async ({ siblingData }) => {
        siblingData["collectionGlobalSlug"] = undefined;
      }],
      afterRead: [async ({ siblingData }) => {
        const slug = await getCollectionDirectorySlug({ crowdinCollectionDirectory: siblingData["crowdinCollectionDirectory"] })
        // Mutate the sibling data to prevent DB storage
        // eslint-disable-next-line no-param-reassign
        siblingData["collectionGlobalSlug"] = undefined;
        return slug
      }],
    },
  },
  {
    name: 'translateOnCrowdin',
    type: 'checkbox',
    admin: {
      condition: (siblingData) => {
        if (!siblingData['collectionGlobalSlug']?.slug) {
          return false
        }

        const matchingConfig = (pluginOptions.globals || []).find(config => {
          if (isCollectionOrGlobalConfigObject(config) && config.slug === siblingData['collectionGlobalSlug'].slug && config.manualDocumentTranslationFlag) {
            return true
          }
          return false
        })

        if (typeof matchingConfig !== 'undefined') {
          return true
        }

        return false
      },
    },
  },
]
