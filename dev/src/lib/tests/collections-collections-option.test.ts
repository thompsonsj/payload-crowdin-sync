import payload from "payload";
import { initPayloadTest } from "./helpers/config";
import { multiRichTextFields } from "../collections/fields/multiRichTextFields";
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

describe("Collections - collections option", () => {
  beforeAll(async () => {
    await initPayloadTest({ __dirname, payloadConfigFile: 'payload.config.collections-option.ts' });
    await new Promise(resolve => setTimeout(resolve, connectionTimeout))
  });

  afterAll(async () => {
    if (typeof payload?.db?.destroy === 'function') {
      await payload.db.destroy(payload)
      // setTimeout(async () => {await payload.db.destroy(payload)}, connectionTimeout)
    }
  });

  describe("Non-localized collections", () => {
    it("does not create an article directory for a collection with no localized fields", async () => {
      const post = await payload.create({
        collection: "posts",
        data: { title: "Test post" },
      });
      const result = await payload.findByID({
        collection: "posts",
        id: post.id,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });

    it("does not create an article directory for a collection with localized fields that is not present in a defined array in the collections option", async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      const result = await payload.findByID({
        collection: "localized-posts",
        id: post.id,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });
  });

  describe("Localized collections", () => {
    it("creates an article directory", async () => {
      const data = multiRichTextFields.slice(1, 3).filter(field => field.type === 'richText').reduce((accum: {[key: string]: any}, field) => {
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
        collection: "multi-rich-text",
        data,
      });
      // retrieve post to get populated fields
      await payload.findByID({
        collection: "multi-rich-text",
        id: post.id,
      });
      // run again - hacky way to wait for all files.
      const result = await payload.findByID({
        collection: "multi-rich-text",
        id: post.id,
      });
      const crowdinArticleDirectoryId = (result.crowdinArticleDirectory as CrowdinArticleDirectory)?.id;
      expect(crowdinArticleDirectoryId).toBeDefined();
    });
  });
});
