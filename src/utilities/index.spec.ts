import { Block, CollectionConfig, Field, GlobalConfig } from 'payload/types'
import { buildCrowdinJsonObject, getLocalizedFields, fieldChanged, containsLocalizedFields, getFieldSlugs } from '.'
import { FieldWithName } from '../types'
import deepEqual from 'deep-equal'
import dot from 'dot-object'

describe("Function: getLocalizedFields", () => {
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

describe("Function: containsLocalizedFields", () => {
  it("detects localized fields on the top-level", () => {
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
      ],
    }
    expect(containsLocalizedFields(global.fields)).toBe(true)
  })

  it("detects localized fields in a group field", () => {
    const global: GlobalConfig = {
      slug: "global",
      fields: [
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
              type: 'richText',
              localized: true,
            },
          ]
        },
      ],
    }
    expect(containsLocalizedFields(global.fields)).toBe(true)
  })

  it("detects localized fields in an array field", () => {
    const global: GlobalConfig = {
      slug: "global",
      fields: [
        {
          name: 'simpleNonLocalizedField',
          type: 'text',
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
      ],
    }
    expect(containsLocalizedFields(global.fields)).toBe(true)
  })

  it("detects localized fields in a blocks field", () => {
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
    const global: GlobalConfig = {
      slug: "global",
      fields: [
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
      ],
    }
    expect(containsLocalizedFields(global.fields)).toBe(true)
  })

  it("returns false if no localized fields in a blocks field", () => {
    const TestBlock: Block = {
      slug: 'text',
      imageAltText: 'Text',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'text',
          type: 'richText',
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
    }
    const global: GlobalConfig = {
      slug: "global",
      fields: [
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
      ],
    }
    expect(containsLocalizedFields(global.fields)).toBe(false)
  })
})

describe("Function: getFieldSlugs", () => {
  it ("detects top-level richText fields", () => {
    const Policies: CollectionConfig = {
      slug: 'policies',
      admin: {
        defaultColumns: ['title', 'updatedDate'],
        useAsTitle: 'title',
        group: "Pages",
      },
      access: {
        read: () => true,
      },
      versions: {
        drafts: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'updatedDate',
          type: 'date',
          admin: {
            description: "If set, this updated date/time will be displayed on the policy page."
          }
        },
        {
          name: 'content',
          type: 'richText',
          localized: true,
        },
      ],
    }
    const htmlFields = getLocalizedFields({ fields: Policies.fields, type: 'html'})
    expect(getFieldSlugs(htmlFields)).toEqual(['content'])
  })

  it ("returns an empty array if no rich text fields", () => {
    const Statistics: GlobalConfig = {
      slug: "statistics",
      access: {
        read: () => true,
      },
      fields: [
        {
          name: "users",
          type: "group",
          fields: [
            {
              name: "text",
              type: "text",
              localized: true,
            },
            {
              name: "number",
              type: "number",
              min: 0,
              admin: {
                step: 100,
                description: "Restricted to multiples of 100 in order to simplify localization."
              }
            },
          ],
        },
        {
          name: "companies",
          type: "group",
          fields: [
            {
              name: "text",
              type: "text",
              localized: true,
            },
            {
              name: "number",
              type: "number",
              min: 0,
              admin: {
                step: 100,
                description: "Restricted to multiples of 100 in order to simplify localization."
              }
            },
          ],
        },
        {
          name: "countries",
          type: "group",
          fields: [
            {
              name: "text",
              type: "text",
              localized: true,
            },
            {
              name: "number",
              type: "number",
              min: 0,
              admin: {
                step: 1
              }
            },
          ],
        },
        {
          name: "successfulHires",
          type: "group",
          fields: [
            {
              name: "text",
              type: "text",
              localized: true,
            },
            {
              name: "number",
              type: "number",
              min: 0,
              admin: {
                step: 100,
                description: "Restricted to multiples of 100 in order to simplify localization."
              }
            },
          ],
        },
      ],
    }
    const htmlFields = getLocalizedFields({ fields: Statistics.fields, type: 'html'})
    expect(getFieldSlugs(htmlFields)).toEqual([])
  })
})

describe("Function: fieldChanged", () => {
  it ("detects a richText field change on create", () => {
    const before = undefined
    const after = {
      children: [
        {
          text: "Test content"
        }
      ]
    }
    const type = 'richText'
    expect(fieldChanged(before, after, type)).toEqual(true)
  })

  it ("detects a richText field change on update", () => {
    const before = {
      children: [
        {
          text: "Test content before"
        }
      ]
    }
    const after = {
      children: [
        {
          text: "Test content"
        }
      ]
    }
    const type = 'richText'
    expect(fieldChanged(before, after, type)).toEqual(true)
  })

  it ("returns false for equal richText objects", () => {
    const before = {
      children: [
        {
          text: "Test content"
        }
      ]
    }
    const after = before
    const type = 'richText'
    expect(fieldChanged(before, after, type)).toEqual(false)
  })
})

/**
 * Test the deep-equal dependency
 * 
 * Usually, tests should not be done on third
 * party libraries but in this case, we need to
 * be sure key order does not matter.
 */
describe('deep-equal', () => {
  it('returns equal if keys are in a different order', () => {
    const obj1 = {
      title: "Sample article",
      content: [
        {
          children: [
            {
              text: 'Heading 2',
            },
          ],
          type: 'h2',
        },
        {
          children: [
            {
              text: 'A regular paragraph.',
            },
          ],
        }
      ],
      meta: {
        "title": "Sample article | Company",
        "description": ""
      }
    }
    const obj2 = {
      title: "Sample article",
      "meta": {
        "description": "",
        "title": "Sample article | Company"
      },
      content: [
        {
          children: [
            {
              text: 'Heading 2',
            },
          ],
          type: 'h2',
        },
        {
          children: [
            {
              text: 'A regular paragraph.',
            },
          ],
        }
      ],
    }
    expect(deepEqual(
      obj1,
      obj2
    )).toBe(true)
  })
})
