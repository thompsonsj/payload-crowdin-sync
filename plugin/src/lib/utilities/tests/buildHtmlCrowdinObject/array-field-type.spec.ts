import type { CollectionConfig, Field } from "payload";
import { buildCrowdinHtmlObject } from "../..";
import {
  field,
  fieldCrowdinObject,
  fieldDocValue,
  fieldLocalizedTopLevel,
} from "./fixtures/array-field-type.fixture";

describe("fn: buildCrowdinHtmlObject: array field type", () => {
  it("includes localized fields", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      arrayField: fieldDocValue,
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      // select not supported yet
      {
        name: "select",
        type: "select",
        localized: true,
        options: ["one", "two"],
      },
      field,
    ];
    const expected = fieldCrowdinObject;
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected);
  });

  it("includes localized fields with a top-level localization setting", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      arrayField: fieldDocValue,
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      // select not supported yet
      {
        name: "select",
        type: "select",
        localized: true,
        options: ["one", "two"],
      },
      fieldLocalizedTopLevel,
    ];
    const expected = fieldCrowdinObject;
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected);
  });

  it("includes localized fields within a collapsible field", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      arrayField: fieldDocValue,
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      // select not supported yet
      {
        name: "select",
        type: "select",
        localized: true,
        options: ["one", "two"],
      },
      {
        label: "Array fields",
        type: "collapsible",
        fields: [field],
      },
    ];
    const expected = fieldCrowdinObject;
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected);
  });

  it("includes localized fields with a top-level localization setting within a collapsible field", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      arrayField: fieldDocValue,
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      // select not supported yet
      {
        name: "select",
        type: "select",
        localized: true,
        options: ["one", "two"],
      },
      {
        label: "Array fields",
        type: "collapsible",
        fields: [fieldLocalizedTopLevel],
      },
    ];
    const expected = fieldCrowdinObject;
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected);
  });
});

describe("fn: buildCrowdinHtmlObject - group nested in array", () => {
  const doc = {
    id: "6474a81bef389b66642035ff",
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
    ctas: [
      {
        link: {
          text: [
            {
              type: "p",
              children: [
                {
                  text: "Link rich text.",
                },
              ],
            },
          ],
          href: "#",
          type: "ctaPrimary",
        },
        id: "6474a80221baea4f5f169757",
      },
      {
        link: {
          text: [
            {
              type: "p",
              children: [
                {
                  text: "Second link rich text.",
                },
              ],
            },
          ],
          href: "#",
          type: "ctaSecondary",
        },
        id: "6474a81021baea4f5f169758",
      },
    ],
    createdAt: "2023-05-29T13:26:51.734Z",
    updatedAt: "2023-05-29T14:47:45.957Z",
    crowdinArticleDirectory: {
      id: "6474baaf73b854f4d464e38f",
      updatedAt: "2023-05-29T14:46:07.000Z",
      createdAt: "2023-05-29T14:46:07.000Z",
      name: "6474a81bef389b66642035ff",
      crowdinCollectionDirectory: {
        id: "6474baaf73b854f4d464e38d",
        updatedAt: "2023-05-29T14:46:07.000Z",
        createdAt: "2023-05-29T14:46:07.000Z",
        name: "promos",
        title: "Promos",
        collectionSlug: "promos",
        originalId: 1633,
        projectId: 323731,
        directoryId: 1169,
      },
      originalId: 1635,
      projectId: 323731,
      directoryId: 1633,
    },
  };
  const linkField: Field = {
    name: "link",
    type: "group",
    fields: [
      {
        name: "text",
        type: "richText",
        localized: true,
      },
      {
        name: "href",
        type: "text",
      },
      {
        name: "type",
        type: "select",
        options: ["ctaPrimary", "ctaSecondary"],
      },
    ],
  };
  const Promos: CollectionConfig = {
    slug: "promos",
    admin: {
      defaultColumns: ["title", "updatedAt"],
      useAsTitle: "title",
      group: "Shared",
    },
    access: {
      read: () => true,
    },
    fields: [
      {
        name: "title",
        type: "richText",
        localized: true,
      },
      {
        name: "text",
        type: "text",
        localized: true,
      },
      {
        name: "ctas",
        type: "array",
        minRows: 1,
        maxRows: 2,
        fields: [linkField],
      },
    ],
  };

  const expected: any = {
    ["ctas.6474a80221baea4f5f169757.link.text"]: [
      {
        type: "p",
        children: [
          {
            text: "Link rich text.",
          },
        ],
      },
    ],
    ["ctas.6474a81021baea4f5f169758.link.text"]: [
      {
        type: "p",
        children: [
          {
            text: "Second link rich text.",
          },
        ],
      },
    ],
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
  };

  it("includes group json fields nested inside of array field items", () => {
    expect(buildCrowdinHtmlObject({ doc, fields: Promos.fields })).toEqual(
      expected
    );
  });

  it("can work with an empty group field in an array", () => {
    expect(
      buildCrowdinHtmlObject({
        doc: {
          ...doc,
          ctas: [{}, {}],
        },
        fields: Promos.fields,
      })
    ).toEqual({
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
    });
  });
});
