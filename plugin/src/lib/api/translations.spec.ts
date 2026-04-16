import { payloadCrowdinSyncTranslationsApi } from './translations';
import { pluginOptions } from './mock/plugin-options';

/**
 * Helper to access the private sanitizeRelationshipObjects method for testing.
 */
function sanitize(
  instance: payloadCrowdinSyncTranslationsApi,
  input: unknown,
): any {
  return (instance as any).sanitizeRelationshipObjects(input);
}

function makeApi() {
  // Provide minimal Payload mock; constructor only stores it, doesn't call it.
  const fakePayload = {} as any;
  return new payloadCrowdinSyncTranslationsApi(pluginOptions, fakePayload);
}

describe('payloadCrowdinSyncTranslationsApi: sanitizeRelationshipObjects', () => {
  let api: payloadCrowdinSyncTranslationsApi;

  beforeEach(() => {
    api = makeApi();
  });

  it('returns null unchanged', () => {
    expect(sanitize(api, null)).toBeNull();
  });

  it('returns undefined unchanged', () => {
    expect(sanitize(api, undefined)).toBeUndefined();
  });

  it('returns a string unchanged', () => {
    expect(sanitize(api, 'hello')).toBe('hello');
  });

  it('returns a number unchanged', () => {
    expect(sanitize(api, 42)).toBe(42);
  });

  it('returns a boolean unchanged', () => {
    expect(sanitize(api, true)).toBe(true);
  });

  it('maps over arrays recursively', () => {
    const input = ['a', 'b', 'c'];
    expect(sanitize(api, input)).toEqual(['a', 'b', 'c']);
  });

  it('replaces a doc-like object with its id when createdAt is present', () => {
    const mediaDoc = {
      id: 'abc123',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      filename: 'image.png',
      mimeType: 'image/png',
      url: '/media/image.png',
    };
    expect(sanitize(api, mediaDoc)).toBe('abc123');
  });

  it('replaces a doc-like object with its id when only updatedAt is present', () => {
    const obj = { id: 'doc-id', updatedAt: '2024-01-01T00:00:00.000Z' };
    expect(sanitize(api, obj)).toBe('doc-id');
  });

  it('replaces a doc-like object with its id when only filename is present', () => {
    const obj = { id: 'file-id', filename: 'document.pdf' };
    expect(sanitize(api, obj)).toBe('file-id');
  });

  it('replaces a doc-like object with its id when only mimeType is present', () => {
    const obj = { id: 'mime-id', mimeType: 'application/pdf' };
    expect(sanitize(api, obj)).toBe('mime-id');
  });

  it('replaces a doc-like object with its id when only url is present', () => {
    const obj = { id: 'url-id', url: 'https://example.com/file.pdf' };
    expect(sanitize(api, obj)).toBe('url-id');
  });

  it('does not replace a plain object without doc-like properties', () => {
    const obj = { id: 'some-id', title: 'Test', content: 'hello' };
    expect(sanitize(api, obj)).toEqual({
      id: 'some-id',
      title: 'Test',
      content: 'hello',
    });
  });

  it('does not replace when id is a number (not a string)', () => {
    const obj = { id: 42, createdAt: '2024-01-01T00:00:00.000Z' };
    expect(sanitize(api, obj)).toEqual({
      id: 42,
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  });

  it('does not replace when id is absent', () => {
    const obj = { createdAt: '2024-01-01T00:00:00.000Z', filename: 'x.png' };
    expect(sanitize(api, obj)).toEqual(obj);
  });

  it('recursively sanitizes nested objects', () => {
    const input = {
      title: 'Post title',
      image: {
        id: 'nested-id',
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        url: '/media/photo.jpg',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    };
    expect(sanitize(api, input)).toEqual({
      title: 'Post title',
      image: 'nested-id',
    });
  });

  it('recursively sanitizes doc-like objects inside arrays', () => {
    const mediaDoc = {
      id: 'arr-id',
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    const input = [mediaDoc, 'plain-string'];
    expect(sanitize(api, input)).toEqual(['arr-id', 'plain-string']);
  });

  it('recursively sanitizes deeply nested arrays and objects', () => {
    const input = {
      blocks: [
        {
          blockType: 'imageText',
          fields: {
            image: {
              id: 'deep-id',
              url: '/media/deep.jpg',
            },
            text: 'Hello world',
          },
        },
      ],
    };
    const expected = {
      blocks: [
        {
          blockType: 'imageText',
          fields: {
            image: 'deep-id',
            text: 'Hello world',
          },
        },
      ],
    };
    expect(sanitize(api, input)).toEqual(expected);
  });

  it('handles an empty object without throwing', () => {
    expect(sanitize(api, {})).toEqual({});
  });

  it('handles an empty array without throwing', () => {
    expect(sanitize(api, [])).toEqual([]);
  });

  it('preserves primitive values inside a mixed object', () => {
    const input = {
      count: 5,
      enabled: false,
      label: 'test',
      nested: { foo: 'bar' },
    };
    expect(sanitize(api, input)).toEqual(input);
  });
});