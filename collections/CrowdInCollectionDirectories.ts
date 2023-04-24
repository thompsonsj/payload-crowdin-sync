import { CollectionConfig } from 'payload/types'

const CrowdInCollectionDirectories: CollectionConfig = {
  slug: 'crowdin-collection-directories',
  admin: {
    defaultColumns: ['name', 'title', 'collectionSlug', 'updatedAt'],
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
    {
      name: 'title',
      type: 'text'
    },
    /* Internal fields  */
    {
      name: 'collectionSlug',
      type: 'text',
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

export default CrowdInCollectionDirectories
