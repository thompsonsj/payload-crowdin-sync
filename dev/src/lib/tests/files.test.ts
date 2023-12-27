import payload from "payload";
import { initPayloadTest } from "./helpers/config";
import {
  getFileByDocumentID,
  getFilesByDocumentID,
  getArticleDirectory,
  isDefined,
} from "payload-crowdin-sync";
import { connectionTimeout } from "./config";


/**
 * Test files
 *
 * Ensure that files are created for Crowdin as expected.
 *
 * Note: This test suite is not intended to test file contents.
 * This is the responsibility of buildCrowdinHtmlObject and
 * buildCrowdinJsonObject which are unit tested in `src/utilities`.
 */

describe(`Crowdin file create, update and delete`, () => {
  beforeAll(async () => {
    await initPayloadTest({ __dirname });
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

  describe(`Collection: ${"localized-posts"}`, () => {
    it("updates the `fields` file for a new article", async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      const file = await getFileByDocumentID("fields", `${post.id}`, payload as any);
      expect(file.fileData?.json).toEqual({ title: "Test post" });
    });

    it("updates the `fields` file if a text field has changed", async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      const file = await getFileByDocumentID("fields", `${post.id}`, payload);
      await payload.update({
        id: `${post.id}`,
        collection: "localized-posts",
        data: { title: "Test post updated" },
      });
      const updatedFile = await getFileByDocumentID("fields", `${post.id}`, payload);
      expect(file.updatedAt).not.toEqual(updatedFile.updatedAt);
      expect(updatedFile.fileData?.json).toEqual({ title: "Test post updated" });
    });
  });

  describe(`Collection: ${"nested-field-collection"}`, () => {
    it("does not create files for empty localized fields", async () => {
      const article = await payload.create({
        collection: "nested-field-collection",
        data: {
          title: "Non localized title",
          tabTwo: {}
        },
      });

      const crowdinFiles = await getFilesByDocumentID(`${article.id}`, payload);
      expect(crowdinFiles.length).toEqual(0);
    });

    it("creates files containing fieldType content", async () => {
      const article = await payload.create({
        collection: "nested-field-collection",
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
          tabTwo: {},
        },
      });
      const crowdinFiles = await getFilesByDocumentID(`${article.id}`, payload);
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
        collection: "nested-field-collection",
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
          tabTwo: {},
        },
      });
      // run again - hacky way to wait for all files.
      await payload.findByID({
        collection: "nested-field-collection",
        id: article.id,
      });
      const ids = article["arrayField"] instanceof Array && article["arrayField"].map((item) => item.id) || [] as string[];
      const crowdinFiles = await getFilesByDocumentID(`${article.id}`, payload);
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
        collection: "nested-field-collection",
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
          tabTwo: {},
        },
      });
      const blockIds = article["layout"] instanceof Array ? article["layout"].map((item) => item.id).filter(isDefined) : [];
      const blockTypes = article["layout"] instanceof Array && article["layout"].map((item) => item.blockType) || [] as string[];
      const arrayIds = article["layout"] instanceof Array && article["layout"].length > 0 && (article["layout"][1] as any).messages.map((item: any) => item.id);
      const crowdinFiles = await getFilesByDocumentID(`${article.id}`, payload);
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
      expect(jsonFile?.fileData?.json).toEqual({
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
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      const file = await getFileByDocumentID("fields", `${post.id}`, payload);
      expect(file.fileData?.json).toEqual({ title: "Test post" });
      await payload.delete({
        collection: "localized-posts",
        id: `${post.id}`,
      });
      const crowdinFiles = await getFilesByDocumentID(`${post.id}`, payload);
      expect(crowdinFiles.length).toEqual(0);
    });

    it("deletes the collection Crowdin article directory when an existing article is deleted", async () => {
      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      const file = await getFileByDocumentID("fields", `${post.id}`, payload);
      expect(file.fileData?.json).toEqual({ title: "Test post" });
      await payload.delete({
        collection: "localized-posts",
        id: `${post.id}`,
      });
      const crowdinPayloadArticleDirectory = await getArticleDirectory(
        `${post.id}`,
        payload
      );
      expect(crowdinPayloadArticleDirectory).toBeUndefined();
    });
  });
});
