import { RichTextField } from 'payload/types';
import { BlocksFeature, BoldTextFeature, lexicalEditor, LinkFeature, SlateToLexicalFeature } from '@payloadcms/richtext-lexical'

export const lexicalEditorWithBlocks: RichTextField = {
  name: 'content',
  type: 'richText',
  localized: true,
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      SlateToLexicalFeature(),
      BlocksFeature({
        blocks: [
          {
            slug: 'highlight',
            imageAltText: 'Text',
            fields: [
              {
                name: "heading",
                type: "group",
                fields: [
                  {
                    name: 'title',
                    type: 'text',
                    localized: true,
                  },
                  {
                    name: 'preTitle',
                    type: 'text',
                    localized: true,
                  },
                ]
              },
              {
                name: "color",
                type: "select",
                options: [
                  'gray',
                  'yellow',
                  'green'
                ],
                admin: {
                  isClearable: true,
                },
              },
              {
                name: 'content',
                type: 'richText',
                localized: false,
                editor: lexicalEditor({
                  features: () => [
                    BoldTextFeature(),
                    LinkFeature({}),
                  ]
                }),
              },
            ]
          }
        ],
      })
    ],
  }),
}