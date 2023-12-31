import payload from "payload";
import { initPayloadTest } from "../../helpers/config";
import { payloadHtmlToSlateConfig, payloadCrowdinSyncTranslationsApi } from "payload-crowdin-sync";
import nock from "nock";
import { mockCrowdinClient } from "plugin/src/lib/api/mock/crowdin-api-responses";
import { pluginConfig } from "../../helpers/plugin-config"

/**
 * Test translations
 *
 * Ensure translations are retrieved, compared, and
 * stored as expected.
 */

const pluginOptionsDefault = pluginConfig()
const pluginOptions = {
  ...pluginOptionsDefault,
  htmlToSlateConfig: {
    ...payloadHtmlToSlateConfig,
    elementTags: {
      ...payloadHtmlToSlateConfig.elementTags,
      table: () => ({ type: 'table' }),
      tr: () => ({ type: 'table-row' }),
      td: () => ({ type: 'table-cell' }),
      thead: () => ({ type: 'table-header' }),
      th: () => ({ type: 'table-header-cell' }),
      tbody: () => ({ type: 'table-body' }),
    },
  },
};
const mockClient = mockCrowdinClient(pluginOptions)

/**
 * payload.config.custom-serializers.ts required for htmlToSlate.
 * 
 * Plugin options passed directly to payloadCrowdinSyncTranslationsApi - this API is initialized through `server.ts` at the moment. Can change this in the future to use internal functions.
 */
describe("Translations", () => {
  beforeAll(async () => {
    await initPayloadTest({});
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
    if (typeof payload?.db?.destroy === "function") {
      await payload.db.destroy(payload);
    }
  });

  describe("fn: updateTranslation - custom serializer", () => {
    it("updates a Payload article with a `richText` field translation retrieved from Crowdin", async () => {
      const fileId = 4674

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
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${fileId}`,
          {
            targetLanguageId: 'de',
          }
        )
        .reply(200, mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${fileId}/download?targetLanguageId=de`
        }))
        .get(
          `/api/v2/projects/${pluginOptions.projectId}/translations/builds/${fileId}/download`
        )
        .query({
          targetLanguageId: 'de',
        })
        .reply(200, "<table><thead><tr><th>Text für Überschriftenzelle 1</th><th>Text für Überschriftenzelle 2</th><th>Text für Überschriftenzelle 3</th><th>Text für Überschriftenzelle 4</th></tr></thead><tbody><tr><td>Text für Tabellenzelle, Zeile 1, Spalte 1</td><td>Text für Tabellenzelle, Zeile 1, Spalte 2</td><td>Text für Tabellenzelle, Zeile 1, Spalte 3</td><td><p>Absatz 1-Text für Tabellenzelle, Zeile 1, Spalte 4</p><p>Absatz 2-Text für Tabellenzelle, Zeile 1, Spalte 4</p></td></tr></tbody></table>",
        )
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${fileId}`,
          {
            targetLanguageId: 'fr',
          }
        )
        .reply(200, mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${fileId}/download?targetLanguageId=fr`
        }))
        .get(
          `/api/v2/projects/${pluginOptions.projectId}/translations/builds/${fileId}/download`
        )
        .query({
          targetLanguageId: 'fr',
        })
        .reply(200, "<table><thead><tr><th>Texte pour la cellule d'en-tête 1</th><th>Texte pour la cellule d'en-tête 2</th><th>Texte pour la cellule d'en-tête 3</th><th>Texte pour la cellule d'en-tête 4</th></tr></thead><tbody><tr><td>Texte de la cellule du tableau, ligne 1, col 1</td><td>Texte de la cellule du tableau, ligne 1, col 2</td><td>Texte de la cellule du tableau, ligne 1, col 3</td><td><p>Texte du paragraphe 1 pour la ligne 1 de la cellule du tableau, colonne 4</p><p>Texte du paragraphe 2 pour la ligne 1 de la cellule du tableau, colonne 4</p></td></tr></tbody></table>",
        );
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
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        pluginOptions,
        payload
      );
      await translationsApi.updateTranslation({
        documentId: `${post.id}`,
        collection: "localized-posts",
        dryRun: false,
      });
      // retrieve translated post from Payload
      const result = await payload.findByID({
        collection: "localized-posts",
        id: post.id,
        locale: "de_DE",
      });
      const expected = [
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
                          text: "Text für Überschriftenzelle 1",
                        },
                      ],
                    },
                    {
                      type: "table-header-cell",
                      children: [
                        {
                          text: "Text für Überschriftenzelle 2",
                        },
                      ],
                    },
                    {
                      type: "table-header-cell",
                      children: [
                        {
                          text: "Text für Überschriftenzelle 3",
                        },
                      ],
                    },
                    {
                      type: "table-header-cell",
                      children: [
                        {
                          text: "Text für Überschriftenzelle 4",
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
                          text: "Text für Tabellenzelle, Zeile 1, Spalte 1",
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      children: [
                        {
                          text: "Text für Tabellenzelle, Zeile 1, Spalte 2",
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      children: [
                        {
                          text: "Text für Tabellenzelle, Zeile 1, Spalte 3",
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      children: [
                        {
                          type: "p",
                          children: [
                            {
                              text: "Absatz 1-Text für Tabellenzelle, Zeile 1, Spalte 4",
                            },
                          ],
                        },
                        {
                          type: "p",
                          children: [
                            {
                              text: "Absatz 2-Text für Tabellenzelle, Zeile 1, Spalte 4",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ]
        }
      ];
      expect(result["content"]).toEqual(expected);
      const frResult = await payload.findByID({
        collection: "localized-posts",
        id: post.id,
        locale: "fr_FR",
      });
      const frExpected = [
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
                          text: "Texte pour la cellule d'en-tête 1",
                        },
                      ],
                    },
                    {
                      type: "table-header-cell",
                      children: [
                        {
                          text: "Texte pour la cellule d'en-tête 2",
                        },
                      ],
                    },
                    {
                      type: "table-header-cell",
                      children: [
                        {
                          text: "Texte pour la cellule d'en-tête 3",
                        },
                      ],
                    },
                    {
                      type: "table-header-cell",
                      children: [
                        {
                          text: "Texte pour la cellule d'en-tête 4",
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
                          text: "Texte de la cellule du tableau, ligne 1, col 1",
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      children: [
                        {
                          text: "Texte de la cellule du tableau, ligne 1, col 2",
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      children: [
                        {
                          text: "Texte de la cellule du tableau, ligne 1, col 3",
                        },
                      ],
                    },
                    {
                      type: "table-cell",
                      children: [
                        {
                          type: "p",
                          children: [
                            {
                              text: "Texte du paragraphe 1 pour la ligne 1 de la cellule du tableau, colonne 4",
                            },
                          ],
                        },
                        {
                          type: "p",
                          children: [
                            {
                              text: "Texte du paragraphe 2 pour la ligne 1 de la cellule du tableau, colonne 4",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ]
        }
      ];
      expect(frResult["content"]).toEqual(frExpected);
    });
  });
});
