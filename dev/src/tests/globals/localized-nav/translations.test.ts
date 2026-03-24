import {
  // payloadCrowdinSyncTranslationsApi,
  utilities,
  mockCrowdinClient,
  payloadCrowdinSyncTranslationsApi,
  // getFilesByDocumentID,
  // getFiles,
} from 'payload-crowdin-sync'
import { fixtures } from './fixtures'
import nock from 'nock'
import { pluginConfig } from '../../helpers/plugin-config'
import { LocalizedNav } from '@/payload-types'
import { initPayloadInt } from '../../helpers/initPayloadInt'
import type { Payload } from 'payload'
import { LocalizedNav as LocalizedNavConfig } from './../../../globals/LocalizedNav'
let payload: Payload
const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)
// fr fileId for the localized-nav global
const fileId = 48311
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
      .reply(
        200,
        mockClient.createFile({
          fileId,
        }),
      )
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
  it('builds a Payload update object as expected', async () => {
    const global = (await payload.findGlobal({
      slug: 'localized-nav',
    })) as LocalizedNav
    const crowdinHtmlObject = utilities.buildCrowdinHtmlObject({
      doc: global,
      fields: LocalizedNavConfig.fields,
    })
    const crowdinJsonObject = utilities.buildCrowdinJsonObject({
      doc: global,
      fields: LocalizedNavConfig.fields,
    })
    expect(
      utilities.buildPayloadUpdateObject({
        crowdinJsonObject,
        crowdinHtmlObject,
        fields: LocalizedNavConfig.fields,
        document: global,
      }),
    ).toMatchSnapshot()
  })
  it('publishes in fr_FR with a translation from Crowdin', async () => {
    nock('https://api.crowdin.com')
      // fr - file 1 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${fileId}`, {
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${fileId}/download?targetLanguageId=fr`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${fileId}/download`)
      .query({
        targetLanguageId: 'fr',
      })
      .reply(200, {
        items: {
          '68ddb03a9432e06617d52103': {
            label: 'Élément de navigation publié 1',
          },
          '68ddb04d9432e06617d52105': {
            label: 'Élément de navigation publié 2',
          },
        },
      })
    const translationsApi = new payloadCrowdinSyncTranslationsApi(pluginOptions, payload)
    await translationsApi.updateTranslation({
      documentId: `can-be-anything`, // this is no needed when global=`true`
      global: true,
      collection: 'localized-nav',
      dryRun: false,
      excludeLocales: ['de_DE'],
    })
    const global = (await payload.findGlobal({
      slug: 'localized-nav',
      locale: 'fr_FR',
    })) as LocalizedNav
    expect(global.items).toMatchSnapshot()
  })
  it('saves draft in fr_FR with a translation from Crowdin', async () => {
    nock('https://api.crowdin.com')
      // fr - file 1 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${fileId}`, {
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${fileId}/download?targetLanguageId=fr`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${fileId}/download`)
      .query({
        targetLanguageId: 'fr',
      })
      .reply(200, {
        items: {
          '68ddb03a9432e06617d52103': {
            label: 'Élément de navigation publié 1',
          },
          '68ddb04d9432e06617d52105': {
            label: 'Élément de navigation publié 2',
          },
        },
      })
    const translationsApi = new payloadCrowdinSyncTranslationsApi(pluginOptions, payload)
    await translationsApi.updateTranslation({
      documentId: `can-be-anything`, // this is no needed when global=`true`
      global: true,
      collection: 'localized-nav',
      dryRun: false,
      draft: true,
      excludeLocales: ['de_DE'],
    })
    const global = (await payload.findGlobal({
      slug: 'localized-nav',
      draft: true,
      locale: 'fr_FR',
    })) as LocalizedNav
    expect(global.items).toMatchSnapshot()
  })
  it('builds a Crowdin JSON object as expected for a draft', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/storages`)
      .times(1)
      .reply(200, mockClient.addStorage())
      .put(`/api/v2/projects/${pluginOptions.projectId}/files/${fileId}`)
      .times(1)
      .reply(
        200,
        mockClient.createFile({
          fileId,
        }),
      )
    const global = (await payload.updateGlobal({
      slug: 'localized-nav',
      data: {
        items: fixtures.draft.items,
      },
      draft: true,
    })) as LocalizedNav
    expect(
      utilities.buildCrowdinJsonObject({
        doc: global,
        fields: LocalizedNavConfig.fields,
      }),
    ).toMatchSnapshot()
  })
  it('saves draft in fr_FR with a translation from Crowdin from a source draft version', async () => {
    nock('https://api.crowdin.com')
      // fr - file 1 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${fileId}`, {
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${fileId}/download?targetLanguageId=fr`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${fileId}/download`)
      .query({
        targetLanguageId: 'fr',
      })
      .reply(200, {
        items: {
          '68ddb03a9432e06617d52103': {
            label: 'Élément de navigation publié 1',
          },
          '68ddb04d9432e06617d52105': {
            label: 'Élément de navigation publié 2',
          },
          '68ddb14523771003a41a0049': {
            label: "L'article 3 est inclus uniquement dans le projet",
          },
        },
      })
    const translationsApi = new payloadCrowdinSyncTranslationsApi(pluginOptions, payload)
    await translationsApi.updateTranslation({
      documentId: `can-be-anything`, // this is no needed when global=`true`
      global: true,
      collection: 'localized-nav',
      dryRun: false,
      draft: true,
      excludeLocales: ['de_DE'],
    })
    const global = (await payload.findGlobal({
      slug: 'localized-nav',
      draft: true,
      locale: 'fr_FR',
    })) as LocalizedNav
    expect(global.items).toMatchSnapshot()
  })
})
