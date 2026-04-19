import type { GlobalConfig } from 'payload'

export const LocalizedNav: GlobalConfig = {
  slug: 'localized-nav',
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      maxRows: 8,
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
        },
      ],
    },
  ],
}
