import type { Field } from "payload";
import {
  buildPayloadUpdateObject,
} from "../..";
import {
  field,
  fieldHtmlCrowdinObject,
  fieldJsonCrowdinObject,
  fieldDocValue,
} from "../fixtures/blocks-field-type.fixture";

describe("fn: buildPayloadUpdateObject: blocks field type", () => {
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
    const crowdinJsonObject = {
      title: "Test Policy created with title",
      ...fieldJsonCrowdinObject(),
    };
    const crowdinHtmlObject = fieldHtmlCrowdinObject();
    const expected = {
      title: "Test Policy created with title",
      blocksField: fieldDocValue,
    };

    expect(
      buildPayloadUpdateObject({
        crowdinJsonObject,
        crowdinHtmlObject,
        fields,
        document: doc,
      })
    ).toEqual(expected);
  });
});
