import type { CollectionConfig, GlobalConfig } from "payload";
import { getLocalizedFields, getFieldSlugs } from ".";

describe("Function: getFieldSlugs", () => {
  it("detects top-level richText fields", () => {
    const Policies: CollectionConfig = {
      slug: "policies",
      admin: {
        defaultColumns: ["title", "updatedDate"],
        useAsTitle: "title",
        group: "Pages",
      },
      access: {
        read: () => true,
      },
      versions: {
        drafts: true,
      },
      fields: [
        {
          name: "title",
          type: "text",
          localized: true,
        },
        {
          name: "updatedDate",
          type: "date",
          admin: {
            description:
              "If set, this updated date/time will be displayed on the policy page.",
          },
        },
        {
          name: "content",
          type: "richText",
          localized: true,
        },
      ],
    };
    const htmlFields = getLocalizedFields({
      fields: Policies.fields,
      type: "html",
    });
    expect(getFieldSlugs(htmlFields)).toEqual(["content"]);
  });

  it("returns an empty array if no rich text fields", () => {
    const Statistics: GlobalConfig = {
      slug: "statistics",
      access: {
        read: () => true,
      },
      fields: [
        {
          name: "users",
          type: "group",
          fields: [
            {
              name: "text",
              type: "text",
              localized: true,
            },
            {
              name: "number",
              type: "number",
              min: 0,
              admin: {
                step: 100,
                description:
                  "Restricted to multiples of 100 in order to simplify localization.",
              },
            },
          ],
        },
        {
          name: "companies",
          type: "group",
          fields: [
            {
              name: "text",
              type: "text",
              localized: true,
            },
            {
              name: "number",
              type: "number",
              min: 0,
              admin: {
                step: 100,
                description:
                  "Restricted to multiples of 100 in order to simplify localization.",
              },
            },
          ],
        },
        {
          name: "countries",
          type: "group",
          fields: [
            {
              name: "text",
              type: "text",
              localized: true,
            },
            {
              name: "number",
              type: "number",
              min: 0,
              admin: {
                step: 1,
              },
            },
          ],
        },
        {
          name: "successfulHires",
          type: "group",
          fields: [
            {
              name: "text",
              type: "text",
              localized: true,
            },
            {
              name: "number",
              type: "number",
              min: 0,
              admin: {
                step: 100,
                description:
                  "Restricted to multiples of 100 in order to simplify localization.",
              },
            },
          ],
        },
      ],
    };
    const htmlFields = getLocalizedFields({
      fields: Statistics.fields,
      type: "html",
    });
    expect(getFieldSlugs(htmlFields)).toEqual([]);
  });
});
