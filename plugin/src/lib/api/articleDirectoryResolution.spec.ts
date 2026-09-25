import { NotFound } from 'payload';
import type { Payload, PayloadRequest, Where } from 'payload';
import { getArticleDirectory } from './helpers';
import { filesApiByDocument } from './files/by-document';
import { payloadCrowdinSyncDocumentFilesApi } from './files/document';
import { pluginOptions } from './mock/plugin-options';

/**
 * Root article directory resolution across the sync, delete and translation
 * lookup paths. Uses an in-memory Payload that evaluates `where` clauses, so
 * the tests assert which directory is found rather than the query sequence.
 *
 * SQL adapters reuse ids across collections (e.g. post `5` and page `5`), so
 * a lookup by `name` alone can match another collection's directory.
 */

type Row = Record<string, unknown> & { id: string };

const valueAt = (row: Row, path: string): unknown =>
  path.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object') {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, row);

const idOf = (value: unknown) =>
  value && typeof value === 'object' ? (value as Row).id : value;

const matches = (row: Row, where?: Where): boolean => {
  if (!where) return true;
  return Object.entries(where).every(([key, condition]) => {
    if (key === 'and') {
      return (condition as Where[]).every((w) => matches(row, w));
    }
    if (key === 'or') {
      return (condition as Where[]).some((w) => matches(row, w));
    }
    const { equals } = condition as { equals: unknown };
    return idOf(valueAt(row, key)) === equals;
  });
};

function createFakePayload(collections: Record<string, Row[]>) {
  const rows = (collection: string) => collections[collection] ?? [];
  const payload = {
    find: vi.fn(async ({ collection, where, limit }) => {
      const docs = rows(collection).filter((row) => matches(row, where));
      const limited = limit ? docs.slice(0, limit) : docs;
      return { docs: limited, totalDocs: docs.length };
    }),
    findByID: vi.fn(async ({ collection, id }) => {
      const doc = rows(collection).find((row) => row.id === id);
      if (!doc) throw new NotFound();
      return doc;
    }),
    delete: vi.fn(async ({ collection, id }) => {
      collections[collection] = rows(collection).filter((row) => row.id !== id);
    }),
  };
  return payload;
}

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
  payload: ReturnType<typeof createFakePayload>,
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
    const payload = createFakePayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPostDirectory, linked],
    });
    const result = await getArticleDirectory({
      documentId: '5',
      payload: payload as unknown as Payload,
      rootLookup,
    });
    expect(result?.id).toBe('ad-linked');
  });

  it('finds an unlinked directory by name within its own collection directory', async () => {
    const payload = createFakePayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPageDirectory, legacyPostDirectory],
    });
    const result = await getArticleDirectory({
      documentId: '5',
      payload: payload as unknown as Payload,
      rootLookup,
    });
    expect(result?.id).toBe('ad-post-5');
  });

  it("does not return another collection's directory with the same name", async () => {
    const payload = createFakePayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPageDirectory],
    });
    const result = await getArticleDirectory({
      documentId: '5',
      payload: payload as unknown as Payload,
      allowEmpty: true,
      rootLookup,
    });
    expect(result).toBeUndefined();
  });

  it('finds an unlinked global directory by name within the globals directory', async () => {
    const payload = createFakePayload({
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
      payload: payload as unknown as Payload,
      rootLookup: { collectionSlug: 'nav', global: true },
    });
    expect(result?.id).toBe('ad-nav');
  });
});

describe('getArticleDirectory without rootLookup', () => {
  it('keeps the name-only lookup for callers that do not know the collection', async () => {
    const payload = createFakePayload({
      'crowdin-article-directories': [legacyPageDirectory],
    });
    const result = await getArticleDirectory({
      documentId: '5',
      payload: payload as unknown as Payload,
    });
    expect(result?.id).toBe('ad-page-5');
  });
});

describe('filesApiByDocument.resolveExistingArticleDirectory (delete path)', () => {
  it("does not resolve another collection's directory for a document that was never synced", async () => {
    const payload = createFakePayload({
      'crowdin-collection-directories': collectionDirectories,
      'crowdin-article-directories': [legacyPageDirectory],
    });
    const api = buildApiByDocument(payload, { id: '5' });
    expect(await api.resolveExistingArticleDirectory()).toBeUndefined();
  });

  it('uses the legacy reference on the document when there is no polymorphic link', async () => {
    const payload = createFakePayload({
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
  });

  it('skips a legacy reference to a directory that no longer exists', async () => {
    const payload = createFakePayload({
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
    const payload = createFakePayload({
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
    const payload = createFakePayload({
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
    const payload = createFakePayload({
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
    const payload = createFakePayload({
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
