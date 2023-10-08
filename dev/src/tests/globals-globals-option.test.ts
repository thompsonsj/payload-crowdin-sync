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
  localized: "statistics",
  localizedButDisabled: "localized-nav",
};

describe("Globals", () => {
  beforeAll(async () => {
    await initPayloadTest({ __dirname, payloadConfigFile: 'payload.config.globals-option.ts' });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await payload.mongoMemoryServer.stop();
  });

  describe("Non-localized globals", () => {
    it("does not create an article directory for a global with no localized fields", async () => {
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

    it("does not create an article directory for a global with localized fields that is not present in a defined array in the globals option", async () => {
      const global = await payload.updateGlobal({
        slug: globals.localizedButDisabled,
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      const result = await payload.findGlobal({
        slug: globals.localizedButDisabled,
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
  });
});
