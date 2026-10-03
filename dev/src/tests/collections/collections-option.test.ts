import { multiRichTextFields } from '../../collections/fields/multiRichTextFields'
import { CrowdinArticleDirectory } from '../../payload-types'
import nock from 'nock'
import { mockCrowdinClient } from 'payload-crowdin-sync'
import { pluginConfig } from '../helpers/plugin-config'
import { initPayloadInt } from '../helpers/initPayloadInt'
import { assertCrowdinNocksDone, cleanCrowdinNocks } from '../helpers/crowdin-nock'
import type { Payload } from 'payload'
import type { PluginOptions } from 'payload-crowdin-sync'

let payload: Payload

const pluginOptionsOverride: Partial<PluginOptions> = {
  collections: [
    'localized-posts',
    'posts',
    'multi-rich-text',
    {
      slug: 'localized-posts-with-condition',
      condition: ({ doc }) => doc.translateWithCrowdin,
    },
  ],
}

const pluginOptions = pluginConfig(pluginOptionsOverride)
const mockClient = mockCrowdinClient(pluginOptions)

describe('Collections - collections option', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt({ pluginOptionsOverride })
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
  describe('Non-localized collections', () => {
    it('does not create an article directory for a collection with no localized fields', async () => {
      const post = await payload.create({
        collection: 'posts',
        data: { title: 'Test post' },
      })
      const result = await payload.findByID({
        collection: 'posts',
        id: post.id,
      })
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy()
    })
    it('does not create an article directory for a collection with localized fields that is not present in a defined array in the collections option', async () => {
      const post = await payload.create({
        collection: 'policies',
        data: { title: 'Test post' },
      })
      const result = await payload.findByID({
        collection: 'policies',
        id: post.id,
      })
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy()
    })
  })
  describe('Localized collections', () => {
    it('creates an article directory', async () => {
      nock('https://api.crowdin.com')
        .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
        .twice()
        .reply(200, mockClient.createDirectory({}))
        .post(`/api/v2/storages`)
        .twice()
        .reply(200, mockClient.addStorage())
        .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
        .twice()
        .reply(200, mockClient.createFile({}))
      const data = multiRichTextFields
        .slice(1, 3)
        .filter((field) => field.type === 'richText')
        .reduce(
          (
            accum: {
              [key: string]: any
            },
            field,
          ) => {
            accum[field.name] = [
              {
                children: [
                  {
                    text: `Rich text content for ${field.name}.`,
                  },
                ],
              },
            ]
            return accum
          },
          {},
        )
      const post = await payload.create({
        collection: 'multi-rich-text',
        data,
      })
      const result = await payload.findByID({
        collection: 'multi-rich-text',
        id: post.id,
      })
      const crowdinArticleDirectoryId = (
        result['crowdinArticleDirectory'] as CrowdinArticleDirectory
      )?.id
      expect(crowdinArticleDirectoryId).toBeDefined()
    })
    it('creates an article directory for a collection with localized fields that is defined in the collections object using an config object', async () => {
      nock('https://api.crowdin.com')
        .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
        .twice()
        .reply(200, mockClient.createDirectory({}))
        .post(`/api/v2/storages`)
        .reply(200, mockClient.addStorage())
        .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
        .reply(200, mockClient.createFile({}))
      const post = await payload.create({
        collection: 'localized-posts-with-condition',
        data: {
          title: 'Test post',
          translateWithCrowdin: true,
        },
      })
      const result = await payload.findByID({
        collection: 'localized-posts-with-condition',
        id: post.id,
      })
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeTruthy()
    })
  })
})
