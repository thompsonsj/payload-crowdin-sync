import type { Block, Field } from "payload";
import {
  buildPayloadUpdateObject,
  getLocalizedFields,
} from "../..";
import { FieldWithName } from "../../../types";

const TestBlockOne: Block = {
  slug: "testBlockOne",
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
};

const TestBlockTwo: Block = {
  slug: "testBlockTwo",
  fields: [
    {
      name: "url",
      type: "text",
      localized: true,
    },
  ],
};

const TestBlockTwoNonLocalized: Block = {
  slug: "testBlockTwo",
  fields: [
    {
      name: "url",
      type: "text",
    },
  ],
};

describe("fn: buildPayloadUpdateObject: blocks field type", () => {
  it("includes localized fields nested in blocks", () => {
    const crowdinJsonObject = {
      title: "Test Policy created with title",
      blocksField: {
        "64735620230d57bce946d370": {
          testBlockOne: {
            title: "Block field title content one",
            text: "Block field text content one",
          },
        },
        "64735621230d57bce946d371": {
          testBlockTwo: {
            url: "https://github.com/thompsonsj/payload-crowdin-sync",
          },
        },
      },
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
        name: "blocksField",
        type: "blocks",
        blocks: [TestBlockOne, TestBlockTwo],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
      blocksField: [
        {
          title: "Block field title content one",
          text: "Block field text content one",
          id: "64735620230d57bce946d370",
          blockType: "testBlockOne",
        },
        {
          url: "https://github.com/thompsonsj/payload-crowdin-sync",
          id: "64735621230d57bce946d371",
          blockType: "testBlockTwo",
        },
      ],
    };
    expect(
      buildPayloadUpdateObject({ crowdinJsonObject, fields: localizedFields })
    ).toEqual(expected);
  });

  it("excludes block with no localized fields", () => {
    const crowdinJsonObject = {
      title: "Test Policy created with title",
      blocksField: {
        "64735620230d57bce946d370": {
          testBlockOne: {
            title: "Block field title content one",
            text: "Block field text content one",
          },
        },
      },
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
        name: "blocksField",
        type: "blocks",
        blocks: [TestBlockOne, TestBlockTwoNonLocalized],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
      blocksField: [
        {
          title: "Block field title content one",
          text: "Block field text content one",
          id: "64735620230d57bce946d370",
          blockType: "testBlockOne",
        },
      ],
    };
    expect(
      buildPayloadUpdateObject({ crowdinJsonObject, fields: localizedFields })
    ).toEqual(expected);
  });

  it("excludes block with no localized fields - more blocks", () => {
    const crowdinJsonObject = {
      title: "Test Policy created with title",
      blocksField: {
        "64735620230d57bce946d370": {
          testBlockOne: {
            title: "Block field title content one",
            text: "Block field text content one",
          },
        },
        "64a535cdf1eaa5498709c906": {
          testBlockOne: {
            title: "Block field title content two",
            text: "Block field text content two",
          },
        },
      },
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
        name: "blocksField",
        type: "blocks",
        blocks: [TestBlockOne, TestBlockTwoNonLocalized],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
      blocksField: [
        {
          title: "Block field title content one",
          text: "Block field text content one",
          id: "64735620230d57bce946d370",
          blockType: "testBlockOne",
        },
        {
          title: "Block field title content two",
          text: "Block field text content two",
          id: "64a535cdf1eaa5498709c906",
          blockType: "testBlockOne",
        },
      ],
    };
    expect(
      buildPayloadUpdateObject({ crowdinJsonObject, fields: localizedFields })
    ).toEqual(expected);
  });

  it("does not include localized fields richText fields nested in an array field within a block in the `fields.json` file", () => {
    const TestBlockArrayOfRichText: Block = {
      slug: "testBlockArrayOfRichText",
      fields: [
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

    const crowdinJsonObject = {
      title: "Test Policy created with title",
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
        name: "blocksField",
        type: "blocks",
        blocks: [TestBlockArrayOfRichText],
      },
    ];
    const localizedFields = getLocalizedFields({ fields, type: "json" });
    const expected = {
      title: "Test Policy created with title",
    };
    expect(
      buildPayloadUpdateObject({ crowdinJsonObject, fields: localizedFields })
    ).toEqual(expected);
  });

  it("does not include localized fields richText fields nested in an array field within a block in the `fields.json` file 2", () => {
    const TestBlockArrayOfRichText: Block = {
      slug: "testBlockArrayOfRichText",
      fields: [
        {
          name: "title",
          type: "text",
          localized: true,
        },
        {
          name: "messages",
          type: "array",
          localized: true,
          maxRows: 3,
          fields: [
            {
              name: "title",
              type: "text",
              localized: true,
            },
            {
              name: "message",
              type: "richText",
            },
          ],
        },
      ],
    };

    const crowdinJsonObject = {
      title: "Test Policy created with title",
      blocksField: {
        "649cd1ecbac7445191be36af": {
          testBlockArrayOfRichText: {
            messages: {
              "64735620230d57bce946d370": {
                title: "Test title 1",
              },
              "64735621230d57bce946d371": {
                title: "Test title 2",
              },
            },
          },
        },
      },
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
        name: "blocksField",
        type: "blocks",
        blocks: [TestBlockArrayOfRichText],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
      title: "Test Policy created with title",
      blocksField: [
        {
          messages: [
            {
              title: "Test title 1",
              id: "64735620230d57bce946d370",
            },
            {
              title: "Test title 2",
              id: "64735621230d57bce946d371",
            },
          ],
          id: "649cd1ecbac7445191be36af",
          blockType: "testBlockArrayOfRichText",
        },
      ],
    };
    expect(
      buildPayloadUpdateObject({ crowdinJsonObject, fields: localizedFields })
    ).toEqual(expected);
  });
});
