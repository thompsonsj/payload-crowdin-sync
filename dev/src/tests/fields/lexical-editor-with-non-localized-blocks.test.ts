import {
  getFilesByDocumentID,
  isDefined,
  utilities,
  mockCrowdinClient,
  payloadCrowdinSyncTranslationsApi,
} from 'payload-crowdin-sync'
import Policies from '../../collections/Policies'
import { fixture } from './lexical-editor-with-non-localized-blocks.fixture'
import nock from 'nock'
import { pluginConfig } from '../helpers/plugin-config'
import { CrowdinArticleDirectory, Policy } from '../../payload-types'
import { initPayloadInt } from '../helpers/initPayloadInt'
import type { Payload } from 'payload'

let payload: Payload

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

describe('Lexical editor with blocks', () => {
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
      .times(3)
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
        content: fixture,
      },
    })
    expect(
      utilities.buildCrowdinHtmlObject({
        doc: policy,
        fields: Policies.fields,
      }),
    ).toMatchInlineSnapshot(`
      {
        "content": {
          "root": {
            "children": [
              {
                "children": [
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "What happens if a block doesn't have any localized fields?",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "textFormat": 0,
                "textStyle": "",
                "type": "paragraph",
                "version": 1,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "cookieTable",
                  "cookieCategoryId": "strictlyNecessary",
                  "id": "678564c06ec4a6f1fcf6a623",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "children": [
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "For example - a block that only contains a select field, which is included twice for good measure!",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "textFormat": 0,
                "textStyle": "",
                "type": "paragraph",
                "version": 1,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "cookieTable",
                  "cookieCategoryId": "functional",
                  "id": "678564926ec4a6f1fcf6a622",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "root",
            "version": 1,
          },
        },
      }
    `)
  })

  it('builds a Crowdin JSON object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(2)
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
        content: fixture,
      },
    })
    expect(
      utilities.buildCrowdinJsonObject({
        doc: policy,
        fields: Policies.fields,
      }),
    ).toMatchInlineSnapshot(`
      {
        "title": "Test policy",
      }
    `)
  })

  it('builds a Payload update object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .twice()
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
        content: fixture,
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
    ).toMatchInlineSnapshot(`
      {
        "content": {
          "root": {
            "children": [
              {
                "children": [
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "What happens if a block doesn't have any localized fields?",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "textFormat": 0,
                "textStyle": "",
                "type": "paragraph",
                "version": 1,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "cookieTable",
                  "cookieCategoryId": "strictlyNecessary",
                  "id": "678564c06ec4a6f1fcf6a623",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "children": [
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "For example - a block that only contains a select field, which is included twice for good measure!",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "textFormat": 0,
                "textStyle": "",
                "type": "paragraph",
                "version": 1,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "cookieTable",
                  "cookieCategoryId": "functional",
                  "id": "678564926ec4a6f1fcf6a622",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "root",
            "version": 1,
          },
        },
        "title": "Test policy",
      }
    `)
  })

  it('creates an HTML file for Crowdin as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .twice()
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
        content: fixture,
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
    expect(contentHtmlFile?.fileData?.html).toMatchInlineSnapshot(
      `"<p>What happens if a block doesn&#39;t have any localized fields?</p><span data-block-id=678564c06ec4a6f1fcf6a623 data-block-type=cookieTable></span><p>For example - a block that only contains a select field, which is included twice for good measure!</p><span data-block-id=678564926ec4a6f1fcf6a622 data-block-type=cookieTable></span>"`,
    )
  })

  it('updates a Payload article with a rich text field that uses the Lexical editor with multiple blocks with a translation received from Crowdin', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .twice()
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(2)
      .reply(200, mockClient.addStorage())
      // file 1 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 56641,
        }),
      )
      // file 2 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 56642,
        }),
      )
      // de - file 1 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${56641}`, {
        targetLanguageId: 'de',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${56641}/download?targetLanguageId=de`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56641}/download`)
      .query({
        targetLanguageId: 'de',
      })
      .reply(200, {})
      // de - file 2 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${56642}`, {
        targetLanguageId: 'de',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${56642}/download?targetLanguageId=de`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56642}/download`)
      .query({
        targetLanguageId: 'de',
      })
      .reply(
        200,
        '<p>Was passiert, wenn ein Block keine lokalisierten Felder hat?<p><span data-block-id=678564c06ec4a6f1fcf6a623 data-block-type=cookieTable></span><p>Zum Beispiel – ein Block, der nur ein Auswahlfeld enthält, das zur Sicherheit zweimal enthalten ist!<p><span data-block-id=678564926ec4a6f1fcf6a622 data-block-type=cookieTable></span>',
      )
      // fr - file 1 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${56641}`, {
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${56641}/download?targetLanguageId=fr`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56641}/download`)
      .query({
        targetLanguageId: 'fr',
      })
      .reply(200, {})
      // fr - file 2 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${56642}`, {
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${56642}/download?targetLanguageId=fr`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56642}/download`)
      .query({
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        '<p>Que se passe-t-il si un bloc ne contient aucun champ localisé ?<p><span data-block-id=678564c06ec4a6f1fcf6a623 data-block-type=cookieTable></span><p>Par exemple : un bloc qui contient uniquement un champ de sélection, qui est inclus deux fois pour faire bonne mesure !<p><span data-block-id=678564926ec4a6f1fcf6a622 data-block-type=cookieTable></span>',
      )

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: fixture,
      },
    })
    const crowdinFiles = await getFilesByDocumentID({ documentId: `${policy.id}`, payload })

    // check file ids are always mapped in the same way
    const fileIds = crowdinFiles.map((file) => ({
      fileId: file.originalId,
      field: file.field,
    }))
    expect(fileIds).toEqual([
      {
        field: 'content',
        fileId: 56642,
      },
      {
        field: 'fields',
        fileId: 56641,
      },
    ])
    const translationsApi = new payloadCrowdinSyncTranslationsApi(pluginOptions, payload)
    await translationsApi.updateTranslation({
      documentId: `${policy.id}`,
      collection: 'policies',
      dryRun: false,
    })
    // retrieve translated post from Payload
    const result = await payload.findByID({
      collection: 'policies',
      id: `${policy.id}`,
      locale: 'fr_FR',
    })
    expect(result['content']).toMatchInlineSnapshot(`
      {
        "root": {
          "children": [
            {
              "children": [
                {
                  "detail": 0,
                  "format": 0,
                  "mode": "normal",
                  "style": "",
                  "text": "Que se passe-t-il si un bloc ne contient aucun champ localisé ?",
                  "type": "text",
                  "version": 1,
                },
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "textFormat": 0,
              "textStyle": "",
              "type": "paragraph",
              "version": 1,
            },
            {
              "children": [
                {
                  "fields": {
                    "blockType": "cookieTable",
                    "cookieCategoryId": "strictlyNecessary",
                    "id": "678564c06ec4a6f1fcf6a623",
                  },
                  "format": "",
                  "type": "block",
                  "version": 2,
                },
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "textFormat": 0,
              "textStyle": "",
              "type": "paragraph",
              "version": 1,
            },
            {
              "children": [
                {
                  "detail": 0,
                  "format": 0,
                  "mode": "normal",
                  "style": "",
                  "text": "Par exemple : un bloc qui contient uniquement un champ de sélection, qui est inclus deux fois pour faire bonne mesure !",
                  "type": "text",
                  "version": 1,
                },
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "textFormat": 0,
              "textStyle": "",
              "type": "paragraph",
              "version": 1,
            },
            {
              "children": [
                {
                  "fields": {
                    "blockType": "cookieTable",
                    "cookieCategoryId": "functional",
                    "id": "678564926ec4a6f1fcf6a622",
                  },
                  "format": "",
                  "type": "block",
                  "version": 2,
                },
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "textFormat": 0,
              "textStyle": "",
              "type": "paragraph",
              "version": 1,
            },
          ],
          "direction": "ltr",
          "format": "",
          "indent": 0,
          "type": "root",
          "version": 1,
        },
      }
    `)
  })
})
