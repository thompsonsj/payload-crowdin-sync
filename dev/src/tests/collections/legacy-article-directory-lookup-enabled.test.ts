import type { Payload, PayloadRequest } from 'payload'
import { mockCrowdinClient } from 'payload-crowdin-sync'
import type { CrowdinArticleDirectory } from '../../payload-types'
import { filesApiByDocument } from '../../../../plugin/src/lib/api/files/by-document'
import { initPayloadInt } from '../helpers/initPayloadInt'
import { pluginConfig } from '../helpers/plugin-config'
import {
  assertCrowdinNocksDone,
  cleanCrowdinNocks,
  nockLocalizedPostsDocumentCreate,
} from '../helpers/crowdin-nock'

let payload: Payload

const pluginOptionsOverride = { legacyArticleDirectoryLookup: true }
const pluginOptions = pluginConfig(pluginOptionsOverride)
const mockClient = mockCrowdinClient(pluginOptions)

const findArticleDirectory = async (documentId: string) => {
  const result = await payload.find({
    collection: 'crowdin-article-directories',
    where: { name: { equals: documentId } },
    depth: 0,
  })
  return result.docs[0] as CrowdinArticleDirectory | undefined
}

const unlinkArticleDirectory = async (directoryId: string) => {
  await payload.update({
    collection: 'crowdin-article-directories',
    id: directoryId,
    data: { collectionDocument: null },
    context: { triggerAfterChange: false },
  })
}

/**
 * #377 option-on paths: name and stored-id lookups still find an unlinked row.
 */
describe('legacyArticleDirectoryLookup on', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt({
      testSuiteName: 'legacy-article-directory-lookup-enabled',
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

  it('finds an unlinked directory by name on read and reuses it on save', async () => {
    const fileId = 37702
    nockLocalizedPostsDocumentCreate(pluginOptions, mockClient, {
      directoryPosts: 2,
      includeContentHtml: false,
      fieldsFileId: fileId,
    })
      .post(`/api/v2/storages`)
      .reply(200, mockClient.addStorage())
      .put(`/api/v2/projects/${pluginOptions.projectId}/files/${fileId}`)
      .reply(200, mockClient.updateOrRestoreFile({ fileId }))

    const post = await payload.create({
      collection: 'localized-posts',
      data: { title: 'Legacy name lookup' },
    })
    const created = await findArticleDirectory(`${post.id}`)
    await unlinkArticleDirectory(created!.id)
    expect((await findArticleDirectory(`${post.id}`))?.collectionDocument).toBeFalsy()

    const afterUnlink = await payload.findByID({ collection: 'localized-posts', id: post.id })
    expect((afterUnlink['crowdinArticleDirectory'] as CrowdinArticleDirectory).id).toBe(created?.id)

    await payload.update({
      collection: 'localized-posts',
      id: post.id,
      data: { title: 'Legacy name lookup updated' },
    })

    const directories = await payload.find({
      collection: 'crowdin-article-directories',
      where: { name: { equals: `${post.id}` } },
      depth: 0,
    })
    expect(directories.totalDocs).toBe(1)
    expect(directories.docs[0].id).toBe(created?.id)
  })

  it('finds an unlinked directory by the stored id on the document', async () => {
    nockLocalizedPostsDocumentCreate(pluginOptions, mockClient, {
      directoryPosts: 1,
      includeContentHtml: false,
      fieldsFileId: 37703,
    })

    const post = await payload.create({
      collection: 'localized-posts',
      data: { title: 'Legacy stored id' },
    })
    const created = await findArticleDirectory(`${post.id}`)
    await unlinkArticleDirectory(created!.id)

    const api = new filesApiByDocument({
      document: {
        id: post.id,
        title: 'Legacy stored id',
        crowdinArticleDirectory: created!.id,
      },
      collectionSlug: 'localized-posts',
      global: false,
      pluginOptions,
      req: { payload } as PayloadRequest,
    })

    expect((await api.resolveExistingArticleDirectory())?.id).toBe(created?.id)
  })
})
