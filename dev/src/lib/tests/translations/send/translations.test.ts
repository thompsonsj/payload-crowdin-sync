import payload from "payload";
import { initPayloadTest } from "../../helpers/config";
import { payloadCrowdinSyncTranslationsApi } from "payload-crowdin-sync";
import nock from "nock";
import { payloadCreateData } from "../../fixtures/nested-field-collection/simple-blocks.fixture";
import { payloadCreateBlocksRichTextData } from "../../fixtures/nested-field-collection/rich-text-blocks.fixture";
import { payloadCreateIncludesNonLocalizedBlocksData } from "../../fixtures/nested-field-collection/simple-blocks-with-non-localized-blocks.fixture";
import { multiRichTextFields } from "../../../collections/fields/multiRichTextFields";
import { connectionTimeout } from "../../config";

/**
 * Test translations
 *
 * Ensure translations are retrieved, compared, and
 * stored as expected.
 */

const pluginOptions = {
  projectId: 323731,
  directoryId: 1169,
  token: process.env['CROWDIN_TOKEN'] as string,
  localeMap: {
    de_DE: {
      crowdinId: "de",
    },
    fr_FR: {
      crowdinId: "fr",
    },
  },
  sourceLocale: "en",
};

describe("Translations", () => {
  beforeAll(async () => {
    await initPayloadTest({
      __dirname,
      payloadConfigFile: "./../../payload.config.default.ts"
    });
    await new Promise(resolve => setTimeout(resolve, connectionTimeout));
  });

  afterEach(async () => {
    nock.cleanAll();
  });

  afterAll(async () => {
    if (typeof payload?.db?.destroy === 'function') {
      await payload.db.destroy(payload)
      //setTimeout(async () => {await payload.db.destroy(payload)}, connectionTimeout)
    }
  });

  describe("fn: getTranslation", () => {
    it("retrieves a translation from Crowdin", async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        pluginOptions,
        payload
      );
      nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de"
        )
        .reply(200, {
          title: "Testbeitrag",
        })
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr"
        )
        .reply(200, {
          title: "Poste d'essai",
        });
      const translation = await translationsApi.getTranslation({
        documentId: `${post.id}`,
        fieldName: "fields",
        locale: "de_DE",
      });
      expect(translation).toEqual({
        title: "Testbeitrag",
      });
    });
  });

  describe("fn: updateTranslation", () => {
    it("updates a Payload article with a `text` field translation retrieved from Crowdin", async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        pluginOptions,
        payload
      );
      nock("https://api.crowdin.com")
        .get(
          `/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de`
        )
        .reply(200, {
          title: "Testbeitrag",
        })
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr"
        )
        .reply(200, {
          title: "Poste d'essai",
        });
      await translationsApi.updateTranslation({
        documentId: `${post.id}`,
        collection: "localized-posts",
        dryRun: false,
      });
      // retrieve translated post from Payload
      const result = await payload.findByID({
        collection: "localized-posts",
        id: `${post.id}`,
        locale: "de_DE",
      });
      expect(result["title"]).toEqual("Testbeitrag");
    });

    it("updates a Payload article draft with a `text` field translation retrieved from Crowdin", async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        pluginOptions,
        payload
      );
      nock("https://api.crowdin.com")
        .get(
          `/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de`
        )
        .reply(200, {
          title: "Testbeitrag",
        })
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr"
        )
        .reply(200, {
          title: "Poste d'essai",
        });
      await translationsApi.updateTranslation({
        documentId: `${post.id}`,
        collection: "localized-posts",
        dryRun: false,
        draft: true,
      });
      // retrieve translated post from Payload
      const result = await payload.findByID({
        collection: "localized-posts",
        id: `${post.id}`,
        locale: "de_DE",
      });
      expect(result["title"]).toEqual("Test post"); // collection has fallback locale
      // retrieve translated post draft from Payload
      const resultDraft = await payload.findByID({
        collection: "localized-posts",
        id: `${post.id}`,
        locale: "de_DE",
        draft: true,
      });
      expect(resultDraft["title"]).toEqual("Testbeitrag");
    });

    it("updates a Payload article with a `richText` field translation retrieved from Crowdin", async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: {
          content: [
            {
              children: [
                {
                  text: "Test content",
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
      nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de"
        )
        .reply(200, "<p>Testbeitrag</p>")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr"
        )
        .reply(200, {
          title: "Poste d'essai",
        });
      await translationsApi.updateTranslation({
        documentId: `${post.id}`,
        collection: "localized-posts",
        dryRun: false,
      });
      // retrieve translated post from Payload
      const result = await payload.findByID({
        collection: "localized-posts",
        id: `${post.id}`,
        locale: "de_DE",
      });
      expect(result["content"]).toEqual([
        {
          children: [{ text: "Testbeitrag" }],
          type: "p",
        },
      ]);
    });

    it("updates a Payload article with a *blocks* field translation retrieved from Crowdin", async () => {
      const post = await payload.create({
        collection: "nested-field-collection",
        data: payloadCreateData as any,
      });
      // we need the ids created by Payload to update the blocks
      const blockIds = (post["layout"] instanceof Array ? post["layout"].map((block) => block.id) : []) as string[];
      const blockTypes = post["layout"] instanceof Array ? post["layout"].map((block) => block.blockType) : [];
      const responseDe = {
        layout: {
          [blockIds[0]]: {
            [blockTypes[0]]: {
              textField: "Textfeldinhalt im Block bei Layoutindex 0",
              textareaField:
                "Textbereichsfeldinhalt im Block bei Layoutindex 0",
            },
          },
          [blockIds[1]]: {
            [blockTypes[1]]: {
              textField: "Textfeldinhalt im Block bei Layoutindex 1",
              textareaField:
                "Textbereichsfeldinhalt im Block bei Layoutindex 1",
            },
          },
        },
      };
      const responseFr = {
        layout: {
          [blockIds[0]]: {
            [blockTypes[0]]: {
              textField:
                "Contenu du champ de texte dans le bloc à l'index de mise en page 0",
              textareaField:
                "Contenu du champ Textarea dans le bloc à l'index de mise en page 0",
            },
          },
          [blockIds[1]]: {
            [blockTypes[1]]: {
              textField:
                "Contenu du champ de texte dans le bloc à l'index de mise en page 1",
              textareaField:
                "Contenu du champ Textarea dans le bloc à l'index de mise en page 1",
            },
          },
        },
      };
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        pluginOptions,
        payload
      );
      nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de"
        )
        .reply(200, responseDe)
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr"
        )
        .reply(200, responseFr);
      await translationsApi.updateTranslation({
        documentId: `${post.id}`,
        collection: "nested-field-collection",
        dryRun: false,
      });
      // retrieve translated post from Payload
      const resultDe = await payload.findByID({
        collection: "nested-field-collection",
        id: `${post.id}`,
        locale: "de_DE",
      });
      expect(resultDe["layout"]).toEqual([
        {
          textField: "Textfeldinhalt im Block bei Layoutindex 0",
          textareaField: "Textbereichsfeldinhalt im Block bei Layoutindex 0",
          id: blockIds[0],
          blockType: "basicBlock",
        },
        {
          textField: "Textfeldinhalt im Block bei Layoutindex 1",
          textareaField: "Textbereichsfeldinhalt im Block bei Layoutindex 1",
          id: blockIds[1],
          blockType: "basicBlock",
        },
      ]);
      // retrieve translated post from Payload
      const resultFr = await payload.findByID({
        collection: "nested-field-collection",
        id: `${post.id}`,
        locale: "fr_FR",
      });
      expect(resultFr["layout"]).toEqual([
        {
          textField:
            "Contenu du champ de texte dans le bloc à l'index de mise en page 0",
          textareaField:
            "Contenu du champ Textarea dans le bloc à l'index de mise en page 0",
          id: blockIds[0],
          blockType: "basicBlock",
        },
        {
          textField:
            "Contenu du champ de texte dans le bloc à l'index de mise en page 1",
          textareaField:
            "Contenu du champ Textarea dans le bloc à l'index de mise en page 1",
          id: blockIds[1],
          blockType: "basicBlock",
        },
      ]);
    });

    it("updates a Payload article with a *blocks* field translation retrieved from Crowdin and respects non-localized fields", async () => {
      const post = await payload.create({
        collection: "nested-field-collection",
        data: payloadCreateIncludesNonLocalizedBlocksData as any,
      });
      // we need the ids created by Payload to update the blocks
      const blockIds = (post["layout"] instanceof Array ? post["layout"].map((block) => block.id) : []) as string[];
      const blockTypes = (post["layout"] instanceof Array ? post["layout"].map((block) => block.blockType) : []) as string[];
      // ensure the original created post is as expected
      expect(post["layout"]).toEqual([
        {
          textField:
            "Text field content in block at layout index 0",
          textareaField:
            "Textarea field content in block at layout index 0",
          id: blockIds[0],
          blockType: "basicBlock",
        },
        {
          textField:
            "Text field content in block at layout index 1",
          textareaField:
            "Textarea field content in block at layout index 1",
          id: blockIds[1],
          blockType: "basicBlockNonLocalized",
        },
        {
          textField:
            "Text field content in block at layout index 2",
          textareaField:
            "Textarea field content in block at layout index 2",
          id: blockIds[2],
          blockType: "basicBlock",
        },
      ]);
      const responseFr = {
        layout: {
          [blockIds[0]]: {
            [blockTypes[0]]: {
              textField:
                "Contenu du champ de texte dans le bloc à l'index de mise en page 0",
              textareaField:
                "Contenu du champ Textarea dans le bloc à l'index de mise en page 0",
            },
          },
          [blockIds[2]]: {
            [blockTypes[2]]: {
              textField:
                "Contenu du champ de texte dans le bloc à l'index de mise en page 2",
              textareaField:
                "Contenu du champ Textarea dans le bloc à l'index de mise en page 2",
            },
          },
        },
      };
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        pluginOptions,
        payload
      );
      nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de"
        )
        .reply(200, {})
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr"
        )
        .reply(200, responseFr);
      await translationsApi.updateTranslation({
        documentId: `${post.id}`,
        collection: "nested-field-collection",
        dryRun: false,
      });
      // retrieve original post from Payload
      const resultEn = await payload.findByID({
        collection: "nested-field-collection",
        id: `${post.id}`,
        locale: "en",
      });
      expect(resultEn["layout"]).toEqual([
        {
          textField:
            "Text field content in block at layout index 0",
          textareaField:
            "Textarea field content in block at layout index 0",
          id: blockIds[0],
          blockType: "basicBlock",
        },
        {
          textField:
            "Text field content in block at layout index 1",
          textareaField:
            "Textarea field content in block at layout index 1",
          id: blockIds[1],
          blockType: "basicBlockNonLocalized",
        },
        {
          textField:
            "Text field content in block at layout index 2",
          textareaField:
            "Textarea field content in block at layout index 2",
          id: blockIds[2],
          blockType: "basicBlock",
        },
      ]);
      // retrieve translated post from Payload
      const resultFr = await payload.findByID({
        collection: "nested-field-collection",
        id: `${post.id}`,
        locale: "fr_FR",
      });
      expect(resultFr["layout"]).toEqual([
        {
          textField:
            "Contenu du champ de texte dans le bloc à l'index de mise en page 0",
          textareaField:
            "Contenu du champ Textarea dans le bloc à l'index de mise en page 0",
          id: blockIds[0],
          blockType: "basicBlock",
        },
        {
          textField:
            "Text field content in block at layout index 1",
          textareaField:
            "Textarea field content in block at layout index 1",
          id: blockIds[1],
          blockType: "basicBlockNonLocalized",
        },
        {
          textField:
            "Contenu du champ de texte dans le bloc à l'index de mise en page 2",
          textareaField:
            "Contenu du champ Textarea dans le bloc à l'index de mise en page 2",
          id: blockIds[2],
          blockType: "basicBlock",
        },
      ]);
    });

    it("updates a Payload article with a *blocks* field translation retrieved from Crowdin and detects no change on the next update attempt", async () => {
      const post = await payload.create({
        collection: "nested-field-collection",
        data: payloadCreateData as any,
      });
      // we need the ids created by Payload to update the blocks
      const blockIds = (post["layout"] instanceof Array ? post["layout"].map((block: any) => block.id) : []) as string[];
      const blockTypes = post["layout"] instanceof Array ? post["layout"].map((block: any) => block.blockType) : [];
      const responseDe = {
        layout: {
          [blockIds[0]]: {
            [blockTypes[0]]: {
              textField: "Textfeldinhalt im Block bei Layoutindex 0",
              textareaField:
                "Textbereichsfeldinhalt im Block bei Layoutindex 0",
            },
          },
          [blockIds[1]]: {
            [blockTypes[1]]: {
              textField: "Textfeldinhalt im Block bei Layoutindex 1",
              textareaField:
                "Textbereichsfeldinhalt im Block bei Layoutindex 1",
            },
          },
        },
      };
      const responseFr = {
        layout: {
          [blockIds[0]]: {
            [blockTypes[0]]: {
              textField:
                "Contenu du champ de texte dans le bloc à l'index de mise en page 0",
              textareaField:
                "Contenu du champ Textarea dans le bloc à l'index de mise en page 0",
            },
          },
          [blockIds[1]]: {
            [blockTypes[1]]: {
              textField:
                "Contenu du champ de texte dans le bloc à l'index de mise en page 1",
              textareaField:
                "Contenu du champ Textarea dans le bloc à l'index de mise en page 1",
            },
          },
        },
      };
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        pluginOptions,
        payload
      );
      nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de"
        )
        .reply(200, responseDe)
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr"
        )
        .reply(200, responseFr);
      await translationsApi.updateTranslation({
        documentId: `${post.id}`,
        collection: "nested-field-collection",
        dryRun: false,
      });
      // retrieve translated post from Payload
      const resultDe = await payload.findByID({
        collection: "nested-field-collection",
        id: `${post.id}`,
        locale: "de_DE",
      });
      expect(resultDe["layout"]).toEqual([
        {
          textField: "Textfeldinhalt im Block bei Layoutindex 0",
          textareaField: "Textbereichsfeldinhalt im Block bei Layoutindex 0",
          id: blockIds[0],
          blockType: "basicBlock",
        },
        {
          textField: "Textfeldinhalt im Block bei Layoutindex 1",
          textareaField: "Textbereichsfeldinhalt im Block bei Layoutindex 1",
          id: blockIds[1],
          blockType: "basicBlock",
        },
      ]);
      // retrieve translated post from Payload
      const resultFr = await payload.findByID({
        collection: "nested-field-collection",
        id: `${post.id}`,
        locale: "fr_FR",
      });
      expect(resultFr["layout"]).toEqual([
        {
          textField:
            "Contenu du champ de texte dans le bloc à l'index de mise en page 0",
          textareaField:
            "Contenu du champ Textarea dans le bloc à l'index de mise en page 0",
          id: blockIds[0],
          blockType: "basicBlock",
        },
        {
          textField:
            "Contenu du champ de texte dans le bloc à l'index de mise en page 1",
          textareaField:
            "Contenu du champ Textarea dans le bloc à l'index de mise en page 1",
          id: blockIds[1],
          blockType: "basicBlock",
        },
      ]);
      nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de"
        )
        .reply(200, responseDe)
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr"
        )
        .reply(200, responseFr);
      const nextTranslation = await translationsApi.updateTranslation({
        documentId: `${post.id}`,
        collection: "nested-field-collection",
        dryRun: false,
      });
      expect(nextTranslation.translations["de_DE"].changed).toBe(false);
      expect(nextTranslation.translations["fr_FR"].changed).toBe(false);
    });

    it("updates a Payload article with *blocks* rich text translations retrieved from Crowdin", async () => {
      const post = await payload.create({
        collection: "nested-field-collection",
        data: payloadCreateBlocksRichTextData as any,
      });
      // we need the ids created by Payload to update the blocks
      const blockIds = (post["layout"] instanceof Array ? post["layout"].map((block) => block.id) : []) as string[];
      const responseDeOne =
        "<p>Rich-Text-Inhalt im Blocklayout bei Index 0.</p>";
      const responseDeTwo =
        "<p>Rich-Text-Inhalt im Blocklayout bei Index 1.</p>";
      const responseFrOne =
        "<p>Contenu de texte enrichi dans la disposition des blocs à l'index 0.</p>";
      const responseFrTwo =
        "<p>Contenu de texte enrichi dans la disposition des blocs à l'index 1.</p>";
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        pluginOptions,
        payload
      );
      nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de"
        )
        .reply(200, responseDeTwo)
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de"
        )
        .reply(200, responseDeOne)
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr"
        )
        .reply(200, responseFrTwo)
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr"
        )
        .reply(200, responseFrOne);
      await translationsApi.updateTranslation({
        documentId: `${post.id}`,
        collection: "nested-field-collection",
        dryRun: false,
      });
      // run again - hacky way to wait for all files.
      await payload.findByID({
        collection: "nested-field-collection",
        id: `${post.id}`,
        locale: "de_DE",
      });
      // run again - hacky way to wait for all files.
      await payload.findByID({
        collection: "nested-field-collection",
        id: `${post.id}`,
        locale: "de_DE",
      });
      // retrieve translated post from Payload
      const resultDe = await payload.findByID({
        collection: "nested-field-collection",
        id: `${post.id}`,
        locale: "de_DE",
      });
      expect(resultDe["layout"]).toEqual([
        {
          richTextField: [
            {
              children: [
                {
                  text: "Rich-Text-Inhalt im Blocklayout bei Index 0.",
                },
              ],
              type: "p",
            },
          ],
          id: blockIds[0],
          blockType: "basicBlockRichText",
        },
        {
          richTextField: [
            {
              children: [
                {
                  text: "Rich-Text-Inhalt im Blocklayout bei Index 1.",
                },
              ],
              type: "p",
            },
          ],
          id: blockIds[1],
          blockType: "basicBlockRichText",
        },
      ]);
      // run again - hacky way to wait for all files.
      await payload.findByID({
        collection: "nested-field-collection",
        id: `${post.id}`,
        locale: "fr_FR",
      });
      // run again - hacky way to wait for all files.
      await payload.findByID({
        collection: "nested-field-collection",
        id: `${post.id}`,
        locale: "fr_FR",
      });
      // retrieve translated post from Payload
      const resultFr = await payload.findByID({
        collection: "nested-field-collection",
        id: `${post.id}`,
        locale: "fr_FR",
      });
      expect(resultFr["layout"]).toEqual([
        {
          richTextField: [
            {
              children: [
                {
                  text: "Contenu de texte enrichi dans la disposition des blocs à l'index 0.",
                },
              ],
              type: "p",
            },
          ],
          id: blockIds[0],
          blockType: "basicBlockRichText",
        },
        {
          richTextField: [
            {
              children: [
                {
                  text: "Contenu de texte enrichi dans la disposition des blocs à l'index 1.",
                },
              ],
              type: "p",
            },
          ],
          id: blockIds[1],
          blockType: "basicBlockRichText",
        },
      ]);
    });
  });

  describe('fn: getHtmlFieldSlugs', () => {
    /**
     * If Payload queries are not written correctly,
     * we may end up with the default limit of 10.
     */
    it("retrieves all HTML field slugs", async () => {
      const slug = "multi-rich-text"

      const data = multiRichTextFields.filter(field => field.type === 'richText').reduce((accum: {[key: string]: any}, field) => {
        accum[field?.name] = [
          {
            children: [
              {
                text: `Rich text content for ${field.name}.`,
              },
            ],
          },
        ];
        return accum;
      }, {});
      const post = await payload.create({
        collection: slug,
        data,
      });
      // ensure all afterChange hooks have run? Getting test failures without this additional operation.
      await payload.findByID({
        collection: slug,
        id: `${post.id}`,
      });
      // Try to enforce a little more waiting for all files to have been created.
      const result = await payload.findByID({
        collection: slug,
        id: `${post.id}`,
      });
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        pluginOptions,
        payload
      );
      const htmlFieldSlugs = await translationsApi.getHtmlFieldSlugs(`${result.id}`);
      expect(htmlFieldSlugs.length).toEqual(11)
      expect(htmlFieldSlugs.sort()).toEqual([
          "field_0",
          "field_1",
          "field_10",
          "field_2",
          "field_3",
          "field_4",
          "field_5",
          "field_6",
          "field_7",
          "field_8",
          "field_9",
        ]);
    });
  })
});
