import payload from "payload";
import { initPayloadTest } from "./helpers/config";
import {
  getFilesByDocumentID,
} from "payload-crowdin-sync";
import { connectionTimeout } from "./config";
import { CrowdinArticleDirectory, CrowdinCollectionDirectory, CrowdinFile } from "../payload-types";

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

describe("Collections", () => {
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

  describe("Non-localized collections", () => {
    it("does not create an article directory", async () => {
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
  });

  describe("crowdin-article-directories", () => {
    it("creates an article directory", async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: "localized-posts",
        id: post.id,
      });
      const crowdinArticleDirectoryId = (result.crowdinArticleDirectory as CrowdinArticleDirectory)?.id;
      expect(crowdinArticleDirectoryId).toBeDefined();
    });

    it("creates only one article directory", async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      // retrieve post to get populated fields
      const postRefreshed = await payload.findByID({
        collection: "localized-posts",
        id: post.id,
      });
      const crowdinArticleDirectoryId =
        (postRefreshed.crowdinArticleDirectory as CrowdinArticleDirectory)?.id;
      const updatedPost = await payload.update({
        id: post.id,
        collection: "localized-posts",
        data: { title: "Updated test post" },
      });
      // retrieve post to get populated fields
      const updatedPostRefreshed = await payload.findByID({
        collection: "localized-posts",
        id: updatedPost.id,
      });
      expect((updatedPostRefreshed.crowdinArticleDirectory as CrowdinArticleDirectory)?.id).toEqual(
        crowdinArticleDirectoryId
      );
    });

    it("creates unique article directories for two articles created in the same collection", async () => {
      const postOne = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post 1" },
      });
      // retrieve post to get populated fields
      const postOneRefreshed = await payload.findByID({
        collection: "localized-posts",
        id: postOne.id,
      });
      const postTwo = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post 2" },
      });
      // retrieve post to get populated fields
      const postTwoRefreshed = await payload.findByID({
        collection: "localized-posts",
        id: postTwo.id,
      });
      expect((postOneRefreshed.crowdinArticleDirectory as CrowdinArticleDirectory).id).not.toEqual(
        (postTwoRefreshed.crowdinArticleDirectory as CrowdinArticleDirectory).id
      );
    });
  });

  describe("crowdin-files", () => {
    it('creates a "fields" Crowdin file to include the title field', async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      const crowdinFiles = await getFilesByDocumentID(post.id, payload as any);
      expect(crowdinFiles.length).toEqual(1);
      const file = crowdinFiles.find((doc: CrowdinFile) => doc.field === "fields");
      expect(file).not.toEqual(undefined);
      expect(file?.type).toEqual("json");
    });

    it('does not create a "fields" Crowdin file if all fields are empty strings', async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "" },
      });
      const crowdinFiles = await getFilesByDocumentID(post.id, payload as any);
      expect(crowdinFiles.length).toEqual(0);
    });

    const fieldsAndContentTestName =
      "creates a `fields` file to include the title field and a `content` file for the content richText field";
    it(`${fieldsAndContentTestName}`, async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: {
          title: `${fieldsAndContentTestName}`,
          content: [
            {
              children: [
                {
                  text: `${fieldsAndContentTestName}`,
                },
              ],
            },
          ],
        },
      });
      // hacky way to wait for files to be created
      await payload.findByID({
        id: `${post.id}`,
        collection: "localized-posts"
      })
      const crowdinFiles = await getFilesByDocumentID(post.id, payload);
      expect(crowdinFiles.length).toEqual(2);
      const fields = crowdinFiles.find((doc: CrowdinFile) => doc.field === "fields");
      const content = crowdinFiles.find((doc: CrowdinFile) => doc.field === "content");
      expect(fields).not.toEqual(undefined);
      expect(fields?.type).toEqual("json");
      expect(content).not.toEqual(undefined);
      expect(content?.type).toEqual("html");
    });
  });

  describe("crowdin-collection-directories", () => {
    it("associates an article Directory with a collection directory", async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: "localized-posts",
        id: post.id,
      });
      const crowdinArticleDirectory = result.crowdinArticleDirectory as CrowdinArticleDirectory
      expect(crowdinArticleDirectory.id).toBeDefined();
      expect(
        (crowdinArticleDirectory.crowdinCollectionDirectory as CrowdinCollectionDirectory)?.name
      ).toEqual("localized-posts");
    });

    it("uses the same collection directory for two articles created in the same collection", async () => {
      const postOne = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post 1" },
      });
      // retrieve post to get populated fields
      const postOneRefreshed = await payload.findByID({
        collection: "localized-posts",
        id: postOne.id,
      });
      const postTwo = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post 2" },
      });
      // retrieve post to get populated fields
      const postTwoRefreshed = await payload.findByID({
        collection: "localized-posts",
        id: postTwo.id,
      });
      const crowdinArticleDirectoryOne = postOneRefreshed.crowdinArticleDirectory as CrowdinArticleDirectory
      const crowdinArticleDirectoryTwo = postTwoRefreshed.crowdinArticleDirectory as CrowdinArticleDirectory
      expect(
        crowdinArticleDirectoryOne.crowdinCollectionDirectory
      ).toEqual(
        crowdinArticleDirectoryTwo.crowdinCollectionDirectory
      );
    });
  });
});
