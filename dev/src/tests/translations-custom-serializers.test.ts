import payload from "payload";
import { initPayloadTest } from "./helpers/config";
import { connectionTimeout } from "./config";
import { payloadHtmlToSlateConfig } from "../../../dist";
import { payloadCrowdinSyncTranslationsApi } from "../../../dist/api/payload-crowdin-sync/translations";
import nock from "nock";

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

const pluginOptions = {
  projectId: 323731,
  directoryId: 1169,
  token: process.env.CROWDIN_TOKEN as string,
  localeMap: {
    de_DE: {
      crowdinId: "de",
    },
    fr_FR: {
      crowdinId: "fr",
    },
  },
  sourceLocale: "en",
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

/**
 * payload.config.custom-serializers.ts required for htmlToSlate.
 * 
 * Plugin options passed directly to payloadCrowdinSyncTranslationsApi - this API is initialized through `server.ts` at the moment. Can change this in the future to use internal functions.
 */
describe("Translations", () => {
  beforeAll(async () => {
    await initPayloadTest({
      __dirname });
    await new Promise((resolve) => setTimeout(resolve, connectionTimeout));
  });

  afterAll(async () => {
    if (typeof payload.db.destroy === "function") {
      setTimeout(async () => {
        await payload.db.destroy(payload);
      }, connectionTimeout);
    }
  });

  describe("fn: updateTranslation - custom serializer", () => {
    it("updates a Payload article with a `richText` field translation retrieved from Crowdin", async () => {
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
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        pluginOptions,
        payload as any
      );
      const scope = nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de"
        )
        .reply(200, "<table><thead><tr><th>Text für Überschriftenzelle 1</th><th>Text für Überschriftenzelle 2</th><th>Text für Überschriftenzelle 3</th><th>Text für Überschriftenzelle 4</th></tr></thead><tbody><tr><td>Text für Tabellenzelle, Zeile 1, Spalte 1</td><td>Text für Tabellenzelle, Zeile 1, Spalte 2</td><td>Text für Tabellenzelle, Zeile 1, Spalte 3</td><td><p>Absatz 1-Text für Tabellenzelle, Zeile 1, Spalte 4</p><p>Absatz 2-Text für Tabellenzelle, Zeile 1, Spalte 4</p></td></tr></tbody></table>",
        )
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr"
        )
        .reply(200, "<table><thead><tr><th>Texte pour la cellule d'en-tête 1</th><th>Texte pour la cellule d'en-tête 2</th><th>Texte pour la cellule d'en-tête 3</th><th>Texte pour la cellule d'en-tête 4</th></tr></thead><tbody><tr><td>Texte de la cellule du tableau, ligne 1, col 1</td><td>Texte de la cellule du tableau, ligne 1, col 2</td><td>Texte de la cellule du tableau, ligne 1, col 3</td><td><p>Texte du paragraphe 1 pour la ligne 1 de la cellule du tableau, colonne 4</p><p>Texte du paragraphe 2 pour la ligne 1 de la cellule du tableau, colonne 4</p></td></tr></tbody></table>",
        );

        const translation = await translationsApi.updateTranslation({
          documentId: `${post.id}`,
          collection: collections.localized,
          dryRun: false,
        });
        // retrieve translated post from Payload
      const result = await payload.findByID({
        collection: collections.localized,
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
      expect(result.content).toEqual(expected);
      const frResult = await payload.findByID({
        collection: collections.localized,
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
      expect(frResult.content).toEqual(frExpected);
    });
  });
});
