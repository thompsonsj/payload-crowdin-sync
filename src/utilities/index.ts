import { Block, CollapsibleField, CollectionConfig, Field, GlobalConfig } from 'payload/types'
import deepEqual from 'deep-equal'
import { FieldWithName } from '../types'
import { slateToHtml, payloadSlateToDomConfig } from 'slate-serializers'
import type { Descendant } from 'slate'
import { get, isEmpty, merge, omitBy } from "lodash"

const localizedFieldTypes = [
  'richText',
  'text',
  'textarea',
]

const nestedFieldTypes = [
  'array',
  'group',
  'blocks',
  'tabs',
]

export const containsNestedFields = (field: Field) => nestedFieldTypes.includes(field.type)

export const getLocalizedFields = ({
  fields,
  type,
  localizedParent = false,
}: {
  fields: Field[],
  type?: 'json' | 'html',
  localizedParent?: boolean
}): any[] => {
  // flatten the presetational only tabs field
  // TODO: check this is correct. Docs at https://payloadcms.com/docs/fields/tabs suggest that subsequent tabs can be accessed using a prefix, but documents saved with tabs seem to retain their structure as if they didn't have tabs.
  let flattenedFields = fields
  if (fields.length === 1 && fields[0].type === 'tabs') {
    flattenedFields = fields[0].tabs.map(tab => tab.fields).flat()
  }
  const localizedFields = getLocalizedFieldsRecursive({
    fields: flattenedFields,
    type,
    localizedParent,
  })
  if (localizedFields.length === 1 && get(localizedFields[0], 'name') === 'meta') {
    return []
  }
  return localizedFields
}

