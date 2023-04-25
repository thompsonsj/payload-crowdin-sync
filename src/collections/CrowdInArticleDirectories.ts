import { CollectionConfig } from 'payload/types'

const CrowdInArticleDirectories: CollectionConfig = {
  slug: 'crowdin-article-directories',
  admin: {
    defaultColumns: ['name', 'title', 'crowdinCollectionDirectory', 'createdAt'],
    useAsTitle: 'name',
    group: "CrowdIn Admin",
  },
  access: {
    read: () => true,
  },
  fields: [
    /* CrowdIn field */
    {
      name: 'name',
      type: 'text'
    },
    /* Internal fields  */
    {
      name: 'crowdinCollectionDirectory',
      type: 'relationship',
      relationTo: 'crowdin-collection-directories',
      hasMany: false,
    },
    {
      name: 'crowdInFiles',
      type: 'relationship',
      relationTo: 'crowdin-files',
      hasMany: true,
    },
    /* CrowdIn fields */
    {
      name: 'createdAt',
      type: 'date',
    },
    {
      name: 'updatedAt',
      type: 'date',
    },
    {
      name: 'originalId',
      type: 'number'
    },
    {
      name: 'projectId',
      type: 'number'
    },
    {
      name: 'directoryId',
      type: 'number'
    },
  ],
}

export default CrowdInArticleDirectories
