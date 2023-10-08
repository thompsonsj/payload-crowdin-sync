import mongoose from "mongoose";
import payload from "payload";
import { initPayloadTest } from "./helpers/config";
import {
  getFilesByDocumentID,
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

const collections = {
  nonLocalized: "posts",
  localized: "localized-posts",
};

describe("Collections", () => {
  beforeAll(async () => {
    await initPayloadTest({ __dirname });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await payload.mongoMemoryServer.stop();
  });

  describe("Non-localized collections", () => {
    it("does not create an article directory", async () => {
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
  });

  describe("crowdin-article-directories", () => {
    it("creates an article directory", async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: "Test post" },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: collections.localized,
        id: post.id,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id;
      expect(crowdinArticleDirectoryId).toBeDefined();
    });

    it("creates only one article directory", async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: "Test post" },
      });
      // retrieve post to get populated fields
      const postRefreshed = await payload.findByID({
        collection: collections.localized,
        id: post.id,
      });
      const crowdinArticleDirectoryId =
        postRefreshed.crowdinArticleDirectory?.id;
      const updatedPost = await payload.update({
        id: post.id,
        collection: collections.localized,
        data: { title: "Updated test post" },
      });
      // retrieve post to get populated fields
      const updatedPostRefreshed = await payload.findByID({
        collection: collections.localized,
        id: updatedPost.id,
      });
      expect(updatedPostRefreshed.crowdinArticleDirectory?.id).toEqual(
        crowdinArticleDirectoryId
      );
    });

    it("creates unique article directories for two articles created in the same collection", async () => {
      const postOne = await payload.create({
        collection: collections.localized,
        data: { title: "Test post 1" },
      });
      // retrieve post to get populated fields
      const postOneRefreshed = await payload.findByID({
        collection: collections.localized,
        id: postOne.id,
      });
      const postTwo = await payload.create({
        collection: collections.localized,
        data: { title: "Test post 2" },
      });
      // retrieve post to get populated fields
      const postTwoRefreshed = await payload.findByID({
        collection: collections.localized,
        id: postTwo.id,
      });
      expect(postOneRefreshed.crowdinArticleDirectory.id).not.toEqual(
        postTwoRefreshed.crowdinArticleDirectory.id
      );
    });
  });

  describe("crowdin-files", () => {
    it('creates a "fields" Crowdin file to include the title field', async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: "Test post" },
      });
      const crowdinFiles = await getFilesByDocumentID(post.id, payload as any);
      expect(crowdinFiles.length).toEqual(1);
      const file = crowdinFiles.find((doc) => doc.field === "fields");
      expect(file).not.toEqual(undefined);
      expect(file?.type).toEqual("json");
    });

    it('does not create a "fields" Crowdin file if all fields are empty strings', async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: "" },
      });
      const crowdinFiles = await getFilesByDocumentID(post.id, payload as any);
      expect(crowdinFiles.length).toEqual(0);
    });

    const fieldsAndContentTestName =
      "creates a `fields` file to include the title field and a `content` file for the content richText field";
    it(`${fieldsAndContentTestName}`, async () => {
      const post = await payload.create({
        collection: collections.localized,
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
      const crowdinFiles = await getFilesByDocumentID(post.id, payload as any);
      expect(crowdinFiles.length).toEqual(2);
      const fields = crowdinFiles.find((doc) => doc.field === "fields");
      const content = crowdinFiles.find((doc) => doc.field === "content");
      expect(fields).not.toEqual(undefined);
      expect(fields?.type).toEqual("json");
      expect(content).not.toEqual(undefined);
      expect(content?.type).toEqual("html");
    });
  });

  describe("crowdin-collection-directories", () => {
    it("associates an article Directory with a collection directory", async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: "Test post" },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: collections.localized,
        id: post.id,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id;
      expect(crowdinArticleDirectoryId).toBeDefined();
      expect(
        result.crowdinArticleDirectory.crowdinCollectionDirectory.name
      ).toEqual(collections.localized);
    });

    it("uses the same collection directory for two articles created in the same collection", async () => {
      const postOne = await payload.create({
        collection: collections.localized,
        data: { title: "Test post 1" },
      });
      // retrieve post to get populated fields
      const postOneRefreshed = await payload.findByID({
        collection: collections.localized,
        id: postOne.id,
      });
      const postTwo = await payload.create({
        collection: collections.localized,
        data: { title: "Test post 2" },
      });
      // retrieve post to get populated fields
      const postTwoRefreshed = await payload.findByID({
        collection: collections.localized,
        id: postTwo.id,
      });
      expect(
        postOneRefreshed.crowdinArticleDirectory.crowdinCollectionDirectory
      ).toEqual(
        postTwoRefreshed.crowdinArticleDirectory.crowdinCollectionDirectory
      );
    });
  });
});
