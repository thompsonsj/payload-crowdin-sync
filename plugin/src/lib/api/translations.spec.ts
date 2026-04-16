/**
 * Tests for new/changed code in translations.ts (PR scope):
 *  - sanitizeRelationshipObjects private method (added in PR)
 *  - depth: 0 additions (regression guard via observable behaviour)
 */
import { payloadCrowdinSyncTranslationsApi } from './translations';
import { pluginOptions } from './mock/plugin-options';

/**
 * Build a minimal instance of payloadCrowdinSyncTranslationsApi so we can
 * access the private `sanitizeRelationshipObjects` helper via a type cast.
 * No network access is performed; the Crowdin Client constructor is lazy.
 */
function buildApi() {
  // payload is never called in these tests – a bare object is enough.
  const mockPayload = {} as any;
  return new payloadCrowdinSyncTranslationsApi(pluginOptions, mockPayload);
}

describe('payloadCrowdinSyncTranslationsApi: sanitizeRelationshipObjects', () => {
  let api: payloadCrowdinSyncTranslationsApi;

  beforeAll(() => {
    api = buildApi();
  });

  const sanitize = (input: unknown) =>
    (api as any).sanitizeRelationshipObjects(input);

  describe('primitive pass-through', () => {
    it('returns null unchanged', () => {
      expect(sanitize(null)).toBeNull();
    });

    it('returns undefined unchanged', () => {
      expect(sanitize(undefined)).toBeUndefined();
    });

    it('returns strings unchanged', () => {
      expect(sanitize('hello')).toBe('hello');
    });

    it('returns numbers unchanged', () => {
      expect(sanitize(42)).toBe(42);
    });

    it('returns booleans unchanged', () => {
      expect(sanitize(true)).toBe(true);
    });
  });

  describe('array handling', () => {
    it('maps over arrays recursively', () => {
      expect(sanitize([1, 'two', null])).toEqual([1, 'two', null]);
    });

    it('sanitizes populated documents inside an array', () => {
      const mediaDoc = {
        id: 'abc123',
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        url: '/uploads/photo.jpg',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      expect(sanitize([mediaDoc, 'plain-string'])).toEqual([
        'abc123',
        'plain-string',
      ]);
    });

    it('handles nested arrays', () => {
      const nested = [[{ id: 'x', createdAt: '2024-01-01T00:00:00.000Z' }]];
      expect(sanitize(nested)).toEqual([['x']]);
    });
  });

  describe('doc-like object detection', () => {
    it('replaces an object with a createdAt field with its id', () => {
      const doc = {
        id: 'doc-id-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        title: 'Some title',
      };
      expect(sanitize(doc)).toBe('doc-id-1');
    });

    it('replaces an object with an updatedAt field with its id', () => {
      const doc = {
        id: 'doc-id-2',
        updatedAt: '2024-01-01T00:00:00.000Z',
        name: 'Example',
      };
      expect(sanitize(doc)).toBe('doc-id-2');
    });

    it('replaces an object with a filename field with its id', () => {
      const media = {
        id: 'media-id-1',
        filename: 'image.png',
        size: 1024,
      };
      expect(sanitize(media)).toBe('media-id-1');
    });

    it('replaces an object with a mimeType field with its id', () => {
      const media = {
        id: 'media-id-2',
        mimeType: 'image/png',
      };
      expect(sanitize(media)).toBe('media-id-2');
    });

    it('replaces an object with a url field with its id', () => {
      const media = {
        id: 'media-id-3',
        url: 'https://example.com/file.jpg',
      };
      expect(sanitize(media)).toBe('media-id-3');
    });

    it('does NOT replace a plain object without doc-like fields', () => {
      const plain = { foo: 'bar', baz: 123 };
      expect(sanitize(plain)).toEqual({ foo: 'bar', baz: 123 });
    });

    it('does NOT replace an object whose id is not a string', () => {
      const obj = { id: 42, createdAt: '2024-01-01T00:00:00.000Z' };
      // id is a number, not a string – should not be replaced
      expect(sanitize(obj)).toEqual({
        id: 42,
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });
  });

  describe('deep / nested object handling', () => {
    it('recursively sanitizes nested objects', () => {
      const input = {
        title: 'My doc',
        image: {
          id: 'img-1',
          filename: 'hero.jpg',
          mimeType: 'image/jpeg',
        },
      };
      expect(sanitize(input)).toEqual({
        title: 'My doc',
        image: 'img-1',
      });
    });

    it('sanitizes a Lexical-style block node containing a relationship', () => {
      const node = {
        type: 'block',
        fields: {
          blockType: 'imageText',
          image: {
            id: 'media-abc',
            filename: 'banner.jpg',
            url: '/uploads/banner.jpg',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          caption: 'A caption',
        },
      };

      expect(sanitize(node)).toEqual({
        type: 'block',
        fields: {
          blockType: 'imageText',
          image: 'media-abc',
          caption: 'A caption',
        },
      });
    });

    it('keeps plain id strings (already sanitized) untouched', () => {
      const input = {
        image: 'already-an-id',
        title: 'Text',
      };
      expect(sanitize(input)).toEqual(input);
    });

    it('handles arrays of Lexical block nodes with nested relationships', () => {
      const blocks = [
        {
          type: 'block',
          fields: {
            blockType: 'hero',
            media: {
              id: 'm1',
              url: '/uploads/m1.png',
            },
          },
        },
        {
          type: 'block',
          fields: {
            blockType: 'text',
            body: 'Some text',
          },
        },
      ];

      expect(sanitize(blocks)).toEqual([
        {
          type: 'block',
          fields: {
            blockType: 'hero',
            media: 'm1',
          },
        },
        {
          type: 'block',
          fields: {
            blockType: 'text',
            body: 'Some text',
          },
        },
      ]);
    });
  });
});