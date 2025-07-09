import { Policy } from "@/payload-types";

export const fixture = {
  "root": {
    "type": "root",
    "children": [
      {
        "type": "table",
        "format": "",
        "direction": null,
        "version": 1,
        "indent": 0,
        "children": [
          {
            "type": "tablerow",
            "format": "",
            "direction": null,
            "version": 1,
            "indent": 0,
            "children": [
              {
                "type": "tablecell",
                "headerState": 1,
                "format": "",
                "direction": null,
                "version": 1,
                "indent": 0,
                "children": [
                  {
                    "type": "text",
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Texte pour la cellule d'en-tête 1",
                    "version": 1
                  }
                ]
              },
              {
                "type": "tablecell",
                "headerState": 1,
                "format": "",
                "direction": null,
                "version": 1,
                "indent": 0,
                "children": [
                  {
                    "type": "text",
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Texte pour la cellule d'en-tête 2",
                    "version": 1
                  }
                ]
              },
              {
                "type": "tablecell",
                "headerState": 1,
                "format": "",
                "direction": null,
                "version": 1,
                "indent": 0,
                "children": [
                  {
                    "type": "text",
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Texte pour la cellule d'en-tête 3",
                    "version": 1
                  }
                ]
              },
              {
                "type": "tablecell",
                "headerState": 1,
                "format": "",
                "direction": null,
                "version": 1,
                "indent": 0,
                "children": [
                  {
                    "type": "text",
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Texte pour la cellule d'en-tête 4",
                    "version": 1
                  }
                ]
              }
            ]
          },
          {
            "type": "tablerow",
            "format": "",
            "direction": null,
            "version": 1,
            "indent": 0,
            "children": [
              {
                "type": "tablecell",
                "headerState": 0,
                "format": "",
                "direction": null,
                "version": 1,
                "indent": 0,
                "children": [
                  {
                    "type": "text",
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Texte de la cellule du tableau, ligne 1, col 1",
                    "version": 1
                  }
                ]
              },
              {
                "type": "tablecell",
                "headerState": 0,
                "format": "",
                "direction": null,
                "version": 1,
                "indent": 0,
                "children": [
                  {
                    "type": "text",
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Texte de la cellule du tableau, ligne 1, col 2",
                    "version": 1
                  }
                ]
              },
              {
                "type": "tablecell",
                "headerState": 0,
                "format": "",
                "direction": null,
                "version": 1,
                "indent": 0,
                "children": [
                  {
                    "type": "text",
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Texte de la cellule du tableau, ligne 1, col 3",
                    "version": 1
                  }
                ]
              },
              {
                "type": "tablecell",
                "headerState": 0,
                "format": "",
                "direction": null,
                "version": 1,
                "indent": 0,
                "children": [
                  {
                    "type": "paragraph",
                    "children": [
                      {
                        "type": "text",
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "Texte du paragraphe 1 pour la ligne 1 de la cellule du tableau, colonne 4",
                        "version": 1
                      }
                    ],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "textFormat": 0,
                    "textStyle": "",
                    "version": 1
                  },
                  {
                    "type": "paragraph",
                    "children": [
                      {
                        "type": "text",
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "Texte du paragraphe 2 pour la ligne 1 de la cellule du tableau, colonne 4",
                        "version": 1
                      }
                    ],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "textFormat": 0,
                    "textStyle": "",
                    "version": 1
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "direction": "ltr",
    "format": "",
    "indent": 0,
    "version": 1
  }
} as Policy['content']
