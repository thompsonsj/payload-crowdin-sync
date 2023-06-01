import {CollectionConfig, Field, GlobalConfig } from 'payload/types'
import { getLocalizedFields } from '.'

describe("fn: getLocalizedFields", () => {
  describe("basic field type tests", () => {
    it ("includes localized fields from a group field", () => {
      const global: GlobalConfig = {
        slug: "global",
        fields: [
          {
            name: 'simpleLocalizedField',
            type: 'text',
            localized: true,
          },
          {
            name: 'simpleNonLocalizedField',
            type: 'text',
          },
          {
            name: 'groupField',
            type: 'group',
            fields: [
              {
                name: 'simpleLocalizedField',
                type: 'text',
                localized: true,
              },
              {
                name: 'simpleNonLocalizedField',
                type: 'text',
              },
              // select fields not supported yet
              {
                name: 'text',
                type: 'select',
                localized: true,
                options: [
                  'one',
                  'two'
                ]
              },
            ]
          },
        ]
      }
      const expected = [
        {
          name: 'simpleLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          name: 'groupField',
          type: 'group',
          fields: [
            {
              name: 'simpleLocalizedField',
              type: 'text',
              localized: true,
            },
          ]
        },
      ]
      expect(getLocalizedFields({ fields: global.fields })).toEqual(expected)
    })

    it ("includes localized fields from an array field", () => {
      const global: GlobalConfig = {
        slug: "global",
        fields: [
          {
            name: 'simpleLocalizedField',
            type: 'text',
            localized: true,
          },
          {
            name: 'simpleNonLocalizedField',
            type: 'text',
          },
          {
            name: 'arrayField',
            type: 'array',
            fields: [
              {
                name: 'title',
                type: 'text',
                localized: true,
              },
              {
                name: 'text',
                type: 'text',
                localized: true,
              },
              {
                name: 'select',
                type: 'select',
                localized: true,
                options: [
                  'one',
                  'two'
                ]
              },
            ]
          },
        ]
      }
      const expected = [
        {
          name: 'simpleLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          name: 'arrayField',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
            },
            {
              name: 'text',
              type: 'text',
              localized: true,
            },
          ]
        },
      ]
      expect(getLocalizedFields({ fields: global.fields })).toEqual(expected)
    })

    it ("includes localized fields from an array with a localization setting on the array field", () => {
      const global: GlobalConfig = {
        slug: "global",
        fields: [
          {
            name: 'simpleLocalizedField',
            type: 'text',
            localized: true,
          },
          {
            name: 'simpleNonLocalizedField',
            type: 'text',
          },
          {
            name: 'arrayField',
            type: 'array',
            localized: true,
            fields: [
              {
                name: 'title',
                type: 'text',
                
              },
              {
                name: 'text',
                type: 'text',
              },
              {
                name: 'select',
                type: 'select',
                options: [
                  'one',
                  'two'
                ]
              },
            ]
          },
        ]
      }
      const expected = [
        {
          name: 'simpleLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          name: 'arrayField',
          type: 'array',
          localized: true,
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'text',
              type: 'text',
            },
          ]
        },
      ]
      expect(getLocalizedFields({ fields: global.fields })).toEqual(expected)
    })

    /**
     * * help ensure no errors during version 0 development
     * * mitigate against errors if a new field type is introduced by Payload CMS
     */
    it ("does not include unrecognized field types", () => {
      const global: any = {
        slug: "global",
        fields: [
          {
            name: 'textLocalizedField',
            type: 'text',
            localized: true,
          },
          {
            name: 'textNonLocalizedField',
            type: 'text',
          },
          {
            name: 'unknownLocalizedField',
            type: 'weird',
            localized: true,
          },
          {
            name: "Unknown Field type",
            type: 'strange',
            fields: [
              {
                name: 'textLocalizedFieldInCollapsibleField',
                type: 'text',
                localized: true,
              },
              {
                name: 'textNonLocalizedFieldInCollapsibleField',
                type: 'text',
              },
              // select fields not supported yet
              {
                name: 'selectLocalizedFieldInCollapsibleField',
                type: 'select',
                localized: true,
                options: [
                  'one',
                  'two'
                ]
              },
            ]
          },
        ]
      }
      const expected = [
        {
          name: 'textLocalizedField',
          type: 'text',
          localized: true,
        },
      ]
      expect(getLocalizedFields({ fields: global.fields })).toEqual(expected)
    })

    it ("includes localized fields from a group field", () => {
      const fields: Field[] = [
        {
          name: 'simpleLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          name: 'simpleNonLocalizedField',
          type: 'text',
        },
        {
          name: 'groupField',
          type: 'group',
          fields: [
            {
              name: 'simpleLocalizedField',
              type: 'text',
              localized: true,
            },
            {
              name: 'simpleNonLocalizedField',
              type: 'text',
            },
            // select fields not supported yet
            {
              name: 'text',
              type: 'select',
              localized: true,
              options: [
                'one',
                'two'
              ]
            },
          ]
        },
      ]
      const expected = [
        {
          name: 'simpleLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          name: 'groupField',
          type: 'group',
          fields: [
            {
              name: 'simpleLocalizedField',
              type: 'text',
              localized: true,
            },
          ]
        },
      ]
      expect(getLocalizedFields({ fields })).toEqual(expected)
    })

    it ("includes localized fields from a group field with a localization setting on the group field", () => {
      const fields: Field[] = [
        {
          name: 'simpleLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          name: 'simpleNonLocalizedField',
          type: 'text',
        },
        {
          name: 'groupField',
          type: 'group',
          localized: true,
          fields: [
            {
              name: 'textLocalizedField',
              type: 'text',
            },
            {
              name: 'richTextLocalizedField',
              type: 'richText',
            },
            // select fields not supported yet
            {
              name: 'text',
              type: 'select',
              options: [
                'one',
                'two'
              ]
            },
          ]
        },
      ]
      const expected = [
        {
          name: 'simpleLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          name: 'groupField',
          type: 'group',
          localized: true,
          fields: [
            {
              name: 'textLocalizedField',
              type: 'text',
            },
            {
              name: 'richTextLocalizedField',
              type: 'richText',
            },
          ]
        },
      ]
      expect(getLocalizedFields({ fields })).toEqual(expected)
    })

    /**
     * blocks not supported yet
    it ("includes localized fields from a blocks field", () => {
      const TestBlock: Block = {
        slug: 'text',
        imageAltText: 'Text',
        fields: [
          {
            name: 'title',
            type: 'text',
            localized: true,
          },
          {
            name: 'text',
            type: 'richText',
            localized: true,
          },
          {
            name: 'select',
            type: 'select',
            localized: true,
            options: [
              'one',
              'two'
            ]
          },
        ]
      }
      const TestBlockLocalizedFieldsOnly: Block = {
        slug: 'text',
        imageAltText: 'Text',
        fields: [
          {
            name: 'title',
            type: 'text',
            localized: true,
          },
          {
            name: 'text',
            type: 'richText',
            localized: true,
          },
        ]
      }
      const global: GlobalConfig = {
        slug: "global",
        fields: [
          {
            name: 'simpleLocalizedField',
            type: 'text',
            localized: true,
          },
          {
            name: 'simpleNonLocalizedField',
            type: 'text',
          },
          {
            name: 'blocksField',
            type: 'blocks',
            blocks: [
              TestBlock
            ]
          },
        ]
      }
      const expected = [
        {
          name: 'simpleLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          name: 'blocksField',
          type: 'blocks',
          blocks: [
            {
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'text',
                  type: 'richText',
                  localized: true,
                },
              ]
            }
          ]
        },
      ]
      expect(getLocalizedFields(global.fields)).toEqual(expected)
    })
    */
  })

  it ("extract rich text localized fields", () => {
    const global: GlobalConfig = {
      slug: "global",
      fields: [
        {
          name: 'simpleLocalizedField',
          type: 'richText',
          localized: true,
        },
        {
          name: 'simpleNonLocalizedField',
          type: 'text',
        },
        {
          name: 'arrayField',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
            },
            {
              name: 'richText',
              type: 'richText',
              localized: true,
            },
            {
              name: 'select',
              type: 'select',
              localized: true,
              options: [
                'one',
                'two'
              ]
            },
          ]
        },
        {
          name: 'groupField',
          type: 'group',
          fields: [
            {
              name: 'simpleLocalizedField',
              type: 'richText',
              localized: true,
            },
            {
              name: 'simpleNonLocalizedField',
              type: 'text',
            },
            // select fields not supported yet
            {
              name: 'text',
              type: 'select',
              localized: true,
              options: [
                'one',
                'two'
              ]
            },
          ]
        },
      ]
    }
    const expected = [
      {
        name: 'simpleLocalizedField',
        type: 'richText',
        localized: true,
      },
      {
        name: 'arrayField',
        type: 'array',
        fields: [
          {
            name: 'richText',
            type: 'richText',
            localized: true,
          },
        ]
      },
      {
        name: 'groupField',
        type: 'group',
        fields: [
          {
            name: 'simpleLocalizedField',
            type: 'richText',
            localized: true,
          },
        ]
      },
    ]
    expect(getLocalizedFields({ fields: global.fields, type: 'html'})).toEqual(expected)
  })
  
  it ("returns an nested json fields in a group inside an array", () => {
    const linkField: Field = {
      name: 'link',
      type: 'group',
      fields: [
        {
          name: 'text',
          type: 'text',
          localized: true,
        },
        {
          name: 'href',
          type: 'text'
        },
        {
          name: 'type',
          type: 'select',
          options: [
            'ctaPrimary',
            'ctaSecondary'
          ]
        }
      ]
    }
    const Promos: CollectionConfig = {
      slug: 'promos',
      admin: {
        defaultColumns: ['title', 'updatedAt'],
        useAsTitle: 'title',
        group: "Shared",
      },
      access: {
        read: () => true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'text',
          type: 'text',
          localized: true,
        },
        {
          name: 'ctas',
          type: 'array',
          minRows: 1,
          maxRows: 2,
          fields: [
            linkField,
          ]
        }
      ]
    }
    const expected = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      {
        name: 'text',
        type: 'text',
        localized: true,
      },
      {
        name: 'ctas',
        type: 'array',
        minRows: 1,
        maxRows: 2,
        fields: [
          {
            name: 'link',
            type: 'group',
            fields: [
              {
                name: 'text',
                type: 'text',
                localized: true,
              },
            ],
          },
        ]
      }
    ]
    const jsonFields = getLocalizedFields({ fields: Promos.fields, type: 'json'})
    expect(jsonFields).toEqual(expected)
  })
})