import { CrowdinArticleDirectory } from '../../payload-types'
import nock from 'nock'
import { mockCrowdinClient, utilities } from 'payload-crowdin-sync'
import { pluginConfig } from '../helpers/plugin-config'

import { initPayloadInt } from '../helpers/initPayloadInt'
import type { Payload } from 'payload'
import { Home } from './../../globals/Home'

let payload: Payload

/**
 * Test the collections
 *
 * Ensure plugin collections are created and
 * behave as expected.
 *
 * Collections to test:
 *
 * - crowdin-article-directories
 * - crowdin-files
 * - crowdin-collection-directories
 *
 * Terminology:
 *
 * - article directory: Crowdin Article Directory
 * - collection directory: Crowdin Collection Directory
 * - file: Crowdin File
 */

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

describe('global: Home', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt()
    ;({ payload } = initialized as {
      payload: Payload
    })
  })

  afterEach((done) => {
    if (!nock.isDone()) {
      throw new Error(`Not all nock interceptors were used: ${JSON.stringify(nock.pendingMocks())}`)
    }
    nock.cleanAll()
    done()
  })

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
  })

  const fixture = {
    parentGroup: {
      preTitle: 'Parent group preTitle',
      title: 'Parent group title',
      subGroupOne: {
        title: 'SubGroupOne title',
        text: 'SubGroupOne text',
        ctaText: 'SubGroupOne ctaText',
      },
      subGroupTwo: {
        title: 'SubGroupTwo title',
        text: 'SubGroupTwo text',
        ctaText: 'SubGroupTwo ctaText',
      },
    },
  }

  describe('crowdin-article-directories', () => {
    it('creates an article directory', async () => {
      // this test needs revising. fileId needs to be the same for the subsequent tests, and both need a put mock? Check the logic of using nock and what changes take place in hooks for updateGlobal
      const fileId = 9332

      nock('https://api.crowdin.com')
        .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
        .twice()
        .reply(200, mockClient.createDirectory({}))
        .post(`/api/v2/storages`)
        .reply(200, mockClient.addStorage())
        .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
        .reply(
          200,
          mockClient.createFile({
            fileId,
          }),
        )

      await payload.updateGlobal({
        slug: 'home',
        data: fixture,
      })
      // retrieve post to get populated fields
      const result = await payload.findGlobal({
        slug: 'home',
      })
      const crowdinArticleDirectoryId = (
        result['crowdinArticleDirectory'] as CrowdinArticleDirectory
      )?.id
      expect(crowdinArticleDirectoryId).toBeDefined()
    })
  })

  describe('utilities', () => {
    it('builds a Crowdin JSON object as expected', async () => {
      const doc = await payload.updateGlobal({
        slug: 'home',
        data: fixture,
      })

      expect(
        utilities.buildCrowdinJsonObject({
          doc,
          fields: Home.fields,
        }),
      ).toMatchInlineSnapshot(`
        {
          "parentGroup": {
            "preTitle": "Parent group preTitle",
            "subGroupOne": {
              "ctaText": "SubGroupOne ctaText",
              "text": "SubGroupOne text",
              "title": "SubGroupOne title",
            },
            "subGroupTwo": {
              "ctaText": "SubGroupTwo ctaText",
              "text": "SubGroupTwo text",
              "title": "SubGroupTwo title",
            },
            "title": "Parent group title",
          },
        }
      `)
    })
  })
})
