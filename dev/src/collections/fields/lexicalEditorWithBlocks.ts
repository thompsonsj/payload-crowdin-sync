import type { RichTextField } from 'payload';
import { BlocksFeature, BoldFeature as BoldTextFeature, lexicalEditor, LinkFeature } from '@payloadcms/richtext-lexical'
import { SlateToLexicalFeature } from '@payloadcms/richtext-lexical/migrate'
import { slateEditor } from '@payloadcms/richtext-slate';

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
          },
          {
            slug: "cta",
            imageAltText: "CTA",
            fields: [
              {
                name: "link",
                type: "group",
                fields: [
                  {
                    name: "text",
                    type: "text",
                  },
                  {
                    name: "href",
                    type: "text",
                  },
                  {
                    name: "type",
                    type: "select",
                    options: [
                      "internal",
                      "external",
                    ]
                  }
                ]
              },
              {
                name: "style",
                type: "select",
                options: [
                  "primary",
                  "secondary",
                ]
              }
            ]
          },
          {
            slug: "imageText",
            imageAltText: "Image with text",
            fields: [
              {
                name: "title",
                type: "text",
              },
              {
                name: "content",
                type: "richText",
                editor: slateEditor({}),
              },
              {
                name: "image",
                type: "relationship",
                relationTo: "media",
              }
            ],
          },
          {
            slug: "cookieTable",
            fields: [
              {
                name: "cookieCategoryId",
                type: "select",
                options: [
                  'strictlyNecessary',
                  'functional',
                  'performance',
                  'tracking',
                ]
              }
            ],
          }
        ],
      })
    ],
  }),
}