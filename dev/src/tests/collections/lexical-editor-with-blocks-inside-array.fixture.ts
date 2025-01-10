import { NestedFieldCollection } from "../../payload-types";

export const fixture = {
  "id": "6712ecd0ce62939a20dea70c",
  "arrayField": [],
  "layout": [],
  "group": {},
  "items": [
      {
          "heading": "Nested Lexical fields are supported",
          "block": [
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
                                          "text": "Lexical fields nested within complex layouts - such as this one (a ",
                                          "type": "text",
                                          "version": 1
                                      },
                                      {
                                          "detail": 0,
                                          "format": 16,
                                          "mode": "normal",
                                          "style": "",
                                          "text": "blocks",
                                          "type": "text",
                                          "version": 1
                                      },
                                      {
                                          "detail": 0,
                                          "format": 0,
                                          "mode": "normal",
                                          "style": "",
                                          "text": " field in an ",
                                          "type": "text",
                                          "version": 1
                                      },
                                      {
                                          "detail": 0,
                                          "format": 16,
                                          "mode": "normal",
                                          "style": "",
                                          "text": "array",
                                          "type": "text",
                                          "version": 1
                                      },
                                      {
                                          "detail": 0,
                                          "format": 0,
                                          "mode": "normal",
                                          "style": "",
                                          "text": " item within a ",
                                          "type": "text",
                                          "version": 1
                                      },
                                      {
                                          "detail": 0,
                                          "format": 16,
                                          "mode": "normal",
                                          "style": "",
                                          "text": "tab",
                                          "type": "text",
                                          "version": 1
                                      },
                                      {
                                          "detail": 0,
                                          "format": 0,
                                          "mode": "normal",
                                          "style": "",
                                          "text": "), are supported.",
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
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "type": "root",
                          "version": 1
                      }
                  },
                  "id": "6712ecd0a87c5472e08bf255",
                  "blockType": "basicBlockLexical"
              }
          ],
          "id": "6712ecd0a87c5472e08bf253"
      },
      {
          "heading": "Nested Lexical fields are supported - and blocks in that Lexical field are also translated",
          "block": [
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
                                          "text": "If you add custom blocks, these will also be translated!",
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
                                      "id": "6712ec66a81e050bf5f31b43",
                                      "blockName": "",
                                      "blockType": "highlight",
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
                                                              "text": "Note a key difference with regular blocks - all ",
                                                              "type": "text",
                                                              "version": 1
                                                          },
                                                          {
                                                              "detail": 0,
                                                              "format": 16,
                                                              "mode": "normal",
                                                              "style": "",
                                                              "text": "text",
                                                              "type": "text",
                                                              "version": 1
                                                          },
                                                          {
                                                              "detail": 0,
                                                              "format": 0,
                                                              "mode": "normal",
                                                              "style": "",
                                                              "text": ", ",
                                                              "type": "text",
                                                              "version": 1
                                                          },
                                                          {
                                                              "detail": 0,
                                                              "format": 16,
                                                              "mode": "normal",
                                                              "style": "",
                                                              "text": "textarea",
                                                              "type": "text",
                                                              "version": 1
                                                          },
                                                          {
                                                              "detail": 0,
                                                              "format": 0,
                                                              "mode": "normal",
                                                              "style": "",
                                                              "text": " and ",
                                                              "type": "text",
                                                              "version": 1
                                                          },
                                                          {
                                                              "detail": 0,
                                                              "format": 16,
                                                              "mode": "normal",
                                                              "style": "",
                                                              "text": "richText",
                                                              "type": "text",
                                                              "version": 1
                                                          },
                                                          {
                                                              "detail": 0,
                                                              "format": 0,
                                                              "mode": "normal",
                                                              "style": "",
                                                              "text": " fields will be sent to Crowdin regardless of whether or not they are ",
                                                              "type": "text",
                                                              "version": 1
                                                          },
                                                          {
                                                              "children": [
                                                                  {
                                                                      "detail": 0,
                                                                      "format": 0,
                                                                      "mode": "normal",
                                                                      "style": "",
                                                                      "text": "localized fields",
                                                                      "type": "text",
                                                                      "version": 1
                                                                  }
                                                              ],
                                                              "direction": "ltr",
                                                              "format": "",
                                                              "indent": 0,
                                                              "type": "link",
                                                              "version": 2,
                                                              "fields": {
                                                                  "linkType": "custom",
                                                                  "newTab": false,
                                                                  "url": "https://payloadcms.com/docs/configuration/localization#field-by-field-localization"
                                                              }
                                                          },
                                                          {
                                                              "detail": 0,
                                                              "format": 0,
                                                              "mode": "normal",
                                                              "style": "",
                                                              "text": ".",
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
                                              "direction": "ltr",
                                              "format": "",
                                              "indent": 0,
                                              "type": "root",
                                              "version": 1
                                          }
                                      },
                                      "heading": {
                                          "title": "Block configuration in Lexical fields"
                                      },
                                      "color": "yellow",
                                  }
                              }
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "type": "root",
                          "version": 1
                      }
                  },
                  "id": "6712ecd0a87c5472e08bf256",
                  "blockType": "basicBlockLexical"
              }
          ],
          "id": "6712ecd0a87c5472e08bf254"
      }
  ],
  "tabTwo": {},
  "createdAt": "2024-10-18T23:18:40.599Z",
  "updatedAt": "2024-10-18T23:18:40.599Z"
} as NestedFieldCollection
