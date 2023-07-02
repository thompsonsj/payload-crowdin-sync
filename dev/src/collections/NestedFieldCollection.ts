import { Block, CollectionConfig } from 'payload/types';
import { basicLocalizedFields } from './fields/basicLocalizedFields';

const LocalizedBlock: Block = {
  slug: 'Block', // required
  fields: basicLocalizedFields,
};

const NestedFieldCollection: CollectionConfig = {
  slug: 'nested-field-collection',
  access: {
    read: () => true,
  },
  fields: [
    ...basicLocalizedFields,
    // array
    {
      name: 'arrayField',
      type: 'array',
      fields: [
        ...basicLocalizedFields,
      ],
    },
    // blocks
    {
      name: 'layout', // required
      type: 'blocks', // required
      blocks: [
        LocalizedBlock,
      ],
    },
    // collapsible
    {
      label: 'Collapsible',
      type: 'collapsible',
      fields: basicLocalizedFields,
    },
    // group
    {
      name: "group", // required
      type: "group", // required
      fields: basicLocalizedFields,
    },
    // tabs
    {
      type: "tabs", // required
      tabs: [
        {
          label: "Tab One Label", // required
          fields: [
            {
              name: 'tabOneTitle',
              type: 'text',
              localized: true,
            },
            {
              name: 'tabOneContent',
              type: 'richText',
              localized: true,
            },
          ],
        },
        {
          name: "tabTwo",
          label: "Tab Two Label",
          fields: basicLocalizedFields,
        },
      ],
    },
  ],
}

export default NestedFieldCollection;