export const getLocalizedFieldsRecursive = ({
  fields,
  type,
  localizedParent = false,
}: {
  fields: Field[],
  type?: 'json' | 'html',
  localizedParent?: boolean
}): any[] => ([
  ...fields
  // localized or group fields only.
  .filter(field => isLocalizedField(field, localizedParent) || containsNestedFields(field))
  // further filter on CrowdIn field type
  .filter (field => {
    if (containsNestedFields(field)) {
      return true
    }
    return type ? fieldCrowdinFileType(field as FieldWithName) === type : true
  })
  // exclude group, array and block fields with no localized fields
  // TODO: find a better way to do this - block, array and group logic is duplicated, and this filter needs to be compatible with field extraction logic later in this function
  .filter(field => {
    const localizedParent = hasLocalizedProp(field)
    if (field.type === 'group' || field.type === 'array') {
      return containsLocalizedFields({ fields: field.fields, type, localizedParent })
    }
    if (field.type === 'blocks') {
      return field.blocks.find(block => containsLocalizedFields({ fields: block.fields, type, localizedParent }))
    }
    return true
  })
  // recursion for group, array and blocks field
  .map(field => {
    const localizedParent = hasLocalizedProp(field)
    if (field.type === 'group' || field.type === 'array') {
      return {
        ...field,
        fields: getLocalizedFields({
          fields: field.fields,
          type,
          localizedParent,
        })
      }
    }
    if (field.type === 'blocks') {
      const blocks = field.blocks.map((block: Block) => {
        if (containsLocalizedFields({ fields: block.fields, type, localizedParent })) {
          return {
            slug: block.slug,
            fields: getLocalizedFields({
              fields: block.fields,
              type,
              localizedParent,
            })
          }
        }
      }).filter(block => block)
      return {
        ...field,
        blocks,  
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

const hasLocalizedProp = (field: Field) => "localized" in field && field.localized

/**
 * Is Localized Field
 * 
 * Note that `id` should be excluded - it is a `text` field that is added by Payload CMS.
 */
export const isLocalizedField = (field: Field, addLocalizedProp: boolean = false) => (hasLocalizedProp(field) || addLocalizedProp) && localizedFieldTypes.includes(field.type) && !excludeBasedOnDescription(field) && (field as any).name !== 'id'

const excludeBasedOnDescription = (field: Field) => {
  const description = get(field, 'admin.description', '')
  if (description.includes("Not sent to CrowdIn. Localize in the CMS.")) {
    return true
  }
  return false
}

export const containsLocalizedFields = ({
  fields,
  type,
  localizedParent,
}: {
  fields: Field[],
  type?: 'json' | 'html',
  localizedParent?: boolean,
}): boolean => {
  return !isEmpty(getLocalizedFields({ fields, type, localizedParent }))
}

export const fieldChanged = (previousValue: string | object | undefined, value: string | object | undefined, type: string) => {
  if (type === 'richText') {
    return !deepEqual(previousValue || {}, value || {})
  }
  return previousValue !== value
}

export const removeLineBreaks = (string: string) => string.replace(/(\r\n|\n|\r)/gm, "")

export const fieldCrowdinFileType = (field: FieldWithName): 'json' | 'html' => field.type === 'richText' ? 'html' : 'json'

export const buildCrowdinJsonObject = ({
  doc,
  fields,
  topLevel = true,
}: {
  doc: { [key: string]: any },
  /** Use getLocalizedFields to pass localized fields only */
  fields: Field[],
  /** Flag used internally to filter json fields before recursion. */
  topLevel?: boolean
}) => {
  let response: { [key: string]: any } = {}
  const filteredFields = topLevel ? getLocalizedFields({ fields, type: 'json'}) : fields
  filteredFields
    .forEach(field => {
    if (!doc[field.name]) {
      return
    }
    if (field.type === 'group') {
      response[field.name] = buildCrowdinJsonObject({
        doc: doc[field.name],
        fields: field.fields,
        topLevel: false,
      })
    } else if (field.type === 'array') {
      response[field.name] = doc[field.name].map((item: any) => buildCrowdinJsonObject({
        doc: item,
        fields: field.fields,
        topLevel: false,
      })).filter((item: any) => !isEmpty(item))
    } else if (field.type === 'blocks') {
      response[field.name] = doc[field.name].map((item: any) => buildCrowdinJsonObject({
        doc: item,
        fields: field.blocks.find((block: Block) => block.slug === item.blockType)?.fields || [],
        topLevel: false,
      })).filter((item: any) => !isEmpty(item))
    } else {
      response[field.name] = doc[field.name]
    }
  })
  return omitBy(response, isEmpty)
}

export const buildCrowdinHtmlObject = ({
  doc,
  fields,
  prefix = '',
  topLevel = true,
}: {
  doc: { [key: string]: any },
  /** Use getLocalizedFields to pass localized fields only */
  fields: Field[],
  /** Use to build dot notation field during recursion. */
  prefix?: string,
  /** Flag used internally to filter html fields before recursion. */
  topLevel?: boolean
}) => {
  let response: { [key: string]: any } = {}
  // it is convenient to be able to pass all fields - filter in this case
  const filteredFields = topLevel ? getLocalizedFields({ fields, type: 'html'}) : fields
  filteredFields.forEach(field => {
    const name = [prefix, (field as FieldWithName).name].filter(string => string).join('.')
    if (!doc[field.name]) {
      return
    }
    if (field.type === 'group') {
      const subPrefix = `${[prefix, field.name].filter(string => string).join('.')}`
      response = {
        ...response,
        ...buildCrowdinHtmlObject({
          doc: doc[field.name],
          fields: field.fields,
          prefix: subPrefix,
          topLevel: false,
        })
      }
    } else if (field.type === 'array') {
      const arrayValues = doc[field.name].map((item: any, index: number) => {
        const subPrefix = `${[prefix, `${field.name}[${index}]`].filter(string => string).join('.')}`  
        return buildCrowdinHtmlObject({
        doc: item,
        fields: field.fields,
        prefix: subPrefix,
        topLevel: false,
        })
      })
      response = {
        ...response,
        ...merge({}, ...arrayValues)
      }
    } else if (field.type === 'blocks') {
      const arrayValues = doc[field.name].map((item: any, index: number) => {
        const subPrefix = `${[prefix, `${field.name}[${index}]`].filter(string => string).join('.')}`  
        return buildCrowdinHtmlObject({
        doc: item,
        fields: field.blocks.find((block: Block) => block.slug === item.blockType)?.fields || [],
        prefix: subPrefix,
        topLevel: false,
        })
      })
      response = {
        ...response,
        ...merge({}, ...arrayValues)
      }
    } else {
      if (doc[field.name]?.en) {
        response[name] = doc[field.name].en
      } else {
        response[name] = doc[field.name]
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
