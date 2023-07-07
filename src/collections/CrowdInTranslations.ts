import { CollectionConfig } from 'payload/types'

const CrowdInGlobalTranslations: CollectionConfig = {
  slug: 'crowdin-translations',
  admin: {
    defaultColumns: ['slug', 'updatedAt'],
    useAsTitle: 'slug',
    group: "CrowdIn Admin",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
    },
  ],
}

export default CrowdInGlobalTranslations
