import payload from 'payload';
import { initPayloadTest } from './helpers/config';

describe('Example integration test', () => {
  beforeEach(async () => {
    await initPayloadTest({ __dirname });
  });

  it('create a post', async () => {
    const post = await payload.create({
      collection: 'posts',
      data: { title: 'Test post' },
    });
    const result = await payload.findByID({
      collection: 'posts',
      id: post.id,
    });
    expect(result.title).toEqual('Test post');
  });
});
