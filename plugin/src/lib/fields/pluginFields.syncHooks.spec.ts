import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pluginCollectionOrGlobalFields } from './pluginFields';
import { updatePayloadTranslation } from '../api/helpers';
import type { PluginOptions } from '../types';

vi.mock('../api/helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/helpers')>();
  return {
    ...actual,
    updatePayloadTranslation: vi.fn(),
  };
});

const pluginOptions = {
  projectId: 123,
  token: 'fake-token',
  organization: '',
  localeMap: {
    de_DE: { crowdinId: 'de' },
    fr_FR: { crowdinId: 'fr' },
    es_ES: { crowdinId: 'es' },
  },
  sourceLocale: 'en',
} as unknown as PluginOptions;

type SyncFieldName = 'syncTranslations' | 'syncAllTranslations';

const getHooks = (name: SyncFieldName) => {
  const fields = pluginCollectionOrGlobalFields({ fields: [], pluginOptions });
  const field = fields.find((f) => (f as any).name === name) as any;
  expect(field).toBeTruthy();
  const beforeChange = field.hooks.beforeChange[0] as (args: any) => unknown;
  const afterChange = field.hooks.afterChange[0] as (
    args: any,
  ) => Promise<unknown>;
  return { beforeChange, afterChange };
};

const makeReq = (locale = 'de_DE') => ({
  locale,
  payload: { jobs: { queue: vi.fn() } },
});

describe('pluginFields - sync checkbox visibility', () => {
  const getCondition = (
    name: SyncFieldName,
    args: Parameters<typeof pluginCollectionOrGlobalFields>[0],
  ) => {
    const fields = pluginCollectionOrGlobalFields(args);
    const field = fields.find((f) => (f as any).name === name) as any;
    expect(field).toBeTruthy();
    return field.admin.condition as (data: Record<string, unknown>) => boolean;
  };

  it('hides the checkboxes when the collection condition is false', () => {
    const condition = getCondition('syncTranslations', {
      fields: [],
      pluginOptions: {
        ...pluginOptions,
        collections: [
          {
            slug: 'localized-posts',
            condition: ({ doc }) => Boolean(doc.translateWithCrowdin),
          },
        ],
      },
      slug: 'localized-posts',
    });

    expect(
      condition({
        crowdinArticleDirectory: 'ad-1',
        translateWithCrowdin: false,
      }),
    ).toBe(false);
    expect(
      condition({
        crowdinArticleDirectory: 'ad-1',
        translateWithCrowdin: true,
      }),
    ).toBe(true);
    expect(condition({ translateWithCrowdin: true })).toBe(false);
  });

  it('applies the same visibility to sync all translations', () => {
    const condition = getCondition('syncAllTranslations', {
      fields: [],
      pluginOptions: {
        ...pluginOptions,
        collections: [
          {
            slug: 'localized-posts',
            condition: ({ doc }) => Boolean(doc.translateWithCrowdin),
          },
        ],
      },
      slug: 'localized-posts',
    });

    expect(
      condition({
        crowdinArticleDirectory: 'ad-1',
        translateWithCrowdin: false,
      }),
    ).toBe(false);
  });

  it('hides the checkboxes when the global condition is false', () => {
    const condition = getCondition('syncTranslations', {
      fields: [],
      pluginOptions: {
        ...pluginOptions,
        globals: [
          {
            slug: 'nav',
            condition: ({ doc }) => Boolean(doc.translateWithCrowdin),
          },
        ],
      },
      slug: 'nav',
      global: true,
    });

    expect(
      condition({
        crowdinArticleDirectory: 'ad-1',
        translateWithCrowdin: false,
      }),
    ).toBe(false);
    expect(
      condition({
        crowdinArticleDirectory: 'ad-1',
        translateWithCrowdin: true,
      }),
    ).toBe(true);
  });

  it('hides the checkboxes for a global omitted from the globals allowlist', () => {
    const condition = getCondition('syncTranslations', {
      fields: [],
      pluginOptions: {
        ...pluginOptions,
        globals: ['footer'],
        collections: ['nav'],
      },
      slug: 'nav',
      global: true,
    });

    expect(
      condition({
        crowdinArticleDirectory: 'ad-1',
      }),
    ).toBe(false);
  });

  it('only requires an article directory when no slug is passed', () => {
    const condition = getCondition('syncTranslations', {
      fields: [],
      pluginOptions,
    });

    expect(condition({ crowdinArticleDirectory: 'ad-1' })).toBe(true);
    expect(condition({})).toBe(false);
  });
});

