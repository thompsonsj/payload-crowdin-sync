import type { FieldHook } from 'payload/dist/fields/config/types'
import type { CollectionConfig, Field} from 'payload/types'
import { containsLocalizedFields, isLocalizedField } from '../utilities'

interface Args {
  collection: CollectionConfig
}

export const getFields = ({
  collection,
}: Args): Field[] => {
  const fields = [...collection.fields]
  
  const crowdInArticleDirectoryField: Field = {
    name: 'crowdinArticleDirectory',
    type: 'relationship',
    relationTo: 'crowdin-article-directories',
    hasMany: false
    /*admin: {
      readOnly: true,
      disabled: true,
    },*/
  }

  fields.push(crowdInArticleDirectoryField)

  return fields
}
