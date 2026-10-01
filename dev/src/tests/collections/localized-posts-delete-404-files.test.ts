import nock from 'nock'
import type { Payload } from 'payload'
import {
  getFilesByDocumentID,
  mockCrowdinClient,
  payloadCrowdinSyncTranslationsApi,
} from 'payload-crowdin-sync'
import { initPayloadInt } from '../helpers/initPayloadInt'
import { pluginConfig } from '../helpers/plugin-config'

let payload: Payload

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

describe('Crowdin files that no longer exist on Crowdin', () => {
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

  it('removes the crowdin-files record when building its translation returns a 404', async () => {
    const fileId = 94100
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .twice()
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(200, mockClient.createFile({ fileId }))
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${fileId}`, {
        targetLanguageId: 'fr',
      })
      .reply(404, { code: 404 })

    const post = await payload.create({
      collection: 'localized-posts-with-condition',
      data: {
        title: 'Test post',
        translateWithCrowdin: true,
      },
    })

    expect(await getFilesByDocumentID({ documentId: `${post.id}`, payload })).toHaveLength(1)

    const translationsApi = new payloadCrowdinSyncTranslationsApi(pluginOptions, payload)
    await translationsApi.updateTranslation({
      documentId: `${post.id}`,
      collection: 'localized-posts-with-condition',
      dryRun: false,
      excludeLocales: ['de_DE'],
    })

    expect(await getFilesByDocumentID({ documentId: `${post.id}`, payload })).toHaveLength(0)
  })
})
