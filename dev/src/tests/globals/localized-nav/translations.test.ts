import {
    // payloadCrowdinSyncTranslationsApi,
    utilities,
    mockCrowdinClient,
    // getFilesByDocumentID,
    // getFiles,
  } from 'payload-crowdin-sync'
  import { fixtures } from './fixtures'
  import nock from 'nock'
  
  import { pluginConfig } from '../../helpers/plugin-config'
  import {
    CrowdinArticleDirectory,
    LocalizedNav,
  } from '@/payload-types'
  
  export const isNotString = <T>(val: T | string | undefined | null): val is T => {
    return val !== undefined && val !== null && typeof val !== 'string'
  }
  
  const getRelationshipId = (relationship?: string | CrowdinArticleDirectory | null) => {
    if (!relationship) {
      return undefined
    }
    if (isNotString(relationship)) {
      return relationship.id
    }
    return relationship
  }
  
  import { initPayloadInt } from '../../helpers/initPayloadInt'
  import type { Payload } from 'payload'
import { LocalizedNav as LocalizedNavConfig } from './../../../globals/LocalizedNav'
  
  let payload: Payload
  
  const pluginOptions = pluginConfig()
  const mockClient = mockCrowdinClient(pluginOptions)
  
  describe('Global: localized-nav', () => {
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

  
    it('builds a Crowdin JSON object as expected', async () => {
      nock('https://api.crowdin.com')
        .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
        .times(2)
        .reply(200, mockClient.createDirectory({}))
        .post(`/api/v2/storages`)
        .times(1)
        .reply(200, mockClient.addStorage())
        .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
        .times(1)
        .reply(200, mockClient.createFile({}))
  
      const global = (await payload.updateGlobal({
        slug: 'localized-nav',
        data: {
          items: fixtures.published.items,
        },
      })) as LocalizedNav
  
      expect(
        utilities.buildCrowdinJsonObject({
          doc: global,
          fields: LocalizedNavConfig.fields,
        }),
      ).toMatchSnapshot()
    })
  })
  