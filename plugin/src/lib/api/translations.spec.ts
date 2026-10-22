import { payloadCrowdinSyncTranslationsApi } from './translations';
import { pluginOptions } from './mock/plugin-options';
import { applyDocumentSlice } from './adapters';

vi.mock('./adapters', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./adapters')>();
  return {
    ...actual,
    applyDocumentSlice: vi.fn(actual.applyDocumentSlice),
  };
});

/**
 * Tests for new/changed behavior in translations.ts (PR diff scope).
 *
 * sanitizeRelationshipObjects is a private method on the class. We access it
 * via (instance as any) to test its behaviour in isolation without needing a
 * running Payload instance.
 */
describe('payloadCrowdinSyncTranslationsApi', () => {
  // Minimal stub payload – only the properties accessed in the constructor.
  const fakePayload = {} as any;

  let api: payloadCrowdinSyncTranslationsApi;

  beforeEach(() => {
    api = new payloadCrowdinSyncTranslationsApi(pluginOptions, fakePayload);
  });

  describe('sanitizeRelationshipObjects (private)', () => {
    const sanitize = (input: unknown) =>
      (api as any).sanitizeRelationshipObjects(input);

    it('returns null unchanged', () => {
      expect(sanitize(null)).toBeNull();
    });

    it('returns undefined unchanged', () => {
      expect(sanitize(undefined)).toBeUndefined();
    });

    it('returns primitive values unchanged', () => {
      expect(sanitize('hello')).toBe('hello');
      expect(sanitize(42)).toBe(42);
      expect(sanitize(true)).toBe(true);
    });

    it('replaces a Media-like object with its id (has filename)', () => {
      const mediaObject = {
        id: 'abc123',
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      expect(sanitize(mediaObject)).toBe('abc123');
    });

    it('replaces a doc-like object that has createdAt and string id with its id', () => {
      const docObject = {
        id: 'doc-id-001',
        createdAt: '2024-01-01T00:00:00.000Z',
        title: 'Some doc',
      };
      expect(sanitize(docObject)).toBe('doc-id-001');
    });

    it('replaces a doc-like object that has updatedAt and string id with its id', () => {
      const docObject = {
        id: 'doc-id-002',
        updatedAt: '2024-06-01T00:00:00.000Z',
        title: 'Another doc',
      };
      expect(sanitize(docObject)).toBe('doc-id-002');
    });

    it('replaces a doc-like object that has url and string id with its id', () => {
      const docObject = {
        id: 'media-url-id',
        url: '/media/photo.jpg',
      };
      expect(sanitize(docObject)).toBe('media-url-id');
    });

    it('replaces a doc-like object that has mimeType and string id with its id', () => {
      const docObject = {
        id: 'media-mime-id',
        mimeType: 'image/png',
      };
      expect(sanitize(docObject)).toBe('media-mime-id');
    });

    it('does NOT replace a plain object that lacks doc-like properties', () => {
      const plainObject = {
        id: 'some-id',
        key: 'value',
        nested: { foo: 'bar' },
      };
      expect(sanitize(plainObject)).toEqual({
        id: 'some-id',
        key: 'value',
        nested: { foo: 'bar' },
      });
    });

    it('does NOT replace if id is not a string', () => {
      const numericId = {
        id: 42,
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      // id is not a string → heuristic does not match → recurse normally
      expect(sanitize(numericId)).toEqual({
        id: 42,
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('recursively sanitizes items in an array', () => {
      const input = [
        { id: 'media-1', filename: 'a.png' },
        'plain-string',
        { id: 'media-2', mimeType: 'image/png' },
      ];
      expect(sanitize(input)).toEqual(['media-1', 'plain-string', 'media-2']);
    });

    it('recursively sanitizes nested objects', () => {
      const input = {
        title: 'My doc',
        image: {
          id: 'img-id',
          filename: 'hero.jpg',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(sanitize(input)).toEqual({
        title: 'My doc',
        image: 'img-id',
      });
    });

    it('recursively sanitizes deeply nested arrays of media objects', () => {
      const input = {
        blocks: [
          {
            blockType: 'imageText',
            image: {
              id: 'deep-img-id',
              filename: 'deep.png',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
            text: 'Some text',
          },
        ],
      };
      expect(sanitize(input)).toEqual({
        blocks: [
          {
            blockType: 'imageText',
            image: 'deep-img-id',
            text: 'Some text',
          },
        ],
      });
    });

    it('handles arrays at the top level', () => {
      expect(sanitize([])).toEqual([]);
    });

    it('handles empty objects', () => {
      expect(sanitize({})).toEqual({});
    });

    it('preserves non-doc-like objects that have string ids', () => {
      // Object with a string id but no sentinel properties → not collapsed
      const obj = { id: 'x', someOtherProp: 'y' };
      expect(sanitize(obj)).toEqual({ id: 'x', someOtherProp: 'y' });
    });
  });

  describe('readSlice', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    const collection = { slug: 'posts', fields: [] } as any;
    const slateDe = [{ type: 'p', children: [{ text: 'Hallo' }] }];

    it('composes json from the fields file and html from each html slug', async () => {
      vi.spyOn(api, 'getTranslation').mockImplementation(
        async ({ fieldName }) => {
          if (fieldName === 'fields') return { title: 'Hallo' };
          if (fieldName === 'body') return slateDe;
          return undefined;
        },
      );
      vi.spyOn(api, 'getHtmlFieldSlugs').mockResolvedValue(['body']);

      await expect(
        api.readSlice({
          documentId: 'doc-1',
          locale: 'de_DE',
          collection,
        }),
      ).resolves.toEqual({
        json: { title: 'Hallo' },
        html: { body: slateDe },
      });
    });

    it('logs json and html when PAYLOAD_CROWDIN_SYNC_VERBOSE is set', async () => {
      const previous = process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE;
      process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE = 'true';
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
      vi.spyOn(api, 'getTranslation').mockImplementation(
        async ({ fieldName }) => {
          if (fieldName === 'fields') return { title: 'Hallo' };
          if (fieldName === 'body') return slateDe;
          return undefined;
        },
      );
      vi.spyOn(api, 'getHtmlFieldSlugs').mockResolvedValue(['body']);

      try {
        await api.readSlice({
          documentId: 'doc-1',
          locale: 'de_DE',
          collection,
        });
        expect(log).toHaveBeenCalledWith('readSlice: json', { title: 'Hallo' });
        expect(log).toHaveBeenCalledWith(
          'readSlice: html',
          JSON.stringify({ body: slateDe }),
        );
      } finally {
        if (previous === undefined) {
          delete process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE;
        } else {
          process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE = previous;
        }
      }
    });

    it('uses an empty json object when the fields file is missing', async () => {
      vi.spyOn(api, 'getTranslation').mockResolvedValue(undefined);
      vi.spyOn(api, 'getHtmlFieldSlugs').mockResolvedValue([]);

      await expect(
        api.readSlice({
          documentId: 'doc-1',
          locale: 'de_DE',
          collection,
        }),
      ).resolves.toEqual({ json: {}, html: {} });
    });
  });

  describe('getLatestDocumentTranslation', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('applies the slice from readSlice', async () => {
      vi.spyOn(api, 'getCollectionConfig').mockReturnValue({
        slug: 'posts',
        fields: [{ name: 'title', type: 'text', localized: true }],
      } as any);
      vi.spyOn(api, 'readSlice').mockResolvedValue({ json: { title: 'Hallo' } });

      await expect(
        api.getLatestDocumentTranslation({
          collection: 'posts',
          doc: { id: 'doc-1', title: 'Hello' },
          locale: 'de_DE',
        }),
      ).resolves.toEqual({ title: 'Hallo' });
    });

    it('uses the collection slug as documentId for globals', async () => {
      vi.spyOn(api, 'getCollectionConfig').mockReturnValue({
        slug: 'site-settings',
        fields: [{ name: 'title', type: 'text', localized: true }],
      } as any);
      const readSlice = vi
        .spyOn(api, 'readSlice')
        .mockResolvedValue({ json: { title: 'Hallo' } });

      await api.getLatestDocumentTranslation({
        collection: 'site-settings',
        doc: { title: 'Hello' },
        locale: 'de_DE',
        global: true,
      });

      expect(readSlice).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'site-settings',
          global: true,
        }),
      );
    });

    it('fills missing required localized fields from the current translation', async () => {
      vi.spyOn(api, 'getCollectionConfig').mockReturnValue({
        slug: 'posts',
        fields: [
          { name: 'title', type: 'text', localized: true, required: true },
        ],
      } as any);
      vi.spyOn(api, 'readSlice').mockResolvedValue({ json: {} });
      const getCurrent = vi
        .spyOn(api, 'getCurrentDocumentTranslation')
        .mockResolvedValue({
          title: 'Hallo',
        });

      await expect(
        api.getLatestDocumentTranslation({
          collection: 'posts',
          doc: { id: 'doc-1' },
          locale: 'de_DE',
          draft: true,
        }),
      ).resolves.toEqual({ title: 'Hallo' });
      expect(getCurrent).toHaveBeenCalledWith(
        expect.objectContaining({ draft: true }),
      );
    });

    it('forwards draft: false when filling required localized fields', async () => {
      vi.spyOn(api, 'getCollectionConfig').mockReturnValue({
        slug: 'posts',
        fields: [
          { name: 'title', type: 'text', localized: true, required: true },
        ],
      } as any);
      vi.spyOn(api, 'readSlice').mockResolvedValue({ json: {} });
      const getCurrent = vi
        .spyOn(api, 'getCurrentDocumentTranslation')
        .mockResolvedValue({
          title: 'Hallo',
        });

      await api.getLatestDocumentTranslation({
        collection: 'posts',
        doc: { id: 'doc-1' },
        locale: 'de_DE',
        draft: false,
      });

      expect(getCurrent).toHaveBeenCalledWith(
        expect.objectContaining({ draft: false }),
      );
    });

    it('returns a message when the collection has no config', async () => {
      vi.spyOn(api, 'getCollectionConfig').mockImplementation(() => {
        throw new Error('missing');
      });
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await expect(
        api.getLatestDocumentTranslation({
          collection: 'missing',
          doc: { id: '1' },
          locale: 'de_DE',
        }),
      ).resolves.toEqual({ message: 'no localized fields' });
    });
  });

  describe('getCurrentDocumentTranslation', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('rethrows errors from building the update object with the original error as cause', async () => {
      const payload = {
        findByID: vi.fn().mockResolvedValue({ id: 'doc-1', title: 'Hello' }),
      } as any;
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        pluginOptions,
        payload,
      );
      vi.spyOn(translationsApi, 'getCollectionConfig').mockReturnValue({
        slug: 'posts',
        fields: [{ name: 'title', type: 'text', localized: true }],
      } as any);
      const original = new Error('cannot build update object');
      vi.mocked(applyDocumentSlice).mockImplementationOnce(() => {
        throw original;
      });
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const result = translationsApi.getCurrentDocumentTranslation({
        doc: { id: 'doc-1' },
        collection: 'posts',
        locale: 'de_DE',
      });

      await expect(result).rejects.toThrow('cannot build update object');
      const rejection = await result.catch((error: Error) => error);
      expect(rejection.cause).toBe(original);
    });
  });

  describe('updateTranslation (#306)', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    const draftSourceDoc = {
      id: 'doc-1',
      title: 'Draft title',
      translateWithCrowdin: true,
    };

    const inactiveSourceDoc = {
      id: 'doc-1',
      title: 'Changed after opt-out',
      translateWithCrowdin: false,
    };

    const makeApi = (
      doc: Record<string, unknown>,
      options: typeof pluginOptions = pluginOptions,
    ) => {
      const payload = {
        findByID: vi.fn().mockResolvedValue(doc),
        findGlobal: vi.fn().mockResolvedValue(doc),
        update: vi.fn(),
        updateGlobal: vi.fn(),
      } as any;
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        options,
        payload,
      );
      vi.spyOn(
        translationsApi,
        'getCurrentDocumentTranslation',
      ).mockResolvedValue({ title: 'Hallo' });
      vi.spyOn(
        translationsApi,
        'getLatestDocumentTranslation',
      ).mockResolvedValue({ title: 'Hallo' });
      return { translationsApi, payload };
    };

    it('loads the latest draft as the source document even when writing published translations', async () => {
      const { translationsApi, payload } = makeApi(draftSourceDoc);

      await translationsApi.updateTranslation({
        documentId: 'doc-1',
        collection: 'localized-posts',
        dryRun: true,
        draft: false,
      });

      expect(payload.findByID).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'doc-1',
          locale: 'en',
          draft: true,
        }),
      );
    });

    it('loads the latest draft of a global as the source document', async () => {
      const { translationsApi, payload } = makeApi(draftSourceDoc);

      await translationsApi.updateTranslation({
        documentId: '',
        collection: 'nav',
        global: true,
        dryRun: true,
        draft: false,
      });

      expect(payload.findGlobal).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'nav',
          locale: 'en',
          draft: true,
        }),
      );
    });

    it('does not pull Crowdin translations when the collection condition is false', async () => {
      const { translationsApi, payload } = makeApi(inactiveSourceDoc, {
        ...pluginOptions,
        collections: [
          {
            slug: 'localized-posts',
            condition: ({ doc }) => Boolean(doc.translateWithCrowdin),
          },
        ],
      });

      const result = await translationsApi.updateTranslation({
        documentId: 'doc-1',
        collection: 'localized-posts',
        dryRun: false,
      });

      expect(translationsApi.getLatestDocumentTranslation).not.toHaveBeenCalled();
      expect(
        translationsApi.getCurrentDocumentTranslation,
      ).not.toHaveBeenCalled();
      expect(payload.update).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          source: inactiveSourceDoc,
          skipped: true,
        }),
      );
    });

    it('does not pull Crowdin translations when the global condition is false', async () => {
      const { translationsApi, payload } = makeApi(inactiveSourceDoc, {
        ...pluginOptions,
        globals: [
          {
            slug: 'nav',
            condition: ({ doc }) => Boolean(doc.translateWithCrowdin),
          },
        ],
      });

      const result = await translationsApi.updateTranslation({
        documentId: '',
        collection: 'nav',
        global: true,
        dryRun: false,
      });

      expect(translationsApi.getLatestDocumentTranslation).not.toHaveBeenCalled();
      expect(payload.updateGlobal).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          source: inactiveSourceDoc,
          skipped: true,
        }),
      );
    });

    it('still pulls translations when the collection condition is met', async () => {
      const { translationsApi } = makeApi(draftSourceDoc, {
        ...pluginOptions,
        collections: [
          {
            slug: 'localized-posts',
            condition: ({ doc }) => Boolean(doc.translateWithCrowdin),
          },
        ],
      });

      await translationsApi.updateTranslation({
        documentId: 'doc-1',
        collection: 'localized-posts',
        dryRun: true,
      });

      expect(translationsApi.getLatestDocumentTranslation).toHaveBeenCalled();
    });

    it('still pulls translations when the global condition is met', async () => {
      const { translationsApi } = makeApi(draftSourceDoc, {
        ...pluginOptions,
        globals: [
          {
            slug: 'nav',
            condition: ({ doc }) => Boolean(doc.translateWithCrowdin),
          },
        ],
      });

      await translationsApi.updateTranslation({
        documentId: '',
        collection: 'nav',
        global: true,
        dryRun: true,
      });

      expect(translationsApi.getLatestDocumentTranslation).toHaveBeenCalled();
    });

    it('does not pull translations for a global omitted from the globals allowlist', async () => {
      const { translationsApi, payload } = makeApi(draftSourceDoc, {
        ...pluginOptions,
        globals: ['footer'],
        collections: ['nav'],
      });

      const result = await translationsApi.updateTranslation({
        documentId: '',
        collection: 'nav',
        global: true,
        dryRun: false,
      });

      expect(translationsApi.getLatestDocumentTranslation).not.toHaveBeenCalled();
      expect(payload.updateGlobal).not.toHaveBeenCalled();
      expect(result.skipped).toBe(true);
      expect(result.translations).toEqual({});
    });

    it('does not pull translations for a collection omitted from the collections allowlist', async () => {
      const { translationsApi, payload } = makeApi(draftSourceDoc, {
        ...pluginOptions,
        collections: ['posts'],
      });

      const result = await translationsApi.updateTranslation({
        documentId: 'doc-1',
        collection: 'localized-posts',
        dryRun: false,
      });

      expect(translationsApi.getLatestDocumentTranslation).not.toHaveBeenCalled();
      expect(payload.update).not.toHaveBeenCalled();
      expect(result.skipped).toBe(true);
    });

    it('does not pull translations when collections is an empty allowlist', async () => {
      const { translationsApi } = makeApi(draftSourceDoc, {
        ...pluginOptions,
        collections: [],
      });

      const result = await translationsApi.updateTranslation({
        documentId: 'doc-1',
        collection: 'localized-posts',
        dryRun: false,
      });

      expect(translationsApi.getLatestDocumentTranslation).not.toHaveBeenCalled();
      expect(result.skipped).toBe(true);
    });

    it('does not pull translations when globals is an empty allowlist', async () => {
      const { translationsApi } = makeApi(draftSourceDoc, {
        ...pluginOptions,
        globals: [],
      });

      const result = await translationsApi.updateTranslation({
        documentId: '',
        collection: 'nav',
        global: true,
        dryRun: false,
      });

      expect(translationsApi.getLatestDocumentTranslation).not.toHaveBeenCalled();
      expect(result.skipped).toBe(true);
    });

    it('passes the latest-draft source document into getLatestDocumentTranslation', async () => {
      const { translationsApi } = makeApi(draftSourceDoc);

      await translationsApi.updateTranslation({
        documentId: 'doc-1',
        collection: 'localized-posts',
        dryRun: true,
        draft: false,
      });

      expect(translationsApi.getLatestDocumentTranslation).toHaveBeenCalledWith(
        expect.objectContaining({
          doc: draftSourceDoc,
          draft: false,
        }),
      );
    });
  });
});
