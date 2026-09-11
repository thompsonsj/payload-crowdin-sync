import { fixture } from './lexical-editor-with-multiple-blocks.fixture'
import {
  getFilesByDocumentID,
  payloadCrowdinSyncTranslationsApi,
} from 'payload-crowdin-sync'
import type { Payload } from 'payload'
import { CrowdinArticleDirectory } from '../../payload-types'
import {
  injectImageRelationship,
  mockClient,
  pluginOptions,
  setupLexicalMultipleBlocksTest,
  SNAPSHOT_MEDIA_ID,
  teardownLexicalMultipleBlocksTest,
} from './lexical-editor-multiple-blocks-shared.js'
import nock from 'nock'
import { assertCrowdinNocksDone, cleanCrowdinNocks } from '../helpers/crowdin-nock.js'

let payload: Payload
let mediaID: string


describe('Lexical editor with multiple blocks - Translations', () => {
  beforeAll(async () => {
    ;({ payload, mediaID } = await setupLexicalMultipleBlocksTest())
  })
  beforeEach(() => {
    cleanCrowdinNocks()
  })
  afterEach(() => {
    assertCrowdinNocksDone()
  })
  afterAll(async () => {
    await teardownLexicalMultipleBlocksTest(payload)
  })
  it('updates a Payload article with a rich text field that uses the Lexical editor with multiple blocks with a translation received from Crowdin', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(3)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(4)
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
      // file 3 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 56643,
        }),
      )
      // file 4 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 56644,
        }),
      )
      // de - file 1 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${56641}`, {
        targetLanguageId: 'de',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56641}/download?targetLanguageId=de`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56641}/download`)
      .query({
        targetLanguageId: 'de',
      })
      .reply(200, {})
      // de - file 4 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${56644}`, {
        targetLanguageId: 'de',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56644}/download?targetLanguageId=de`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56644}/download`)
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
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56642}/download?targetLanguageId=de`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56642}/download`)
      .query({
        targetLanguageId: 'de',
      })
      .reply(200, {
        blocks: {
          '65d67d2591c92e447e7472f7': {
            cta: {
              text: 'Laden Sie payload-crowdin-sync auf npm herunter!',
              href: 'https://www.npmjs.com/package/payload-crowdin-sync',
            },
          },
          '65d67d8191c92e447e7472f8': {
            highlight: {
              heading: {
                title: 'Blöcke werden in ihre eigenen Felder extrahiert',
                preTitle: 'Wie das Plugin Blöcke im Lexikaleditor behandelt',
              },
            },
          },
          '65d67e2291c92e447e7472f9': {
            imageText: {
              title: 'Testen einer Reihe von Feldern',
            },
          },
        },
      })
      // de - file 3 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${56643}`, {
        targetLanguageId: 'de',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56643}/download?targetLanguageId=de`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56643}/download`)
      .query({
        targetLanguageId: 'de',
      })
      .reply(
        200,
        '<p>Das Plugin analysiert Ihre Blockkonfiguration für den Lexical-Rich-Text-Editor. Es extrahiert alle Blockwerte aus dem Rich-Text-Feld und behandelt diese Konfigurations-/Datenkombination dann als reguläres „Blocks“-Feld.</p<p>>Im HTML werden Markierungen platziert und dieser Inhalt wird bei der Übersetzung an der richtigen Stelle wiederhergestellt.</p>',
      )
      // fr - file 1 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${56641}`, {
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56641}/download?targetLanguageId=fr`,
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
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56642}/download?targetLanguageId=fr`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56642}/download`)
      .query({
        targetLanguageId: 'fr',
      })
      .reply(200, {
        blocks: {
          '65d67d2591c92e447e7472f7': {
            cta: {
              link: {
                text: 'Téléchargez payload-crowdin-sync sur npm!',
                href: 'https://www.npmjs.com/package/payload-crowdin-sync',
              },
            },
          },
          '65d67d8191c92e447e7472f8': {
            highlight: {
              heading: {
                title: 'Les blocs sont extraits dans leurs propres champs',
                preTitle: "Comment le plugin gère les blocs dans l'éditeur lexical",
              },
            },
          },
          '65d67e2291c92e447e7472f9': {
            imageText: {
              title: 'Tester une gamme de domaines',
            },
          },
        },
      })
      // fr - file 3 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${56643}`, {
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56643}/download?targetLanguageId=fr`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56643}/download`)
      .query({
        targetLanguageId: 'fr',
      })
      // include a legacy (since #281) response - existing translations will still be loaded in this way post upgrade
      .reply(
        200,
        "<p>Le plugin analyse la configuration de votre bloc pour l'éditeur de texte enrichi lexical. Il extrait toutes les valeurs de bloc du champ de texte enrichi, puis traite cette combinaison configuration/données comme un champ « blocs » normal.</p<p>>Les marqueurs sont placés dans le code HTML et ce contenu est restauré au bon endroit lors de la traduction.</p>",
      )
      // fr - file 4 get translation
      .post(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${56644}`, {
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56644}/download?targetLanguageId=fr`,
        }),
      )
      .get(`/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56644}/download`)
      .query({
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        `<p>Exemple de contenu pour un champ de texte enrichi lexical avec plusieurs blocs.</p><span data-block-id=65d67d2591c92e447e7472f7 data-block-type=cta></span><p>Une liste à puces entre certains blocs composée de:</p><ul class="bullet"><li value=1>un élément de liste à puces ; et</li><li value=2>
      un autre!</li></ul><span data-block-id=65d67d8191c92e447e7472f8 data-block-type=highlight></span><span data-block-id=65d67e2291c92e447e7472f9 data-block-type=imageText></span><ul class="bullet"><li value=1></li></ul>`,
      )
    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: injectImageRelationship(structuredClone(fixture), mediaID),
      },
    })
    const crowdinFiles = await getFilesByDocumentID({ documentId: `${policy.id}`, payload })
    const contentCrowdinFiles = await getFilesByDocumentID({
      documentId: `${pluginOptions.lexicalBlockFolderPrefix}content`,
      payload,
      parent: policy['crowdinArticleDirectory'] as CrowdinArticleDirectory,
    })
    // check file ids are always mapped in the same way
    const fileIds = crowdinFiles.map((file) => ({
      fileId: file.originalId,
      field: file.field,
    }))
    const contentFileIds = contentCrowdinFiles.map((file) => ({
      fileId: file.originalId,
      field: file.field,
    }))
    expect(fileIds).toEqual([
      {
        field: 'content',
        fileId: 56644,
      },
      {
        field: 'fields',
        fileId: 56641,
      },
    ])
    expect(contentFileIds).toEqual([
      {
        field: `blocks.65d67d8191c92e447e7472f8.highlight.content`,
        fileId: 56643,
      },
      {
        field: 'blocks',
        fileId: 56642,
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
      depth: 0,
    })
    expect(
      injectImageRelationship(structuredClone(result['content']), SNAPSHOT_MEDIA_ID),
    ).toMatchInlineSnapshot(`
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
                  "text": "Exemple de contenu pour un champ de texte enrichi lexical avec plusieurs blocs.",
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
                "blockType": "cta",
                "id": "65d67d2591c92e447e7472f7",
                "link": {
                  "href": "https://www.npmjs.com/package/payload-crowdin-sync",
                  "text": "Téléchargez payload-crowdin-sync sur npm!",
                  "type": "external",
                },
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
                  "text": "Une liste à puces entre certains blocs composée de:",
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
                  "children": [
                    {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "un élément de liste à puces ; et",
                      "type": "text",
                      "version": 1,
                    },
                  ],
                  "direction": "ltr",
                  "format": "",
                  "indent": 0,
                  "type": "listitem",
                  "value": 1,
                  "version": 1,
                },
                {
                  "children": [
                    {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "un autre!",
                      "type": "text",
                      "version": 1,
                    },
                  ],
                  "direction": "ltr",
                  "format": "",
                  "indent": 0,
                  "type": "listitem",
                  "value": 2,
                  "version": 1,
                },
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "listType": "bullet",
              "start": 1,
              "tag": "ul",
              "type": "list",
              "version": 1,
            },
            {
              "fields": {
                "blockType": "highlight",
                "color": "green",
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
                            "text": "Le plugin analyse la configuration de votre bloc pour l'éditeur de texte enrichi lexical. Il extrait toutes les valeurs de bloc du champ de texte enrichi, puis traite cette combinaison configuration/données comme un champ « blocs » normal.>Les marqueurs sont placés dans le code HTML et ce contenu est restauré au bon endroit lors de la traduction.",
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
                    ],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "type": "root",
                    "version": 1,
                  },
                },
                "heading": {
                  "preTitle": "Comment le plugin gère les blocs dans l'éditeur lexical",
                  "title": "Les blocs sont extraits dans leurs propres champs",
                },
                "id": "65d67d8191c92e447e7472f8",
              },
              "format": "",
              "type": "block",
              "version": 2,
            },
            {
              "fields": {
                "blockType": "imageText",
                "id": "65d67e2291c92e447e7472f9",
                "image": "65d67e6a7fb7e9426b3f9f5f",
                "title": "Tester une gamme de domaines",
              },
              "format": "",
              "type": "block",
              "version": 2,
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "",
                      "type": "text",
                      "version": 1,
                    },
                  ],
                  "direction": "ltr",
                  "format": "",
                  "indent": 0,
                  "type": "listitem",
                  "value": 1,
                  "version": 1,
                },
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "listType": "bullet",
              "start": 1,
              "tag": "ul",
              "type": "list",
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
