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
                      "text": "Lexical editor content",
                      "type": "text",
                      "version": 1
                  }
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "type": "heading",
              "version": 1,
              "tag": "h2"
          },
          {
              "children": [
                  {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "This is editable ",
                      "type": "text",
                      "version": 1
                  },
                  {
                      "detail": 0,
                      "format": 1,
                      "mode": "normal",
                      "style": "",
                      "text": "rich",
                      "type": "text",
                      "version": 1
                  },
                  {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": " text, ",
                      "type": "text",
                      "version": 1
                  },
                  {
                      "detail": 0,
                      "format": 2,
                      "mode": "normal",
                      "style": "",
                      "text": "much",
                      "type": "text",
                      "version": 1
                  },
                  {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": " better than a ",
                      "type": "text",
                      "version": 1
                  },
                  {
                      "detail": 0,
                      "format": 16,
                      "mode": "normal",
                      "style": "",
                      "text": "<textarea>",
                      "type": "text",
                      "version": 1
                  },
                  {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "!",
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
                      "text": "Since it's rich text, you can do things like turn a selection of text ",
                      "type": "text",
                      "version": 1
                  },
                  {
                      "detail": 0,
                      "format": 1,
                      "mode": "normal",
                      "style": "",
                      "text": "bold",
                      "type": "text",
                      "version": 1
                  },
                  {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": ", or add a semantically rendered block quote in the middle of the page, like this:",
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
                      "text": "A wise quote.",
                      "type": "text",
                      "version": 1
                  }
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "type": "quote",
              "version": 1
          },
          {
              "children": [
                  {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "Try it out for yourself!",
                      "type": "text",
                      "version": 1
                  }
              ],
              "direction": "ltr",
              "format": "center",
              "indent": 0,
              "type": "paragraph",
              "version": 1
          },
          {
              "children": [],
              "direction": null,
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
                  "id": "6582d48f2037fb3ca72ed2cf",
                  "blockName": "",
                  "blockType": "highlight",
                  "color": "gray",
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
                                          "text": "More lexical content inside a custom block.",
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
                      "title": "Highlight",
                      "preTitle": "Custom block"
                  }
              }
          },
          {
              "children": [],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "paragraph",
              "version": 1
          }
      ],
      "direction": "ltr"
  }
} as Policy['content']
