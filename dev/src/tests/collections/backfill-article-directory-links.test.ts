import nock from 'nock'
import type { Payload } from 'payload'
import {
  backfillArticleDirectoryPolymorphicLinks,
  getArticleDirectory,
  getFileByDocumentID,
  mockCrowdinClient,
} from 'payload-crowdin-sync'
import type { CrowdinArticleDirectory } from '../../payload-types'
import { initPayloadInt } from '../helpers/initPayloadInt'
import { pluginConfig } from '../helpers/plugin-config'
import {
  assertCrowdinNocksDone,
  cleanCrowdinNocks,
  nockLocalizedPostsDocumentCreate,
} from '../helpers/crowdin-nock'

let payload: Payload

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

const findArticleDirectory = async (documentId: string) => {
  const result = await payload.find({
    collection: 'crowdin-article-directories',
    where: { name: { equals: documentId } },
    depth: 0,
  })
  return result.docs[0] as CrowdinArticleDirectory
}

describe('Article directory links', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt()
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

  it('links a new directory to its document, and the backfill restores a missing link by name', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .twice()
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(200, mockClient.createFile({}))

    const post = await payload.create({
      collection: 'localized-posts',
      data: { title: 'Test post' },
    })

    const created = await findArticleDirectory(`${post.id}`)
    expect(created.collectionDocument).toEqual({ relationTo: 'localized-posts', value: post.id })

    await payload.update({
      collection: 'crowdin-article-directories',
      id: created.id,
      data: { collectionDocument: null },
      context: { triggerAfterChange: false },
    })
    expect((await findArticleDirectory(`${post.id}`)).collectionDocument).toBeFalsy()

    const result = await backfillArticleDirectoryPolymorphicLinks(payload)

    expect(result.collectionDocumentsUpdated).toBe(1)
    expect((await findArticleDirectory(`${post.id}`)).collectionDocument).toEqual({
      relationTo: 'localized-posts',
      value: post.id,
    })

    const refreshed = await payload.findByID({ collection: 'localized-posts', id: post.id })
    expect((refreshed['crowdinArticleDirectory'] as CrowdinArticleDirectory).id).toBe(created.id)
  })

  it('syncs to the same directory after backfill with the option off', async () => {
    const fileId = 37704
    nockLocalizedPostsDocumentCreate(pluginOptions, mockClient, {
      directoryPosts: 1,
      includeContentHtml: false,
      fieldsFileId: fileId,
    })
      .post(`/api/v2/storages`)
      .reply(200, mockClient.addStorage())
      .put(`/api/v2/projects/${pluginOptions.projectId}/files/${fileId}`)
      .reply(200, mockClient.updateOrRestoreFile({ fileId }))

    const post = await payload.create({
      collection: 'localized-posts',
      data: { title: 'Backfill then sync' },
    })
    const created = await findArticleDirectory(`${post.id}`)
    await payload.update({
      collection: 'crowdin-article-directories',
      id: created.id,
      data: { collectionDocument: null },
      context: { triggerAfterChange: false },
    })
    await backfillArticleDirectoryPolymorphicLinks(payload)

    await payload.update({
      collection: 'localized-posts',
      id: post.id,
      data: { title: 'Backfill then sync updated' },
    })

    const refreshed = await payload.findByID({ collection: 'localized-posts', id: post.id })
    expect((refreshed['crowdinArticleDirectory'] as CrowdinArticleDirectory).id).toBe(created.id)
    const updatedFile = await getFileByDocumentID('fields', `${post.id}`, payload)
    expect(updatedFile.fileData?.json).toEqual({ title: 'Backfill then sync updated' })
  })

  it('deletes Crowdin assets after backfill with the option off', async () => {
    const fileId = 37705
    nockLocalizedPostsDocumentCreate(pluginOptions, mockClient, {
      directoryPosts: 1,
      includeContentHtml: false,
      fieldsFileId: fileId,
    })
      .delete(`/api/v2/projects/${pluginOptions.projectId}/files/${fileId}`)
      .reply(204)
      .delete(`/api/v2/projects/${pluginOptions.projectId}/directories/1169`)
      .reply(204)

    const post = await payload.create({
      collection: 'localized-posts',
      data: { title: 'Backfill then delete' },
    })
    const created = await findArticleDirectory(`${post.id}`)
    await payload.update({
      collection: 'crowdin-article-directories',
      id: created.id,
      data: { collectionDocument: null },
      context: { triggerAfterChange: false },
    })
    await backfillArticleDirectoryPolymorphicLinks(payload)

    await payload.delete({
      collection: 'localized-posts',
      id: `${post.id}`,
    })

    const remaining = await getArticleDirectory({
      documentId: `${post.id}`,
      payload,
      allowEmpty: true,
    })
    expect(remaining).toBeUndefined()
  })
})
