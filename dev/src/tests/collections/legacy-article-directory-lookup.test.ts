import type { Payload } from 'payload'
import { mockCrowdinClient } from 'payload-crowdin-sync'
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
 * #377 default-off paths: a new install resolves through `collectionDocument`
 * only. An unlinked row is invisible on read and blocks save.
 */
describe('legacyArticleDirectoryLookup off', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt({
      testSuiteName: 'legacy-article-directory-lookup',
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

  it('saves and reads a localized document through collectionDocument only', async () => {
    nockLocalizedPostsDocumentCreate(pluginOptions, mockClient, {
      directoryPosts: 2,
      includeContentHtml: false,
    })

    const post = await payload.create({
      collection: 'localized-posts',
      data: { title: 'New install post' },
    })

    const created = await findArticleDirectory(`${post.id}`)
    expect(created?.collectionDocument).toEqual({
      relationTo: 'localized-posts',
      value: post.id,
    })

    const read = await payload.findByID({ collection: 'localized-posts', id: post.id })
    expect((read['crowdinArticleDirectory'] as CrowdinArticleDirectory).id).toBe(created?.id)

    await unlinkArticleDirectory(created!.id)
    expect((await findArticleDirectory(`${post.id}`))?.collectionDocument).toBeFalsy()

    const afterUnlink = await payload.findByID({ collection: 'localized-posts', id: post.id })
    expect(afterUnlink['crowdinArticleDirectory']).toBeFalsy()
  })

  it('throws on save when an unlinked directory exists and names the backfill and option', async () => {
    nockLocalizedPostsDocumentCreate(pluginOptions, mockClient, {
      directoryPosts: 1,
      includeContentHtml: false,
      fieldsFileId: 37701,
    })

    const post = await payload.create({
      collection: 'localized-posts',
      data: { title: 'Unlinked save' },
    })
    const created = await findArticleDirectory(`${post.id}`)
    await unlinkArticleDirectory(created!.id)

    await expect(
      payload.update({
        collection: 'localized-posts',
        id: post.id,
        data: { title: 'Unlinked save updated' },
      }),
    ).rejects.toThrow(/backfillArticleDirectoryPolymorphicLinks|legacyArticleDirectoryLookup/)
  })
})
