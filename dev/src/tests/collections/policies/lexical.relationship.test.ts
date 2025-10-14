import { getFilesByDocumentID, isDefined, utilities, mockCrowdinClient, payloadCrowdinSyncTranslationsApi } from 'payload-crowdin-sync'
import Policies from '../../../collections/Policies'
import { lexicalFixtures } from './__fixtures__'
import nock from 'nock'
import { pluginConfig } from '../../helpers/plugin-config'
import { CrowdinArticleDirectory, Policy } from '../../../payload-types'
import { initPayloadInt } from '../../helpers/initPayloadInt'
import type { Payload } from 'payload'

let payload: Payload

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

describe('Collection: Policies: Lexical Relationship', () => {
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

  it('builds a Crowdin HTML object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(2)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(2)
      // .times(4)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(2)
      // .times(4)
      .reply(200, mockClient.createFile({}))

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: lexicalFixtures.relationship,
      },
    })
    expect(
      utilities.buildCrowdinHtmlObject({
        doc: policy,
        fields: Policies.fields,
      }),
    ).toMatchSnapshot()
  })

  it('builds a Crowdin JSON object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(1)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(2)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(2)
      .reply(200, mockClient.createFile({}))

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: lexicalFixtures.relationship,
      },
    })
    expect(
      utilities.buildCrowdinJsonObject({
        doc: policy,
        fields: Policies.fields,
      }),
    ).toMatchSnapshot()
  })

  it('builds a Payload update object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(1)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(2)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(2)
      .reply(200, mockClient.createFile({}))

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: lexicalFixtures.relationship,
      },
    })
    const crowdinHtmlObject = utilities.buildCrowdinHtmlObject({
      doc: policy,
      fields: Policies.fields,
    })
    const crowdinJsonObject = utilities.buildCrowdinJsonObject({
      doc: policy,
      fields: Policies.fields,
    })
    expect(
      utilities.buildPayloadUpdateObject({
        crowdinJsonObject,
        crowdinHtmlObject,
        fields: Policies.fields,
        document: policy,
      }),
    ).toMatchSnapshot()
  })

  it('creates an HTML file for Crowdin as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(1)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(2)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(2)
      .reply(200, mockClient.createFile({}))

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: lexicalFixtures.relationship,
      },
    })
    // update now that a Crowdin article directory is available
    await payload.update({
      id: policy.id,
      collection: 'policies',
      data: {
        title: 'Test policy',
      },
    })
    const crowdinFiles = await getFilesByDocumentID({ documentId: `${policy.id}`, payload })
    const contentHtmlFile = crowdinFiles.find((file) => file.field === 'content')
    expect(contentHtmlFile?.fileData?.html).toMatchSnapshot()
  })

  it('updates the Payload document with a translation from Crowdin', async () => {
      nock('https://api.crowdin.com')
        .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
        .times(1)
        .reply(200, mockClient.createDirectory({}))
        .post(`/api/v2/storages`)
        .times(2)
        .reply(200, mockClient.addStorage())
        // file 1 creation
        .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
        .reply(
          200,
          mockClient.createFile({
            fileId: 48311,
          }),
        )
        // file 2 creation
        .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
        .reply(
          200,
          mockClient.createFile({
            fileId: 48312,
          }),
        )
  
      const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: lexicalFixtures.relationship,
      },
    })
  
      // fr - file 1 get translation
      nock('https://api.crowdin.com')
        .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${48311}`, {
          targetLanguageId: 'fr',
        })
        .reply(
          200,
          mockClient.buildProjectFileTranslation({
            url: `https://api.crowdin.com/api/v2/projects/${
              pluginOptions.projectId
            }/translations/builds/${48311}/download?targetLanguageId=fr`,
          }),
        )
        .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${48311}/download`)
        .query({
          targetLanguageId: 'fr',
        })
        .reply(200, {
          "title": "Politique de test",
        })
        // fr - file 2 get translation
        .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${48312}`, {
          targetLanguageId: 'fr',
        })
        .reply(
          200,
          mockClient.buildProjectFileTranslation({
            url: `https://api.crowdin.com/api/v2/projects/${
              pluginOptions.projectId
            }/translations/builds/${48312}/download?targetLanguageId=fr`,
          }),
        )
        .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${48312}/download`)
        .query({
          targetLanguageId: 'fr',
        })
        .reply(
          200,
          '<p>Paragraphe avant la vidéo YouTube.</p><span data-block-id=671a9003910b067fc9bafa92 data-relation-to=youtube-videos data-block-type="pcsRelationship"></span><p>Paragraphe après la vidéo YouTube.</p>',
        )
  
      const translationsApi = new payloadCrowdinSyncTranslationsApi(pluginOptions, payload)
      await translationsApi.updateTranslation({
        documentId: `${policy.id}`,
        collection: 'policies',
        dryRun: false,
        excludeLocales: ['de_DE'],
      })
      // retrieve translated post from Payload
      const result = await payload.findByID({
        collection: 'policies',
        id: `${policy.id}`,
        locale: 'fr_FR',
      })
      expect(result['content']).toMatchSnapshot()
  })
})
