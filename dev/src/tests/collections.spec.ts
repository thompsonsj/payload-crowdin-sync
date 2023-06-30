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
 */

const collections = {
  nonLocalized: 'posts',
  localized: 'localized-posts',
}

describe('Collections', () => {
  beforeEach(async () => {
    await initPayloadTest({ __dirname });
  });

  it('create a post', async () => {
    const post = await payload.create({
      collection: collections.nonLocalized,
      data: { title: 'Test post' },
    });
    const result = await payload.findByID({
      collection: collections.nonLocalized,
      id: post.id,
    });
    expect(result.title).toEqual('Test post');
  });

  it('should create a CrowdIn Article Directory', async () => {
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
});
