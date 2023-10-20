import mongoose from "mongoose";
import payload from "payload";
import { initPayloadTest } from "./helpers/config";
import { multiRichTextFields } from "../collections/fields/multiRichTextFields";

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

const collections = {
  nonLocalized: "posts",
  localized: "multi-rich-text",
  localizedButDisabled: "localized-posts",
};

describe("Collections - collections option", () => {
  beforeAll(async () => {
    await initPayloadTest({ __dirname, payloadConfigFile: 'payload.config.collections-option.ts' });
    setTimeout(() => true, 1500);
  });

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      setTimeout(async () => {await payload.db.destroy(payload)}, 1500)
    }
  });

  describe("Non-localized collections", () => {
    it("does not create an article directory for a collection with no localized fields", async () => {
      const post = await payload.create({
        collection: collections.nonLocalized,
        data: { title: "Test post" },
      });
      const result = await payload.findByID({
        collection: collections.nonLocalized,
        id: post.id,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id;
      expect(crowdinArticleDirectoryId).toBeUndefined();
    });

    it("does not create an article directory for a collection with localized fields that is not present in a defined array in the collections option", async () => {
      const post = await payload.create({
        collection: collections.localizedButDisabled,
        data: { title: "Test post" },
      });
      const result = await payload.findByID({
        collection: collections.localizedButDisabled,
        id: post.id,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id;
      expect(crowdinArticleDirectoryId).toBeUndefined();
    });
  });

  describe("Localized collections", () => {
    it("creates an article directory", async () => {
      const data = multiRichTextFields.filter(field => field.type === 'richText').reduce((accum: {[key: string]: any}, field) => {
        accum[field.name] = [
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
        collection: collections.localized,
        data,
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: collections.localized,
        id: post.id,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id;
      expect(crowdinArticleDirectoryId).toBeDefined();
    });
  });
});