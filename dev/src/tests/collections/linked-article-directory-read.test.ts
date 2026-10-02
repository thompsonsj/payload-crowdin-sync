import nock from 'nock'
import type { Payload } from 'payload'
import { mockCrowdinClient } from 'payload-crowdin-sync'
import type { CrowdinArticleDirectory, CrowdinCollectionDirectory } from '../../payload-types'
import { initPayloadInt } from '../helpers/initPayloadInt'
import { pluginConfig } from '../helpers/plugin-config'

let payload: Payload

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

/**
 * The backfill links directories to their documents with `collectionDocument`.
 * Reading a document resolves its directory in an `afterRead` hook, so the
 * lookup must not populate that link back to the document being read.
 */
describe('Reading a document whose article directory is linked to it', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt()
    ;({ payload } = initialized as {
      payload: Payload
    })
  })

  afterEach(() => {
    if (!nock.isDone()) {
      throw new Error(`Not all nock interceptors were used: ${JSON.stringify(nock.pendingMocks())}`)
    }
    nock.cleanAll()
  })

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
  })

  it('returns the document with its directory', { timeout: 15000 }, async () => {
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
    const directory = (
      await payload.find({
        collection: 'crowdin-article-directories',
        where: { name: { equals: `${post.id}` } },
        depth: 0,
      })
    ).docs[0] as CrowdinArticleDirectory
    await payload.update({
      collection: 'crowdin-article-directories',
      id: directory.id,
      data: { collectionDocument: { relationTo: 'localized-posts', value: post.id } },
      context: { triggerAfterChange: false },
    })

    const result = await payload.findByID({ collection: 'localized-posts', id: post.id })

    const crowdinArticleDirectory = result['crowdinArticleDirectory'] as CrowdinArticleDirectory
    expect(crowdinArticleDirectory.id).toBe(directory.id)
    expect(
      (crowdinArticleDirectory.crowdinCollectionDirectory as CrowdinCollectionDirectory)?.name,
    ).toEqual('localized-posts')
  })
})
