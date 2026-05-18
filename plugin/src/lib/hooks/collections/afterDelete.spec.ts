import { getAfterDeleteHook } from './afterDelete';
import { pluginOptions } from '../../api/mock/plugin-options';
import type { CollectionConfig } from 'payload';

const deleteCrowdinAssetsIfPresent = vi.fn().mockResolvedValue(undefined);

vi.mock('../../api/files/by-document', () => ({
  filesApiByDocument: class MockFilesApiByDocument {
    deleteCrowdinAssetsIfPresent = deleteCrowdinAssetsIfPresent;
  },
}));

const minimalCollection: CollectionConfig = {
  slug: 'testimonials',
  fields: [
    {
      name: 'quote',
      type: 'text',
      localized: true,
    },
    {
      name: 'translateWithCrowdin',
      type: 'checkbox',
    },
  ],
};

const doc = {
  id: '659489f7b6d58cf7699eb456',
  quote: 'Great product',
  translateWithCrowdin: false,
};

function buildReq() {
  return {
    payload: {
      collections: {
        testimonials: {
          config: minimalCollection,
        },
      },
    },
  } as any;
}

describe('getAfterDeleteHook', () => {
  beforeEach(() => {
    deleteCrowdinAssetsIfPresent.mockClear();
  });

  it('skips Crowdin cleanup when the collection condition is not met', async () => {
    const hook = getAfterDeleteHook({
      collection: minimalCollection,
      pluginOptions: {
        ...pluginOptions,
        collections: [
          {
            slug: 'testimonials',
            condition: ({ doc: d }) => Boolean(d.translateWithCrowdin),
          },
        ],
      },
    });

    const result = await hook({
      doc,
      req: buildReq(),
      collection: minimalCollection,
    } as any);

    expect(result).toBe(doc);
    expect(deleteCrowdinAssetsIfPresent).not.toHaveBeenCalled();
  });

  it('runs Crowdin cleanup when the collection condition is met', async () => {
    const hook = getAfterDeleteHook({
      collection: minimalCollection,
      pluginOptions: {
        ...pluginOptions,
        collections: [
          {
            slug: 'testimonials',
            condition: ({ doc: d }) => Boolean(d.translateWithCrowdin),
          },
        ],
      },
    });

    const result = await hook({
      doc: { ...doc, translateWithCrowdin: true },
      req: buildReq(),
      collection: minimalCollection,
    } as any);

    expect(result).toEqual({ ...doc, translateWithCrowdin: true });
    expect(deleteCrowdinAssetsIfPresent).toHaveBeenCalledTimes(1);
  });

  it('returns doc without cleanup when token is unset outside test mode', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const hook = getAfterDeleteHook({
      collection: minimalCollection,
      pluginOptions: { ...pluginOptions, token: '' },
    });

    const result = await hook({
      doc,
      req: buildReq(),
      collection: minimalCollection,
    } as any);

    expect(result).toBe(doc);
    expect(deleteCrowdinAssetsIfPresent).not.toHaveBeenCalled();

    vi.unstubAllEnvs();
  });
});
