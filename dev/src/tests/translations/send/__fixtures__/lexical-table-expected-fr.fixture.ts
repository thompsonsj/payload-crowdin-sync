import { Policy } from '@/payload-types'

/** Expected Lexical JSON after convertHTMLToLexical (no Slate hop). */
export const fixture = {
  "root": {
    "children": [
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "Texte pour la cellule d'en-tête 1",
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
                  }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 3,
                "rowSpan": 1
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
                        "text": "Texte pour la cellule d'en-tête 2",
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
                  }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 1,
                "rowSpan": 1
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
                        "text": "Texte pour la cellule d'en-tête 3",
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
                  }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 1,
                "rowSpan": 1
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
                        "text": "Texte pour la cellule d'en-tête 4",
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
                  }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 1,
                "rowSpan": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "tablerow",
            "version": 1
          },
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "Texte de la cellule du tableau, ligne 1, col 1",
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
                  }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1
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
                        "text": "Texte de la cellule du tableau, ligne 1, col 2",
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
                  }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1
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
                        "text": "Texte de la cellule du tableau, ligne 1, col 3",
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
                  }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1
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
                        "text": "Texte du paragraphe 1 pour la ligne 1 de la cellule du tableau, colonne 4",
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
                    "children": [
                      {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "Texte du paragraphe 2 pour la ligne 1 de la cellule du tableau, colonne 4",
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
                  }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "tablerow",
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "table",
        "version": 1
      }
    ],
    "direction": "ltr",
    "format": "",
    "indent": 0,
    "type": "root",
    "version": 1
  }
} as Policy['content']
