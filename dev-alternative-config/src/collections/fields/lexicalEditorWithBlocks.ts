import type { RichTextField } from 'payload';
import { BlocksFeature, BoldFeature as BoldTextFeature, lexicalEditor, LinkFeature } from '@payloadcms/richtext-lexical'
import { SlateToLexicalFeature } from '@payloadcms/richtext-lexical/migrate'

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
                  },
                  {
                    name: 'preTitle',
                    type: 'text',
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