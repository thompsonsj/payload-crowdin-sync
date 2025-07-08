import type { SerializedTableNode } from "@payloadcms/richtext-lexical"
import type { SlateNodeConverter } from '@payloadcms/richtext-lexical'

// note that there is no attempt to restore any formatting on the table when loading translations - only content.
// to avoid repetition, define default values for each node in one place
const defaultLexicalNodeProps = {
  format: '',
  direction: null,
  version: 1,
  indent: 0,
}

export const SlateTableConverter: SlateNodeConverter = {
  converter({ slateNode }) {
    return {
      type: 'table',
      ...defaultLexicalNodeProps,
      children: slateNode['children']?.map((row) => ({
        ...defaultLexicalNodeProps,
        type: 'tablerow',
        children: row.children?.map(() => ({
          ...defaultLexicalNodeProps,
          type: 'tablecell',
          "children": [
            {
              "children": [
                {
                  "detail": 0,
                  "format": 0,
                  "mode": "normal",
                  "style": "",
                  "text": "Row 2 cell 5",
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
          ]
        }))
      })),
    } as const as SerializedTableNode
  },
  nodeTypes: ['table'],
}
