import {
  findRootArticleDirectoryPolymorphic,
  getArticleDirectory,
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
});
