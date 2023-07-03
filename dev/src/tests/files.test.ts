import payload from 'payload';
import { initPayloadTest } from './helpers/config';
import { getFileByDocumentID, getFilesByDocumentID } from '../../../dist/api/helpers';

/**
 * Test files
 * 
 * Ensure that files are created for CrowdIn as expected.
 * 
 * Note: This test suite is not intended to test file contents.
 * This is the responsibility of buildCrowdinHtmlObject and
 * buildCrowdinJsonObject which are unit tested in `src/utilities`.
 */

const collections = {
  nonLocalized: 'posts',
  localized: 'localized-posts',
  nestedFields: 'nested-field-collection'
}

describe(`CrowdIn file create, update and delete`, () => {
  beforeEach(async () => {
    await initPayloadTest({ __dirname });
  });

  describe(`Collection: ${collections.localized}`, () => {
    it('updates the `fields` file if a text field has changed', async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: 'Test post' },
      });
      const file = await getFileByDocumentID('fields', post.id, payload)
      const updatedPost = await payload.update({
        id: post.id,
        collection: collections.localized,
        data: { title: 'Test post updated' },
      });
      const updatedFile = await getFileByDocumentID('fields', post.id, payload)
      expect(file.updatedAt).not.toEqual(updatedFile.updatedAt)
    })
  })

  describe(`Collection: ${collections.nestedFields}`, () => {
    it('does not create files for empty localized fields', async () => {
      const article = await payload.create({
        collection: collections.nestedFields,
        data: {},
      });

      const crowdInFiles = await getFilesByDocumentID(article.id, payload)
      expect(crowdInFiles.length).toEqual(0)
    })

    /**
     * TODO: Fix this test
     * 
     * ValidationError: nested-field-collection validation failed: title.en: Cast to string failed for value "{ en: 'Test title' }" (type Object) at path "en"
     *  model.Object.<anonymous>.Document.invalidate (dev/node_modules/mongoose/lib/document.js:3050:32)
     * /
    it('creates files containing fieldType content', async () => {
      const article = await payload.create({
        collection: collections.nestedFields,
        locale: "en",
        data: {
          title: 'Test title',
          content: [
            {
              children: [
                {
                  text: "Test content"
                }
              ]
            }
          ],
          metaDescription: 'Test meta description',
        },
      });
      const crowdInFiles = await getFilesByDocumentID(article.id, payload)
      expect(crowdInFiles.length).toEqual(2)
      expect(crowdInFiles.find((file) => file.name === 'content.html')).toBeDefined()
      expect(crowdInFiles.find((file) => file.name === 'fields.json')).toBeDefined()
    })
    */

    it('creates files containing `array` fieldType content', async () => {
      const article = await payload.create({
        collection: collections.nestedFields,
        data: {
          arrayField: [
            {
              title: 'Test title 1',
              content: [
                {
                  children: [
                    {
                      text: "Test content 1"
                    }
                  ]
                }
              ],
              metaDescription: 'Test meta description 1',
            },
            {
              title: 'Test title 2',
              content: [
                {
                  children: [
                    {
                      text: "Test content 2"
                    }
                  ]
                }
              ],
              metaDescription: 'Test meta description 2',
            },
          ],
        },
      });
      const crowdInFiles = await getFilesByDocumentID(article.id, payload)
      expect(crowdInFiles.length).toEqual(3)
      expect(crowdInFiles.find((file) => file.name === 'arrayField[0].content.html')).toBeDefined()
      expect(crowdInFiles.find((file) => file.name === 'arrayField[1].content.html')).toBeDefined()
      expect(crowdInFiles.find((file) => file.name === 'fields.json')).toBeDefined()
    })

    it('creates files containing `blocks` fieldType content', async () => {
      const article = await payload.create({
        collection: collections.nestedFields,
        data: {
          layout: [
            {
              title: 'Test title 1',
              content: [
                {
                  children: [
                    {
                      text: "Test content 1"
                    }
                  ]
                }
              ],
              metaDescription: 'Test meta description 1',
              blockType: 'basicBlock'
            },
            {
              title: 'Test title 2',
              content: [
                {
                  children: [
                    {
                      text: "Test content 2"
                    }
                  ]
                }
              ],
              metaDescription: 'Test meta description 2',
              blockType: 'basicBlock'
            },
          ],
        },
      });
      const crowdInFiles = await getFilesByDocumentID(article.id, payload)
      expect(crowdInFiles.length).toEqual(3)
      expect(crowdInFiles.find((file) => file.name === 'layout[0].content.html')).toBeDefined()
      expect(crowdInFiles.find((file) => file.name === 'layout[1].content.html')).toBeDefined()
      expect(crowdInFiles.find((file) => file.name === 'fields.json')).toBeDefined()
    })
  })
});
