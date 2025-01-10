import type { Field } from "payload";
import { buildCrowdinJsonObject, getLocalizedFields } from "../..";
import { FieldWithName } from "../../../types";

describe("fn: buildCrowdinJsonObject", () => {
  it("creates an empty object if no content exists", () => {
    const doc = {
      id: "638641358b1a140462752076",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const localizedFields: FieldWithName[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      {
        name: "anotherString",
        type: "text",
        localized: true,
      },
    ];
    const expected = {};
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("does not include undefined localized fields", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const localizedFields: FieldWithName[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      {
        name: "anotherString",
        type: "text",
        localized: true,
      },
    ];
    const expected = {
      title: "Test Policy created with title",
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("includes localized fields", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Text value",
      anotherString: "Another text value",
      description: "A textarea value.\nWith a new line.",
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const localizedFields: FieldWithName[] = [
      {
        name: "title",
        type: "text",
        localized: true,
      },
      {
        name: "anotherString",
        type: "text",
        localized: true,
      },
      {
        name: "description",
        type: "textarea",
        localized: true,
      },
    ];
    const expected = {
      title: "Text value",
      anotherString: "Another text value",
      description: "A textarea value.\nWith a new line.",
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("includes localized fields within a collapsible field", () => {
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
        fields: [
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
});
