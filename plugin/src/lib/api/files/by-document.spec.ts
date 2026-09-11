import { CrowdinError } from '@crowdin/crowdin-api-client';
import { filesApiByDocument } from './by-document';
import { pluginOptions } from '../mock/plugin-options';
import type { CrowdinCollectionDirectory } from '../../payload-types';
import type { PayloadRequest } from 'payload';

/**
 * Tests for directory 404 self-clean (#360).
 *
 * Problem: Crowdin directories can be deleted externally while Payload still
 * holds matching `crowdin-collection-directories` / `crowdin-article-directories`
 * records. Sync then fails with "Invalid directory id given".
 *
 * Fix: Before reusing a directory record, verify it on Crowdin via getDirectory.
 * On 404, delete the stale Payload record and recreate. Opt out via disableSelfClean
 * (same flag as file self-clean in translations.ts).
 */

function buildApi(
  payloadOverrides: Record<string, unknown> = {},
  sourceFilesOverrides: Record<string, unknown> = {},
  pluginOptionsOverrides: Record<string, unknown> = {},
  documentOverrides: Record<string, unknown> = {},
) {
  const req = {
    payload: payloadOverrides,
    transactionID: undefined,
  } as unknown as PayloadRequest;

  const api = new filesApiByDocument({
    document: { id: 'doc-1', title: 'Test', ...documentOverrides },
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

const crowdinDirectoryResponse = (id: number, directoryId: number, name: string) => ({
  data: {
    id,
    directoryId,
    name,
    title: name,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
});

const collectionDirectoryFixture = (
  overrides: Pick<CrowdinCollectionDirectory, 'id' | 'originalId'> &
    Partial<CrowdinCollectionDirectory>,
): CrowdinCollectionDirectory => ({
  collectionSlug: 'posts',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('directory 404 self-clean (#360)', () => {
  describe('collection directories (crowdin-collection-directories)', () => {
    it('reuses Payload record when Crowdin getDirectory confirms it still exists', async () => {
      const validDirectory = {
        id: 'collection-dir-1',
        collectionSlug: 'posts',
        originalId: 100,
      };

      const find = vi.fn().mockResolvedValue({ totalDocs: 1, docs: [validDirectory] });
      const getDirectory = vi.fn().mockResolvedValue({ data: { id: 100 } });
      const payloadDelete = vi.fn();
      const createDirectory = vi.fn();

      const { api } = buildApi(
        { find, delete: payloadDelete },
        { getDirectory, createDirectory },
      );

      const result = await (api as any).findOrCreateCollectionDirectory({
        collectionSlug: 'posts',
      });

      expect(getDirectory).toHaveBeenCalledWith(pluginOptions.projectId, 100);
      expect(payloadDelete).not.toHaveBeenCalled();
      expect(createDirectory).not.toHaveBeenCalled();
      expect(result).toEqual(validDirectory);
    });

    it('deletes stale Payload record and recreates on Crowdin when getDirectory returns 404', async () => {
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
      const createDirectory = vi.fn().mockResolvedValue(
        crowdinDirectoryResponse(1001, pluginOptions.directoryId as number, 'posts'),
      );

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
      expect(createDirectory).toHaveBeenCalledWith(pluginOptions.projectId, {
        directoryId: pluginOptions.directoryId,
        name: 'posts',
        title: expect.any(String),
      });
      expect(result).toEqual(recreatedDirectory);
    });

    it('keeps stale Payload record when disableSelfClean is true', async () => {
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

    it('throws when stale collection directory persists after one self-clean retry', async () => {
      const staleDirectory = {
        id: 'collection-dir-1',
        collectionSlug: 'posts',
        originalId: 999,
      };

      const find = vi.fn().mockResolvedValue({ totalDocs: 1, docs: [staleDirectory] });
      const getDirectory = vi
        .fn()
        .mockRejectedValue(new CrowdinError('Not found', 404, {}));
      const payloadDelete = vi.fn().mockResolvedValue(undefined);

      const { api } = buildApi({ find, delete: payloadDelete }, { getDirectory });

      await expect(
        (api as any).findOrCreateCollectionDirectory({ collectionSlug: 'posts' }),
      ).rejects.toThrow(
        'Stale Crowdin collection directory "posts" could not be recreated after self-clean',
      );

      expect(payloadDelete).toHaveBeenCalledTimes(1);
      expect(find).toHaveBeenCalledTimes(2);
    });

    it('propagates non-404 Crowdin errors during verification', async () => {
      const directory = {
        id: 'collection-dir-1',
        collectionSlug: 'posts',
        originalId: 100,
      };

      const find = vi.fn().mockResolvedValue({ totalDocs: 1, docs: [directory] });
      const getDirectory = vi
        .fn()
        .mockRejectedValue(new CrowdinError('Forbidden', 403, {}));

      const { api } = buildApi({ find }, { getDirectory });

      await expect(
        (api as any).findOrCreateCollectionDirectory({ collectionSlug: 'posts' }),
      ).rejects.toThrow('Forbidden');
    });
  });

  describe('article directories (crowdin-article-directories)', () => {
    const collectionDirectory = {
      id: 'collection-dir-1',
      collectionSlug: 'posts',
      originalId: 100,
    };

    function stubArticleDirectoryCreation(
      api: filesApiByDocument,
      recreatedArticleDirectory: Record<string, unknown>,
    ) {
      vi.spyOn(api as any, 'findOrCreateCollectionDirectory').mockResolvedValue(
        collectionDirectory,
      );
      vi.spyOn(api as any, 'resolveParentDirectory').mockResolvedValue(undefined);
      vi.spyOn(api as any, 'lookupCollectionConfig').mockReturnValue({
        admin: { useAsTitle: 'title' },
      });
      vi.spyOn(api as any, 'payloadStoreCrowdinDirectory').mockResolvedValue(
        recreatedArticleDirectory,
      );
    }

    it('returns valid polymorphic link without calling createDirectory', async () => {
      const validArticleDirectory = {
        id: 'article-dir-1',
        originalId: 200,
        name: 'doc-1',
      };

      const getDirectory = vi.fn().mockResolvedValue({ data: { id: 200 } });
      const createDirectory = vi.fn();

      const { api } = buildApi({}, { getDirectory, createDirectory });

      vi.spyOn(api as any, 'findArticleDirectoryByPolymorphicLink').mockResolvedValue(
        validArticleDirectory,
      );
      vi.spyOn(api as any, 'findArticleDirectoryByLegacyField').mockResolvedValue(
        undefined,
      );

      const result = await api.findOrCreateArticleDirectory();

      expect(getDirectory).toHaveBeenCalledWith(pluginOptions.projectId, 200);
      expect(createDirectory).not.toHaveBeenCalled();
      expect(result).toEqual(validArticleDirectory);
    });

    it('self-cleans stale polymorphic link then creates a new article directory', async () => {
      const staleArticleDirectory = {
        id: 'article-dir-1',
        originalId: 888,
        name: 'doc-1',
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
      const createDirectory = vi.fn().mockResolvedValue(
        crowdinDirectoryResponse(1002, 100, 'doc-1'),
      );

      const { api } = buildApi({ delete: payloadDelete }, { getDirectory, createDirectory });

      vi.spyOn(api as any, 'findArticleDirectoryByPolymorphicLink').mockResolvedValue(
        staleArticleDirectory,
      );
      vi.spyOn(api as any, 'findArticleDirectoryByLegacyField').mockResolvedValue(
        undefined,
      );
      vi.spyOn(api as any, 'findArticleDirectoryInPayload').mockResolvedValue(undefined);
      stubArticleDirectoryCreation(api, recreatedArticleDirectory);

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

    it('self-cleans stale legacy field reference then creates a new article directory', async () => {
      const staleArticleDirectory = {
        id: 'article-dir-legacy',
        originalId: 777,
        name: 'doc-1',
      };
      const recreatedArticleDirectory = {
        id: 'article-dir-new',
        originalId: 1003,
        name: 'doc-1',
      };

      const payloadDelete = vi.fn().mockResolvedValue(undefined);
      const getDirectory = vi
        .fn()
        .mockRejectedValueOnce(new CrowdinError('Not found', 404, {}))
        .mockResolvedValue({ data: { id: 100 } });
      const createDirectory = vi.fn().mockResolvedValue(
        crowdinDirectoryResponse(1003, 100, 'doc-1'),
      );

      const { api } = buildApi(
        { delete: payloadDelete },
        { getDirectory, createDirectory },
        {},
        { crowdinArticleDirectory: staleArticleDirectory },
      );

      vi.spyOn(api as any, 'findArticleDirectoryByPolymorphicLink').mockResolvedValue(
        undefined,
      );
      vi.spyOn(api as any, 'findArticleDirectoryByLegacyField').mockResolvedValue(
        staleArticleDirectory,
      );
      vi.spyOn(api as any, 'findArticleDirectoryInPayload').mockResolvedValue(undefined);
      stubArticleDirectoryCreation(api, recreatedArticleDirectory);

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

    it('self-cleans stale payload lookup match then creates a new article directory', async () => {
      const staleArticleDirectory = {
        id: 'article-dir-payload',
        originalId: 666,
        name: 'doc-1',
      };
      const recreatedArticleDirectory = {
        id: 'article-dir-new',
        originalId: 1004,
        name: 'doc-1',
      };

      const payloadDelete = vi.fn().mockResolvedValue(undefined);
      const getDirectory = vi
        .fn()
        .mockRejectedValueOnce(new CrowdinError('Not found', 404, {}))
        .mockResolvedValue({ data: { id: 100 } });
      const createDirectory = vi.fn().mockResolvedValue(
        crowdinDirectoryResponse(1004, 100, 'doc-1'),
      );

      const { api } = buildApi({ delete: payloadDelete }, { getDirectory, createDirectory });

      vi.spyOn(api as any, 'findArticleDirectoryByPolymorphicLink').mockResolvedValue(
        undefined,
      );
      vi.spyOn(api as any, 'findArticleDirectoryByLegacyField').mockResolvedValue(
        undefined,
      );
      vi.spyOn(api as any, 'findArticleDirectoryInPayload').mockResolvedValue(
        staleArticleDirectory,
      );
      stubArticleDirectoryCreation(api, recreatedArticleDirectory);

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

    it('keeps stale article directory when disableSelfClean is true', async () => {
      const staleArticleDirectory = {
        id: 'article-dir-1',
        originalId: 888,
        name: 'doc-1',
      };

      const payloadDelete = vi.fn();
      const getDirectory = vi.fn();
      const createDirectory = vi.fn();

      const { api } = buildApi(
        { delete: payloadDelete },
        { getDirectory, createDirectory },
        { disableSelfClean: true },
      );

      vi.spyOn(api as any, 'findArticleDirectoryByPolymorphicLink').mockResolvedValue(
        staleArticleDirectory,
      );
      vi.spyOn(api as any, 'findArticleDirectoryByLegacyField').mockResolvedValue(
        undefined,
      );

      const result = await api.findOrCreateArticleDirectory();

      expect(getDirectory).not.toHaveBeenCalled();
      expect(payloadDelete).not.toHaveBeenCalled();
      expect(createDirectory).not.toHaveBeenCalled();
      expect(result).toEqual(staleArticleDirectory);
    });
  });

  describe('crowdinFindOrCreateDirectory create failures', () => {
    it('when collection parent id is stale, deletes Payload record and retries create', async () => {
      const staleCollectionDirectory = collectionDirectoryFixture({
        id: 'collection-dir-stale',
        originalId: 999,
      });
      const refreshedCollectionDirectory = collectionDirectoryFixture({
        id: 'collection-dir-fresh',
        originalId: 100,
      });
      const createdArticleDirectory = {
        id: 'article-dir-new',
        originalId: 2001,
        name: 'doc-1',
      };

      const payloadDelete = vi.fn().mockResolvedValue(undefined);
      const createDirectory = vi
        .fn()
        .mockRejectedValueOnce(
          new Error("Invalid directory id given. Directory doesn't exists"),
        )
        .mockResolvedValueOnce(crowdinDirectoryResponse(2001, 100, 'doc-1'));

      const findOrCreateCollectionDirectory = vi
        .fn()
        .mockResolvedValueOnce(refreshedCollectionDirectory);

      const { api } = buildApi({ delete: payloadDelete }, { createDirectory });

      vi.spyOn(api as any, 'findOrCreateCollectionDirectory').mockImplementation(
        findOrCreateCollectionDirectory,
      );
      vi.spyOn(api as any, 'payloadStoreCrowdinDirectory').mockResolvedValue(
        createdArticleDirectory,
      );

      const result = await api.crowdinFindOrCreateDirectory({
        crowdinPayloadCollectionDirectory: staleCollectionDirectory,
        name: 'doc-1',
        useAsTitle: 'title',
      });

      expect(payloadDelete).toHaveBeenCalledWith({
        collection: 'crowdin-collection-directories',
        id: staleCollectionDirectory.id,
        req: expect.any(Object),
        overrideAccess: true,
      });
      expect(findOrCreateCollectionDirectory).toHaveBeenCalledWith({
        collectionSlug: 'posts',
        selfCleanAttempt: 1,
      });
      expect(createDirectory).toHaveBeenCalledTimes(2);
      expect(result).toEqual(createdArticleDirectory);
    });

    it('rethrows createError when self-clean retry budget is exhausted', async () => {
      const staleCollectionDirectory = collectionDirectoryFixture({
        id: 'collection-dir-stale',
        originalId: 999,
      });
      const refreshedCollectionDirectory = collectionDirectoryFixture({
        id: 'collection-dir-fresh',
        originalId: 100,
      });
      const createError = new Error(
        "Invalid directory id given. Directory doesn't exists",
      );

      const payloadDelete = vi.fn().mockResolvedValue(undefined);
      const createDirectory = vi.fn().mockRejectedValue(createError);
      const findOrCreateCollectionDirectory = vi
        .fn()
        .mockResolvedValue(refreshedCollectionDirectory);

      const { api } = buildApi({ delete: payloadDelete }, { createDirectory });

      vi.spyOn(api as any, 'findOrCreateCollectionDirectory').mockImplementation(
        findOrCreateCollectionDirectory,
      );

      await expect(
        api.crowdinFindOrCreateDirectory({
          crowdinPayloadCollectionDirectory: staleCollectionDirectory,
          name: 'doc-1',
          selfCleanAttempt: 1,
        }),
      ).rejects.toThrow(createError);

      expect(createDirectory).toHaveBeenCalledTimes(1);
      expect(findOrCreateCollectionDirectory).not.toHaveBeenCalled();
      expect(payloadDelete).not.toHaveBeenCalled();
    });

    it('when article parent id is stale (lexical field dirs), deletes parent Payload record', async () => {
      const staleParent = {
        id: 'article-dir-parent',
        originalId: 555,
        name: 'doc-1',
      };

      const payloadDelete = vi.fn().mockResolvedValue(undefined);
      const createDirectory = vi
        .fn()
        .mockRejectedValue(
          new Error("Invalid directory id given. Directory doesn't exists"),
        );

      const { api } = buildApi({ delete: payloadDelete }, { createDirectory });

      vi.spyOn(api, 'crowdinFindFieldDirectory').mockResolvedValue(undefined);

      // Stale parent is removed; the create error is swallowed by the outer
      // catch (existing behaviour). The next sync recreates the parent chain.
      const result = await api.crowdinFindOrCreateDirectory({
        parent: staleParent as any,
        name: 'blocks__hero',
        useAsTitle: 'title',
      });

      expect(result).toBeUndefined();
      expect(payloadDelete).toHaveBeenCalledWith({
        collection: 'crowdin-article-directories',
        id: staleParent.id,
        req: expect.any(Object),
        overrideAccess: true,
      });
    });

    it('when field directory exists in Payload but is stale on Crowdin, recreates it', async () => {
      const parentArticleDirectory = {
        id: 'article-dir-parent',
        originalId: 100,
        name: 'doc-1',
      };
      const staleFieldDirectory = {
        id: 'field-dir-stale',
        originalId: 444,
        name: 'blocks__hero',
      };
      const recreatedFieldDirectory = {
        id: 'field-dir-new',
        originalId: 3001,
        name: 'blocks__hero',
      };

      const payloadDelete = vi.fn().mockResolvedValue(undefined);
      const getDirectory = vi
        .fn()
        .mockRejectedValueOnce(new CrowdinError('Not found', 404, {}))
        .mockResolvedValue({ data: { id: 100 } });
      const createDirectory = vi.fn().mockResolvedValue(
        crowdinDirectoryResponse(3001, 100, 'blocks__hero'),
      );

      const { api } = buildApi({ delete: payloadDelete }, { getDirectory, createDirectory });

      vi.spyOn(api, 'crowdinFindFieldDirectory').mockResolvedValue(
        staleFieldDirectory as any,
      );
      vi.spyOn(api as any, 'payloadStoreCrowdinDirectory').mockResolvedValue(
        recreatedFieldDirectory,
      );

      const result = await api.crowdinFindOrCreateDirectory({
        parent: parentArticleDirectory as any,
        name: 'blocks__hero',
      });

      expect(payloadDelete).toHaveBeenCalledWith({
        collection: 'crowdin-article-directories',
        id: staleFieldDirectory.id,
        req: expect.any(Object),
        overrideAccess: true,
      });
      expect(createDirectory).toHaveBeenCalledWith(pluginOptions.projectId, {
        directoryId: parentArticleDirectory.originalId,
        name: 'blocks__hero',
        title: 'Test',
      });
      expect(result).toEqual(recreatedFieldDirectory);
    });
  });
});
