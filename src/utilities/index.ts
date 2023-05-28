import { CollectionConfig, Field, GlobalConfig } from 'payload/types'
import deepEqual from 'deep-equal'
import { FieldWithName } from '../types'
import { slateToHtml, payloadSlateToDomConfig } from 'slate-serializers'
import type { Descendant } from 'slate'

const localizedFieldTypes = [
  'richText',
  'text'
]

export const getLocalizedFields = (fields: Field[], type?: 'json' | 'html'): any[] => ( fields
  // localized or group fields only.
  .filter(field => isLocalizedField(field) || field.type === 'group')
  // further filter on CrowdIn field type
  .filter (field => type ? fieldCrowdinFileType(field as FieldWithName) === type : true  || field.type === 'group')
  // recursion for group field
  .map(field => {
    if (field.type === 'group') {
      return {
        ...field,
        fields: getLocalizedFields(field.fields, type)
      }
    }
    return field
  })
)

export const getLocalizedRequiredFields = (collection: CollectionConfig, type?: 'json' | 'html'): any[] => {
  const fields = getLocalizedFields(collection.fields, type)
  return fields.filter(field => field.required)
}

export const getFieldSlugs = (fields: FieldWithName[]): string[] => fields.map((field: any) => field.name)

export const isLocalizedField = (field: Field) => "localized" in field && field.localized && localizedFieldTypes.includes(field.type)

export const containsLocalizedFields = (fields: Field[]) => typeof fields.find(field => isLocalizedField(field)) === 'undefined' ? false : true

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
  getLocalizedFields(localizedFields, 'json')
    .forEach(field => {
    if (field.type === 'group') {
      response[field.name] = buildCrowdinJsonObject(doc[field.name], field.fields)
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
