import type { Block } from "payload";
import { buildCrowdinJsonObject, getLocalizedFields } from "../..";
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

describe("fn: buildCrowdinJsonObject: blocks field type", () => {
  it("includes localized fields nested in blocks", () => {
    const doc = {
      title: "Test Policy created with title",
      blocksField: [
        {
          title: "Block field title content one",
          text: "Block field text content one",
          select: "two",
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
        blocks: [TestBlockOne, TestBlockTwo],
      },
    ];
    const localizedFields = getLocalizedFields({ fields });
    const expected = {
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
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("excludes block with no localized fields", () => {
    const doc = {
      title: "Test Policy created with title",
      blocksField: [
        {
          title: "Block field title content one",
          text: "Block field text content one",
          select: "two",
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
      blocksField: {
        "64735620230d57bce946d370": {
          testBlockOne: {
            title: "Block field title content one",
            text: "Block field text content one",
          },
        },
      },
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });

  it("excludes block with no localized fields - more blocks", () => {
    const doc = {
      title: "Test Policy created with title",
      blocksField: [
        {
          title: "Block field title content one",
          text: "Block field text content one",
          select: "two",
          id: "64735620230d57bce946d370",
          blockType: "testBlockOne",
        },
        {
          url: "https://github.com/thompsonsj/payload-crowdin-sync",
          id: "64735621230d57bce946d371",
          blockType: "testBlockTwo",
        },
        {
          title: "Block field title content two",
          text: "Block field text content two",
          select: "two",
          id: "64a535cdf1eaa5498709c906",
          blockType: "testBlockOne",
        },
      ],
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
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
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

    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      blocksField: [
        {
          arrayField: [
            {
              content: [
                {
                  children: [
                    {
                      text: "Test content 1",
                    },
                  ],
                },
              ],
              id: "64735620230d57bce946d370",
            },
            {
              content: [
                {
                  children: [
                    {
                      text: "Test content 1",
                    },
                  ],
                },
              ],
              id: "64735621230d57bce946d371",
            },
          ],
          blockType: "testBlockArrayOfRichText",
        },
      ],
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
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
    const localizedFields = getLocalizedFields({ fields, type: "json" });
    const expected = {
      title: "Test Policy created with title",
    };
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
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

    const doc = {
      id: "638641358b1a140462752076",
      title: "Test Policy created with title",
      blocksField: [
        {
          messages: [
            {
              title: "Test title 1",
              message: [
                {
                  children: [
                    {
                      text: "Test content 1",
                    },
                  ],
                },
              ],
              id: "64735620230d57bce946d370",
            },
            {
              title: "Test title 2",
              message: [
                {
                  children: [
                    {
                      text: "Test content 1",
                    },
                  ],
                },
              ],
              id: "64735621230d57bce946d371",
            },
          ],
          id: "649cd1ecbac7445191be36af",
          blockType: "testBlockArrayOfRichText",
        },
      ],
      status: "draft",
      createdAt: "2022-11-29T17:28:21.644Z",
      updatedAt: "2022-11-29T17:28:21.644Z",
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
    expect(buildCrowdinJsonObject({ doc, fields: localizedFields })).toEqual(
      expected
    );
  });
});