describe('pluginFields - sync translation hooks', () => {
  beforeEach(() => {
    vi.mocked(updatePayloadTranslation).mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('syncTranslations beforeChange', () => {
    const { beforeChange } = getHooks('syncTranslations');

    it('stores the sync request for the current locale in context and clears the checkbox', async () => {
      const context: Record<string, unknown> = {};
      const siblingData = {
        syncTranslations: true,
        crowdinArticleDirectory: 'ad-1',
        _status: 'draft',
      };

      await beforeChange({ context, req: makeReq('de_DE'), siblingData });

      expect(context).toEqual({
        articleDirectoryId: 'ad-1',
        draft: true,
        excludeLocales: ['fr_FR', 'es_ES'],
        syncTranslations: true,
      });
      expect(siblingData.syncTranslations).toBeUndefined();
    });

    it('uses the id of a populated article directory', async () => {
      const context: Record<string, unknown> = {};

      await beforeChange({
        context,
        req: makeReq(),
        siblingData: {
          syncTranslations: true,
          crowdinArticleDirectory: { id: 'ad-2' },
        },
      });

      expect(context['articleDirectoryId']).toBe('ad-2');
    });

    it('stores an unpopulated numeric article directory id (SQL adapters)', async () => {
      const context: Record<string, unknown> = {};

      await beforeChange({
        context,
        req: makeReq(),
        siblingData: {
          syncTranslations: true,
          crowdinArticleDirectory: 42,
        },
      });

      expect(context['articleDirectoryId']).toBe(42);
    });

    it('stores the numeric id of a populated article directory (SQL adapters)', async () => {
      const context: Record<string, unknown> = {};

      await beforeChange({
        context,
        req: makeReq(),
        siblingData: {
          syncTranslations: true,
          crowdinArticleDirectory: { id: 42 },
        },
      });

      expect(context['articleDirectoryId']).toBe(42);
    });

    it('treats published and unversioned documents as not draft', async () => {
      const published: Record<string, unknown> = {};
      const unversioned: Record<string, unknown> = {};

      await beforeChange({
        context: published,
        req: makeReq(),
        siblingData: {
          syncTranslations: true,
          crowdinArticleDirectory: 'ad-1',
          _status: 'published',
        },
      });
      await beforeChange({
        context: unversioned,
        req: makeReq(),
        siblingData: {
          syncTranslations: true,
          crowdinArticleDirectory: 'ad-1',
        },
      });

      expect(published['draft']).toBe(false);
      expect(unversioned['draft']).toBe(false);
    });

    it('does not store a sync request without an article directory, but still clears the checkbox', async () => {
      const context: Record<string, unknown> = {};
      const siblingData = { syncTranslations: true };

      await beforeChange({ context, req: makeReq(), siblingData });

      expect(context).toEqual({});
      expect(siblingData.syncTranslations).toBeUndefined();
    });

    it('does nothing when triggerAfterChange is false', async () => {
      const context: Record<string, unknown> = { triggerAfterChange: false };
      const siblingData = {
        syncTranslations: true,
        crowdinArticleDirectory: 'ad-1',
      };

      await beforeChange({ context, req: makeReq(), siblingData });

      expect(context).toEqual({ triggerAfterChange: false });
      expect(siblingData.syncTranslations).toBe(true);
    });
  });

  describe('syncAllTranslations beforeChange', () => {
    const { beforeChange } = getHooks('syncAllTranslations');

    it('stores the sync request for all locales in context and clears the checkbox', async () => {
      const context: Record<string, unknown> = {};
      const siblingData = {
        syncAllTranslations: true,
        crowdinArticleDirectory: 'ad-1',
        _status: 'draft',
      };

      await beforeChange({ context, req: makeReq(), siblingData });

      expect(context).toEqual({
        articleDirectoryId: 'ad-1',
        draft: true,
        syncAllTranslations: true,
      });
      expect(siblingData.syncAllTranslations).toBeUndefined();
    });

    it('uses the id of a populated article directory', async () => {
      const context: Record<string, unknown> = {};

      await beforeChange({
        context,
        req: makeReq(),
        siblingData: {
          syncAllTranslations: true,
          crowdinArticleDirectory: { id: 'ad-2' },
          _status: 'published',
        },
      });

      expect(context['articleDirectoryId']).toBe('ad-2');
      expect(context['draft']).toBe(false);
    });

    it('does not store a sync request without an article directory, but still clears the checkbox', async () => {
      const context: Record<string, unknown> = {};
      const siblingData = { syncAllTranslations: true };

      await beforeChange({ context, req: makeReq(), siblingData });

      expect(context).toEqual({});
      expect(siblingData.syncAllTranslations).toBeUndefined();
    });

    it('does nothing when triggerAfterChange is false', async () => {
      const context: Record<string, unknown> = { triggerAfterChange: false };
      const siblingData = {
        syncAllTranslations: true,
        crowdinArticleDirectory: 'ad-1',
      };

      await beforeChange({ context, req: makeReq(), siblingData });

      expect(context).toEqual({ triggerAfterChange: false });
      expect(siblingData.syncAllTranslations).toBe(true);
    });
  });

  describe('syncTranslations afterChange', () => {
    const { afterChange } = getHooks('syncTranslations');
    const context = {
      articleDirectoryId: 'ad-1',
      draft: true,
      excludeLocales: ['fr_FR', 'es_ES'],
      syncTranslations: true,
    };

    it('updates translations for the current locale', async () => {
      const req = makeReq();

      await afterChange({ context, req });

      expect(updatePayloadTranslation).toHaveBeenCalledTimes(1);
      expect(updatePayloadTranslation).toHaveBeenCalledWith({
        articleDirectoryId: 'ad-1',
        pluginOptions,
        payload: req.payload,
        draft: true,
        excludeLocales: ['fr_FR', 'es_ES'],
        dryRun: false,
        req,
      });
      expect(req.payload.jobs.queue).not.toHaveBeenCalled();
    });

    it('queues one job for the current locale when jobs are enabled', async () => {
      vi.stubEnv('PAYLOAD_CROWDIN_SYNC_USE_JOBS', 'true');
      const req = makeReq();

      await afterChange({ context, req });

      expect(req.payload.jobs.queue).toHaveBeenCalledTimes(1);
      expect(req.payload.jobs.queue).toHaveBeenCalledWith({
        task: 'crowdinSyncTranslations',
        input: {
          articleDirectoryId: 'ad-1',
          draft: true,
          excludeLocales: ['fr_FR', 'es_ES'],
          dryRun: false,
        },
      });
      expect(updatePayloadTranslation).not.toHaveBeenCalled();
    });

    it('does nothing without a complete sync request in context', async () => {
      const req = makeReq();

      await afterChange({ context: {}, req });
      await afterChange({
        context: { ...context, excludeLocales: undefined },
        req,
      });
      await afterChange({
        context: {
          articleDirectoryId: 'ad-1',
          draft: true,
          syncAllTranslations: true,
        },
        req,
      });

      expect(updatePayloadTranslation).not.toHaveBeenCalled();
      expect(req.payload.jobs.queue).not.toHaveBeenCalled();
    });

    it('updates translations when the article directory id is numeric (SQL adapters)', async () => {
      const req = makeReq();

      await afterChange({
        context: {
          ...context,
          articleDirectoryId: 42,
        },
        req,
      });

      expect(updatePayloadTranslation).toHaveBeenCalledTimes(1);
      expect(updatePayloadTranslation).toHaveBeenCalledWith({
        articleDirectoryId: 42,
        pluginOptions,
        payload: req.payload,
        draft: true,
        excludeLocales: ['fr_FR', 'es_ES'],
        dryRun: false,
        req,
      });
    });

    it('queues a job with the numeric id stringified when jobs are enabled', async () => {
      vi.stubEnv('PAYLOAD_CROWDIN_SYNC_USE_JOBS', 'true');
      const req = makeReq();

      await afterChange({
        context: {
          ...context,
          articleDirectoryId: 42,
        },
        req,
      });

      expect(req.payload.jobs.queue).toHaveBeenCalledWith({
        task: 'crowdinSyncTranslations',
        input: {
          articleDirectoryId: '42',
          draft: true,
          excludeLocales: ['fr_FR', 'es_ES'],
          dryRun: false,
        },
      });
      expect(updatePayloadTranslation).not.toHaveBeenCalled();
    });

    it('does nothing when triggerAfterChange is false', async () => {
      const req = makeReq();

      await afterChange({
        context: { ...context, triggerAfterChange: false },
        req,
      });

      expect(updatePayloadTranslation).not.toHaveBeenCalled();
    });
  });

  describe('syncAllTranslations afterChange', () => {
    const { afterChange } = getHooks('syncAllTranslations');
    const context = {
      articleDirectoryId: 'ad-1',
      draft: false,
      syncAllTranslations: true,
    };

    it('updates translations for all locales', async () => {
      const req = makeReq();

      await afterChange({ context, req });

      expect(updatePayloadTranslation).toHaveBeenCalledTimes(1);
      expect(updatePayloadTranslation).toHaveBeenCalledWith({
        articleDirectoryId: 'ad-1',
        pluginOptions,
        payload: req.payload,
        draft: false,
        dryRun: false,
        req,
      });
      expect(req.payload.jobs.queue).not.toHaveBeenCalled();
    });

    it('queues one job per locale when jobs are enabled', async () => {
      vi.stubEnv('PAYLOAD_CROWDIN_SYNC_USE_JOBS', 'true');
      const req = makeReq();

      await afterChange({ context, req });

      expect(req.payload.jobs.queue).toHaveBeenCalledTimes(3);
      expect(req.payload.jobs.queue).toHaveBeenNthCalledWith(1, {
        task: 'crowdinSyncTranslations',
        input: {
          articleDirectoryId: 'ad-1',
          excludeLocales: ['fr_FR', 'es_ES'],
          draft: false,
          dryRun: false,
        },
      });
      expect(req.payload.jobs.queue).toHaveBeenNthCalledWith(2, {
        task: 'crowdinSyncTranslations',
        input: {
          articleDirectoryId: 'ad-1',
          excludeLocales: ['de_DE', 'es_ES'],
          draft: false,
          dryRun: false,
        },
      });
      expect(req.payload.jobs.queue).toHaveBeenNthCalledWith(3, {
        task: 'crowdinSyncTranslations',
        input: {
          articleDirectoryId: 'ad-1',
          excludeLocales: ['de_DE', 'fr_FR'],
          draft: false,
          dryRun: false,
        },
      });
      expect(updatePayloadTranslation).not.toHaveBeenCalled();
    });

    it('does nothing without a complete sync request in context', async () => {
      const req = makeReq();

      await afterChange({ context: {}, req });
      await afterChange({
        context: {
          articleDirectoryId: 'ad-1',
          draft: true,
          excludeLocales: ['fr_FR', 'es_ES'],
          syncTranslations: true,
        },
        req,
      });

      expect(updatePayloadTranslation).not.toHaveBeenCalled();
      expect(req.payload.jobs.queue).not.toHaveBeenCalled();
    });

    it('does nothing when triggerAfterChange is false', async () => {
      const req = makeReq();

      await afterChange({
        context: { ...context, triggerAfterChange: false },
        req,
      });

      expect(updatePayloadTranslation).not.toHaveBeenCalled();
    });
  });
});
