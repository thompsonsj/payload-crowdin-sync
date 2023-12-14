import payload from "payload";
import { initPayloadTest } from "./helpers/config";
import { connectionTimeout } from "./config";
import { CrowdinArticleDirectory } from "../payload-types";

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

describe("Globals", () => {
  beforeAll(async () => {
    await initPayloadTest({ __dirname, payloadConfigFile: 'payload.config.globals-option.ts' })
    await new Promise(resolve => setTimeout(resolve, connectionTimeout));
  });

  afterAll(async () => {
    if (typeof payload?.db?.destroy === 'function') {
      await payload.db.destroy(payload)
      /**
      setTimeout(async () => {await payload.db.destroy(payload)}, connectionTimeout)
      */
    }
  });

  describe("Non-localized globals", () => {
    it("does not create an article directory for a global with no localized fields", async () => {
      await payload.updateGlobal({
        slug: "nav",
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      const result = await payload.findGlobal({
        slug: "nav",
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });

    it("does not create an article directory for a global with localized fields that is not present in a defined array in the globals option", async () => {
      await payload.updateGlobal({
        slug: "localized-nav",
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      const result = await payload.findGlobal({
        slug: "localized-nav",
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });
  });

  describe("crowdin-article-directories", () => {
    it("creates an article directory", async () => {
      await payload.updateGlobal({
        slug: "statistics",
        data: { countries: { text: "Country stats"} },
      });
      // retrieve post to get populated fields
      const result = await payload.findGlobal({
        slug: "statistics",
      });
      const crowdinArticleDirectoryId = (result.crowdinArticleDirectory as CrowdinArticleDirectory)?.id;
      expect(crowdinArticleDirectoryId).toBeDefined();
    });
  });
});
