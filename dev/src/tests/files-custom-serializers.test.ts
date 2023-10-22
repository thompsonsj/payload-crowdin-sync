import payload from "payload";
import { initPayloadTest } from "./helpers/config";
import { connectionTimeout } from "./config";
import { getFilesByDocumentID } from "../../../dist/api/helpers";

/**
 * Test translations
 *
 * Ensure translations are retrieved, compared, and
 * stored as expected.
 */

const collections = {
  nonLocalized: "posts",
  localized: "localized-posts",
  nestedFields: "nested-field-collection",
};

describe("Files - custom serializer", () => {
  beforeAll(async () => {
    await initPayloadTest({
      __dirname,
      payloadConfigFile: "payload.config.custom-serializers.ts",
    });
    await new Promise((resolve) => setTimeout(resolve, connectionTimeout));
  });

  afterAll(async () => {
    if (typeof payload.db.destroy === "function") {
      setTimeout(async () => {
        await payload.db.destroy(payload);
      }, connectionTimeout);
    }
  });

  describe("fn: updateTranslation", () => {
    it("updates the Crowdin article directory with html for a `richText` field", async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: {
          content: [
            {
              type: "table",
              children: [
                {
                  type: "table-header",
                  children: [
                    {
                      type: "table-row",
                      children: [
                        {
                          type: "table-header-cell",
                          children: [
                            {
                              text: "Text for heading cell 1",
                            },
                          ],
                        },
                        {
                          type: "table-header-cell",
                          children: [
                            {
                              text: "Text for heading cell 2",
                            },
                          ],
                        },
                        {
                          type: "table-header-cell",
                          children: [
                            {
                              text: "Text for heading cell 3",
                            },
                          ],
                        },
                        {
                          type: "table-header-cell",
                          children: [
                            {
                              text: "Text for heading cell 4",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "table-body",
                  children: [
                    {
                      type: "table-row",
                      children: [
                        {
                          type: "table-cell",
                          children: [
                            {
                              text: "Text for table cell row 1 col 1",
                            },
                          ],
                        },
                        {
                          type: "table-cell",
                          children: [
                            {
                              text: "Text for table cell row 1 col 2",
                            },
                          ],
                        },
                        {
                          type: "table-cell",
                          children: [
                            {
                              text: "Text for table cell row 1 col 3.",
                            },
                          ],
                        },
                        {
                          type: "table-cell",
                          children: [
                            {
                              type: "paragraph",
                              children: [
                                {
                                  text: "Paragraph 1 text for table cell row 1 col 4",
                                },
                              ],
                            },
                            {
                              type: "paragraph",
                              children: [
                                {
                                  text: "Paragraph 2 text for table cell row 1 col 4",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
      const crowdinFiles = await getFilesByDocumentID(
        `${post.id}`,
        payload as any
      );
      const content = crowdinFiles.find((file) => file.field === "content");
      expect(content).toBeTruthy();
      expect(content.fileData).toMatchInlineSnapshot(`
        {
          "html": "<table><thead><tr><th>Text for heading cell 1</th><th>Text for heading cell 2</th><th>Text for heading cell 3</th><th>Text for heading cell 4</th></tr></thead><tbody><tr><td>Text for table cell row 1 col 1</td><td>Text for table cell row 1 col 2</td><td>Text for table cell row 1 col 3.</td><td><p>Paragraph 1 text for table cell row 1 col 4</p><p>Paragraph 2 text for table cell row 1 col 4</p></td></tr></tbody></table>",
        }
      `);
    });
  });
});
