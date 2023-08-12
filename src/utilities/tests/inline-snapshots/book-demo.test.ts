import BookDemo from "./collections/BookDemo";
import { getLocalizedFields } from "../..";

describe("book demo collection snapshots", () => {
  const fields = BookDemo.fields;

  it("getLocalizedFields", () => {
    expect(getLocalizedFields({ fields })).toMatchInlineSnapshot(`
      [
        {
          "localized": true,
          "name": "logoTitle",
          "required": true,
          "type": "text",
        },
        {
          "fields": [
            {
              "admin": {
                "elements": [],
                "leaves": [
                  "bold",
                ],
              },
              "name": "title",
              "type": "richText",
            },
            {
              "admin": {
                "elements": [],
                "leaves": [
                  "bold",
                ],
              },
              "name": "text",
              "type": "richText",
            },
          ],
          "localized": true,
          "name": "hero",
          "type": "group",
        },
        {
          "fields": [
            {
              "name": "title",
              "type": "text",
            },
            {
              "name": "subTitle",
              "type": "text",
            },
            {
              "fields": [
                {
                  "name": "title",
                  "type": "text",
                },
                {
                  "fields": [
                    {
                      "name": "text",
                      "type": "text",
                    },
                  ],
                  "localized": true,
                  "name": "items",
                  "type": "array",
                },
              ],
              "localized": true,
              "name": "content",
              "type": "group",
            },
          ],
          "localized": true,
          "name": "form",
          "type": "group",
        },
      ]
    `);
  });
});
