import type { Block, CollectionConfig } from "payload";
import { basicLocalizedFields } from "./fields/basicLocalizedFields";
import { delocalizeFields } from "../utils";
import { lexicalEditorWithBlocks } from "./fields/lexicalEditorWithBlocks";

const BasicBlockTextFields: Block = {
  slug: "basicBlock", // required
  fields: basicLocalizedFields,
};

const BasicBlockTextFieldsNonLocalized: Block = {
  slug: "basicBlockNonLocalized", // required
  fields: delocalizeFields(basicLocalizedFields),
};

const BasicBlockRichTextField: Block = {
  slug: "basicBlockRichText", // required
  fields: [
    {
      name: "richTextField",
      type: "richText",
      localized: true,
    },
  ],
};

const BasicBlockMixedFields: Block = {
  slug: "basicBlockMixed", // required
  fields: [
    ...basicLocalizedFields,
  ],
};

const BasicBlockLexical: Block = {
  slug: "basicBlockLexical",
  fields: [
    lexicalEditorWithBlocks,
  ]
}

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
    {
      name: "title",
      type: "text",
    },
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
        BasicBlockTextFieldsNonLocalized,
        BasicBlockRichTextField,
        BasicBlockMixedFields,
        TestBlockArrayOfRichText,
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
          label: "Block Layout Tab",
          fields: [
            {
              name: 'items',
              type: 'array',
              minRows: 1,
              maxRows: 20,
              fields: [
                {
                  name: "heading",
                  type: "text",
                  localized: true,
                },
                {
                  name: 'block',
                  type: 'blocks',
                  minRows: 1,
                  maxRows: 1,
                  blocks: [
                    BasicBlockLexical,
                  ]
                },
              ],
            },
          ]
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
