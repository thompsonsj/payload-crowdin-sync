import type { Field } from 'payload';
import type { Payload } from 'payload';
import { backfillArticleDirectoryPolymorphicLinks } from './backfillArticleDirectoryPolymorphicLinks';

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
