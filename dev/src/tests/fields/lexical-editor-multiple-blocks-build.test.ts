import { utilities } from 'payload-crowdin-sync'
import nock from 'nock'
import Policies from '../../collections/Policies'
import { getFixture } from './lexical-editor-with-multiple-blocks.fixture'
import { normalizeForSnapshot, setupLexicalTest } from './lexical-editor-multiple-blocks-shared'
import { nockLexical } from '../helpers/nock-lexical'
import type { Payload } from 'payload'
import type { Media } from '../../payload-types'

let payload: Payload
let media: Media

describe('Lexical editor with multiple blocks - Build Objects', () => {
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

  it('builds a Crowdin HTML object as expected', async () => {
    nockLexical()
      .directories(4)
      .storages(4)
      .files(4)
      .build()

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: getFixture(media.id),
      },
    })
    expect(
      normalizeForSnapshot(
        utilities.buildCrowdinHtmlObject({
          doc: policy,
          fields: Policies.fields,
        }),
        media.id,
      ),
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
                    "text": "Sample content for a Lexical rich text field with multiple blocks.",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "cta",
                  "id": "65d67d2591c92e447e7472f7",
                  "link": {
                    "href": "https://www.npmjs.com/package/payload-crowdin-sync",
                    "text": "Download payload-crowdin-sync on npm!",
                    "type": "external",
                  },
                  "select": "primary",
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
                    "text": "A bulleted list in-between some blocks consisting of:",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
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
                        "text": "one bullet list item; and",
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
                        "text": "another!",
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
                  "blockName": "",
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
                              "text": "The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular \`blocks\` field.",
                              "type": "text",
                              "version": 1,
                            },
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
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
                              "text": "Markers are placed in the html and this content is restored into the correct place on translation.",
                              "type": "text",
                              "version": 1,
                            },
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
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
                    "preTitle": "How the plugin handles blocks in the Lexical editor",
                    "title": "Blocks are extracted into their own fields",
                  },
                  "id": "65d67d8191c92e447e7472f8",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "imageText",
                  "id": "65d67e2291c92e447e7472f9",
                  "image": "65d67e6a7fb7e9426b3f9f5f",
                  "title": "Testing a range of fields",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "listitem",
                    "value": 1,
                    "version": 1,
                  },
                ],
                "direction": null,
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
        },
      }
    `)
  })

  it('builds a Crowdin JSON object as expected', async () => {
    nockLexical()
      .directories(2)
      .storages(4)
      .files(4)
      .build()

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: getFixture(media.id),
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
    nockLexical()
      .directories(3)
      .storages(4)
      .files(4)
      .build()

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: getFixture(media.id),
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
      normalizeForSnapshot(
        utilities.buildPayloadUpdateObject({
          crowdinJsonObject,
          crowdinHtmlObject,
          fields: Policies.fields,
          document: policy,
        }),
        media.id,
      ),
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
                    "text": "Sample content for a Lexical rich text field with multiple blocks.",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "cta",
                  "id": "65d67d2591c92e447e7472f7",
                  "link": {
                    "href": "https://www.npmjs.com/package/payload-crowdin-sync",
                    "text": "Download payload-crowdin-sync on npm!",
                    "type": "external",
                  },
                  "select": "primary",
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
                    "text": "A bulleted list in-between some blocks consisting of:",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
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
                        "text": "one bullet list item; and",
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
                        "text": "another!",
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
                  "blockName": "",
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
                              "text": "The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular \`blocks\` field.",
                              "type": "text",
                              "version": 1,
                            },
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
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
                              "text": "Markers are placed in the html and this content is restored into the correct place on translation.",
                              "type": "text",
                              "version": 1,
                            },
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
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
                    "preTitle": "How the plugin handles blocks in the Lexical editor",
                    "title": "Blocks are extracted into their own fields",
                  },
                  "id": "65d67d8191c92e447e7472f8",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "imageText",
                  "id": "65d67e2291c92e447e7472f9",
                  "image": "65d67e6a7fb7e9426b3f9f5f",
                  "title": "Testing a range of fields",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "listitem",
                    "value": 1,
                    "version": 1,
                  },
                ],
                "direction": null,
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
        },
        "title": "Test policy",
      }
    `)
  })
})
