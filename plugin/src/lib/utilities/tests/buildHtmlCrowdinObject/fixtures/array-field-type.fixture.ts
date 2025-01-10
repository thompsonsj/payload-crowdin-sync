import type { Field } from "payload";

export const field: Field = {
  name: "arrayField",
  type: "array",
  fields: [
    {
      name: "title",
      type: "richText",
      localized: true,
    },
    {
      name: "content",
      type: "richText",
      localized: true,
    },
    {
      name: "select",
      type: "select",
      localized: true,
      options: ["one", "two"],
    },
  ],
};

export const fieldLocalizedTopLevel: Field = {
  name: "arrayField",
  type: "array",
  localized: true,
  fields: [
    {
      name: "title",
      type: "richText",
    },
    {
      name: "content",
      type: "richText",
    },
    {
      name: "select",
      type: "select",
      options: ["one", "two"],
    },
  ],
};

export const fieldDocValue = [
  {
    title: [
      {
        type: "h1",
        children: [
          {
            text: "A ",
          },
          {
            text: "test",
            bold: true,
          },
          {
            text: " rich text value",
          },
        ],
      },
    ],
    content: [
      {
        type: "p",
        children: [
          {
            text: "A simple paragraph in the first array item.",
          },
        ],
      },
    ],
    select: "two",
    id: "64735620230d57bce946d370",
  },
  {
    title: [
      {
        type: "h1",
        children: [
          {
            text: "A ",
          },
          {
            text: "test",
            bold: true,
          },
          {
            text: " rich text value",
          },
        ],
      },
    ],
    content: [
      {
        type: "p",
        children: [
          {
            text: "A simple paragraph in the second array item.",
          },
        ],
      },
    ],
    select: "two",
    id: "64735621230d57bce946d371",
  },
];

export const fieldCrowdinObject = {
  ["arrayField.64735620230d57bce946d370.title"]: [
    {
      type: "h1",
      children: [
        {
          text: "A ",
        },
        {
          text: "test",
          bold: true,
        },
        {
          text: " rich text value",
        },
      ],
    },
  ],
  ["arrayField.64735620230d57bce946d370.content"]: [
    {
      type: "p",
      children: [
        {
          text: "A simple paragraph in the first array item.",
        },
      ],
    },
  ],
  ["arrayField.64735621230d57bce946d371.title"]: [
    {
      type: "h1",
      children: [
        {
          text: "A ",
        },
        {
          text: "test",
          bold: true,
        },
        {
          text: " rich text value",
        },
      ],
    },
  ],
  ["arrayField.64735621230d57bce946d371.content"]: [
    {
      type: "p",
      children: [
        {
          text: "A simple paragraph in the second array item.",
        },
      ],
    },
  ],
};
