import type { Config } from "payload/config";
import type { PluginOptions } from "./types";
import {
  getAfterChangeHook,
  getGlobalAfterChangeHook,
} from "./hooks/collections/afterChange";
import { getFields } from "./fields/getFields";
import CrowdinFiles from "./collections/CrowdinFiles";
import CrowdinCollectionDirectories from "./collections/CrowdinCollectionDirectories";
import CrowdinArticleDirectories from "./collections/CrowdinArticleDirectories";
import { containsLocalizedFields } from "./utilities";
import { getReviewTranslationEndpoint } from "./endpoints/globals/reviewTranslation";
import Joi from "joi";

/**
 * This plugin extends all collections that contain localized fields
 * by uploading all translation-enabled field content in the default
 * language to Crowdin for translation. Crowdin translations are
 * are synced to fields in all other locales (except the default language).
 *
 **/

export const crowdinSync =
  (pluginOptions: PluginOptions) =>
  (config: Config): Config => {
    const initFunctions: (() => void)[] = [];

    // schema validation
    const schema = Joi.object({
      projectId: Joi.number().required(),

      directoryId: Joi.number(),

      // optional - if not provided, the plugin will not do anything in the afterChange hook.
      token: Joi.string(),

      localeMap: Joi.object().pattern(
        /./,
        Joi.object({
          crowdinId: Joi.string().required(),
        }).pattern(/./, Joi.any()),
      ),

      sourceLocale: Joi.string().required(),
    });

    const validate = schema.validate(pluginOptions);

    if (validate.error) {
      console.log(
        "Payload Crowdin Sync option validation errors:",
        validate.error,
      );
    }

    return {
      ...config,
      admin: {
        ...(config.admin || {}),
      },
      collections: [
        ...(config.collections || []).map((existingCollection) => {
          if (containsLocalizedFields({ fields: existingCollection.fields })) {
            const fields = getFields({
              collection: existingCollection,
            });

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
            };
          }

          return existingCollection;
        }),
        CrowdinFiles,
        CrowdinCollectionDirectories,
        {
          ...CrowdinArticleDirectories,
          fields: [
            ...(CrowdinArticleDirectories.fields || []),
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
          ],
          endpoints: [
            ...(CrowdinArticleDirectories.endpoints || []),
            getReviewTranslationEndpoint({
              pluginOptions,
            }),
            getReviewTranslationEndpoint({
              pluginOptions,
              type: "update",
            }),
          ],
        },
      ],
      globals: [
        ...(config.globals || []).map((existingGlobal) => {
          if (containsLocalizedFields({ fields: existingGlobal.fields })) {
            const fields = getFields({
              collection: existingGlobal,
            });
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
            };
          }

          return existingGlobal;
        }),
      ],
      onInit: async (payload) => {
        initFunctions.forEach((fn) => fn());
        if (config.onInit) await config.onInit(payload);
      },
    };
  };
