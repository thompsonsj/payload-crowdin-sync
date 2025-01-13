import { Policy } from "@/payload-types";

export const fixture = {
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
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1,
        "textFormat": 0,
        "textStyle": ""
      },
      {
        "format": "",
        "type": "block",
        "version": 2,
        "fields": {
          "id": "678564c06ec4a6f1fcf6a623",
          "blockName": "",
          "cookieCategoryId": "strictlyNecessary",
          "blockType": "cookieTable"
        }
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
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1,
        "textFormat": 0,
        "textStyle": ""
      },
      {
        "format": "",
        "type": "block",
        "version": 2,
        "fields": {
          "id": "678564926ec4a6f1fcf6a622",
          "blockName": "",
          "cookieCategoryId": "functional",
          "blockType": "cookieTable"
        }
      }
    ],
    "direction": "ltr",
    "format": "",
    "indent": 0,
    "type": "root",
    "version": 1
  }
} as Policy['content']
