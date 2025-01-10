import { slateEditor } from "@payloadcms/richtext-slate";
import type { Field } from "payload";
import { buildCrowdinHtmlObject } from "../..";

describe("fn: buildCrowdinHtmlObject", () => {
  it("does not include undefined localized fields", () => {
    const doc = {
      id: "638641358b1a140462752076",
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
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
      {
        name: "title",
        type: "richText",
        localized: true,
      },
      {
        name: "anotherString",
        type: "text",
        localized: true,
      },
    ];
    const expected = {
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
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected);
  });

  it("includes localized fields", () => {
    const doc = {
      id: "638641358b1a140462752076",
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
              text: "A simple paragraph.",
            },
          ],
        },
      ],
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
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
    ];
    const expected = {
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
              text: "A simple paragraph.",
            },
          ],
        },
      ],
    };
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected);
  });

  it("includes localized fields nested in a group", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      groupField: {
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
                text: "A simple paragraph.",
              },
            ],
          },
        ],
        select: "one",
      },
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
        name: "groupField",
        type: "group",
        fields: [
          {
            editor: slateEditor({
              admin: {
                elements: ["link"],
                leaves: ["bold", "italic", "underline"],
              },
            }),
            name: "title",
            type: "richText",
            localized: true,
          },
          {
            name: "content",
            type: "richText",
            localized: true,
          },
          // select not supported yet
          {
            name: "select",
            type: "select",
            localized: true,
            options: ["one", "two"],
          },
        ],
      },
    ];
    const expected = {
      ["groupField.title"]: [
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
      ["groupField.content"]: [
        {
          type: "p",
          children: [
            {
              text: "A simple paragraph.",
            },
          ],
        },
      ],
    };
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected);
  });

  it("includes localized fields nested in a group with a localization setting on the group field", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      groupField: {
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
                text: "A simple paragraph.",
              },
            ],
          },
        ],
        select: "one",
      },
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
        name: "groupField",
        type: "group",
        localized: true,
        fields: [
          {
            editor: slateEditor({
              admin: {
                elements: ["link"],
                leaves: ["bold", "italic", "underline"],
              },
            }),
            name: "title",
            type: "richText",
          },
          {
            name: "content",
            type: "richText",
          },
          // select not supported yet
          {
            name: "select",
            type: "select",
            options: ["one", "two"],
          },
        ],
      },
    ];
    const expected = {
      ["groupField.title"]: [
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
      ["groupField.content"]: [
        {
          type: "p",
          children: [
            {
              text: "A simple paragraph.",
            },
          ],
        },
      ],
    };
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected);
  });
});
