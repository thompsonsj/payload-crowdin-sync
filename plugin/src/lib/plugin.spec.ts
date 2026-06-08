import { describe, expect, it } from 'vitest'
import type { Config } from 'payload'
import { crowdinSync } from './plugin'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const minimalCollection = {
  slug: 'posts',
  fields: [{ name: 'title', type: 'text', localized: true }],
}

const minimalGlobal = {
  slug: 'nav',
  fields: [{ name: 'label', type: 'text', localized: true }],
}

const basePluginOptions = {
  projectId: 123,
  token: 'fake-token',
  localeMap: { de: { crowdinId: 'de' } },
  sourceLocale: 'en',
}

/** Build a minimal Config. The plugin only accesses collections, globals, jobs, and admin. */
function buildConfig(overrides: { collections?: any[]; globals?: any[] } = {}): Config {
  return {
    collections: overrides.collections ?? [minimalCollection],
    globals: overrides.globals ?? [],
  } as unknown as Config
}

// ---------------------------------------------------------------------------
// Helpers — navigate the crowdin-article-directories field structure
// ---------------------------------------------------------------------------

function getArticleDirectoryCollection(outputConfig: Config) {
  return outputConfig.collections?.find((c) => c.slug === 'crowdin-article-directories')
}

function getDocumentTab(outputConfig: Config) {
  const collection = getArticleDirectoryCollection(outputConfig)
  const tabsField = collection?.fields?.[0] as any
  return tabsField?.tabs?.find((t: any) => t.label === 'Document') as any | undefined
}

function findCollectionDocumentField(outputConfig: Config) {
  return getDocumentTab(outputConfig)?.fields?.find((f: any) => f.name === 'collectionDocument')
}

function findGlobalSlugField(outputConfig: Config) {
  return getDocumentTab(outputConfig)?.fields?.find((f: any) => f.name === 'globalSlug')
}

// ---------------------------------------------------------------------------
// collectionDocument field registration
// ---------------------------------------------------------------------------

describe('crowdinSync — collectionDocument field registration', () => {
  it('registers the field when pluginOptions.collections is not specified (issue #342)', () => {
    // Bug: syncedCollectionSlugs returned [] when collections was undefined,
    // so collectionDocument was never added to the schema. The afterRead hook
    // queries collectionDocument.value, causing a QueryError on every page load.
    const output = crowdinSync(basePluginOptions)(buildConfig())

    const field = findCollectionDocumentField(output)
    expect(field, 'collectionDocument must be registered').toBeDefined()
    expect(field.type).toBe('relationship')
    expect(field.relationTo).toContain('posts')
  })

  it('registers the field with an explicit collections config (baseline)', () => {
    const output = crowdinSync({
      ...basePluginOptions,
      collections: ['posts'],
    })(buildConfig())

    const field = findCollectionDocumentField(output)
    expect(field).toBeDefined()
    expect(field.type).toBe('relationship')
    expect(field.relationTo).toContain('posts')
  })

  it('does NOT register the field when config.collections is an empty array', () => {
    const output = crowdinSync(basePluginOptions)(buildConfig({ collections: [] }))
    expect(findCollectionDocumentField(output)).toBeUndefined()
  })

  it('does NOT register the field when config.collections is undefined', () => {
    const output = crowdinSync(basePluginOptions)(
      { globals: [] } as unknown as Config,
    )
    expect(findCollectionDocumentField(output)).toBeUndefined()
  })

  it('does NOT register the field when pluginOptions.collections is an empty array', () => {
    const output = crowdinSync({
      ...basePluginOptions,
      collections: [],
    })(buildConfig())
    expect(findCollectionDocumentField(output)).toBeUndefined()
  })

  it('relationTo only contains the slugs listed in pluginOptions.collections', () => {
    const configWithTwo = buildConfig({
      collections: [
        minimalCollection,
        { slug: 'pages', fields: [{ name: 'body', type: 'text', localized: true }] },
      ],
    })
    const output = crowdinSync({
      ...basePluginOptions,
      collections: ['posts'],
    })(configWithTwo)

    const field = findCollectionDocumentField(output)
    expect(field).toBeDefined()
    expect(field.relationTo).toContain('posts')
    expect(field.relationTo).not.toContain('pages')
  })

  it('relationTo contains all collection slugs when pluginOptions.collections is undefined', () => {
    const configWithTwo = buildConfig({
      collections: [
        minimalCollection,
        { slug: 'pages', fields: [{ name: 'body', type: 'text', localized: true }] },
      ],
    })
    const output = crowdinSync(basePluginOptions)(configWithTwo)

    const field = findCollectionDocumentField(output)
    expect(field).toBeDefined()
    expect(field.relationTo).toContain('posts')
    expect(field.relationTo).toContain('pages')
  })
})

