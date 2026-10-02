import type { Field } from 'payload';
import type { Payload } from 'payload';
import { backfillArticleDirectoryPolymorphicLinks } from './backfillArticleDirectoryPolymorphicLinks';
import { createInMemoryPayload, type Row } from '../api/tests/in-memory-payload';

const localizedTextField: Field = {
  name: 'title',
  type: 'text',
  localized: true,
};

describe('backfillArticleDirectoryPolymorphicLinks', () => {
  it('calls ensure (via payload.update) for collection docs that still store crowdinArticleDirectory', async () => {
    const update = vi.fn().mockResolvedValue({});
    const findByID = vi.fn().mockResolvedValue({
      id: 'ad1',
      name: 'legacy-name',
      createdAt: '',
      updatedAt: '',
    });
    const find = vi.fn().mockResolvedValue({
      docs: [{ id: 'doc1', crowdinArticleDirectory: 'ad1' }],
      totalDocs: 1,
    });

    const payload = {
      config: {
        collections: [{ slug: 'posts', fields: [localizedTextField] }],
        globals: [],
      },
      find,
      findByID,
      update,
    } as unknown as Payload;

    const result = await backfillArticleDirectoryPolymorphicLinks(payload);

    expect(result.collectionDocumentsUpdated).toBe(1);
    expect(result.globalsUpdated).toBe(0);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        where: { crowdinArticleDirectory: { not_equals: null } },
      }),
    );
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'crowdin-article-directories',
        id: 'ad1',
      }),
    );
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'crowdin-article-directories',
        id: 'ad1',
        data: {
          collectionDocument: {
            value: 'doc1',
            relationTo: 'posts',
          },
        },
      }),
    );
  });

  it('counts globals when findGlobal returns a linked crowdinArticleDirectory', async () => {
    const update = vi.fn().mockResolvedValue({});
    const findByID = vi.fn().mockResolvedValue({
      id: 'gad1',
      name: 'localized-nav',
      createdAt: '',
      updatedAt: '',
    });
    const find = vi.fn().mockResolvedValue({ docs: [], totalDocs: 0 });
    const findGlobal = vi.fn().mockResolvedValue({
      crowdinArticleDirectory: 'gad1',
    });

    const payload = {
      config: {
        collections: [{ slug: 'posts', fields: [localizedTextField] }],
        globals: [{ slug: 'localized-nav', fields: [localizedTextField] }],
      },
      find,
      findGlobal,
      findByID,
      update,
    } as unknown as Payload;

    const result = await backfillArticleDirectoryPolymorphicLinks(payload);

    expect(result.collectionDocumentsUpdated).toBe(0);
    expect(result.globalsUpdated).toBe(1);
    expect(findGlobal).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'localized-nav' }),
    );
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'gad1',
        data: { globalSlug: 'localized-nav' },
      }),
    );
  });

  it('does not increment collection count when the article row already has collectionDocument', async () => {
    const update = vi.fn().mockResolvedValue({});
    const findByID = vi.fn().mockResolvedValue({
      id: 'ad1',
      name: 'x',
      createdAt: '',
      updatedAt: '',
      collectionDocument: { value: 'doc1', relationTo: 'posts' },
    });
    const find = vi.fn().mockResolvedValue({
      docs: [{ id: 'doc1', crowdinArticleDirectory: 'ad1' }],
      totalDocs: 1,
    });

    const payload = {
      config: {
        collections: [{ slug: 'posts', fields: [localizedTextField] }],
        globals: [],
      },
      find,
      findByID,
      update,
    } as unknown as Payload;

    const result = await backfillArticleDirectoryPolymorphicLinks(payload);

    expect(result.collectionDocumentsUpdated).toBe(0);
    expect(update).not.toHaveBeenCalled();
  });
});

/**
 * Collection directories were created without `collectionDocument`, so most
 * rows can only be linked by their `name` (the document id, or the global
 * slug) within their collection's directory.
 */
