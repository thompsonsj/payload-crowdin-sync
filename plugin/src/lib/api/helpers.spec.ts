import {
  ensureArticleDirectoryPolymorphicLink,
  findRootArticleDirectoryPolymorphic,
  getArticleDirectory,
  getFileByDocumentID,
  isCrowdinActive,
} from './helpers';
import { pluginOptions } from './mock/plugin-options';
import type { Payload } from 'payload';

describe('Helper: isCrowdinActive', () => {
  const doc = {
    id: '638641358b1a140462752076',
    title: 'Test doc',
  };
  it('returns true if no collection options are set', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'posts',
      global: false,
      pluginOptions,
    });
    expect(active).toBeTruthy();
  });
  it('returns true if no global options are set', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'nav',
      global: true,
      pluginOptions,
    });
    expect(active).toBeTruthy();
  });
  it('returns false if collection options are set but do not include the collection slug', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'posts',
      global: false,
      pluginOptions: {
        ...pluginOptions,
        collections: ['localized-posts'],
      },
    });
    expect(active).toBeFalsy();
  });
  it('returns true if collection options are set and include the collection slug', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'posts',
      global: false,
      pluginOptions: {
        ...pluginOptions,
        collections: ['posts'],
      },
    });
    expect(active).toBeTruthy();
  });
  it('returns true if collection options are set as an object and include the collection slug', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'posts',
      global: false,
      pluginOptions: {
        ...pluginOptions,
        collections: [
          {
            slug: 'posts',
          },
        ],
      },
    });
    expect(active).toBeTruthy();
  });
  it('returns true if collection options are set as an object and include the collection slug and a condition that is met', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'posts',
      global: false,
      pluginOptions: {
        ...pluginOptions,
        collections: [
          {
            slug: 'posts',
            condition: ({ doc }) => doc.title === 'Test doc',
          },
        ],
      },
    });
    expect(active).toBeTruthy();
  });
  it('returns false if collection options are set as an object and include the collection slug and a condition that is not met', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'posts',
      global: false,
      pluginOptions: {
        ...pluginOptions,
        collections: [
          {
            slug: 'posts',
            condition: ({ doc }) => doc.title !== 'Test doc',
          },
        ],
      },
    });
    expect(active).toBeFalsy();
  });
});

describe('findRootArticleDirectoryPolymorphic / getArticleDirectory rootLookup', () => {
  it('finds a global root row by globalSlug', async () => {
    const doc = { id: 'dir-global-1' };
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [doc], totalDocs: 1 }),
    } as unknown as Payload;

    const result = await findRootArticleDirectoryPolymorphic({
      payload,
      documentId: 'localized-nav',
      rootLookup: { collectionSlug: 'localized-nav', global: true },
    });

    expect(result).toBe(doc);
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'crowdin-article-directories',
        where: { globalSlug: { equals: 'localized-nav' } },
      }),
    );
  });

  it('finds a collection root row by collectionDocument', async () => {
    const doc = { id: 'dir-col-1' };
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [doc], totalDocs: 1 }),
    } as unknown as Payload;

    const result = await findRootArticleDirectoryPolymorphic({
      payload,
      documentId: 'abc123',
      rootLookup: { collectionSlug: 'posts', global: false },
    });

    expect(result).toBe(doc);
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          and: [
            { 'collectionDocument.value': { equals: 'abc123' } },
            { 'collectionDocument.relationTo': { equals: 'posts' } },
          ],
        },
      }),
    );
  });

  it('getArticleDirectory uses polymorphic match before name when rootLookup is set', async () => {
    const polyDoc = { id: 'from-poly', name: 'other-name' };
    const payload = {
      find: vi
        .fn()
        .mockResolvedValueOnce({ docs: [polyDoc], totalDocs: 1 }),
    } as unknown as Payload;

    const result = await getArticleDirectory({
      documentId: 'doc-1',
      payload,
      allowEmpty: true,
      rootLookup: { collectionSlug: 'posts', global: false },
    });

    expect(result).toBe(polyDoc);
    expect(payload.find).toHaveBeenCalledTimes(1);
  });

  it('getArticleDirectory falls back to name lookup when polymorphic misses but rootLookup is set', async () => {
    const nameDoc = { id: 'from-name', name: 'doc-1' };
    const payload = {
      find: vi
        .fn()
        .mockResolvedValueOnce({ docs: [], totalDocs: 0 })
        .mockResolvedValueOnce({ docs: [nameDoc], totalDocs: 1 }),
    } as unknown as Payload;

    const result = await getArticleDirectory({
      documentId: 'doc-1',
      payload,
      allowEmpty: true,
      rootLookup: { collectionSlug: 'posts', global: false },
    });

    expect(result).toBe(nameDoc);
    expect(payload.find).toHaveBeenCalledTimes(2);
  });
});

