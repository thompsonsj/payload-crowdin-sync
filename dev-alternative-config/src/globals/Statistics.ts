import type { GlobalConfig } from 'payload';

const Statistics: GlobalConfig = {
  slug: 'statistics',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Shared',
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'users',
      type: 'group',
      fields: [
        {
          name: 'text',
          type: 'text',
          localized: true,
        },
        {
          name: 'number',
          type: 'number',
          min: 0,
          admin: {
            step: 100,
            description:
              'Restricted to multiples of 100 in order to simplify localization.',
          },
        },
      ],
    },
    {
      name: 'countries',
      type: 'group',
      fields: [
        {
          name: 'text',
          type: 'text',
          localized: true,
        },
        {
          name: 'number',
          type: 'number',
          min: 0,
          admin: {
            step: 1,
          },
        },
      ],
    },
  ],
};

export default Statistics;
