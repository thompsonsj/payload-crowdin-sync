import { slateEditor } from "@payloadcms/richtext-slate";
import { CollectionConfig, Field, GlobalConfig } from "payload/types";
import { buildCrowdinHtmlObject, getLocalizedFields } from "../..";

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
      title: {
        value: [
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
        field: {
          name: "title",
          type: "richText",
          localized: true,
        },
      }
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
      title: {
        value: [
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
        field: {
          name: "title",
          type: "richText",
          localized: true,
        },
      },
      content: {
        value: [
          {
            type: "p",
            children: [
              {
                text: "A simple paragraph.",
              },
            ],
          },
        ],
        field: {
          name: "content",
          type: "richText",
          localized: true,
        }
      }
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
      ["groupField.title"]: {
        value: [
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
        field: {
          editor: slateEditor({
            admin: {
              elements: ["link"],
              leaves: ["bold", "italic", "underline"],
            },
          }),
          name: "title",
          type: "richText",
          localized: true,
        }
      },
      ["groupField.content"]: {
        value: [
          {
            type: "p",
            children: [
              {
                text: "A simple paragraph.",
              },
            ],
          },
        ],
        field: {
          name: "content",
          type: "richText",
          localized: true,
        },
      },
    };
    expect(JSON.stringify(buildCrowdinHtmlObject({ doc, fields }))).toEqual(JSON.stringify(expected));
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
      ["groupField.title"]: {
        value: [
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
        field: {
          editor: slateEditor({
            admin: {
              elements: ["link"],
              leaves: ["bold", "italic", "underline"],
            },
          }),
          name: "title",
          type: "richText",
        }
      },
      ["groupField.content"]: {
        value: [
          {
            type: "p",
            children: [
              {
                text: "A simple paragraph.",
              },
            ],
          },
        ],
        field: {
          name: "content",
          type: "richText",
        },
      },
    };
    expect(JSON.stringify(buildCrowdinHtmlObject({ doc, fields }))).toEqual(JSON.stringify(expected));
  });
});
