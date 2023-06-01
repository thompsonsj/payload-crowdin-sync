import { Block, CollapsibleField, CollectionConfig, Field, GlobalConfig } from 'payload/types'
import deepEqual from 'deep-equal'
import { FieldWithName } from '../types'
import { slateToHtml, payloadSlateToDomConfig } from 'slate-serializers'
import type { Descendant } from 'slate'
import { isArray } from "lodash"

const localizedFieldTypes = [
  'richText',
  'text'
]

const nestedFieldTypes = [
  'array',
  'group',
  // 'blocks',
]

export const containsNestedFields = (field: Field) => nestedFieldTypes.includes(field.type)

export const getLocalizedFields = ({
  fields,
  type,
}: {
  fields: Field[],
  type?: 'json' | 'html',
}): any[] => ([
  ...fields
  // localized or group fields only.
  .filter(field => isLocalizedField(field) || containsNestedFields(field))
  // further filter on CrowdIn field type
  .filter (field => {
    if (containsNestedFields(field)) {
      return true
    }
    return type ? fieldCrowdinFileType(field as FieldWithName) === type : true
  })
  // recursion for group, array and blocks field
  .map(field => {
    if (field.type === 'group' || field.type === 'array') {
      return {
        ...field,
        fields: getLocalizedFields({
          fields: field.fields,
          type
        })
      }
    }
    if (field.type === 'blocks') {
      return {
        ...field,
        blocks: 
          field.blocks.map((block: Block) => {
            return {
              fields: getLocalizedFields({
                fields: block.fields,
                type
              })
            }
          })
      }
    }
    return field
  })
  .filter(field => field.type !== 'collapsible'),
  // recursion for collapsible field - flatten results into the returned array
  ...getCollapsibleLocalizedFields({ fields, type })
])

export const getCollapsibleLocalizedFields = ({
  fields,
  type,
}: {
  fields: Field[],
  type?: 'json' | 'html',
}): any[] => (
  fields
    .filter(field => field.type === 'collapsible')
    .flatMap(field => getLocalizedFields({
      fields: (field as CollapsibleField).fields,
      type
    }))
)

export const getLocalizedRequiredFields = (collection: CollectionConfig, type?: 'json' | 'html'): any[] => {
  const fields = getLocalizedFields({ fields: collection.fields, type })
  return fields.filter(field => field.required)
}

/**
 * Not yet compatible with nested fields - this means nested HTML
 * field translations cannot be synced from CrowdIn. 
 */
export const getFieldSlugs = (fields: FieldWithName[]): string[] => fields.filter((field: Field) => field.type === 'text' || field.type === 'richText').map((field: FieldWithName) => field.name)

export const isLocalizedField = (field: Field) => "localized" in field && field.localized && localizedFieldTypes.includes(field.type)

export const containsLocalizedFields = (fields: Field[]): boolean => typeof fields.find((field: Field) => {
  if (field.type === 'group' || field.type === 'array') {
    return containsLocalizedFields(field.fields)
  }
  if (field.type === 'blocks') {
    return typeof field.blocks.find((block: Block) => containsLocalizedFields(block.fields)) !== 'undefined'
  }
  return isLocalizedField(field)
}) === 'undefined' ? false : true

export const fieldChanged = (previousValue: string | object | undefined, value: string | object | undefined, type: string) => {
  if (type === 'richText') {
    return !deepEqual(previousValue || {}, value || {})
  }
  return previousValue !== value
}

export const removeLineBreaks = (string: string) => string.replace(/(\r\n|\n|\r)/gm, "")

export const fieldCrowdinFileType = (field: FieldWithName): 'json' | 'html' => field.type === 'richText' ? 'html' : 'json'

export const buildCrowdinJsonObject = (doc: { [key: string]: any }, localizedFields: FieldWithName[]): object => {
  let response: { [key: string]: any } = {}
  getLocalizedFields({ fields: localizedFields, type: 'json'})
    .forEach(field => {
    if (!doc[field.name]) {
      return
    }
    if (field.type === 'group') {
      response[field.name] = buildCrowdinJsonObject(doc[field.name], field.fields)
    } else if (field.type === 'array') {
      response[field.name] = doc[field.name].map((item: any) => buildCrowdinJsonObject(item, field.fields))
    } else {
      /**
       * Kept the following comments from when the plugin
       * used to manually check for doc.meta[key].en to
       * support @payloadcms/plugin-seo. Is the `en` key
       * check a thing? This wouldn't be appropriate for
       * other installations without an `en` default locale.
       * Maybe this was in response to a behaviour that does
       * not exist now?
       * 
       * --
       * 
       * prevDocument in afterChange hook returns
       * localization keys in meta fields only.
       * Normalize.
       * 
       * should be stronger
       * 
       * * what if the default locale key is different?
       * * what happens if there's a field called 'en' (
       * not likely because there are defined fields
       * on the seo plugin)
       *  */ 
      if (doc[field.name]?.en) {
        response[field.name] = doc[field.name].en
      } else {
        response[field.name] = doc[field.name]
      }
    }
  })
  return response
}

export const convertSlateToHtml = (slate: Descendant[]): string => {
  return slateToHtml(slate, {
    ...payloadSlateToDomConfig,
    encodeEntities: false,
    alwaysEncodeBreakingEntities: true,
  })
}
