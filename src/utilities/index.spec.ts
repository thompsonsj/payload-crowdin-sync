import { buildCrowdinJsonObject, fieldChanged } from '.'
import { FieldWithName } from '../types'
import deepEqual from 'deep-equal'

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

describe("Function: buildCrowdinJsonObject", () => {
  it ("does not include undefined localized fields", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const localizedFields: FieldWithName[] = [
      {
        name: 'title',
        type: 'text'
      },
      {
        name: 'anotherString',
        type: 'text'
      }
    ]
    const expected = {
      title: 'Test Policy created with title',
    }
    expect(buildCrowdinJsonObject(doc, localizedFields)).toEqual(expected)
  })

  it ("includes localized fields", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      anotherString: 'An example string',
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const localizedFields: FieldWithName[] = [
      {
        name: 'title',
        type: 'text'
      },
      {
        name: 'anotherString',
        type: 'text'
      }
    ]
    const expected = {
      title: 'Test Policy created with title',
      anotherString: 'An example string',
    }
    expect(buildCrowdinJsonObject(doc, localizedFields)).toEqual(expected)
  })

  it ("includes localized fields and meta @payloadcms/plugin-seo ", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      status: 'draft',
      meta: { title: 'Test Policy created with title | Teamtailor' },
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const localizedFields: FieldWithName[] = [
      {
        name: 'title',
        type: 'text'
      }
    ]
    const expected = {
      title: 'Test Policy created with title',
      meta: { title: 'Test Policy created with title | Teamtailor' },
    }
    expect(buildCrowdinJsonObject(doc, localizedFields)).toEqual(expected)
  })

  it ("includes localized fields and removes localization keys from meta @payloadcms/plugin-seo ", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      status: 'draft',
      meta: { title: { en: 'Test Policy created with title | Teamtailor' } },
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const localizedFields: FieldWithName[] = [
      {
        name: 'title',
        type: 'text'
      }
    ]
    const expected = {
      title: 'Test Policy created with title',
      meta: { title: 'Test Policy created with title | Teamtailor' },
    }
    expect(buildCrowdinJsonObject(doc, localizedFields)).toEqual(expected)
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
