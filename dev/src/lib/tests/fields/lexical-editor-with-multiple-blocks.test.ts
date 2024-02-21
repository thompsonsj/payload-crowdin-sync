import payload from 'payload';
import { initPayloadTest } from '../helpers/config';
import { fixture } from './lexical-editor-with-multiple-blocks.fixture';
import nock from 'nock';
import { extractLexicalBlockContent } from 'plugin/src/lib/utilities/lexical';

describe('Lexical editor with multiple blocks', () => {
  beforeAll(async () => {
    await initPayloadTest({});
  });

  afterEach((done) => {
    if (!nock.isDone()) {
      throw new Error(
        `Not all nock interceptors were used: ${JSON.stringify(
          nock.pendingMocks()
        )}`
      );
    }
    nock.cleanAll();
    done();
  });

  afterAll(async () => {
    if (typeof payload?.db?.destroy === 'function') {
      await payload.db.destroy(payload);
    }
  });

  it('extracts blocks into a format expected for a "blocks" field', async () => {
    expect(extractLexicalBlockContent(fixture.root as any))
      .toMatchInlineSnapshot(`
      [
        {
          "blockName": "",
          "blockType": "cta",
          "href": "https://www.npmjs.com/package/payload-crowdin-sync",
          "id": "65d67d2591c92e447e7472f7",
          "text": "Download payload-crowdin-sync on npm!",
          "type": "primary",
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
          "image": {
            "createdAt": "2024-02-21T22:51:22.836Z",
            "filename": "phone-icon-small.png",
            "filesize": 11150,
            "height": 80,
            "id": "65d67e6a7fb7e9426b3f9f5f",
            "mimeType": "image/png",
            "sizes": {
              "card": {
                "filename": null,
                "filesize": null,
                "height": null,
                "mimeType": null,
                "url": null,
                "width": null,
              },
              "tablet": {
                "filename": "phone-icon-small-1024x1024.png",
                "filesize": 241498,
                "height": 1024,
                "mimeType": "image/png",
                "url": "http://localhost:3000/media/phone-icon-small-1024x1024.png",
                "width": 1024,
              },
              "thumbnail": {
                "filename": null,
                "filesize": null,
                "height": null,
                "mimeType": null,
                "url": null,
                "width": null,
              },
            },
            "updatedAt": "2024-02-21T22:51:22.836Z",
            "url": "http://localhost:3000/media/phone-icon-small.png",
            "width": 80,
          },
          "title": "Testing a range of fields",
        },
      ]
    `);
  });
});
