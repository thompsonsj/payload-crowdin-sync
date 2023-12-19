import payload from "payload";
import { initPayloadTest } from "./../../helpers/config";
import {
  getFilesByDocumentID,
} from "payload-crowdin-sync";
import { connectionTimeout } from "./../../config";
import { CrowdinArticleDirectory, CrowdinCollectionDirectory, CrowdinFile } from "../../../payload-types";
import nock from "nock";

/**
 * Test virtual fields
 *
 * Virtual fields are added to localized documents
 * and are used to indicate that translations should
 * be retrieved on:
 * 
 * save; or
 * save draft/publish. 
 * 
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

describe("Virtual fields", () => {
  beforeAll(async () => {
    await initPayloadTest({
      __dirname,
      payloadConfigFile: "./../../payload.config.default.ts"
    });
    await new Promise(resolve => setTimeout(resolve, connectionTimeout));
  });

  afterAll(async () => {
    if (typeof payload?.db?.destroy === 'function') {
      await payload.db.destroy(payload)
      // setTimeout(async () => {await payload.db.destroy(payload)}, connectionTimeout)
    }
  });

  describe("No database storage", () => {
    it("does not store syncTranslations", async () => {
      nock('https://api.crowdin.com')
        .persist()
        .get(/.*/)
        .reply(200)
        .post(/.*/)
        .reply(200)
      const post = await payload.create({
        collection: "localized-posts",
        data: { 
          title: "Test post",
          syncTranslations: true,
        },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: "localized-posts",
        id: post.id,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'syncTranslations')).toBeFalsy();
    });

    it("does not store syncAllTranslations", async () => {
      nock('https://api.crowdin.com')
        .persist()
        .get(/.*/)
        .reply(200)
        .post(/.*/)
        .reply(200)
      const post = await payload.create({
        collection: "localized-posts",
        data: { 
          title: "Test post",
          syncAllTranslations: true,
        },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: "localized-posts",
        id: post.id,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'syncAllTranslations')).toBeFalsy();
    });
  });
});
