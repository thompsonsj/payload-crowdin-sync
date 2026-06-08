import { describe, expect, it } from 'vitest'
import type { Config } from 'payload'
import { crowdinSync } from './plugin'

/**
 * Minimal Payload config with one collection that has a localized field.
 * Cast to avoid providing every required Config property — the plugin only
 * accesses collections, globals, jobs, and admin.
 */
const minimalConfig = {
  collections: [
    {
      slug: 'posts',
      fields: [{ name: 'title', type: 'text', localized: true }],
    },
  ],
  globals: [],
} as unknown as Config

const basePluginOptions = {
  projectId: 123,
  token: 'fake-token',
  localeMap: { de: { crowdinId: 'de' } },
  sourceLocale: 'en',
}

/**
 * Finds the `collectionDocument` field inside the crowdin-article-directories
 * collection added by the plugin. It lives inside the 'Document' tab of the
 * top-level tabs field.
 */
function findCollectionDocumentField(outputConfig: Config) {
  const articleDirCollection = outputConfig.collections?.find(
    (c) => c.slug === 'crowdin-article-directories',
  )
  const tabsField = articleDirCollection?.fields?.[0] as any
  const documentTab = tabsField?.tabs?.find((t: any) => t.label === 'Document')
  return documentTab?.fields?.find((f: any) => f.name === 'collectionDocument')
}

describe('crowdinSync — issue #342: collectionDocument field registration', () => {
  it('registers collectionDocument in crowdin-article-directories when collections is not specified', () => {
    // When pluginOptions.collections is undefined, collectionOrGlobalConfigActive()
    // treats all collections as active and adds the afterRead hook that queries
    // `collectionDocument.value`. But syncedCollectionSlugs currently returns []
    // in this case, so collectionDocument is never added to the schema — causing
    // Payload to throw a QueryError on every collection page load.
    const outputConfig = crowdinSync(basePluginOptions)(minimalConfig)

    const field = findCollectionDocumentField(outputConfig)

    expect(field, 'collectionDocument field must be registered when collections is not specified').toBeDefined()
    expect(field.type).toBe('relationship')
    expect(field.relationTo).toContain('posts')
  })

  it('registers collectionDocument with explicit collections config (baseline)', () => {
    const outputConfig = crowdinSync({
      ...basePluginOptions,
      collections: ['posts'],
    })(minimalConfig)

    const field = findCollectionDocumentField(outputConfig)

    expect(field).toBeDefined()
    expect(field.type).toBe('relationship')
    expect(field.relationTo).toContain('posts')
  })
})
