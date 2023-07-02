import { Block, CollectionConfig, Field } from "payload/types"
import { buildCrowdinJsonObject, getLocalizedFields } from "../.."
import { FieldWithName } from "../../../types"

const TestBlockOne: Block = {
  slug: 'testBlockOne',
  fields: [{
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
  },],
}

const TestBlockTwo: Block = {
  slug: 'testBlockTwo',
  fields: [{
    name: 'url',
    type: 'text',
    localized: true,
  },],
}

const TestBlockTwoNonLocalized: Block = {
  slug: 'testBlockTwo',
  fields: [{
    name: 'url',
    type: 'text',
  },],
}

describe("fn: buildCrowdinJsonObject: blocks field type", () => {
  it ("includes localized fields nested in blocks", () => {
    const doc = {
      title: 'Test Policy created with title',
      blocksField: [
        {
          title: "Block field title content one",
          text: "Block field text content one",
          select: "two",
          id: "64735620230d57bce946d370",
          blockType: 'testBlockOne',
        },
        {
          url: "https://github.com/thompsonsj/payload-crowdin-sync",
          id: "64735621230d57bce946d371",
          blockType: 'testBlockTwo',
        }
      ],
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
        name: 'blocksField',
        type: 'blocks',
        blocks: [
          TestBlockOne,
          TestBlockTwo,
        ]
      },
    ]
    const localizedFields = getLocalizedFields({ fields })
    const expected = {
      title: 'Test Policy created with title',
      blocksField: [
        {
          title: "Block field title content one",
          text: "Block field text content one",
        },
        {
          url: "https://github.com/thompsonsj/payload-crowdin-sync",
        }
      ],
    }
    expect(buildCrowdinJsonObject({doc, fields: localizedFields})).toEqual(expected)
  })

  it ("excludes block with no localized fields", () => {
    const doc = {
      title: 'Test Policy created with title',
      blocksField: [
        {
          title: "Block field title content one",
          text: "Block field text content one",
          select: "two",
          id: "64735620230d57bce946d370",
          blockType: 'testBlockOne',
        },
        {
          url: "https://github.com/thompsonsj/payload-crowdin-sync",
          id: "64735621230d57bce946d371",
          blockType: 'testBlockTwo',
        }
      ],
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
        name: 'blocksField',
        type: 'blocks',
        blocks: [
          TestBlockOne,
          TestBlockTwoNonLocalized,
        ]
      },
    ]
    const localizedFields = getLocalizedFields({ fields })
    const expected = {
      title: 'Test Policy created with title',
      blocksField: [
        {
          title: "Block field title content one",
          text: "Block field text content one",
        },
      ],
    }
    expect(buildCrowdinJsonObject({doc, fields: localizedFields})).toEqual(expected)
  })
})