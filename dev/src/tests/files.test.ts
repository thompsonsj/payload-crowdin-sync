import mongoose from "mongoose";
import payload from "payload";
import { initPayloadTest } from "./helpers/config";
import {
  getFileByDocumentID,
  getFilesByDocumentID,
  getArticleDirectory,
} from "../../../dist/api/helpers";

/**
 * Test files
 *
 * Ensure that files are created for Crowdin as expected.
 *
 * Note: This test suite is not intended to test file contents.
 * This is the responsibility of buildCrowdinHtmlObject and
 * buildCrowdinJsonObject which are unit tested in `src/utilities`.
 */

const collections = {
  nonLocalized: "posts",
  localized: "localized-posts",
  nestedFields: "nested-field-collection",
};

describe(`Crowdin file create, update and delete`, () => {
  beforeAll(async () => {
    await initPayloadTest({ __dirname });
    setTimeout(() => true, 1500);
  });

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      setTimeout(async () => {await payload.db.destroy(payload)}, 1500)
    }
  });

  describe(`Collection: ${collections.localized}`, () => {
    it("updates the `fields` file for a new article", async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: "Test post" },
      });
      const file = await getFileByDocumentID("fields", post.id, payload as any);
      expect(file.fileData.json).toEqual({ title: "Test post" });
    });

    it("updates the `fields` file if a text field has changed", async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: "Test post" },
      });
      const file = await getFileByDocumentID("fields", post.id, payload as any);
      const updatedPost = await payload.update({
        id: post.id,
        collection: collections.localized,
        data: { title: "Test post updated" },
      });
      const updatedFile = await getFileByDocumentID("fields", post.id, payload as any);
      expect(file.updatedAt).not.toEqual(updatedFile.updatedAt);
      expect(updatedFile.fileData.json).toEqual({ title: "Test post updated" });
    });
  });

  describe(`Collection: ${collections.nestedFields}`, () => {
    it("does not create files for empty localized fields", async () => {
      const article = await payload.create({
        collection: collections.nestedFields,
        data: {},
      });

      const crowdinFiles = await getFilesByDocumentID(article.id, payload as any);
      expect(crowdinFiles.length).toEqual(0);
    });

    it("creates files containing fieldType content", async () => {
      const article = await payload.create({
        collection: collections.nestedFields,
        locale: "en",
        data: {
          textField: "Test title",
          richTextField: [
            {
              children: [
                {
                  text: "Test content",
                },
              ],
            },
          ],
          textareaField: "Test meta description",
        },
      });
      const crowdinFiles = await getFilesByDocumentID(article.id, payload as any);
      expect(crowdinFiles.length).toEqual(2);
      expect(
        crowdinFiles.find((file) => file.name === "richTextField.html")
      ).toBeDefined();
      expect(
        crowdinFiles.find((file) => file.name === "fields.json")
      ).toBeDefined();
    });

    it("creates files containing `array` fieldType content", async () => {
      const article = await payload.create({
        collection: collections.nestedFields,
        data: {
          arrayField: [
            {
              textField: "Test title 1",
              richTextField: [
                {
                  children: [
                    {
                      text: "Test content 1",
                    },
                  ],
                },
              ],
              textareaField: "Test meta description 1",
            },
            {
              textField: "Test title 2",
              richTextField: [
                {
                  children: [
                    {
                      text: "Test content 2",
                    },
                  ],
                },
              ],
              textareaField: "Test meta description 2",
            },
          ],
        },
      });
      const ids = article.arrayField.map((item: any) => item.id);
      const crowdinFiles = await getFilesByDocumentID(article.id, payload as any);
      expect(crowdinFiles.length).toEqual(3);
      expect(
        crowdinFiles.find(
          (file) => file.name === `arrayField.${ids[0]}.richTextField.html`
        )
      ).toBeDefined();
      expect(
        crowdinFiles.find(
          (file) => file.name === `arrayField.${ids[1]}.richTextField.html`
        )
      ).toBeDefined();
      expect(
        crowdinFiles.find((file) => file.name === "fields.json")
      ).toBeDefined();
    });

    it("creates files containing `blocks` fieldType content", async () => {
      const article = await payload.create({
        collection: collections.nestedFields,
        data: {
          layout: [
            {
              textField: "Test title 1",
              richTextField: [
                {
                  children: [
                    {
                      text: "Test content 1",
                    },
                  ],
                },
              ],
              textareaField: "Test meta description 1",
              blockType: "basicBlock",
            },
            {
              messages: [
                {
                  message: [
                    {
                      children: [
                        {
                          text: "Test content 1",
                        },
                      ],
                    },
                  ],
                  id: "64735620230d57bce946d370",
                },
                {
                  message: [
                    {
                      children: [
                        {
                          text: "Test content 1",
                        },
                      ],
                    },
                  ],
                  id: "64735621230d57bce946d371",
                },
              ],
              blockType: "testBlockArrayOfRichText",
            },
          ],
        },
      });
      const blockIds = article.layout.map((item: any) => item.id);
      const blockTypes = article.layout.map((item: any) => item.blockType);
      const arrayIds = article.layout[1].messages.map((item: any) => item.id);
      const crowdinFiles = await getFilesByDocumentID(article.id, payload as any);
      expect(crowdinFiles.length).toEqual(4);
      const jsonFile = crowdinFiles.find((file) => file.name === "fields.json");
      expect(
        crowdinFiles.find(
          (file) =>
            file.name ===
            `layout.${blockIds[0]}.${blockTypes[0]}.richTextField.html`
        )
      ).toBeDefined();
      expect(
        crowdinFiles.find(
          (file) =>
            file.name ===
            `layout.${blockIds[1]}.${blockTypes[1]}.messages.${arrayIds[0]}.message.html`
        )
      ).toBeDefined();
      expect(
        crowdinFiles.find(
          (file) =>
            file.name ===
            `layout.${blockIds[1]}.${blockTypes[1]}.messages.${arrayIds[1]}.message.html`
        )
      ).toBeDefined();
      expect(jsonFile).toBeDefined();
      expect(jsonFile?.fileData.json).toEqual({
        layout: {
          [blockIds[0]]: {
            basicBlock: {
              textareaField: "Test meta description 1",
              textField: "Test title 1",
            },
          },
        },
      });
    });

    it("deletes the `fields` file when an existing article is deleted", async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: "Test post" },
      });
      const file = await getFileByDocumentID("fields", post.id, payload as any);
      expect(file.fileData.json).toEqual({ title: "Test post" });
      const deletedPost = await payload.delete({
        collection: collections.localized,
        id: post.id,
      });
      const crowdinFiles = await getFilesByDocumentID(post.id, payload as any);
      expect(crowdinFiles.length).toEqual(0);
    });

    it("deletes the collection Crowdin article directory when an existing article is deleted", async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: "Test post" },
      });
      const file = await getFileByDocumentID("fields", post.id, payload as any);
      expect(file.fileData.json).toEqual({ title: "Test post" });
      const deletedPost = await payload.delete({
        collection: collections.localized,
        id: post.id,
      });
      const crowdinPayloadArticleDirectory = await getArticleDirectory(
        post.id,
        payload as any
      );
      expect(crowdinPayloadArticleDirectory).toBeUndefined();
    });
  });
});
