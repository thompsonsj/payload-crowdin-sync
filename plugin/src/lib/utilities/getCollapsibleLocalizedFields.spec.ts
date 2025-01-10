import type { GlobalConfig } from "payload";
import { getCollapsibleLocalizedFields } from ".";

describe("fn: getCollapsibleLocalizedFields", () => {
  it("includes only localized fields from a collapsible field", () => {
    const global: GlobalConfig = {
      slug: "global",
      fields: [
        {
          name: "textLocalizedField",
          type: "text",
          localized: true,
        },
        {
          name: "textNonLocalizedField",
          type: "text",
        },
        {
          label: "Collapsible Field",
          type: "collapsible",
          fields: [
            {
              name: "textLocalizedFieldInCollapsibleField",
              type: "text",
              localized: true,
            },
            {
              name: "textNonLocalizedFieldInCollapsibleField",
              type: "text",
            },
            // select fields not supported yet
            {
              name: "selectLocalizedFieldInCollapsibleField",
              type: "select",
              localized: true,
              options: ["one", "two"],
            },
          ],
        },
      ],
    };
    const expected = [
      {
        name: "textLocalizedFieldInCollapsibleField",
        type: "text",
        localized: true,
      },
    ];
    expect(getCollapsibleLocalizedFields({ fields: global.fields })).toEqual(
      expected
    );
  });
});
