import { extractLexicalBlockContent } from 'payload-crowdin-sync'
import { fixture } from './lexical-editor-with-multiple-blocks.fixture'

describe('Lexical editor with multiple blocks - Utilities', () => {
  it('extracts blocks into a format expected for a "blocks" field', async () => {
    expect(fixture && extractLexicalBlockContent(fixture.root)).toMatchInlineSnapshot(`
      [
        {
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
        {
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
        {
          "blockName": "",
          "blockType": "imageText",
          "id": "65d67e2291c92e447e7472f9",
          "image": "65d67e6a7fb7e9426b3f9f5f",
          "title": "Testing a range of fields",
        },
      ]
    `)
  })
})
