import type { CollectionConfig, Field, GlobalConfig} from 'payload/types'

interface Args {
  collection: CollectionConfig | GlobalConfig
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
