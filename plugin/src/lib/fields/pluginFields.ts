import type { Field, TabsField } from "payload";
import { updatePayloadTranslation } from "../api/helpers";
import { PluginOptions } from "../types";
// import { DocumentCustomUIField } from "./documentUI";
import { getOtherLocales } from "../utilities/locales";

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
    /**
    {
      name: 'lastCrowdinSync',
      type: 'ui',
      admin: {
        components: {
          Field: '',
        }
      }
    },
    */
    {
      name: 'syncTranslations',
      type: 'checkbox',
      access: {
        create: () => false,
        // update: () => false,
      },
      admin: {
        description: 'Sync translations for this locale from Crowdin on save draft (stores translations as drafts) or publish (publishes translations).',
        condition: (data) => {
          return Boolean(data['crowdinArticleDirectory'])
        },
      },
      hooks: {
        beforeChange: [async ({ context, req, siblingData }) => {
          if (siblingData["syncTranslations"] && siblingData["crowdinArticleDirectory"]) {
            // is this a draft?
            const draft = Boolean(siblingData["_status"] && siblingData["_status"] !== 'published')
            const excludeLocales = getOtherLocales({
              locale: `${req.locale}`,
              localeMap: pluginOptions.localeMap
            })
            context['articleDirectoryId'] = typeof siblingData["crowdinArticleDirectory"] === 'string' ? siblingData["crowdinArticleDirectory"] : siblingData["crowdinArticleDirectory"].id
            context['draft'] = draft
            context['excludeLocales'] = excludeLocales
            context["syncTranslations"] = true
          }
          // Mutate the sibling data to prevent DB storage
          // eslint-disable-next-line no-param-reassign
          siblingData["syncTranslations"] = undefined;
        }],
        afterChange: [async ({ context, req }) => {
          // type check context, if valid we can safely assume translation updates are desired
          if (typeof context['articleDirectoryId'] === 'string' && typeof context['draft'] === 'boolean' && Array.isArray(context['excludeLocales']) && typeof context["syncTranslations"] === 'boolean') {
            if (process.env.PAYLOAD_CROWDIN_SYNC_USE_JOBS) {
              await req.payload.jobs.queue({
                task: 'crowdinSyncTranslations',
                input: {
                  articleDirectoryId: context['articleDirectoryId'],
                  draft: context['draft'],
                  excludeLocales: context['excludeLocales'],
                  dryRun: false,
                },
              })
            } else {
              await updatePayloadTranslation({
                articleDirectoryId: context['articleDirectoryId'],
                pluginOptions,
                payload: req.payload,
                draft: context['draft'],
                excludeLocales: context['excludeLocales'],
                dryRun: false,
                req,
              })
            }
          }
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
        condition: (data) => {
          return Boolean(data['crowdinArticleDirectory'])
        },
      },
      hooks: {
        beforeChange: [async ({ context, siblingData }) => {
          if (siblingData["syncAllTranslations"] && siblingData["crowdinArticleDirectory"]) {
            // is this a draft?
            const draft = Boolean(siblingData["_status"] && siblingData["_status"] !== 'published')

            context['articleDirectoryId'] = typeof siblingData["crowdinArticleDirectory"] === 'string' ? siblingData["crowdinArticleDirectory"] : siblingData["crowdinArticleDirectory"].id
            context['draft'] = draft
            context["syncAllTranslations"] = true
          }
          // Mutate the sibling data to prevent DB storage
          // eslint-disable-next-line no-param-reassign
          siblingData["syncAllTranslations"] = undefined;
        }],
        afterChange: [async ({ context, req }) => {
          // type check context, if valid we can safely assume translation updates are desired
          if (typeof context['articleDirectoryId'] === 'string' && typeof context['draft'] === 'boolean' && typeof context["syncAllTranslations"] === 'boolean') {
            if (process.env.PAYLOAD_CROWDIN_SYNC_USE_JOBS) {
              // create seperate tasks
              for (const locale of Object.keys(pluginOptions.localeMap)) {
                const excludeLocales = getOtherLocales({
                  locale,
                  localeMap: pluginOptions.localeMap
                })
                await req.payload.jobs.queue({
                  task: 'crowdinSyncTranslations',
                  input: {
                    articleDirectoryId: context['articleDirectoryId'],
                    excludeLocales,
                    draft: context['draft'],
                    dryRun: false,
                  },
                })
              }
            } else {
              await updatePayloadTranslation({
                articleDirectoryId: context['articleDirectoryId'],
                pluginOptions,
                payload: req.payload,
                draft: context['draft'],
                dryRun: false,
                req,
              })
            }
          }
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

