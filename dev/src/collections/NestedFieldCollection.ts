import { Block, CollectionConfig } from "payload/types";
import { basicLocalizedFields } from "./fields/basicLocalizedFields";

const BasicBlockTextFields: Block = {
  slug: "basicBlock", // required
  fields: basicLocalizedFields,
};

const BasicBlockRichTextField: Block = {
  slug: "basicBlockRichText", // required
  fields: [
    {
      name: "richTextField",
      type: "richText",
      localized: true,
    }
  ],
};

const BasicBlockMixedFields: Block = {
  slug: "basicBlockMixed", // required
  fields: [
    ...basicLocalizedFields,
    {
      name: "richTextField",
      type: "richText",
      localized: true,
    }
  ],
};

const TestBlockArrayOfRichText: Block = {
  slug: "testBlockArrayOfRichText",
  fields: [
    {
      name: "title",
      type: "text",
      localized: true,
    },
    {
      name: "messages",
      type: "array",
      localized: true,
      maxRows: 3,
      fields: [
        {
          name: "title",
          type: "text",
          localized: true,
        },
        {
          name: "message",
          type: "richText",
        },
      ],
    },
  ],
};

const NestedFieldCollection: CollectionConfig = {
  slug: "nested-field-collection",
  access: {
    read: () => true,
  },
  fields: [
    ...basicLocalizedFields,
    // array
    {
      name: "arrayField",
      type: "array",
      fields: [...basicLocalizedFields],
    },
    // blocks
    {
      name: "layout", // required
      type: "blocks", // required
      blocks: [
        BasicBlockTextFields,
        BasicBlockRichTextField,
        BasicBlockMixedFields,
        TestBlockArrayOfRichText
      ],
    },
    // collapsible
    /*{
      label: 'Collapsible',
      type: 'collapsible',
      fields: basicLocalizedFields,
    },*/
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
              name: "tabOneTitle",
              type: "text",
              localized: true,
            },
            {
              name: "tabOneContent",
              type: "richText",
              localized: true,
            },
          ],
        },
        {
          name: "tabTwo",
          label: "Tab Two Label",
          fields: [
            {
              name: "tabTwoTitle",
              type: "text",
              localized: true,
            },
            {
              name: "tabTwoContent",
              type: "richText",
              localized: true,
            },
          ],
        },
      ],
    },
  ],
};

export default NestedFieldCollection;
