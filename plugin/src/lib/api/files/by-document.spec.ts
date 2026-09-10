import { CrowdinError } from '@crowdin/crowdin-api-client';
import { filesApiByDocument } from './by-document';
import { pluginOptions } from '../mock/plugin-options';
import type { PayloadRequest } from 'payload';

function buildApi(
  payloadOverrides: Record<string, unknown> = {},
  sourceFilesOverrides: Record<string, unknown> = {},
  pluginOptionsOverrides: Record<string, unknown> = {},
) {
  const req = {
    payload: payloadOverrides,
    transactionID: undefined,
  } as unknown as PayloadRequest;

  const api = new filesApiByDocument({
    document: { id: 'doc-1', title: 'Test' },
    collectionSlug: 'posts',
    global: false,
    pluginOptions: { ...pluginOptions, ...pluginOptionsOverrides },
    req,
  });

  api.sourceFilesApi = {
    getDirectory: vi.fn(),
    createDirectory: vi.fn(),
    listProjectDirectories: vi.fn(),
    ...sourceFilesOverrides,
  } as any;

  return { api, req };
}

describe('filesApiByDocument directory self-clean', () => {
  it('deletes stale collection directory and recreates when Crowdin returns 404', async () => {
    const staleDirectory = {
      id: 'collection-dir-1',
      collectionSlug: 'posts',
      originalId: 999,
    };
    const recreatedDirectory = {
      id: 'collection-dir-2',
      collectionSlug: 'posts',
      originalId: 1001,
    };

    const find = vi
      .fn()
      .mockResolvedValueOnce({ totalDocs: 1, docs: [staleDirectory] })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] });
    const payloadDelete = vi.fn().mockResolvedValue(undefined);
    const payloadCreate = vi.fn().mockResolvedValue(recreatedDirectory);
    const getDirectory = vi
      .fn()
      .mockRejectedValue(new CrowdinError('Not found', 404, {}));
    const createDirectory = vi.fn().mockResolvedValue({
      data: {
        id: 1001,
        directoryId: pluginOptions.directoryId,
        name: 'posts',
        title: 'Posts',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    });

    const { api } = buildApi(
      { find, delete: payloadDelete, create: payloadCreate },
      { getDirectory, createDirectory },
    );

    const result = await (api as any).findOrCreateCollectionDirectory({
      collectionSlug: 'posts',
    });

    expect(getDirectory).toHaveBeenCalledWith(pluginOptions.projectId, 999);
    expect(payloadDelete).toHaveBeenCalledWith({
      collection: 'crowdin-collection-directories',
      id: staleDirectory.id,
      req: expect.any(Object),
      overrideAccess: true,
    });
    expect(createDirectory).toHaveBeenCalled();
    expect(result).toEqual(recreatedDirectory);
  });

  it('keeps stale collection directory when disableSelfClean is true', async () => {
    const staleDirectory = {
      id: 'collection-dir-1',
      collectionSlug: 'posts',
      originalId: 999,
    };

    const find = vi.fn().mockResolvedValue({ totalDocs: 1, docs: [staleDirectory] });
    const payloadDelete = vi.fn();
    const getDirectory = vi.fn();

    const { api } = buildApi(
      { find, delete: payloadDelete },
      { getDirectory },
      { disableSelfClean: true },
    );

    const result = await (api as any).findOrCreateCollectionDirectory({
      collectionSlug: 'posts',
    });

    expect(getDirectory).not.toHaveBeenCalled();
    expect(payloadDelete).not.toHaveBeenCalled();
    expect(result).toEqual(staleDirectory);
  });

  it('deletes stale article directory records before creating a new one', async () => {
    const staleArticleDirectory = {
      id: 'article-dir-1',
      originalId: 888,
      name: 'doc-1',
    };
    const collectionDirectory = {
      id: 'collection-dir-1',
      collectionSlug: 'posts',
      originalId: 100,
    };
    const recreatedArticleDirectory = {
      id: 'article-dir-2',
      originalId: 1002,
      name: 'doc-1',
    };

    const payloadDelete = vi.fn().mockResolvedValue(undefined);
    const getDirectory = vi
      .fn()
      .mockRejectedValueOnce(new CrowdinError('Not found', 404, {}))
      .mockResolvedValue({ data: { id: 100 } });
    const createDirectory = vi.fn().mockResolvedValue({
      data: {
        id: 1002,
        directoryId: 100,
        name: 'doc-1',
        title: 'Test',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    });

    const { api } = buildApi(
      {
        find: vi.fn().mockResolvedValue({ totalDocs: 0, docs: [] }),
        delete: payloadDelete,
        create: vi.fn().mockResolvedValue(recreatedArticleDirectory),
      },
      { getDirectory, createDirectory },
    );

    vi.spyOn(api as any, 'findArticleDirectoryByPolymorphicLink').mockResolvedValue(
      staleArticleDirectory,
    );
    vi.spyOn(api as any, 'findArticleDirectoryByLegacyField').mockResolvedValue(
      undefined,
    );
    vi.spyOn(api as any, 'findOrCreateCollectionDirectory').mockResolvedValue(
      collectionDirectory,
    );
    vi.spyOn(api as any, 'findArticleDirectoryInPayload').mockResolvedValue(
      undefined,
    );
    vi.spyOn(api as any, 'resolveParentDirectory').mockResolvedValue(undefined);
    vi.spyOn(api as any, 'lookupCollectionConfig').mockReturnValue({
      admin: { useAsTitle: 'title' },
    });
    vi.spyOn(api as any, 'payloadStoreCrowdinDirectory').mockResolvedValue(
      recreatedArticleDirectory,
    );

    const result = await api.findOrCreateArticleDirectory();

    expect(payloadDelete).toHaveBeenCalledWith({
      collection: 'crowdin-article-directories',
      id: staleArticleDirectory.id,
      req: expect.any(Object),
      overrideAccess: true,
    });
    expect(createDirectory).toHaveBeenCalled();
    expect(result).toEqual(recreatedArticleDirectory);
  });
});
