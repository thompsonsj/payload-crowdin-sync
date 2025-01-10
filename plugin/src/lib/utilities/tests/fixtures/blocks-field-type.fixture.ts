import type { Block, Field } from "payload";
import { basicLocalizedFields } from "./basic-localized-fields.fixture";
import dot from "dot-object";

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
    },
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
    },
  ],
};

export const field: Field = {
  name: "blocksField",
  type: "blocks",
  blocks: [
    BasicBlockTextFields,
    BasicBlockRichTextField,
    BasicBlockMixedFields,
  ],
};

export const fieldDocValue = [
  {
    textField: "Text field content in basicBlock at layout index 0",
    textareaField: "Textarea field content in basicBlock at layout index 0",
    id: "63ea42b06ff825cddad3c133",
    blockType: "basicBlock",
  },
  {
    richTextField: [
      {
        type: "h1",
        children: [
          {
            text: "Rich text content in ",
          },
          {
            text: "basicBlockRichText",
            bold: true,
          },
          {
            text: " layout at index 1.",
          },
        ],
      },
      {
        children: [
          {
            text: "An extra paragraph for good measure.",
          },
        ],
      },
    ],
    id: "63d169d3d9dfd46d37c649e4",
    blockType: "basicBlockRichText",
  },
  {
    textField: "Text field content in basicBlock at layout index 2",
    textareaField: "Textarea field content in basicBlock at layout index 2",
    id: "63ea373fb725d8a50646952e",
    blockType: "basicBlock",
  },
  {
    richTextField: [
      {
        children: [
          {
            text: "Rich text content in basicBlockRichText layout at index 3.",
          },
        ],
      },
    ],
    id: "63ea3e7fb725d8a50646956a",
    blockType: "basicBlockRichText",
  },
  {
    textField: "Text field content in basicBlockMixed at layout index 4",
    textareaField:
      "Textarea field content in basicBlockMixed at layout index 4",
    richTextField: [
      {
        children: [
          {
            text: "Rich text content in basicBlockMixed layout at index 4.",
          },
        ],
      },
    ],
    id: "63ea40106ff825cddad3c10b",
    blockType: "basicBlockMixed",
  },
];

export const fieldJsonCrowdinObject = (prefix?: string) => {
  const value = {
    blocksField: {
      "63ea42b06ff825cddad3c133": {
        basicBlock: {
          textField: "Text field content in basicBlock at layout index 0",
          textareaField:
            "Textarea field content in basicBlock at layout index 0",
        },
      },
      "63ea373fb725d8a50646952e": {
        basicBlock: {
          textField: "Text field content in basicBlock at layout index 2",
          textareaField:
            "Textarea field content in basicBlock at layout index 2",
        },
      },

      "63ea40106ff825cddad3c10b": {
        basicBlockMixed: {
          textField: "Text field content in basicBlockMixed at layout index 4",
          textareaField:
            "Textarea field content in basicBlockMixed at layout index 4",
        },
      },
    },
  };
  if (prefix) {
    var tgt = {};
    dot.str(prefix, value, tgt);
    return tgt;
  }
  return value;
};

export const fieldHtmlCrowdinObject = (prefix?: string) => ({
  [`${
    prefix || ""
  }blocksField.63d169d3d9dfd46d37c649e4.basicBlockRichText.richTextField`]: [
    {
      type: "h1",
      children: [
        {
          text: "Rich text content in ",
        },
        {
          text: "basicBlockRichText",
          bold: true,
        },
        {
          text: " layout at index 1.",
        },
      ],
    },
    {
      children: [
        {
          text: "An extra paragraph for good measure.",
        },
      ],
    },
  ],
  [`${
    prefix || ""
  }blocksField.63ea3e7fb725d8a50646956a.basicBlockRichText.richTextField`]: [
    {
      children: [
        {
          text: "Rich text content in basicBlockRichText layout at index 3.",
        },
      ],
    },
  ],
  [`${
    prefix || ""
  }blocksField.63ea40106ff825cddad3c10b.basicBlockMixed.richTextField`]: [
    {
      children: [
        {
          text: "Rich text content in basicBlockMixed layout at index 4.",
        },
      ],
    },
  ],
});
