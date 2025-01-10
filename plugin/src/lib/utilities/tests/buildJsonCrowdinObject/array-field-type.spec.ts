import { buildCrowdinJsonObject, getLocalizedFields } from "../..";
import { FieldWithName } from "../../../types";

describe("fn: buildCrowdinJsonObject: array field type", () => {
  it("do not include non-localized fields nested in an array", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      arrayField: [
        {
          title: "Array field title content one",
          text: "Array field text content one",
          select: "two",
          id: "64735620230d57bce946d370",
        },
        {
          title: "Array field title content two",
          text: "Array field text content two",
          select: "two",
          id: "64735621230d57bce946d371",
        },
      ],
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: FieldWithName[] = [
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
        name: "arrayField",
        type: "array",
        fields: [
          {
            name: "title",
            type: "text",
          },
          {
            name: "text",
            type: "text",
          },
          {
            name: "select",
            type: "select",
            localized: true,
            options: ["one", "two"],
          },
        ],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("includes localized fields nested in an array", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      arrayField: [
        {
          title: "Array field title content one",
          text: "Array field text content one",
          select: "two",
          id: "64735620230d57bce946d370",
        },
        {
          title: "Array field title content two",
          text: "Array field text content two",
          select: "two",
          id: "64735621230d57bce946d371",
        },
      ],
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: FieldWithName[] = [
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
        name: "arrayField",
        type: "array",
        fields: [
          {
            name: "title",
            type: "text",
            localized: true,
          },
          {
            name: "text",
            type: "text",
            localized: true,
          },
          {
            name: "select",
            type: "select",
            localized: true,
            options: ["one", "two"],
          },
        ],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
      arrayField: {
        "64735620230d57bce946d370": {
          title: "Array field title content one",
          text: "Array field text content one",
        },
        "64735621230d57bce946d371": {
          title: "Array field title content two",
          text: "Array field text content two",
        },
      },
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("includes localized fields nested in an array with a localization setting on the array field", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      arrayField: [
        {
          title: "Array field title content one",
          text: "Array field text content one",
          select: "two",
          id: "64735620230d57bce946d370",
        },
        {
          title: "Array field title content two",
          text: "Array field text content two",
          select: "two",
          id: "64735621230d57bce946d371",
        },
      ],
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: FieldWithName[] = [
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
        name: "arrayField",
        type: "array",
        localized: true,
        fields: [
          {
            name: "title",
            type: "text",
          },
          {
            name: "text",
            type: "text",
          },
          {
            name: "select",
            type: "select",
            options: ["one", "two"],
          },
        ],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
      arrayField: {
        "64735620230d57bce946d370": {
          title: "Array field title content one",
          text: "Array field text content one",
        },
        "64735621230d57bce946d371": {
          title: "Array field title content two",
          text: "Array field text content two",
        },
      },
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("does not include localized fields richText fields nested in an array field in the `fields.json` file", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      arrayField: [
        {
          content: [
            {
              children: [
                {
                  text: "Test content 1",
                },
              ],
            },
          ],
          id: "64735620230d57bce946d370",
        },
        {
          content: [
            {
              children: [
                {
                  text: "Test content 1",
                },
              ],
            },
          ],
          id: "64735621230d57bce946d371",
        },
      ],
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: FieldWithName[] = [
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
        name: "arrayField",
        type: "array",
        localized: true,
        fields: [
          {
            name: "content",
            type: "richText",
          },
        ],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });
});
