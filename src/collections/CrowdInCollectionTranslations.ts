import { CollectionConfig } from 'payload/types'

const CrowdInCollectionTranslations: CollectionConfig = {
  slug: 'crowdin-collection-translations',
  admin: {
    defaultColumns: ['id', 'collection', 'updatedAt'],
    useAsTitle: 'slug',
    group: "CrowdIn Admin",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'documentId',
      type: 'text',
    },
    {
      name: 'collectionSlug',
      type: 'text',
    },
  ],
}

export default CrowdInCollectionTranslations
