import type { FieldHook, RequestContext } from 'payload';
import { updatePayloadTranslation } from '../api/helpers';
import type { PluginOptions } from '../types';
import { getOtherLocales } from '../utilities/locales';

export type SyncMode = 'current-locale' | 'all-locales';

export const syncFieldNames: Record<SyncMode, string> = {
  'current-locale': 'syncTranslations',
  'all-locales': 'syncAllTranslations',
};

interface SyncRequest {
  articleDirectoryId: string;
  draft: boolean;
  excludeLocales?: string[];
}

const getSyncRequest = (
  mode: SyncMode,
  context: RequestContext,
): SyncRequest | undefined => {
  const { articleDirectoryId, draft, excludeLocales } = context;
  if (
    typeof articleDirectoryId !== 'string' ||
    typeof draft !== 'boolean' ||
    typeof context[syncFieldNames[mode]] !== 'boolean'
  ) {
    return undefined;
  }
  if (mode === 'current-locale') {
    return Array.isArray(excludeLocales)
      ? { articleDirectoryId, draft, excludeLocales }
      : undefined;
  }
  return { articleDirectoryId, draft };
};

/**
 * Store a sync request in `context` for the matching afterChange hook, and
 * clear the checkbox so it is never stored.
 */
export const createSyncBeforeChangeHook =
  (mode: SyncMode, pluginOptions: PluginOptions): FieldHook =>
  async ({ context, req, siblingData }) => {
    if (context.triggerAfterChange === false) {
      return;
    }
    const fieldName = syncFieldNames[mode];
    const articleDirectory = siblingData['crowdinArticleDirectory'];
    if (siblingData[fieldName] && articleDirectory) {
      context['articleDirectoryId'] =
        typeof articleDirectory === 'string'
          ? articleDirectory
          : articleDirectory.id;
      context['draft'] = Boolean(
        siblingData['_status'] && siblingData['_status'] !== 'published',
      );
      if (mode === 'current-locale') {
        context['excludeLocales'] = getOtherLocales({
          locale: `${req.locale}`,
          localeMap: pluginOptions.localeMap,
        });
      }
      context[fieldName] = true;
    }
    siblingData[fieldName] = undefined;
  };

/**
 * Load translations for a sync request stored by the beforeChange hook, either
 * inline or as Payload jobs when `PAYLOAD_CROWDIN_SYNC_USE_JOBS` is set.
 */
export const createSyncAfterChangeHook =
  (mode: SyncMode, pluginOptions: PluginOptions): FieldHook =>
  async ({ context, req }) => {
    if (context.triggerAfterChange === false) {
      return;
    }
    const request = getSyncRequest(mode, context);
    if (!request) {
      return;
    }
    const { articleDirectoryId, draft, excludeLocales } = request;

    if (process.env.PAYLOAD_CROWDIN_SYNC_USE_JOBS) {
      const jobLocaleExclusions =
        mode === 'current-locale'
          ? [excludeLocales]
          : Object.keys(pluginOptions.localeMap).map((locale) =>
              getOtherLocales({ locale, localeMap: pluginOptions.localeMap }),
            );
      for (const jobExcludeLocales of jobLocaleExclusions) {
        await req.payload.jobs.queue({
          task: 'crowdinSyncTranslations',
          input: {
            articleDirectoryId,
            draft,
            excludeLocales: jobExcludeLocales,
            dryRun: false,
          },
        });
      }
      return;
    }

    await updatePayloadTranslation({
      articleDirectoryId,
      pluginOptions,
      payload: req.payload,
      draft,
      ...(excludeLocales && { excludeLocales }),
      dryRun: false,
      req,
    });
  };
