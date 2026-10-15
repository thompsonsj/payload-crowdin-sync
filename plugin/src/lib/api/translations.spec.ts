import { payloadCrowdinSyncTranslationsApi } from './translations';
import { pluginOptions } from './mock/plugin-options';
import { buildPayloadUpdateObject } from '../utilities';

vi.mock('../utilities', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utilities')>();
  return {
    ...actual,
    buildPayloadUpdateObject: vi.fn(actual.buildPayloadUpdateObject),
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
      vi.spyOn(api, 'getCurrentDocumentTranslation').mockResolvedValue({
        title: 'Hallo',
      });

      await expect(
        api.getLatestDocumentTranslation({
          collection: 'posts',
          doc: { id: 'doc-1' },
          locale: 'de_DE',
        }),
      ).resolves.toEqual({ title: 'Hallo' });
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
      vi.mocked(buildPayloadUpdateObject).mockImplementationOnce(() => {
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
});