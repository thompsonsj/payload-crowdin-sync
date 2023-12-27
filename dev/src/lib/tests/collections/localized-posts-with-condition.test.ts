import payload from "payload";
import { initPayloadTest } from "../helpers/config";
import { connectionTimeout } from "../config";

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

  describe("publish: respects a condition set in the plugin config", () => {
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

    it("creates an article directory if the conditon is met on an existing article", async () => {
      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: { title: "Test post" },
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
      await payload.update({
        id: post.id,
        collection: "localized-posts-with-condition",
        data: {
          title: "Test post updated",
          translateWithCrowdin: true,
        }
      })
      // refresh
      const updatedPost = await payload.findByID({
        id: post.id,
        collection: "localized-posts-with-condition",
      })
      expect(Object.prototype.hasOwnProperty.call(updatedPost, 'crowdinArticleDirectory')).toBeTruthy();
    });
  });

  describe("draft: respects a condition set in the plugin config", () => {
    it("does not create an article directory if the conditon is not met", async () => {
      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: { title: "Test post" },
        draft: true,
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
        draft: true,
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
        draft: true,
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
        draft: true,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeTruthy();
    });

    it("creates an article directory if the conditon is met on an existing article", async () => {
      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: { title: "Test post" },
        draft: true,
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
        draft: true,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
      await payload.update({
        id: post.id,
        collection: "localized-posts-with-condition",
        data: {
          title: "Test post updated",
          translateWithCrowdin: true,
        },
        draft: true,
      })
      // refresh
      const updatedPost = await payload.findByID({
        id: post.id,
        collection: "localized-posts-with-condition",
        draft: true,
      })
      expect(Object.prototype.hasOwnProperty.call(updatedPost, 'crowdinArticleDirectory')).toBeTruthy();
    });
  });

  describe("draft, different locales: respects a condition set in the plugin config", () => {
    it("does not create an article directory if the conditon is not met", async () => {
      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: { title: "Poste de test" },
        draft: true,
        locale: "fr_FR",
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
        draft: true,
        locale: "fr_FR",
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });

    it("does not creates an article directory if the conditon is met in a non-source locale", async () => {
      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: {
          title: "Poste de test",
          translateWithCrowdin: true,
        },
        draft: true,
        locale: "fr_FR",
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
        draft: true,
        locale: "fr_FR",
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });

    it("creates an article directory if the conditon is met on an existing article", async () => {
      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: { title: "Poste de test" },
        draft: true,
        locale: "fr_FR",
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
        draft: true,
        locale: "fr_FR",
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
      await payload.update({
        id: post.id,
        collection: "localized-posts-with-condition",
        data: {
          title: "Test post",
          translateWithCrowdin: true,
        },
        draft: true,
      })
      // refresh
      const updatedPost = await payload.findByID({
        id: post.id,
        collection: "localized-posts-with-condition",
        draft: true,
      })
      expect(Object.prototype.hasOwnProperty.call(updatedPost, 'crowdinArticleDirectory')).toBeTruthy();
    });
  });
});
