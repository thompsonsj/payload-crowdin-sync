import { payloadCrowdinSyncTranslationsApi } from "payload-crowdin-sync";
import nock from "nock";
import { mockCrowdinClient } from "payload-crowdin-sync";
import { pluginConfig } from "../../helpers/plugin-config"

import { fixture, fixtureHtml } from "./__fixtures__/lexical-richtext-formatting.fixture";
import { fixture as fixtureDe } from "./__fixtures__/lexical-table-expected-de.fixture";
import { fixture as fixtureFr, fixtureHtml as fixtureHtmlFr } from "./__fixtures__/lexical-richtext-formatting.expected-fr";

import { initPayloadInt } from '../../helpers/initPayloadInt'
import type { Payload } from 'payload'
import { CrowdinArticleDirectory } from "@/payload-types";

let payload: Payload

/**
 * Test translations
 *
 * Ensure translations are retrieved, compared, and
 * stored as expected.
 */

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

/**
 * payload.config.custom-serializers.ts required for htmlToSlate.
 * 
 * Plugin options passed directly to payloadCrowdinSyncTranslationsApi - this API is initialized through `server.ts` at the moment. Can change this in the future to use internal functions.
 */
describe("Translations", () => {
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

  describe("fn: updateTranslation - custom serializer", () => {
    it("updates a Payload article with a `richText` field translation retrieved from Crowdin restoring table structure", async () => {
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
        .reply(200, "<div class=\"lexical-table-container\"><table class=\"lexical-table\" style=\"border-collapse: collapse;\"><tr class=\"lexical-table-row\"><th class=\"lexical-table-cell lexical-table-cell-header-1\">Text für Überschriftenzelle 1</th><th class=\"lexical-table-cell lexical-table-cell-header-1\">Text für Überschriftenzelle 2</th><th class=\"lexical-table-cell lexical-table-cell-header-1\">Text für Überschriftenzelle 3</th><th class=\"lexical-table-cell lexical-table-cell-header-1\">Text für Überschriftenzelle 4</th></tr class=\"lexical-table-row\"><tr><td class=\"lexical-table-cell lexical-table-cell-header-0\">Text für Tabellenzelle, Zeile 1, Spalte 1</td><td class=\"lexical-table-cell lexical-table-cell-header-0\">Text für Tabellenzelle, Zeile 1, Spalte 2</td><td class=\"lexical-table-cell lexical-table-cell-header-0\">Text für Tabellenzelle, Zeile 1, Spalte 3</td><td class=\"lexical-table-cell lexical-table-cell-header-0\"><p>Absatz 1-Text für Tabellenzelle, Zeile 1, Spalte 4</p><p>Absatz 2-Text für Tabellenzelle, Zeile 1, Spalte 4</p></td></tr></table></div>",
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
        .reply(200, fixtureHtmlFr,
        );
      const create = await payload.create({
        collection: "policies",
        data: {
          content: fixture,
        },
      });
      // Crowdin file
      const post = await payload.findByID({
        collection: "policies",
        id: create.id,
      })
      const file = await payload.find({
        collection: "crowdin-files",
        where: {
          crowdinArticleDirectory: {
            equals: (post.crowdinArticleDirectory as CrowdinArticleDirectory)?.id
          },
          title: {
            equals: "content"
          }
        }
      })
      const regexp = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/g;
      regexp.lastIndex = 1;
      const str = file.docs[0].fileData?.html || ``;
      const uuids = Array.from(str.matchAll(regexp), (m) => m[0]);
      let fixtureHtmlWithUuids = fixtureHtml
      uuids.forEach((uuid, index) => {
        fixtureHtmlWithUuids = fixtureHtmlWithUuids.replace(`<uuid[${index}]>`, uuid)
      })
      expect(file.docs[0].fileData?.html).toEqual(fixtureHtmlWithUuids);
      const translationsApi = new payloadCrowdinSyncTranslationsApi(
        pluginOptions,
        payload,
      );
      await translationsApi.updateTranslation({
        documentId: `${post.id}`,
        collection: "policies",
        dryRun: false,
      });
      // retrieve translated post from Payload
      const result = await payload.findByID({
        collection: "policies",
        id: post.id,
        locale: "de_DE",
      }); 

      expect(result["content"]).toEqual(fixtureDe);
      const frResult = await payload.findByID({
        collection: "policies",
        id: post.id,
        locale: "fr_FR",
      });
      
      expect(frResult["content"]).toEqual(fixtureFr);
    });
  });
});