describe('backfillArticleDirectoryPolymorphicLinks for rows found by name', () => {
  const collectionDirectories: Row[] = [
    { id: 'cd-posts', collectionSlug: 'posts' },
    { id: 'cd-removed', collectionSlug: 'removed-collection' },
    { id: 'cd-globals', collectionSlug: 'globals' },
  ];

  const buildPayload = (collections: Record<string, Row[]>) =>
    Object.assign(
      createInMemoryPayload({
        'crowdin-collection-directories': collectionDirectories,
        ...collections,
      }),
      {
        config: {
          collections: [{ slug: 'posts', fields: [localizedTextField] }],
          globals: [{ slug: 'nav', fields: [localizedTextField] }],
        },
        findGlobal: vi.fn().mockResolvedValue({}),
      },
    );

  const linkOf = (payload: ReturnType<typeof buildPayload>, id: string) =>
    payload.findByID({
      collection: 'crowdin-article-directories',
      id,
    }) as Promise<Row>;

  it("links an unlinked row to the collection document it's named after", async () => {
    const payload = buildPayload({
      posts: [{ id: '5' }],
      'crowdin-article-directories': [
        { id: 'ad-post-5', name: '5', crowdinCollectionDirectory: 'cd-posts' },
      ],
    });

    const result = await backfillArticleDirectoryPolymorphicLinks(payload);

    expect(result).toEqual({ collectionDocumentsUpdated: 1, globalsUpdated: 0 });
    expect((await linkOf(payload, 'ad-post-5')).collectionDocument).toEqual({
      value: '5',
      relationTo: 'posts',
    });
  });

  it('rethrows errors other than not found when loading the document', async () => {
    const payload = buildPayload({
      posts: [{ id: '5' }],
      'crowdin-article-directories': [
        { id: 'ad-post-5', name: '5', crowdinCollectionDirectory: 'cd-posts' },
      ],
    });
    const databaseError = Object.assign(new Error('Database unavailable'), {
      status: 500,
    });
    payload.findByID.mockRejectedValueOnce(databaseError);

    await expect(backfillArticleDirectoryPolymorphicLinks(payload)).rejects.toBe(
      databaseError,
    );
  });

  it("links an unlinked row in the globals directory to the global it's named after", async () => {
    const payload = buildPayload({
      'crowdin-article-directories': [
        { id: 'ad-nav', name: 'nav', crowdinCollectionDirectory: 'cd-globals' },
        { id: 'ad-old', name: 'old-global', crowdinCollectionDirectory: 'cd-globals' },
      ],
    });

    const result = await backfillArticleDirectoryPolymorphicLinks(payload);

    expect(result).toEqual({ collectionDocumentsUpdated: 0, globalsUpdated: 1 });
    expect((await linkOf(payload, 'ad-nav')).globalSlug).toBe('nav');
    expect((await linkOf(payload, 'ad-old')).globalSlug).toBeUndefined();
  });

  it('leaves rows it cannot safely link', async () => {
    const payload = buildPayload({
      posts: [{ id: '5' }, { id: '6' }],
      'removed-collection': [{ id: '7' }],
      'crowdin-article-directories': [
        // Lexical block directory under post 5's directory
        {
          id: 'ad-block',
          name: '5',
          parent: 'ad-post-5',
          crowdinCollectionDirectory: 'cd-posts',
        },
        // post 9 no longer exists
        { id: 'ad-post-9', name: '9', crowdinCollectionDirectory: 'cd-posts' },
        // collection no longer in the config
        { id: 'ad-removed-7', name: '7', crowdinCollectionDirectory: 'cd-removed' },
        // post 6 already has a linked row
        {
          id: 'ad-post-6-linked',
          name: '6',
          crowdinCollectionDirectory: 'cd-posts',
          collectionDocument: { value: '6', relationTo: 'posts' },
        },
        { id: 'ad-post-6-duplicate', name: '6', crowdinCollectionDirectory: 'cd-posts' },
      ],
    });

    const result = await backfillArticleDirectoryPolymorphicLinks(payload);

    expect(result).toEqual({ collectionDocumentsUpdated: 0, globalsUpdated: 0 });
    expect(payload.update).not.toHaveBeenCalled();
  });

  it('links rows across more than one page', async () => {
    const ids = Array.from({ length: 101 }, (_, i) => `${i + 1}`);
    const payload = buildPayload({
      posts: ids.map((id) => ({ id })),
      'crowdin-article-directories': ids.map((id) => ({
        id: `ad-post-${id}`,
        name: id,
        crowdinCollectionDirectory: 'cd-posts',
      })),
    });

    const result = await backfillArticleDirectoryPolymorphicLinks(payload);

    expect(result.collectionDocumentsUpdated).toBe(101);
  });

  it('does nothing on a second run', async () => {
    const payload = buildPayload({
      posts: [{ id: '5' }],
      'crowdin-article-directories': [
        { id: 'ad-post-5', name: '5', crowdinCollectionDirectory: 'cd-posts' },
      ],
    });

    await backfillArticleDirectoryPolymorphicLinks(payload);
    const second = await backfillArticleDirectoryPolymorphicLinks(payload);

    expect(second).toEqual({ collectionDocumentsUpdated: 0, globalsUpdated: 0 });
  });
});
