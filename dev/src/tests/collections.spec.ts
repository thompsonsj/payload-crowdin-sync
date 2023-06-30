import payload from 'payload';
import { initPayloadTest } from './helpers/config';

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
 * - article directory: CrowdIn Article Directory
 * - collection directory: CrowdIn Collection Directory
 * - file: CrowdIn File
 */

const collections = {
  nonLocalized: 'posts',
  localized: 'localized-posts',
}

describe('Collections', () => {
  beforeEach(async () => {
    await initPayloadTest({ __dirname });
  });

  describe('Non-localized collections', () => {
    it('does not create an article directory', async () => {
      const post = await payload.create({
        collection: collections.nonLocalized,
        data: { title: 'Test post' },
      });
      const result = await payload.findByID({
        collection: collections.nonLocalized,
        id: post.id,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id
      expect(crowdinArticleDirectoryId).toBeUndefined()
    });
  })

  describe('crowdin-article-directories', () => {
    it('creates an article directory', async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: 'Test post' },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: collections.localized,
        id: post.id,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id
      expect(crowdinArticleDirectoryId).toBeDefined()
    })

    it('creates only one article directory', async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: 'Test post' },
      });
      // retrieve post to get populated fields
      const postRefreshed = await payload.findByID({
        collection: collections.localized,
        id: post.id,
      });
      const crowdinArticleDirectoryId = postRefreshed.crowdinArticleDirectory?.id
      const updatedPost = await payload.update({
        id: post.id,
        collection: collections.localized,
        data: { title: 'Updated test post' },
      });
      // retrieve post to get populated fields
      const updatedPostRefreshed = await payload.findByID({
        collection: collections.localized,
        id: updatedPost.id,
      });
      expect(updatedPostRefreshed.crowdinArticleDirectory?.id).toEqual(crowdinArticleDirectoryId)
    })

    it('creates unique article directories for two articles created in the same collection', async () => {
      const postOne = await payload.create({
        collection: collections.localized,
        data: { title: 'Test post 1' },
      });
      // retrieve post to get populated fields
      const postOneRefreshed = await payload.findByID({
        collection: collections.localized,
        id: postOne.id,
      });
      const postTwo = await payload.create({
        collection: collections.localized,
        data: { title: 'Test post 2' },
      });
      // retrieve post to get populated fields
      const postTwoRefreshed = await payload.findByID({
        collection: collections.localized,
        id: postTwo.id,
      });
      expect(postOneRefreshed.crowdinArticleDirectory.id).not.toEqual(postTwoRefreshed.crowdinArticleDirectory.id)
    })
  })

  describe('crowdin-files', () => {
    it('creates a "fields" CrowdIn file to include the title field', async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: 'Test post' },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: collections.localized,
        id: post.id,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id
      const crowdInFiles = await payload.find({
        collection: 'crowdin-files',
        where: {
          crowdinArticleDirectory: { equals: crowdinArticleDirectoryId },
        },
      });
      expect(crowdInFiles.docs.length).toEqual(1)
      const file = crowdInFiles.docs.find(doc => doc.field === 'fields')
      expect(file).not.toEqual(undefined)
      expect(file.type).toEqual('json')
    })

    it('creates a `fields` file to include the title field and a `content` file for the content richText field', async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: {
          title: 'Test post',
          content: {
            children: [
              {
                text: "Test content"
              }
            ]
          }
        },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: collections.localized,
        id: post.id,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id
      const crowdInFiles = await payload.find({
        collection: 'crowdin-files',
        where: {
          crowdinArticleDirectory: { equals: crowdinArticleDirectoryId },
        },
      });
      expect(crowdInFiles.docs.length).toEqual(2)
      const fields = crowdInFiles.docs.find(doc => doc.field === 'fields')
      const content = crowdInFiles.docs.find(doc => doc.field === 'content')
      expect(fields).not.toEqual(undefined)
      expect(fields.type).toEqual('json')
      expect(content).not.toEqual(undefined)
      expect(content.type).toEqual('html')
    })
  })

  describe('crowdin-collection-directories', () => {
    it('associates an article Directory with a collection directory', async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: 'Test post' },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: collections.localized,
        id: post.id,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id
      expect(crowdinArticleDirectoryId).toBeDefined()
      expect(result.crowdinArticleDirectory.crowdinCollectionDirectory.name).toEqual(collections.localized)
    })

    it('uses the same collection directory for two articles created in the same collection', async () => {
      const postOne = await payload.create({
        collection: collections.localized,
        data: { title: 'Test post 1' },
      });
      // retrieve post to get populated fields
      const postOneRefreshed = await payload.findByID({
        collection: collections.localized,
        id: postOne.id,
      });
      const postTwo = await payload.create({
        collection: collections.localized,
        data: { title: 'Test post 2' },
      });
      // retrieve post to get populated fields
      const postTwoRefreshed = await payload.findByID({
        collection: collections.localized,
        id: postTwo.id,
      });
      expect(postOneRefreshed.crowdinArticleDirectory.crowdinCollectionDirectory).toEqual(postTwoRefreshed.crowdinArticleDirectory.crowdinCollectionDirectory)
    })
  })

  describe('crowdin-files: on update', () => {
    it('updates the `fields` file if a text field has changed', async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: 'Test post' },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: collections.localized,
        id: post.id,
      });
      const crowdinArticleDirectoryId = result.crowdinArticleDirectory?.id
      const crowdInFiles = await payload.find({
        collection: 'crowdin-files',
        where: {
          crowdinArticleDirectory: { equals: crowdinArticleDirectoryId },
        },
      });
      const file = crowdInFiles.docs.find(doc => doc.field === 'fields')
      const updatedPost = await payload.update({
        id: post.id,
        collection: collections.localized,
        data: { title: 'Test post updated' },
      });
      const updatedCrowdInFiles = await payload.find({
        collection: 'crowdin-files',
        where: {
          crowdinArticleDirectory: { equals: crowdinArticleDirectoryId },
        },
      });
      const updatedFile = updatedCrowdInFiles.docs.find(doc => doc.field === 'fields')
      expect(file.updatedAt).not.toEqual(updatedFile.updatedAt)
    })
  })
});
