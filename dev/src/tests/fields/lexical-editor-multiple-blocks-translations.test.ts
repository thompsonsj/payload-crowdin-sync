import {
  getFilesByDocumentID,
  payloadCrowdinSyncTranslationsApi,
} from 'payload-crowdin-sync'
import nock from 'nock'
import { pluginConfig } from '../helpers/plugin-config'
import { CrowdinArticleDirectory } from '../../payload-types'
import { getFixture } from './lexical-editor-with-multiple-blocks.fixture'
import { normalizeForSnapshot, setupLexicalTest } from './lexical-editor-multiple-blocks-shared'
import { nockLexical } from '../helpers/nock-lexical'
import type { Payload } from 'payload'
import type { Media } from '../../payload-types'

let payload: Payload
let media: Media
const pluginOptions = pluginConfig()

describe('Lexical editor with multiple blocks - Translations', () => {
  beforeAll(async () => {
    const setup = await setupLexicalTest()
    payload = setup.payload
    media = setup.media
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

  it('updates a Payload article with a rich text field that uses the Lexical editor with multiple blocks with a translation received from Crowdin', async () => {
    nockLexical()
      .directories(4)
      .storages(4)
      .fileWithId(56641)
      .fileWithId(56642)
      .fileWithId(56643)
      .fileWithId(56644)
      .translationDownload(56641, 'de', {})
      .translationDownload(56644, 'de', {})
      .translationDownload(56642, 'de', {
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
      .translationDownload(56643, 'de', '<p>Das Plugin analysiert Ihre Blockkonfiguration für den Lexical-Rich-Text-Editor. Es extrahiert alle Blockwerte aus dem Rich-Text-Feld und behandelt diese Konfigurations-/Datenkombination dann als reguläres „Blocks"-Feld.</p<p>>Im HTML werden Markierungen platziert und dieser Inhalt wird bei der Übersetzung an der richtigen Stelle wiederhergestellt.</p>')
      .translationDownload(56644, 'fr', {})
      .translationDownload(56641, 'fr', {
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
      .translationDownload(56642, 'fr', "<p>Le plugin analyse la configuration de votre bloc pour l'éditeur de texte enrichi lexical. Il extrait toutes les valeurs de bloc du champ de texte enrichi, puis traite cette combinaison configuration/données comme un champ « blocs » normal.</p<p>>Les marqueurs sont placés dans le code HTML et ce contenu est restauré au bon endroit lors de la traduction.</p>")
      .translationDownload(56643, 'fr', `<p>Exemple de contenu pour un champ de texte enrichi lexical avec plusieurs blocs.</p><span data-block-id=65d67d2591c92e447e7472f7 data-block-type=cta></span><p>Une liste à puces entre certains blocs composée de:</p><ul class="bullet"><li value=1>un élément de liste à puces ; et</li><li value=2>
      un autre!</li></ul><span data-block-id=65d67d8191c92e447e7472f8 data-block-type=highlight></span><span data-block-id=65d67e2291c92e447e7472f9 data-block-type=imageText></span><ul class="bullet"><li value=1></li></ul>`)
      .build()

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: getFixture(media.id),
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
        field: 'fields',
        fileId: 56644,
      },
      {
        field: 'content',
        fileId: 56643,
      },
    ])
    expect(contentFileIds).toEqual([
      {
        field: `blocks.65d67d8191c92e447e7472f8.highlight.content`,
        fileId: 56642,
      },
      {
        field: 'blocks',
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
    expect(normalizeForSnapshot(result['content'], media.id)).toMatchInlineSnapshot(`
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
