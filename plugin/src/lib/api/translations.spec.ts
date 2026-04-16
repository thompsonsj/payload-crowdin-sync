import { payloadCrowdinSyncTranslationsApi } from './translations';
import { pluginOptions } from './mock/plugin-options';

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
});