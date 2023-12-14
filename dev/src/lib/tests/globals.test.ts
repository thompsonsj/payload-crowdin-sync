import payload from "payload";
import { initPayloadTest } from "./helpers/config";
import { connectionTimeout } from "./config";
import { CrowdinArticleDirectory } from "../payload-types"

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
    await initPayloadTest({ __dirname });
    await new Promise(resolve => setTimeout(resolve, connectionTimeout));
  });

  afterAll(async () => {
    if (typeof payload?.db?.destroy === 'function') {
      await payload.db.destroy(payload)
      // setTimeout(async () => {await payload.db.destroy(payload)}, connectionTimeout)
    }
  });

  describe("Non-localized globals", () => {
    it("does not create an article directory", async () => {
      await payload.updateGlobal({
        slug: "nav",
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      const result = await payload.findGlobal({
        slug: "nav",
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeDefined();
    });
  });

  describe("crowdin-article-directories", () => {
    it("creates an article directory", async () => {
      await payload.updateGlobal({
        slug: "localized-nav",
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      // retrieve post to get populated fields
      const result = await payload.findGlobal({
        slug: "localized-nav",
      });
      const crowdinArticleDirectoryId = (result["crowdinArticleDirectory"] as CrowdinArticleDirectory)?.id;
      expect(crowdinArticleDirectoryId).toBeDefined();
    });

    it("creates only one article directory", async () => {
       await payload.updateGlobal({
        slug: "localized-nav",
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      // retrieve post to get populated fields
      const globalRefreshed = await payload.findGlobal({
        slug: "localized-nav",
      });
      const crowdinArticleDirectoryId =
        (globalRefreshed["crowdinArticleDirectory"] as CrowdinArticleDirectory)?.id;
      await payload.updateGlobal({
        slug: "localized-nav",
        data: { items: [
            {
              label: "Nav item 1"
            },
            {
              label: "Nav item 2"
            },
          ]
        },
      });
      // retrieve post to get populated fields
      const updatedGlobalRefreshed =  await payload.findGlobal({
        slug: "localized-nav",
      });
      expect((updatedGlobalRefreshed["crowdinArticleDirectory"] as CrowdinArticleDirectory)?.id).toEqual(
        crowdinArticleDirectoryId
      );
    });
  });
});
