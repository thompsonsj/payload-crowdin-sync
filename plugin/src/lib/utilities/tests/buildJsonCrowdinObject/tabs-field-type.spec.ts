import type { Field } from "payload";
import { buildCrowdinJsonObject, getLocalizedFields } from "../..";
import {
  emptyFieldDocValue,
} from "../fixtures/basic-localized-fields.fixture";

describe("fn: buildCrowdinJsonObject: group field type", () => {
  it("creates an empty JSON object if fields are empty", () => {
    const doc = {
      id: "638641358b1a140462752076",
      title: "",
      groupField: emptyFieldDocValue,
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
    };
    const fields: Field[] = [
      {
        type: "tabs",
        tabs: [
          {
            label: "Tab 1",
            fields: [
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
            ],
          },
          {
            label: "Tab 2",
            fields: [
              {
                name: "groupField",
                type: "group",
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
                    name: "description",
                    type: "textarea",
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
            ],
          },
        ],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {};
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });
});