describe('ensureArticleDirectoryPolymorphicLink', () => {
  it('returns false without calling update when collectionDocument is already set', async () => {
    const update = vi.fn();
    const payload = { update } as unknown as Payload;
    const result = await ensureArticleDirectoryPolymorphicLink({
      payload,
      articleDirectory: {
        id: 'ad1',
        createdAt: '',
        updatedAt: '',
        collectionDocument: { value: 'x', relationTo: 'posts' },
      },
      documentId: 'x',
      collectionSlug: 'posts',
      global: false,
    });
    expect(result).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it('returns false without calling update when globalSlug is already set', async () => {
    const update = vi.fn();
    const payload = { update } as unknown as Payload;
    const result = await ensureArticleDirectoryPolymorphicLink({
      payload,
      articleDirectory: {
        id: 'ad1',
        createdAt: '',
        updatedAt: '',
        globalSlug: 'localized-nav',
      },
      documentId: 'localized-nav',
      collectionSlug: 'localized-nav',
      global: true,
    });
    expect(result).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it('writes collectionDocument when missing for a collection article', async () => {
    const update = vi.fn().mockResolvedValue({});
    const payload = { update } as unknown as Payload;
    const result = await ensureArticleDirectoryPolymorphicLink({
      payload,
      articleDirectory: {
        id: 'ad1',
        name: 'n1',
        createdAt: '',
        updatedAt: '',
      },
      documentId: 'doc-99',
      collectionSlug: 'localized-posts',
      global: false,
    });
    expect(result).toBe(true);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'crowdin-article-directories',
        id: 'ad1',
        data: {
          collectionDocument: {
            value: 'doc-99',
            relationTo: 'localized-posts',
          },
        },
        overrideAccess: true,
        context: { triggerAfterChange: false },
      }),
    );
  });

  it('writes globalSlug when missing for a global article', async () => {
    const update = vi.fn().mockResolvedValue({});
    const payload = { update } as unknown as Payload;
    const result = await ensureArticleDirectoryPolymorphicLink({
      payload,
      articleDirectory: {
        id: 'ad1',
        name: 'localized-nav',
        createdAt: '',
        updatedAt: '',
      },
      documentId: 'localized-nav',
      collectionSlug: 'localized-nav',
      global: true,
    });
    expect(result).toBe(true);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'crowdin-article-directories',
        id: 'ad1',
        data: { globalSlug: 'localized-nav' },
      }),
    );
  });
});

/**
 * End-to-end Crowdin HTTP tests for localized-posts live under `dev/src/tests/files/`;
 * those require a matching nock layout for every Crowdin call. These unit tests pin the
 * polymorphic vs legacy resolution contract without hitting the network.
 */
describe('getFileByDocumentID + rootLookup (contract)', () => {
  it('resolves the Crowdin file when the article directory is only reachable via polymorphic fields', async () => {
    const articleDir = {
      id: 'article-poly-1',
      name: 'orphan-name-not-doc-id',
      createdAt: '',
      updatedAt: '',
    };
    const crowdinFile = {
      id: 'file-1',
      field: 'fields',
      fileData: { json: { title: 'From polymorphic path' } },
    };

    const payload = {
      find: vi
        .fn()
        .mockResolvedValueOnce({ docs: [articleDir], totalDocs: 1 })
        .mockResolvedValueOnce({ docs: [crowdinFile], totalDocs: 1 }),
    } as unknown as Payload;

    const file = await getFileByDocumentID(
      'fields',
      'real-doc-id',
      payload,
      undefined,
      { collectionSlug: 'localized-posts', global: false },
    );

    expect(file).toEqual(crowdinFile);
    expect(payload.find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'crowdin-article-directories',
        where: {
          and: [
            { 'collectionDocument.value': { equals: 'real-doc-id' } },
            { 'collectionDocument.relationTo': { equals: 'localized-posts' } },
          ],
        },
      }),
    );
    expect(payload.find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'crowdin-files',
        where: {
          field: { equals: 'fields' },
          crowdinArticleDirectory: { equals: 'article-poly-1' },
        },
      }),
    );
  });

  it('returns undefined when legacy name lookup misses and rootLookup is omitted', async () => {
    const payload = {
      find: vi
        .fn()
        .mockResolvedValueOnce({ docs: [], totalDocs: 0 })
        .mockResolvedValueOnce({ docs: [], totalDocs: 0 }),
    } as unknown as Payload;

    const file = await getFileByDocumentID(
      'fields',
      'real-doc-id',
      payload,
    );

    expect(file).toBeUndefined();
    expect(payload.find).toHaveBeenCalledTimes(2);
    expect(payload.find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'crowdin-article-directories',
        where: { name: { equals: 'real-doc-id' } },
      }),
    );
    expect(payload.find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'crowdin-files',
        where: {
          field: { equals: 'fields' },
          crowdinArticleDirectory: { equals: 'undefined' },
        },
      }),
    );
  });
});