// ---------------------------------------------------------------------------
// globalSlug field registration
// ---------------------------------------------------------------------------

describe('crowdinSync — globalSlug field registration', () => {
  it('registers the field when pluginOptions.globals is not specified and config has globals', () => {
    const output = crowdinSync(basePluginOptions)(buildConfig({ globals: [minimalGlobal] }))

    const field = findGlobalSlugField(output)
    expect(field, 'globalSlug must be registered').toBeDefined()
    expect(field.type).toBe('select')
    expect(field.options).toContain('nav')
  })

  it('registers the field with an explicit globals config (baseline)', () => {
    const output = crowdinSync({
      ...basePluginOptions,
      globals: ['nav'],
    })(buildConfig({ globals: [minimalGlobal] }))

    const field = findGlobalSlugField(output)
    expect(field).toBeDefined()
    expect(field.type).toBe('select')
    expect(field.options).toContain('nav')
  })

  it('does NOT register the field when config.globals is an empty array', () => {
    // Empty globals array in the config: no globals to sync, field must be absent.
    const output = crowdinSync(basePluginOptions)(buildConfig({ globals: [] }))
    expect(findGlobalSlugField(output)).toBeUndefined()
  })

  it('does NOT register the field when config.globals is undefined', () => {
    const output = crowdinSync(basePluginOptions)(
      { collections: [minimalCollection] } as unknown as Config,
    )
    expect(findGlobalSlugField(output)).toBeUndefined()
  })

  it('does NOT register the field when pluginOptions.globals is an empty array', () => {
    const output = crowdinSync({
      ...basePluginOptions,
      globals: [],
    })(buildConfig({ globals: [minimalGlobal] }))
    expect(findGlobalSlugField(output)).toBeUndefined()
  })

  it('options only contains the slugs listed in pluginOptions.globals', () => {
    const configWithTwo = buildConfig({
      globals: [
        minimalGlobal,
        { slug: 'footer', fields: [{ name: 'text', type: 'text', localized: true }] },
      ],
    })
    const output = crowdinSync({
      ...basePluginOptions,
      globals: ['nav'],
    })(configWithTwo)

    const field = findGlobalSlugField(output)
    expect(field).toBeDefined()
    expect(field.options).toContain('nav')
    expect(field.options).not.toContain('footer')
  })

  it('options contains all global slugs when pluginOptions.globals is undefined', () => {
    const configWithTwo = buildConfig({
      globals: [
        minimalGlobal,
        { slug: 'footer', fields: [{ name: 'text', type: 'text', localized: true }] },
      ],
    })
    const output = crowdinSync(basePluginOptions)(configWithTwo)

    const field = findGlobalSlugField(output)
    expect(field).toBeDefined()
    expect(field.options).toContain('nav')
    expect(field.options).toContain('footer')
  })
})

// ---------------------------------------------------------------------------
// Document tab presence
// ---------------------------------------------------------------------------

describe('crowdinSync — Document tab in crowdin-article-directories', () => {
  it('omits the Document tab when no collections or globals are configured', () => {
    const output = crowdinSync(basePluginOptions)(buildConfig({ collections: [], globals: [] }))
    expect(getDocumentTab(output)).toBeUndefined()
  })

  it('includes the Document tab when only collections are present', () => {
    const output = crowdinSync(basePluginOptions)(buildConfig({ globals: [] }))
    expect(getDocumentTab(output)).toBeDefined()
  })

  it('includes the Document tab when only globals are present', () => {
    const output = crowdinSync(basePluginOptions)(
      buildConfig({ collections: [], globals: [minimalGlobal] }),
    )
    expect(getDocumentTab(output)).toBeDefined()
  })

  it('includes the Document tab with both fields when config has both collections and globals', () => {
    const output = crowdinSync(basePluginOptions)(
      buildConfig({ globals: [minimalGlobal] }),
    )
    const tab = getDocumentTab(output)
    expect(tab).toBeDefined()
    expect(tab.fields.map((f: any) => f.name)).toContain('collectionDocument')
    expect(tab.fields.map((f: any) => f.name)).toContain('globalSlug')
  })
})
