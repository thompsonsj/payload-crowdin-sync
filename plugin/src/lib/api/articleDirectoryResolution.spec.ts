import type { PayloadRequest } from 'payload';
import { getArticleDirectory } from './helpers';
import { filesApiByDocument } from './files/by-document';
import { payloadCrowdinSyncDocumentFilesApi } from './files/document';
import { pluginOptions } from './mock/plugin-options';
import {
  createInMemoryPayload,
  type InMemoryPayload,
  type Row,
} from './tests/in-memory-payload';

/**
 * Root article directory resolution across the sync, delete and translation
 * lookup paths.
 *
 * SQL adapters reuse ids across collections (e.g. post `5` and page `5`), so
 * a lookup by `name` alone can match another collection's directory.
 */

const collectionDirectories: Row[] = [
  { id: 'cd-pages', collectionSlug: 'pages', originalId: 10 },
  { id: 'cd-posts', collectionSlug: 'posts', originalId: 20 },
  { id: 'cd-globals', collectionSlug: 'globals', originalId: 30 },
];

/** A directory for page `5` without a polymorphic link (created before links existed). */
const legacyPageDirectory: Row = {
  id: 'ad-page-5',
  name: '5',
  originalId: 105,
  crowdinCollectionDirectory: 'cd-pages',
};

const legacyPostDirectory: Row = {
  id: 'ad-post-5',
  name: '5',
  originalId: 205,
  crowdinCollectionDirectory: 'cd-posts',
};

const buildApiByDocument = (
  payload: InMemoryPayload,
  document: Record<string, unknown>,
  { collectionSlug = 'posts', global = false } = {},
) =>
  new filesApiByDocument({
    document: { title: 'Doc', ...document },
    collectionSlug: collectionSlug as 'posts',
    global,
    pluginOptions: { ...pluginOptions, disableSelfClean: true },
    req: { payload } as unknown as PayloadRequest,
  });

describe('getArticleDirectory with rootLookup', () => {
  const rootLookup = { collectionSlug: 'posts', global: false };

  it('prefers the polymorphic link over a name match', async () => {
    const linked: Row = {
      id: 'ad-linked',
      name: 'renamed',
      collectionDocument: { value: '5', relationTo: 'posts' },
    };
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPostDirectory, linked],
    });
    const result = await getArticleDirectory({
      documentId: '5',
      payload: payload,
      rootLookup,
    });
    expect(result?.id).toBe('ad-linked');
  });

  it('finds an unlinked directory by name within its own collection directory', async () => {
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPageDirectory, legacyPostDirectory],
    });
    const result = await getArticleDirectory({
      documentId: '5',
      payload: payload,
      rootLookup,
    });
    expect(result?.id).toBe('ad-post-5');
  });

  it("does not return another collection's directory with the same name", async () => {
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPageDirectory],
    });
    const result = await getArticleDirectory({
      documentId: '5',
      payload: payload,
      allowEmpty: true,
      rootLookup,
    });
    expect(result).toBeUndefined();
  });

  it('finds an unlinked global directory by name within the globals directory', async () => {
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [
        {
          id: 'ad-nav',
          name: 'nav',
          crowdinCollectionDirectory: 'cd-globals',
        },
      ],
    });
    const result = await getArticleDirectory({
      documentId: 'nav',
      payload: payload,
      rootLookup: { collectionSlug: 'nav', global: true },
    });
    expect(result?.id).toBe('ad-nav');
  });
});

describe('getArticleDirectory with rootLookup when nothing matches', () => {
  it('throws unless allowEmpty is set', async () => {
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPageDirectory],
    });
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    await expect(
      getArticleDirectory({
        documentId: '5',
        payload,
        rootLookup: { collectionSlug: 'posts', global: false },
      }),
    ).rejects.toThrow(
      'This article does not have a corresponding entry in the crowdin-article-directories collection.',
    );
    consoleError.mockRestore();
  });
});

describe('getArticleDirectory without rootLookup', () => {
  it('keeps the name-only lookup for callers that do not know the collection', async () => {
    const payload = createInMemoryPayload({
      'crowdin-article-directories': [legacyPageDirectory],
    });
    const result = await getArticleDirectory({
      documentId: '5',
      payload: payload,
    });
    expect(result?.id).toBe('ad-page-5');
  });
});

