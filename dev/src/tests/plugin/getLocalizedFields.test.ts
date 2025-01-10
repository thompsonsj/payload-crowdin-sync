import Policies from '../../collections/Policies'
import type { Field } from 'payload'
import {
  getLocalizedFields,
  getLexicalBlockFields,
  getLexicalEditorConfig,
  isLexical,
} from 'payload-crowdin-sync'

import { isRichTextField } from './../../type-checkers'

const fields: Field[] = Policies.fields

// Need to sanitize config for this to work - this is done in the plugin by retrieving the config from req.payload
/**
describe('payload-crowdin-sync: isLexical', () => {
  it('detects a lexical field', () => {
    const contentField = (fields || [])
      .filter(isRichTextField)
      .find((field) => field.name === 'content')

    expect(contentField && isLexical(contentField)).toBeTruthy()
  })
})
*/

/**
describe('payload-crowdin-sync: getLexicalBlockFields', () => {
  it('detects a lexical field', () => {
    const contentField = (fields || [])
      .filter(isRichTextField)
      .find((field) => field.name === 'content')

    const editorConfig = contentField && getLexicalEditorConfig(contentField)

    expect(editorConfig && getLexicalBlockFields(editorConfig)).toMatchInlineSnapshot(`undefined`)
  })
})
*/

describe('payload-crowdin-sync: getLocalizedFields', () => {
  it('returns policies collection result as expected', () => {
    expect(getLocalizedFields({ fields })).toMatchInlineSnapshot(`
      [
        {
          "localized": true,
          "name": "title",
          "type": "text",
        },
        {
          "editor": [Function],
          "localized": true,
          "name": "content",
          "type": "richText",
        },
        {
          "fields": [
            {
              "fields": [
                {
                  "localized": true,
                  "name": "title",
                  "type": "text",
                },
                {
                  "editor": [Function],
                  "localized": true,
                  "name": "content",
                  "type": "richText",
                },
              ],
              "name": "array",
              "type": "array",
            },
          ],
          "name": "group",
          "type": "group",
        },
      ]
    `)
  })
})
