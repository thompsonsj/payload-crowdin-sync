import { getFilesByDocumentID } from "payload-crowdin-sync";
import { CrowdinFile } from "../../payload-types";
import nock from "nock";
import { mockCrowdinClient } from "payload-crowdin-sync";
import { pluginConfig } from "../helpers/plugin-config"


import { initPayloadInt } from '../helpers/initPayloadInt'
import type { Payload } from 'payload'

let payload: Payload

/**
 * Test translations
 *
 * Ensure translations are retrieved, compared, and
 * stored as expected.
 */

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

describe("Files - custom serializer", () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt()
    ;({ payload } = initialized as {
      payload: Payload
    })
  });

  afterEach((done) => {
    if (!nock.isDone()) {
      throw new Error(
        `Not all nock interceptors were used: ${JSON.stringify(
          nock.pendingMocks()
        )}`
      );
    }
    nock.cleanAll()
    done()
  })

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
  });

  describe("fn: updateTranslation", () => {
    it("updates the Crowdin article directory with html for a `richText` field", async () => {
      const fileId = 92
      
      nock("https://api.crowdin.com")
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/directories`
        )
        .twice()
        .reply(200, mockClient.createDirectory({}))
        .post(
          `/api/v2/storages`
        )
        .reply(200, mockClient.addStorage())
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/files`
        )
        .reply(200, mockClient.createFile({
          fileId,
        }))

      const post = await payload.create({
        collection: "localized-posts",
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
      const crowdinFiles = await getFilesByDocumentID({
        documentId: `${post.id}`,
        payload 
      });
      const content = crowdinFiles.find((file: CrowdinFile) => file.field === "content");
      expect(content).toBeTruthy();
      expect(content?.fileData).toMatchInlineSnapshot(`
        {
          "html": "<table><thead><tr><th>Text for heading cell 1</th><th>Text for heading cell 2</th><th>Text for heading cell 3</th><th>Text for heading cell 4</th></tr></thead><tbody><tr><td>Text for table cell row 1 col 1</td><td>Text for table cell row 1 col 2</td><td>Text for table cell row 1 col 3.</td><td><p>Paragraph 1 text for table cell row 1 col 4</p><p>Paragraph 2 text for table cell row 1 col 4</p></td></tr></tbody></table>",
        }
      `);
    });
  });
});