describe('filesApiByDocument.resolveExistingArticleDirectory (delete path)', () => {
  it("does not resolve another collection's directory for a document that was never synced", async () => {
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPageDirectory],
    });
    const api = buildApiByDocument(payload, { id: '5' });
    expect(await api.resolveExistingArticleDirectory()).toBeUndefined();
  });

  it('uses the legacy reference on the document when there is no polymorphic link', async () => {
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [
        { id: 'ad-legacy', name: 'something-else' },
      ],
    });
    const api = buildApiByDocument(payload, {
      id: '5',
      crowdinArticleDirectory: 'ad-legacy',
    });
    expect((await api.resolveExistingArticleDirectory())?.id).toBe('ad-legacy');
    expect(payload.findByID).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'ad-legacy', overrideAccess: true }),
    );
  });

  it('ignores a populated legacy reference without an id', async () => {
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPostDirectory],
    });
    const api = buildApiByDocument(payload, {
      id: '5',
      crowdinArticleDirectory: { name: 'no-id' },
    });
    expect((await api.resolveExistingArticleDirectory())?.id).toBe('ad-post-5');
  });

  it('rethrows errors other than not found from the legacy lookup', async () => {
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPostDirectory],
    });
    const databaseError = Object.assign(new Error('Database unavailable'), {
      status: 500,
    });
    payload.findByID.mockRejectedValueOnce(databaseError);
    const api = buildApiByDocument(payload, {
      id: '5',
      crowdinArticleDirectory: 'ad-legacy',
    });
    await expect(api.resolveExistingArticleDirectory()).rejects.toBe(
      databaseError,
    );
  });

  it('skips a legacy reference to a directory that no longer exists', async () => {
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [],
    });
    const api = buildApiByDocument(payload, {
      id: '5',
      crowdinArticleDirectory: 'ad-deleted',
    });
    expect(await api.resolveExistingArticleDirectory()).toBeUndefined();
  });
});

describe('filesApiByDocument.findOrCreateArticleDirectory (sync path)', () => {
  it('prefers the polymorphic link over the legacy reference', async () => {
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [
        { id: 'ad-legacy', name: 'x' },
        {
          id: 'ad-linked',
          name: '5',
          collectionDocument: { value: '5', relationTo: 'posts' },
        },
      ],
    });
    const api = buildApiByDocument(payload, {
      id: '5',
      crowdinArticleDirectory: 'ad-legacy',
    });
    expect((await api.findOrCreateArticleDirectory()).id).toBe('ad-linked');
  });

  it('skips a legacy reference to a directory that no longer exists and finds the directory by name', async () => {
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPostDirectory],
    });
    const api = buildApiByDocument(payload, {
      id: '5',
      crowdinArticleDirectory: 'ad-deleted',
    });
    expect((await api.findOrCreateArticleDirectory()).id).toBe('ad-post-5');
  });

  it("does not reuse another collection's directory with the same name", async () => {
    const payload = createInMemoryPayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPageDirectory],
    });
    const api = buildApiByDocument(payload, { id: '5' });
    const created = { id: 'ad-created', name: '5' };
    const create = vi
      .spyOn(api, 'crowdinFindOrCreateDirectory')
      .mockResolvedValue(created as never);
    expect((await api.findOrCreateArticleDirectory()).id).toBe('ad-created');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        crowdinPayloadCollectionDirectory: expect.objectContaining({
          id: 'cd-posts',
        }),
      }),
    );
  });
});

describe('payloadCrowdinSyncDocumentFilesApi.deleteFilesAndDirectory', () => {
  it('deletes the resolved article directory, not another directory with the same name', async () => {
    const payload = createInMemoryPayload({
      'crowdin-article-directories': [legacyPageDirectory, legacyPostDirectory],
      'crowdin-files': [],
    });
    const api = new payloadCrowdinSyncDocumentFilesApi(
      {
        document: { id: '5' },
        articleDirectory: legacyPostDirectory as never,
        collectionSlug: 'posts' as never,
        global: false,
      },
      { ...pluginOptions, deleteCrowdinFiles: false },
      { payload } as unknown as PayloadRequest,
    );

    await api.deleteFilesAndDirectory();

    expect(payload.delete).toHaveBeenCalledTimes(1);
    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'crowdin-article-directories',
        id: 'ad-post-5',
      }),
    );
  });
});
