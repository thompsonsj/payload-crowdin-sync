import { Policy } from "../../payload-types"

export const fixture = {
  "root": {
      "type": "root",
      "format": "",
      "indent": 0,
      "version": 1,
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
                      "version": 1
                  }
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "type": "paragraph",
              "version": 1
          },
          {
              "format": "",
              "type": "block",
              "version": 2,
              "fields": {
                  "id": "65d67d2591c92e447e7472f7",
                  "blockName": "",
                  "blockType": "cta",
                  "link": {
                    "text": "Download payload-crowdin-sync on npm!",
                    "href": "https://www.npmjs.com/package/payload-crowdin-sync",
                    "type": "external",
                  },
                  "select": "primary"
              }
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
                      "version": 1
                  }
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "type": "paragraph",
              "version": 1
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
                              "version": 1
                          }
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "type": "listitem",
                      "version": 1,
                      "value": 1
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
                              "version": 1
                          }
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "type": "listitem",
                      "version": 1,
                      "value": 2
                  }
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "type": "list",
              "version": 1,
              "listType": "bullet",
              "start": 1,
              "tag": "ul"
          },
          {
              "format": "",
              "type": "block",
              "version": 2,
              "fields": {
                  "id": "65d67d8191c92e447e7472f8",
                  "blockName": "",
                  "blockType": "highlight",
                  "color": "green",
                  "content": {
                      "root": {
                          "type": "root",
                          "format": "",
                          "indent": 0,
                          "version": 1,
                          "children": [
                              {
                                  "children": [
                                      {
                                          "detail": 0,
                                          "format": 0,
                                          "mode": "normal",
                                          "style": "",
                                          "text": "The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular `blocks` field.",
                                          "type": "text",
                                          "version": 1
                                      }
                                  ],
                                  "direction": "ltr",
                                  "format": "",
                                  "indent": 0,
                                  "type": "paragraph",
                                  "version": 1
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
                                          "version": 1
                                      }
                                  ],
                                  "direction": "ltr",
                                  "format": "",
                                  "indent": 0,
                                  "type": "paragraph",
                                  "version": 1
                              }
                          ],
                          "direction": "ltr"
                      }
                  },
                  "heading": {
                      "title": "Blocks are extracted into their own fields",
                      "preTitle": "How the plugin handles blocks in the Lexical editor"
                  }
              }
          },
          {
              "format": "",
              "type": "block",
              "version": 2,
              "fields": {
                  "id": "65d67e2291c92e447e7472f9",
                  "blockName": "",
                  "blockType": "imageText",
                  "title": "Testing a range of fields",
                  "image": "65d67e6a7fb7e9426b3f9f5f",
              }
          },
          {
              "children": [
                  {
                      "children": [],
                      "direction": null,
                      "format": "",
                      "indent": 0,
                      "type": "listitem",
                      "version": 1,
                      "value": 1
                  }
              ],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "list",
              "version": 1,
              "listType": "bullet",
              "start": 1,
              "tag": "ul"
          }
      ],
      "direction": "ltr"
  }
} as Policy['content']
