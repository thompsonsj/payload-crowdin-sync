import type { Field } from "payload";
import { buildCrowdinHtmlObject } from "../..";
import {
  field,
  fieldHtmlCrowdinObject,
  fieldDocValue,
} from "../fixtures/blocks-field-type.fixture";

describe("fn: buildCrowdinHtmlObject: blocks field type", () => {
  it("includes localized fields", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      blocksField: fieldDocValue,
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
    const expected = fieldHtmlCrowdinObject();
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected);
  });

  it("includes localized fields within a collapsible field", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      blocksField: fieldDocValue,
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
    const expected = fieldHtmlCrowdinObject();
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected);
  });

  it("includes localized fields within an array field", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      arrayField: [
        {
          blocksField: fieldDocValue,
          id: "63ea4adb6ff825cddad3c1f2",
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
        name: "arrayField",
        type: "array",
        fields: [field],
      },
    ];
    const expected = fieldHtmlCrowdinObject(
      "arrayField.63ea4adb6ff825cddad3c1f2."
    );
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected);
  });
});
