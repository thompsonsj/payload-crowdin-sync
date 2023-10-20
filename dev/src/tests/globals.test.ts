import mongoose from "mongoose";
import payload from "payload";
import { initPayloadTest } from "./helpers/config";
import {
  getFilesByDocumentID,
  getFileByDocumentID,
} from "../../../dist/api/helpers";

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

const globals = {
  nonLocalized: "nav",
  localized: "localized-nav",
};

describe("Globals", () => {
  beforeAll(async () => {
    await initPayloadTest({ __dirname });
    setTimeout(() => true, 3000);
  });

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      setTimeout(async () => {await payload.db.destroy(payload)}, 1500)
    }
  });

  describe("Non-localized globals", () => {
    it("does not create an article directory", async () => {
      const global = await payload.updateGlobal({
        slug: globals.nonLocalized,
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      const result = await payload.findGlobal({
        slug: globals.nonLocalized,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id;
      expect(crowdinArticleDirectoryId).toBeUndefined();
    });
  });

  describe("crowdin-article-directories", () => {
    it("creates an article directory", async () => {
      const global = await payload.updateGlobal({
        slug: globals.localized,
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      // retrieve post to get populated fields
      const result = await payload.findGlobal({
        slug: globals.localized,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id;
      expect(crowdinArticleDirectoryId).toBeDefined();
    });

    it("creates only one article directory", async () => {
      const global = await payload.updateGlobal({
        slug: globals.localized,
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      // retrieve post to get populated fields
      const globalRefreshed = await payload.findGlobal({
        slug: globals.nonLocalized,
      });
      const crowdinArticleDirectoryId =
        globalRefreshed.crowdinArticleDirectory?.id;
      const updatedGlobal = await payload.updateGlobal({
        slug: globals.localized,
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
        slug: globals.nonLocalized,
      });
      expect(updatedGlobalRefreshed.crowdinArticleDirectory?.id).toEqual(
        crowdinArticleDirectoryId
      );
    });
  });
});
