import payload from "payload";
import { initPayloadTest } from "../helpers/config";
import {
  getFilesByDocumentID,
} from "payload-crowdin-sync";
import { connectionTimeout } from "../config";
import { CrowdinArticleDirectory, CrowdinCollectionDirectory, CrowdinFile } from "../../payload-types";

/**
 * Test the collections
 *
 * Ensure plugin collections are created and
 * behave as expected.
 *
 * Collections to test:
 *
 * - crowdin-article-directories
 * - crowdin-files
 * - crowdin-collection-directories
 *
 * Terminology:
 *
 * - article directory: Crowdin Article Directory
 * - collection directory: Crowdin Collection Directory
 * - file: Crowdin File
 */

describe("Collection: Localized Posts With Conditon", () => {
  beforeAll(async () => {
    await initPayloadTest({
      __dirname,
      payloadConfigFile: "./../payload.config.default.ts"
    });
    await new Promise(resolve => setTimeout(resolve, connectionTimeout));
  });

  afterAll(async () => {
    if (typeof payload?.db?.destroy === 'function') {
      await payload.db.destroy(payload)
      // setTimeout(async () => {await payload.db.destroy(payload)}, connectionTimeout)
    }
  });

  describe("Respects a condition set in the plugin config", () => {
    it("does not create an article directory if the conditon is not met", async () => {
      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: { title: "Test post" },
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });

    it("creates an article directory if the conditon is met", async () => {
      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: {
          title: "Test post",
          translateWithCrowdin: true,
        },
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeTruthy();
    });
  });
});
