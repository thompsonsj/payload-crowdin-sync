import type { Field, TabsField } from "payload/types";
import { updatePayloadTranslation } from "../api/helpers";
import { PluginOptions } from "../types";
import { DocumentCustomUIField } from "./documentUI";

interface Args {
  fields: Field[];
  pluginOptions: PluginOptions;
}

const crowdinArticleDirectoryField: Field = {
  name: "crowdinArticleDirectory",
  type: "relationship",
  relationTo: "crowdin-article-directories",
  hasMany: false,
  /*admin: {
    readOnly: true,
    disabled: true,
  },*/
};

export const pluginCollectionOrGlobalFields = ({
  fields,
  pluginOptions,
}: Args): Field[] => {
  const pluginFields: Field[] = [
    {
      name: 'lastCrowdinSync',
      type: 'ui',
      admin: {
        components: {
          Field: DocumentCustomUIField,
        }
      }
    },
    {
      name: 'syncTranslations',
      type: 'checkbox',
      access: {
        create: () => false,
        // update: () => false,
      },
      admin: {
        description: 'Sync translations for this locale from Crowdin on save draft (stores translations as drafts) or publish (publishes translations).',
      },
      hooks: {
        beforeChange: [async ({ req, siblingData }) => {
          if (siblingData["syncTranslations"] && siblingData["crowdinArticleDirectory"]) {
            // is this a draft?
            const draft = Boolean(siblingData["_status"] && siblingData["_status"] !== 'published')
            const excludeLocales = Object.keys(pluginOptions.localeMap)
            const thisLocaleIndex = req.locale && excludeLocales.indexOf(req.locale)
            if (thisLocaleIndex) {
              excludeLocales.splice(thisLocaleIndex, 1)
            }

            await updatePayloadTranslation({
              articleDirectoryId: typeof siblingData["crowdinArticleDirectory"] === 'string' ? siblingData["crowdinArticleDirectory"] : siblingData["crowdinArticleDirectory"].id,
              pluginOptions,
              payload: req.payload,
              draft,
              excludeLocales,
            })
          }
          // Mutate the sibling data to prevent DB storage
          // eslint-disable-next-line no-param-reassign
          siblingData["syncTranslations"] = undefined;
        }],
      },
    },
    {
      name: 'syncAllTranslations',
      type: 'checkbox',
      access: {
        create: () => false,
        // update: () => false,
      },
      admin: {
        description: 'Sync all translations from Crowdin on save draft (stores translations as drafts) or publish (publishes translations).',
      },
      hooks: {
        beforeChange: [async ({ siblingData, req }) => {
          if (siblingData["syncAllTranslations"] && siblingData["crowdinArticleDirectory"]) {
            // is this a draft?
            const draft = Boolean(siblingData["_status"] && siblingData["_status"] !== 'published')

            await updatePayloadTranslation({
              articleDirectoryId: typeof siblingData["crowdinArticleDirectory"] === 'string' ? siblingData["crowdinArticleDirectory"] : siblingData["crowdinArticleDirectory"].id,
              pluginOptions,
              payload: req.payload,
              draft,
            })
          }
          // Mutate the sibling data to prevent DB storage
          // eslint-disable-next-line no-param-reassign
          siblingData["syncAllTranslations"] = undefined;
        }],
      },
    },
    crowdinArticleDirectoryField,
  ]

  if (pluginOptions.tabbedUI) {
    const pluginTabs: TabsField[] = [
      {
        type: 'tabs',
        tabs: [
          // append a new tab onto the end of the tabs array, if there is one at the first index
          // if needed, create a new `Content` tab in the first index for this collection's base fields
          ...(fields?.[0].type === 'tabs'
            ? fields[0]?.tabs
            : [
                {
                  label: 'Content',
                  fields: [...(fields || [])],
                },
              ]),
          {
            label: 'Crowdin',
            fields: pluginFields,
          },
        ],
      },
    ]
  
    return [
      ...pluginTabs,
      ...(fields?.[0].type === 'tabs' ? fields?.slice(1) : []),
    ]
  }
  
  return [
    ...fields,
    ...pluginFields,
  ]
};

