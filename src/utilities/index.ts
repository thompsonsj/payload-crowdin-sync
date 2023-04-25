import { CollectionConfig, Field } from 'payload/types'
import deepEqual from 'deep-equal'
import { FieldWithName } from '../types'
import { slateToHtml, payloadSlateToDomConfig } from 'slate-serializers'
import type { Descendant } from 'slate'

const localizedFieldTypes = [
  'richText',
  'text'
]

export const getLocalizedFields = (collection: CollectionConfig, type?: 'json' | 'html'): any[] => {
  const fields = [...collection.fields].filter(field => isLocalizedField(field))
  if (type) {
    return fields.filter(field => fieldCrowdinFileType(field as FieldWithName) === type)
  }
  return fields
}

export const getLocalizedRequiredFields = (collection: CollectionConfig, type?: 'json' | 'html'): any[] => {
  const fields = getLocalizedFields(collection, type)
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
  localizedFields
    .filter(field => fieldCrowdinFileType(field) === 'json')
    .forEach(field => {
    if (field.name in doc) {
      response[field.name] = doc[field.name]
    }
  })
  // support @payloadcms/plugin-seo
  if ('meta' in doc) {
    response.meta = {}
    Object.keys(doc.meta).forEach(key => {
      /**
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
      if (doc.meta[key].en) {
        response.meta[key] = doc.meta[key].en
      } else {
        response.meta[key] = doc.meta[key]
      }
    })
  }
  return response
}

export const convertSlateToHtml = (slate: Descendant[]): string => {
  return slateToHtml(slate, {
    ...payloadSlateToDomConfig,
    encodeEntities: false,
    alwaysEncodeBreakingEntities: true,
  })
}
