import type { CollectionConfig, Field } from "payload";
import { containsLocalizedFields } from ".";

describe("fn: containsLocalizedFields: true tests", () => {
  describe("basic field type tests", () => {
    it("includes localized fields from a group field", () => {
      const fields: Field[] = [
        {
          name: "simpleLocalizedField",
          type: "text",
          localized: true,
        },
        {
          name: "simpleNonLocalizedField",
          type: "text",
        },
        {
          name: "groupField",
          type: "group",
          fields: [
            {
              name: "simpleLocalizedField",
              type: "text",
              localized: true,
            },
            {
              name: "simpleNonLocalizedField",
              type: "text",
            },
            // select fields not supported yet
            {
              name: "text",
              type: "select",
              localized: true,
              options: ["one", "two"],
            },
          ],
        },
      ];
      expect(containsLocalizedFields({ fields })).toEqual(true);
    });

    it("includes localized fields from an array field", () => {
      const fields: Field[] = [
        {
          name: "simpleLocalizedField",
          type: "text",
          localized: true,
        },
        {
          name: "simpleNonLocalizedField",
          type: "text",
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
      expect(containsLocalizedFields({ fields })).toEqual(true);
    });

    it("includes localized fields from an array with a localization setting on the array field", () => {
      const fields: Field[] = [
        {
          name: "simpleLocalizedField",
          type: "text",
          localized: true,
        },
        {
          name: "simpleNonLocalizedField",
          type: "text",
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
      expect(containsLocalizedFields({ fields })).toEqual(true);
    });

    it("includes localized fields from an array inside a collapsible field where the top-level field group only contains collapsible fields", () => {
      const fields: Field[] = [
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
                  type: "richText",
                  localized: true,
                },
                {
                  name: "content",
                  type: "richText",
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
      expect(containsLocalizedFields({ fields })).toEqual(true);
    });

    /**
     * * help ensure no errors during version 0 development
     * * mitigate against errors if a new field type is introduced by Payload CMS
     */
    it("does not include unrecognized field types", () => {
      const fields: any[] = [
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
          name: "unknownLocalizedField",
          type: "weird",
          localized: true,
        },
        {
          name: "Unknown Field type",
          type: "strange",
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
      ];
      expect(containsLocalizedFields({ fields })).toEqual(true);
    });

    it("includes localized fields from a group field", () => {
      const fields: Field[] = [
        {
          name: "simpleLocalizedField",
          type: "text",
          localized: true,
        },
        {
          name: "simpleNonLocalizedField",
          type: "text",
        },
        {
          name: "groupField",
          type: "group",
          fields: [
            {
              name: "simpleLocalizedField",
              type: "text",
              localized: true,
            },
            {
              name: "simpleNonLocalizedField",
              type: "text",
            },
            // select fields not supported yet
            {
              name: "text",
              type: "select",
              localized: true,
              options: ["one", "two"],
            },
          ],
        },
      ];
      expect(containsLocalizedFields({ fields })).toEqual(true);
    });

    it("includes localized fields from a group field with a localization setting on the group field", () => {
      const fields: Field[] = [
        {
          name: "simpleLocalizedField",
          type: "text",
          localized: true,
        },
        {
          name: "simpleNonLocalizedField",
          type: "text",
        },
        {
          name: "groupField",
          type: "group",
          localized: true,
          fields: [
            {
              name: "textLocalizedField",
              type: "text",
            },
            {
              name: "richTextLocalizedField",
              type: "richText",
            },
            // select fields not supported yet
            {
              name: "text",
              type: "select",
              options: ["one", "two"],
            },
          ],
        },
      ];
      expect(containsLocalizedFields({ fields })).toEqual(true);
    });
  });

  it("includes localized fields from a group field with a localization setting on the group field: localized parent only", () => {
    const fields: Field[] = [
      {
        name: "groupField",
        type: "group",
        localized: true,
        fields: [
          {
            name: "textLocalizedField",
            type: "text",
          },
          {
            name: "richTextLocalizedField",
            type: "richText",
          },
          // select fields not supported yet
          {
            name: "text",
            type: "select",
            options: ["one", "two"],
          },
        ],
      },
    ];
    expect(containsLocalizedFields({ fields })).toEqual(true);
  });

  describe("extract rich text localized fields", () => {
    const fields: Field[] = [
      {
        name: "simpleLocalizedField",
        type: "richText",
        localized: true,
      },
      {
        name: "simpleNonLocalizedField",
        type: "text",
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
            name: "richText",
            type: "richText",
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
      {
        name: "groupField",
        type: "group",
        fields: [
          {
            name: "simpleLocalizedField",
            type: "richText",
            localized: true,
          },
          {
            name: "simpleNonLocalizedField",
            type: "text",
          },
          // select fields not supported yet
          {
            name: "text",
            type: "select",
            localized: true,
            options: ["one", "two"],
          },
        ],
      },
    ];
    expect(containsLocalizedFields({ fields })).toEqual(true);
  });

  it("returns nested json fields in a group inside an array", () => {
    const linkField: Field = {
      name: "link",
      type: "group",
      fields: [
        {
          name: "text",
          type: "text",
          localized: true,
        },
        {
          name: "href",
          type: "text",
        },
        {
          name: "type",
          type: "select",
          options: ["ctaPrimary", "ctaSecondary"],
        },
      ],
    };
    const Promos: CollectionConfig = {
      slug: "promos",
      admin: {
        defaultColumns: ["title", "updatedAt"],
        useAsTitle: "title",
        group: "Shared",
      },
      access: {
        read: () => true,
      },
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
          name: "ctas",
          type: "array",
          minRows: 1,
          maxRows: 2,
          fields: [linkField],
        },
      ],
    };
    expect(containsLocalizedFields({ fields: Promos.fields })).toEqual(true);
  });
});

describe("fn: containsLocalizedFields: false tests", () => {
  describe("basic field type tests", () => {
    it("includes localized fields from a group field", () => {
      const fields: Field[] = [
        {
          name: "simpleLocalizedField",
          type: "text",
        },
        {
          name: "simpleNonLocalizedField",
          type: "text",
        },
        {
          name: "groupField",
          type: "group",
          fields: [
            {
              name: "simpleLocalizedField",
              type: "text",
            },
            {
              name: "simpleNonLocalizedField",
              type: "text",
            },
            // select fields not supported yet
            {
              name: "text",
              type: "select",
              localized: true,
              options: ["one", "two"],
            },
          ],
        },
      ];
      expect(containsLocalizedFields({ fields })).toEqual(false);
    });

    it("includes localized fields from an array field", () => {
      const fields: Field[] = [
        {
          name: "simpleLocalizedField",
          type: "text",
        },
        {
          name: "simpleNonLocalizedField",
          type: "text",
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
      expect(containsLocalizedFields({ fields })).toEqual(false);
    });

    it("includes localized fields from an array with a localization setting on the array field", () => {
      const fields: Field[] = [
        {
          name: "simpleLocalizedField",
          type: "text",
        },
        {
          name: "simpleNonLocalizedField",
          type: "text",
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
              options: ["one", "two"],
            },
          ],
        },
      ];
      expect(containsLocalizedFields({ fields })).toEqual(false);
    });

    it("includes localized fields from an array inside a collapsible field where the top-level field group only contains collapsible fields", () => {
      const fields: Field[] = [
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
                  type: "richText",
                },
                {
                  name: "content",
                  type: "richText",
                },
                {
                  name: "select",
                  type: "select",
                  options: ["one", "two"],
                },
              ],
            },
          ],
        },
      ];
      expect(containsLocalizedFields({ fields })).toEqual(false);
    });

    /**
     * * help ensure no errors during version 0 development
     * * mitigate against errors if a new field type is introduced by Payload CMS
     */
    it("does not include unrecognized field types", () => {
      const fields: any[] = [
        {
          name: "textLocalizedField",
          type: "text",
        },
        {
          name: "textNonLocalizedField",
          type: "text",
        },
        {
          name: "unknownLocalizedField",
          type: "weird",
          localized: true,
        },
        {
          name: "Unknown Field type",
          type: "strange",
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
      ];
      expect(containsLocalizedFields({ fields })).toEqual(false);
    });

    it("includes localized fields from a group field", () => {
      const fields: Field[] = [
        {
          name: "simpleLocalizedField",
          type: "text",
        },
        {
          name: "simpleNonLocalizedField",
          type: "text",
        },
        {
          name: "groupField",
          type: "group",
          fields: [
            {
              name: "simpleLocalizedField",
              type: "text",
            },
            {
              name: "simpleNonLocalizedField",
              type: "text",
            },
            // select fields not supported yet
            {
              name: "text",
              type: "select",
              localized: true,
              options: ["one", "two"],
            },
          ],
        },
      ];
      expect(containsLocalizedFields({ fields })).toEqual(false);
    });

    it("includes localized fields from a group field with a localization setting on the group field", () => {
      const fields: Field[] = [
        {
          name: "simpleLocalizedField",
          type: "text",
        },
        {
          name: "simpleNonLocalizedField",
          type: "text",
        },
        {
          name: "groupField",
          type: "group",
          fields: [
            {
              name: "textLocalizedField",
              type: "text",
            },
            {
              name: "richTextLocalizedField",
              type: "richText",
            },
            // select fields not supported yet
            {
              name: "text",
              type: "select",
              options: ["one", "two"],
            },
          ],
        },
      ];
      expect(containsLocalizedFields({ fields })).toEqual(false);
    });
  });

  describe("extract rich text localized fields", () => {
    const fields: Field[] = [
      {
        name: "simpleLocalizedField",
        type: "richText",
      },
      {
        name: "simpleNonLocalizedField",
        type: "text",
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
            name: "richText",
            type: "richText",
          },
          {
            name: "select",
            type: "select",
            options: ["one", "two"],
          },
        ],
      },
      {
        name: "groupField",
        type: "group",
        fields: [
          {
            name: "simpleLocalizedField",
            type: "richText",
          },
          {
            name: "simpleNonLocalizedField",
            type: "text",
          },
          // select fields not supported yet
          {
            name: "text",
            type: "select",
            localized: true,
            options: ["one", "two"],
          },
        ],
      },
    ];
    expect(containsLocalizedFields({ fields })).toEqual(false);
  });

  it("returns nested json fields in a group inside an array", () => {
    const linkField: Field = {
      name: "link",
      type: "group",
      fields: [
        {
          name: "text",
          type: "text",
        },
        {
          name: "href",
          type: "text",
        },
        {
          name: "type",
          type: "select",
          options: ["ctaPrimary", "ctaSecondary"],
        },
      ],
    };
    const Promos: CollectionConfig = {
      slug: "promos",
      admin: {
        defaultColumns: ["title", "updatedAt"],
        useAsTitle: "title",
        group: "Shared",
      },
      access: {
        read: () => true,
      },
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
          name: "ctas",
          type: "array",
          minRows: 1,
          maxRows: 2,
          fields: [linkField],
        },
      ],
    };
    expect(containsLocalizedFields({ fields: Promos.fields })).toEqual(false);
  });
});
