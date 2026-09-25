import type { Field, TabsField } from 'payload';
import { PluginOptions } from '../types';
// import { DocumentCustomUIField } from "./documentUI";
import {
  createSyncAfterChangeHook,
  createSyncBeforeChangeHook,
  syncFieldNames,
} from './syncTranslationHooks';

interface Args {
  fields: Field[];
  pluginOptions: PluginOptions;
}

const crowdinArticleDirectoryField: Field = {
  name: 'crowdinArticleDirectory',
  type: 'relationship',
  relationTo: 'crowdin-article-directories',
  hasMany: false,
  /*admin: {
    readOnly: true,
    disabled: true,
  },*/
  hooks: {
    // ensure crowdinArticleDirectory is not copied to a duplicated document
    beforeDuplicate: [() => null],
    beforeChange: [
      ({ siblingData }) => {
        // ensures data is not stored in DB
        delete siblingData['crowdinArticleDirectory'];
      },
    ],
    afterRead: [
      async ({ data, req, global, collection }) => {
        if (!data?.id) {
          return;
        }

        // If this read happens during an internal bookkeeping update, skip the lookup.
        if ((req as any)?.context?.triggerAfterChange === false) {
          return;
        }

        // If already present (populated), short-circuit.
        const existing = (data as any)?.crowdinArticleDirectory;
        if (existing && typeof existing === 'object') {
          return existing;
        }

        // Request-scoped memoization to avoid repeated DB round-trips per document.
        const slugKey = collection?.slug || global?.slug;
        if (!slugKey) {
          return;
        }
        const cacheKey = `${slugKey}:${data.id}`;
        const ctx = ((req as any).context ||= {});
        const cache: Record<string, any> =
          (ctx._crowdinArticleDirectoryCache ||= {});
        if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
          return cache[cacheKey];
        }

        let result;
        if (global?.slug) {
          result = await req.payload.find({
            collection: 'crowdin-article-directories',
            where: {
              globalSlug: { equals: global.slug },
            },
            req,
            overrideAccess: true,
          });

          // Backwards compatibility: some installs link global root directories by `name`
          // rather than `globalSlug`.
          if (result.totalDocs === 0) {
            result = await req.payload.find({
              collection: 'crowdin-article-directories',
              where: {
                name: { equals: global.slug },
              },
              limit: 1,
              req,
              overrideAccess: true,
            });
          }
        } else if (collection?.slug) {
          result = await req.payload.find({
            collection: 'crowdin-article-directories',
            where: {
              'collectionDocument.value': { equals: data.id },
              'collectionDocument.relationTo': { equals: collection.slug },
            },
            req,
            overrideAccess: true,
          });

          // Backwards compatibility: some installs still link root directories by `name`
          // plus `crowdinCollectionDirectory` instead of `collectionDocument`.
          if (result.totalDocs === 0) {
            const collectionDirectory = await req.payload.find({
              collection: 'crowdin-collection-directories',
              where: {
                collectionSlug: { equals: collection.slug },
              },
              limit: 1,
              req,
              overrideAccess: true,
            });
            const collectionDirectoryId = collectionDirectory.docs[0]?.id;
            if (collectionDirectoryId) {
              result = await req.payload.find({
                collection: 'crowdin-article-directories',
                where: {
                  and: [
                    { name: { equals: data.id } },
                    {
                      crowdinCollectionDirectory: {
                        equals: collectionDirectoryId,
                      },
                    },
                  ],
                },
                limit: 1,
                req,
                overrideAccess: true,
              });
            }
          }
        } else {
          // Without a collection/global slug we cannot safely resolve a polymorphic link.
          // Avoid a loose lookup by value that could collide across collections.
          return;
        }
        const resolved = result?.totalDocs > 0 ? result.docs[0] : undefined;
        cache[cacheKey] = resolved;
        return resolved;
      },
    ],
  },
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
      name: syncFieldNames['current-locale'],
      type: 'checkbox',
      access: {
        create: () => false,
        // update: () => false,
      },
      admin: {
        description:
          'Sync translations for this locale from Crowdin on save draft (stores translations as drafts) or publish (publishes translations).',
        condition: (data) => {
          return Boolean(data['crowdinArticleDirectory']);
        },
      },
      hooks: {
        beforeChange: [
          createSyncBeforeChangeHook('current-locale', pluginOptions),
        ],
        afterChange: [
          createSyncAfterChangeHook('current-locale', pluginOptions),
        ],
      },
    },
    {
      name: syncFieldNames['all-locales'],
      type: 'checkbox',
      access: {
        create: () => false,
        // update: () => false,
      },
      admin: {
        description:
          'Sync all translations from Crowdin on save draft (stores translations as drafts) or publish (publishes translations).',
        condition: (data) => {
          return Boolean(data['crowdinArticleDirectory']);
        },
      },
      hooks: {
        beforeChange: [
          createSyncBeforeChangeHook('all-locales', pluginOptions),
        ],
        afterChange: [createSyncAfterChangeHook('all-locales', pluginOptions)],
      },
    },
    crowdinArticleDirectoryField,
  ];

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
    ];

    return [
      ...pluginTabs,
      ...(fields?.[0].type === 'tabs' ? fields?.slice(1) : []),
    ];
  }

  return [...fields, ...pluginFields];
};
