/**
 * Integration test for issue #342.
 *
 * When pluginOptions.collections is undefined the plugin treats all collections
 * as active, but previously syncedCollectionSlugs returned [] which meant the
 * collectionDocument field was never registered on crowdin-article-directories.
 * The afterRead hook on crowdinArticleDirectory always queries
 * `collectionDocument.value`, so any payload.findByID() call on a synced
 * collection threw:
 *
 *   QueryError: The following paths cannot be queried:
 *     collectionDocument, collectionDocument
 *
 * These tests verify that loading a collection document succeeds when
 * pluginOptions.collections is not specified.
 */
import type { Payload } from 'payload'
import { mockCrowdinClient } from 'payload-crowdin-sync'
import nock from 'nock'

import { pluginConfig } from '../helpers/plugin-config'
import { initPayloadInt } from '../helpers/initPayloadInt'
import { assertCrowdinNocksDone, cleanCrowdinNocks } from '../helpers/crowdin-nock'

// Plugin options with collections intentionally omitted — the issue #342 scenario.
const pluginOptionsOverride = {
  collections: undefined,
}

const pluginOptions = pluginConfig(pluginOptionsOverride)
const mockClient = mockCrowdinClient(pluginOptions)

let payload: Payload

describe('issue #342 — collections: undefined does not cause QueryError', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt({
      testSuiteName: 'issue-342',
      pluginOptionsOverride,
    })
    ;({ payload } = initialized as {
      payload: Payload
    })
  })

  beforeEach(() => {
    cleanCrowdinNocks()
  })

  afterEach(() => {
    assertCrowdinNocksDone()
  })

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
  })

  it('reads a localized collection document without throwing a QueryError', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .twice()
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(200, mockClient.createFile({}))

    const created = await payload.create({
      collection: 'localized-posts',
      data: { title: 'Issue 342 test' },
    })

    // findByID triggers the afterRead hook which queries collectionDocument.value
    // on crowdin-article-directories. Before the fix this threw a QueryError.
    await expect(
      payload.findByID({ collection: 'localized-posts', id: created.id }),
    ).resolves.toBeDefined()
  })

  it('populates crowdinArticleDirectory on a localized collection document', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .once()
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(200, mockClient.createFile({}))

    const created = await payload.create({
      collection: 'localized-posts',
      data: { title: 'Issue 342 population test' },
    })

    const result = await payload.findByID({
      collection: 'localized-posts',
      id: created.id,
    })

    expect((result as any).crowdinArticleDirectory).toBeDefined()
    expect(typeof (result as any).crowdinArticleDirectory).toBe('object')
  })

  it('collectionDocument field is registered on crowdin-article-directories', async () => {
    const articleDirCollection = payload.config.collections.find(
      (c) => c.slug === 'crowdin-article-directories',
    )
    const tabsField = articleDirCollection?.fields?.[0] as any
    const documentTab = tabsField?.tabs?.find((t: any) => t.label === 'Document')
    const collectionDocumentField = documentTab?.fields?.find(
      (f: any) => f.name === 'collectionDocument',
    )

    expect(
      collectionDocumentField,
      'collectionDocument must be registered when pluginOptions.collections is undefined',
    ).toBeDefined()
    expect(collectionDocumentField.type).toBe('relationship')
    expect(collectionDocumentField.relationTo).toContain('localized-posts')
  })
})
