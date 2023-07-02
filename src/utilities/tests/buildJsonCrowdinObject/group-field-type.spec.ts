import { CollectionConfig, Field } from "payload/types"
import { buildCrowdinJsonObject, getLocalizedFields } from "../.."
import { FieldWithName } from "../../../types"

describe("fn: buildCrowdinJsonObject: group field type", () => {
  it ("creates an empty JSON object if fields are empty", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: '',
      groupField: {
        title: "",
        text: "",
        description: '',
        select: "one"
      },
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const fields: FieldWithName[] = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      // select not supported yet
      {
        name: 'select',
        type: 'select',
        localized: true,
        options: [
          'one',
          'two'
        ]
      },
      {
        name: 'groupField',
        type: 'group',
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
            name: 'description',
            type: 'textarea',
            localized: true,
          },
          // select not supported yet
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
    const localizedFields = getLocalizedFields({ fields })
    const expected = {}
    expect(buildCrowdinJsonObject({doc, fields: localizedFields})).toEqual(expected)
  })

  it ("includes localized fields nested in a group", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      groupField: {
        title: "Group title field content",
        text: "Group text field content",
        description: 'A textarea value.\nWith a new line.',
        select: "one"
      },
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const fields: FieldWithName[] = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      // select not supported yet
      {
        name: 'select',
        type: 'select',
        localized: true,
        options: [
          'one',
          'two'
        ]
      },
      {
        name: 'groupField',
        type: 'group',
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
            name: 'description',
            type: 'textarea',
            localized: true,
          },
          // select not supported yet
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
    const localizedFields = getLocalizedFields({ fields })
    const expected = {
      title: 'Test Policy created with title',
      groupField: {
        title: "Group title field content",
        text: "Group text field content",
        description: 'A textarea value.\nWith a new line.',
      },
    }
    expect(buildCrowdinJsonObject({doc, fields: localizedFields})).toEqual(expected)
  })

  it ("includes localized fields nested in a group with a localization setting on the group field", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      groupField: {
        title: "Group title field content",
        text: "Group text field content",
        select: "one"
      },
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const fields: FieldWithName[] = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      // select not supported yet
      {
        name: 'select',
        type: 'select',
        localized: true,
        options: [
          'one',
          'two'
        ]
      },
      {
        name: 'groupField',
        type: 'group',
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
          // select not supported yet
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
    const localizedFields = getLocalizedFields({ fields })
    const expected = {
      title: 'Test Policy created with title',
      groupField: {
        title: "Group title field content",
        text: "Group text field content",
      },
    }
    expect(buildCrowdinJsonObject({doc, fields: localizedFields})).toEqual(expected)
  })

  it ("includes localized fields and meta @payloadcms/plugin-seo ", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      status: 'draft',
      meta: {
        title: 'Meta title value',
        description: 'Meta description value.\nCan contain new lines.',
      },
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const localizedFields: FieldWithName[] = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      {
        name: "meta",
        label: "SEO",
        type: "group",
        fields: [
          {
            name: "title",
            type: "text",
            localized: true,
            admin: {
              components: {}
            }
          },
          {
            name: "description",
            type: "textarea",
            localized: true,
            admin: {
              components: {}
            }
          }
        ]
      }
    ]
    const expected = {
      title: 'Test Policy created with title',
      meta: { title: 'Meta title value', description: 'Meta description value.\nCan contain new lines.', },
    }
    expect(buildCrowdinJsonObject({doc, fields: localizedFields})).toEqual(expected)
  })

  /**
   * This test is still included but I'm not sure if it's needed.
   * 
   * It may have been the result of a mistake? i.e. a field that
   * was localized and then de-localized? That's more a job for
   * migrations.
   */
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
        type: 'text',
        localized: true,
      },
      {
        name: "meta",
        label: "SEO",
        type: "group",
        fields: [
          {
            name: "title",
            type: "text",
            localized: true,
            admin: {
              components: {}
            }
          }
        ]
      }
    ]
    const expected = {
      title: 'Test Policy created with title',
      meta: { title: 'Test Policy created with title | Teamtailor' },
    }
    expect(buildCrowdinJsonObject({doc, fields: localizedFields})).toEqual(expected)
  })
})