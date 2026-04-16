import {
  isDefined,
  isCollectionOrGlobalConfigObject,
  isCollectionOrGlobalConfigSlug,
  isCrowdinArticleDirectory,
  isCrowdinCollectionDirectory,
  type PluginOptions,
} from './types';

/**
 * Tests for the PluginOptions.deleteCrowdinFiles field and existing type guards.
 */

describe('PluginOptions: deleteCrowdinFiles field', () => {
  it('accepts a PluginOptions object with deleteCrowdinFiles set to true', () => {
    const opts: PluginOptions = {
      projectId: 1,
      token: 'tok',
      localeMap: { fr_FR: { crowdinId: 'fr' } },
      sourceLocale: 'en',
      deleteCrowdinFiles: true,
    };
    expect(opts.deleteCrowdinFiles).toBe(true);
  });

  it('accepts a PluginOptions object with deleteCrowdinFiles set to false', () => {
    const opts: PluginOptions = {
      projectId: 1,
      token: 'tok',
      localeMap: { fr_FR: { crowdinId: 'fr' } },
      sourceLocale: 'en',
      deleteCrowdinFiles: false,
    };
    expect(opts.deleteCrowdinFiles).toBe(false);
  });

  it('accepts a PluginOptions object without deleteCrowdinFiles (optional field)', () => {
    const opts: PluginOptions = {
      projectId: 1,
      token: 'tok',
      localeMap: { fr_FR: { crowdinId: 'fr' } },
      sourceLocale: 'en',
    };
    expect(opts.deleteCrowdinFiles).toBeUndefined();
  });

  it('defaults to falsy behavior when not provided', () => {
    const opts: PluginOptions = {
      projectId: 1,
      token: 'tok',
      localeMap: {},
      sourceLocale: 'en',
    };
    // When not set, it should be treated as false (undefined is falsy)
    expect(!opts.deleteCrowdinFiles).toBe(true);
  });
});

describe('isDefined', () => {
  it('returns true for a defined value', () => {
    expect(isDefined('hello')).toBe(true);
    expect(isDefined(0)).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined({})).toBe(true);
  });

  it('returns false for null', () => {
    expect(isDefined(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isDefined(undefined)).toBe(false);
  });
});

describe('isCollectionOrGlobalConfigObject', () => {
  it('returns true for an object config', () => {
    expect(isCollectionOrGlobalConfigObject({ slug: 'posts' })).toBe(true);
  });

  it('returns false for a string config', () => {
    expect(isCollectionOrGlobalConfigObject('posts')).toBe(false);
  });
});

describe('isCollectionOrGlobalConfigSlug', () => {
  it('returns true for a string config', () => {
    expect(isCollectionOrGlobalConfigSlug('posts')).toBe(true);
  });

  it('returns false for an object config', () => {
    expect(isCollectionOrGlobalConfigSlug({ slug: 'posts' })).toBe(false);
  });
});

describe('isCrowdinArticleDirectory', () => {
  it('returns true for an object value', () => {
    const dir = { id: 'dir-001', originalId: 123 };
    expect(isCrowdinArticleDirectory(dir as any)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isCrowdinArticleDirectory(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isCrowdinArticleDirectory(undefined)).toBe(false);
  });

  it('returns false for a string (relationship stored as ID)', () => {
    expect(isCrowdinArticleDirectory('dir-001')).toBe(false);
  });
});

describe('isCrowdinCollectionDirectory', () => {
  it('returns true for an object value', () => {
    const dir = { id: 'col-001', originalId: 456 };
    expect(isCrowdinCollectionDirectory(dir as any)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isCrowdinCollectionDirectory(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isCrowdinCollectionDirectory(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isCrowdinCollectionDirectory('col-001')).toBe(false);
  });
});