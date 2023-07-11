import mongoose from 'mongoose';
import payload from "payload";
import { initPayloadTest } from "./helpers/config";
import { payloadCrowdInSyncTranslationsApi } from "../../../dist/api/payload-crowdin-sync/translations";
import nock from "nock";
import { payloadCreateData } from './fixtures/nested-field-collection/simple-blocks.fixture';

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
  token: process.env.CROWDIN_TOKEN,
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
    await initPayloadTest({ __dirname });
  });

  afterEach(async () => {
    nock.cleanAll()
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await payload.mongoMemoryServer.stop();
  });

  describe("fn: getTranslation", () => {
    
    it("retrieves a translation from CrowdIn", async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: "Test post" },
      });
      const translationsApi = new payloadCrowdInSyncTranslationsApi(
        pluginOptions,
        payload,
      );
      const scope = nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de",
        )
        .reply(200, {
          title: "Testbeitrag",
        })
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr",
        )
        .reply(200, {
          title: "Poste d'essai",
        });
      const translation = await translationsApi.getTranslation({
        documentId: post.id,
        fieldName: "fields",
        locale: "de_DE",
      });
      expect(translation).toEqual({
        title: "Testbeitrag",
      });
    });
  });

  describe("fn: updateTranslation", () => {
    it("updates a Payload article with a `text` field translation retrieved from CrowdIn", async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: "Test post" },
      });
      const translationsApi = new payloadCrowdInSyncTranslationsApi(
        pluginOptions,
        payload,
      );
      const scope = nock("https://api.crowdin.com")
        .get(
          `/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de`,
        )
        .reply(200, {
          title: "Testbeitrag",
        })
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr",
        )
        .reply(200, {
          title: "Poste d'essai",
        });
      const translation = await translationsApi.updateTranslation({
        documentId: post.id,
        collection: collections.localized,
        dryRun: false,
      });
      // retrieve translated post from Payload
      const result = await payload.findByID({
        collection: collections.localized,
        id: post.id,
        locale: "de_DE",
      });
      expect(result.title).toEqual("Testbeitrag");
    });
  

    it("updates a Payload article with a `richText` field translation retrieved from CrowdIn", async () => {
      const post = await payload.create({
        collection: collections.localized,
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
      const translationsApi = new payloadCrowdInSyncTranslationsApi(
        pluginOptions,
        payload,
      );
      const scope = nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de",
        )
        .reply(200, "<p>Testbeitrag</p>")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr",
        )
        .reply(200, {
          title: "Poste d'essai",
        });
      const translation = await translationsApi.updateTranslation({
        documentId: post.id,
        collection: collections.localized,
        dryRun: false,
      });
      // retrieve translated post from Payload
      const result = await payload.findByID({
        collection: collections.localized,
        id: post.id,
        locale: "de_DE",
      });
      expect(result.content).toEqual([
        {
          children: [{ text: "Testbeitrag" }],
          type: "p",
        },
      ]);
    });

    

    it("updates a Payload article with a *blocks* field translation retrieved from CrowdIn", async () => {
      const post = await payload.create({
        collection: collections.nestedFields,
        data: payloadCreateData
      });
      // we need the ids created by Payload to update the blocks
      const blockIds = post.layout.map((block) => block.id);
      const blockTypes = post.layout.map((block) => block.blockType);
      const responseDe = {
        layout: [
          {
            [blockIds[0]]: {
              [blockTypes[0]] :{
                textField: "Textfeldinhalt im Block bei Layoutindex 0",
                textareaField: "Textbereichsfeldinhalt im Block bei Layoutindex 0",
              },
            },
          },
          {
            [blockIds[1]]: {
              [blockTypes[1]] :{
                textField: "Textfeldinhalt im Block bei Layoutindex 1",
                textareaField: "Textbereichsfeldinhalt im Block bei Layoutindex 1",
              },
            },
          }
        ],
      };
      const responseFr = {
        layout: [
          {
            [blockIds[0]]: {
              [blockTypes[0]] :{
                textField: "Contenu du champ de texte dans le bloc à l'index de mise en page 0",
                textareaField: "Contenu du champ Textarea dans le bloc à l'index de mise en page 0",
              },
            },
          },
          {
            [blockIds[1]]: {
              [blockTypes[1]] :{
                textField: "Contenu du champ de texte dans le bloc à l'index de mise en page 1",
                textareaField: "Contenu du champ Textarea dans le bloc à l'index de mise en page 1",
              },
            },
          }
        ],
      };
      const translationsApi = new payloadCrowdInSyncTranslationsApi(
        pluginOptions,
        payload,
      );
      const scope = nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de",
        )
        .reply(200, responseDe)
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr",
        )
        .reply(200, responseFr);
      const translation = await translationsApi.updateTranslation({
        documentId: post.id,
        collection: collections.nestedFields,
        dryRun: false,
      });
      // console.log(translation, translation.translations._DE.latestTranslations);
      // retrieve translated post from Payload
      const resultDe = await payload.findByID({
        collection: collections.nestedFields,
        id: post.id,
        locale: "de_DE",
      });
      expect(resultDe.layout).toEqual([
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
        ],
      );
      // retrieve translated post from Payload
      const resultFr = await payload.findByID({
        collection: collections.nestedFields,
        id: post.id,
        locale: "fr_FR",
      });
      expect(resultFr.layout).toEqual([
          {
            textField: "Contenu du champ de texte dans le bloc à l'index de mise en page 0",
            textareaField: "Contenu du champ Textarea dans le bloc à l'index de mise en page 0",
            id: blockIds[0],
            blockType: "basicBlock",
          },
          {
            textField: "Contenu du champ de texte dans le bloc à l'index de mise en page 1",
            textareaField: "Contenu du champ Textarea dans le bloc à l'index de mise en page 1",
            id: blockIds[1],
            blockType: "basicBlock",
          },
        ],
      );
    });

    it("updates a Payload article with a *blocks* field translation retrieved from CrowdIn and detects no change on the next update attempt", async () => {
      const post = await payload.create({
        collection: collections.nestedFields,
        data: payloadCreateData
      });
      // we need the ids created by Payload to update the blocks
      const blockIds = post.layout.map((block) => block.id);
      const blockTypes = post.layout.map((block) => block.blockType);
      const responseDe = {
        layout: [
          {
            [blockIds[0]]: {
              [blockTypes[0]] :{
                textField: "Textfeldinhalt im Block bei Layoutindex 0",
                textareaField: "Textbereichsfeldinhalt im Block bei Layoutindex 0",
              },
            },
          },
          {
            [blockIds[1]]: {
              [blockTypes[1]] :{
                textField: "Textfeldinhalt im Block bei Layoutindex 1",
                textareaField: "Textbereichsfeldinhalt im Block bei Layoutindex 1",
              },
            },
          }
        ],
      };
      const responseFr = {
        layout: [
          {
            [blockIds[0]]: {
              [blockTypes[0]] :{
                textField: "Contenu du champ de texte dans le bloc à l'index de mise en page 0",
                textareaField: "Contenu du champ Textarea dans le bloc à l'index de mise en page 0",
              },
            },
          },
          {
            [blockIds[1]]: {
              [blockTypes[1]] :{
                textField: "Contenu du champ de texte dans le bloc à l'index de mise en page 1",
                textareaField: "Contenu du champ Textarea dans le bloc à l'index de mise en page 1",
              },
            },
          }
        ],
      };
      const translationsApi = new payloadCrowdInSyncTranslationsApi(
        pluginOptions,
        payload,
      );
      const scope = nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de",
        )
        .reply(200, responseDe)
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr",
        )
        .reply(200, responseFr);
      const translation = await translationsApi.updateTranslation({
        documentId: post.id,
        collection: collections.nestedFields,
        dryRun: false,
      });
      // console.log(translation, translation.translations._DE.latestTranslations);
      // retrieve translated post from Payload
      const resultDe = await payload.findByID({
        collection: collections.nestedFields,
        id: post.id,
        locale: "de_DE",
      });
      expect(resultDe.layout).toEqual([
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
        ],
      );
      // retrieve translated post from Payload
      const resultFr = await payload.findByID({
        collection: collections.nestedFields,
        id: post.id,
        locale: "fr_FR",
      });
      expect(resultFr.layout).toEqual([
          {
            textField: "Contenu du champ de texte dans le bloc à l'index de mise en page 0",
            textareaField: "Contenu du champ Textarea dans le bloc à l'index de mise en page 0",
            id: blockIds[0],
            blockType: "basicBlock",
          },
          {
            textField: "Contenu du champ de texte dans le bloc à l'index de mise en page 1",
            textareaField: "Contenu du champ Textarea dans le bloc à l'index de mise en page 1",
            id: blockIds[1],
            blockType: "basicBlock",
          },
        ],
      );
      const nextScope = nock("https://api.crowdin.com")
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=de",
        )
        .reply(200, responseDe)
        .get(
          "/api/v2/projects/1/translations/builds/1/download?targetLanguageId=fr",
        )
        .reply(200, responseFr);
      const nextTranslation = await translationsApi.updateTranslation({
        documentId: post.id,
        collection: collections.nestedFields,
        dryRun: false,
      });
      expect(nextTranslation.translations['de_DE'].changed).toBe(false)
      expect(nextTranslation.translations['fr_FR'].changed).toBe(false)
    });
  });
});
