import { NestedFieldCollection } from '@/payload-types'

export const fixture = [
  {
    blockType: 'basicBlockLexical',
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Text in a Lexical field inside a block in the ',
                type: 'text',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'blocks field',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'link',
                version: 3,
                fields: {
                  linkType: 'custom',
                  newTab: false,
                  url: 'https://payloadcms.com/docs/fields/blocks',
                },
                id: '688dd6e6a950db7862106961',
              },
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
            textFormat: 0,
            textStyle: '',
          },
          {
            type: 'block',
            version: 2,
            format: '',
            fields: {
              id: '688dd6eca950db7862106962',
              content: {
                root: {
                  children: [
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: "Text in a Lexical field in the 'Highlight' block. This block is embedded in a parent Lexical field within the 'Basic Block Lexical' block.",
                          type: 'text',
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      type: 'paragraph',
                      version: 1,
                      textFormat: 0,
                      textStyle: '',
                    },
                    {
                      type: 'block',
                      version: 2,
                      format: '',
                      fields: {
                        id: '688dd71aa950db7862106963',
                        blockName: '',
                        items: [
                          {
                            id: '688dd71d258ffa0224ea6dac',
                            text: "Text in an array field in the 'Feature List' block. This block is embedded in a parent Lexical field within the 'Highlight' block.",
                          },
                          {
                            id: '688dd71f258ffa0224ea6dae',
                            text: 'The Payload Crowdin Sync plugin can parse complex field structures including blocks nested in Lexical fields nested in blocks nested in ...etc.',
                          },
                        ],
                        blockType: 'featureList',
                      },
                    },
                    {
                      children: [],
                      direction: null,
                      format: '',
                      indent: 0,
                      type: 'paragraph',
                      version: 1,
                      textFormat: 0,
                      textStyle: '',
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'root',
                  version: 1,
                },
              },
              blockName: '',
              blockType: 'highlight',
              heading: {},
            },
          },
          {
            children: [],
            direction: null,
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
            textFormat: 0,
            textStyle: '',
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    id: '688dd685258ffa0224ea6daa',
  },
] as NestedFieldCollection['layout']
