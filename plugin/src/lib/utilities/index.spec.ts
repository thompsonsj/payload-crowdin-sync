import { Block, GlobalConfig } from "payload";
import {
  fieldChanged,
  containsLocalizedFields,
} from ".";
import deepEqual from "deep-equal";

describe("Function: containsLocalizedFields", () => {
  it("detects localized fields on the top-level", () => {
    const global: GlobalConfig = {
      slug: "global",
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
      ],
    };
    expect(containsLocalizedFields({ fields: global.fields })).toBe(true);
  });

  it("detects localized fields in a group field", () => {
    const global: GlobalConfig = {
      slug: "global",
      fields: [
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
              type: "richText",
              localized: true,
            },
          ],
        },
      ],
    };
    expect(containsLocalizedFields({ fields: global.fields })).toBe(true);
  });

  it("detects localized fields in an array field", () => {
    const global: GlobalConfig = {
      slug: "global",
      fields: [
        {
          name: "simpleNonLocalizedField",
          type: "text",
        },
        {
          name: "arrayField",
          type: "array",
          fields: [
            {
              name: "richText",
              type: "richText",
              localized: true,
            },
          ],
        },
      ],
    };
    expect(containsLocalizedFields({ fields: global.fields })).toBe(true);
  });

  it("returns false if no localized fields in a blocks field", () => {
    const TestBlock: Block = {
      slug: "text",
      imageAltText: "Text",
      fields: [
        {
          name: "title",
          type: "text",
        },
        {
          name: "text",
          type: "richText",
        },
        {
          name: "select",
          type: "select",
          options: ["one", "two"],
        },
      ],
    };
    const global: GlobalConfig = {
      slug: "global",
      fields: [
        {
          name: "simpleNonLocalizedField",
          type: "text",
        },
        {
          name: "blocksField",
          type: "blocks",
          blocks: [TestBlock],
        },
      ],
    };
    expect(containsLocalizedFields({ fields: global.fields })).toBe(false);
  });
});

describe("Function: fieldChanged", () => {
  it("detects a richText field change on create", () => {
    const before = undefined;
    const after = {
      children: [
        {
          text: "Test content",
        },
      ],
    };
    const type = "richText";
    expect(fieldChanged(before, after, type)).toEqual(true);
  });

  it("detects a richText field change on update", () => {
    const before = {
      children: [
        {
          text: "Test content before",
        },
      ],
    };
    const after = {
      children: [
        {
          text: "Test content",
        },
      ],
    };
    const type = "richText";
    expect(fieldChanged(before, after, type)).toEqual(true);
  });

  it("returns false for equal richText objects", () => {
    const before = {
      children: [
        {
          text: "Test content",
        },
      ],
    };
    const after = before;
    const type = "richText";
    expect(fieldChanged(before, after, type)).toEqual(false);
  });
});

/**
 * Test the deep-equal dependency
 *
 * Usually, tests should not be done on third
 * party libraries but in this case, we need to
 * be sure key order does not matter.
 */
describe("deep-equal", () => {
  it("returns equal if keys are in a different order", () => {
    const obj1 = {
      title: "Sample article",
      content: [
        {
          children: [
            {
              text: "Heading 2",
            },
          ],
          type: "h2",
        },
        {
          children: [
            {
              text: "A regular paragraph.",
            },
          ],
        },
      ],
      meta: {
        title: "Sample article | Company",
        description: "",
      },
    };
    const obj2 = {
      title: "Sample article",
      meta: {
        description: "",
        title: "Sample article | Company",
      },
      content: [
        {
          children: [
            {
              text: "Heading 2",
            },
          ],
          type: "h2",
        },
        {
          children: [
            {
              text: "A regular paragraph.",
            },
          ],
        },
      ],
    };
    expect(deepEqual(obj1, obj2)).toBe(true);
  });
});
