import { isCrowdinActive } from './helpers';
import { pluginOptions } from './mock/plugin-options';
describe('Helper: isCrowdinActive', () => {
  const doc = {
    id: '638641358b1a140462752076',
    title: 'Test doc',
  };
  it('returns true if no collection options are set', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'posts',
      global: false,
      pluginOptions,
    });
    expect(active).toBeTruthy();
  });
  it('returns true if no global options are set', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'nav',
      global: true,
      pluginOptions,
    });
    expect(active).toBeTruthy();
  });
  it('returns false if collection options are set but do not include the collection slug', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'posts',
      global: false,
      pluginOptions: {
        ...pluginOptions,
        collections: ['localized-posts'],
      },
    });
    expect(active).toBeFalsy();
  });
  it('returns true if collection options are set and include the collection slug', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'posts',
      global: false,
      pluginOptions: {
        ...pluginOptions,
        collections: ['posts'],
      },
    });
    expect(active).toBeTruthy();
  });
  it('returns true if collection options are set as an object and include the collection slug', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'posts',
      global: false,
      pluginOptions: {
        ...pluginOptions,
        collections: [
          {
            slug: 'posts',
          },
        ],
      },
    });
    expect(active).toBeTruthy();
  });
  it('returns true if collection options are set as an object and include the collection slug and a condition that is met', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'posts',
      global: false,
      pluginOptions: {
        ...pluginOptions,
        collections: [
          {
            slug: 'posts',
            condition: ({ doc }) => doc.title === 'Test doc',
          },
        ],
      },
    });
    expect(active).toBeTruthy();
  });
  it('returns false if collection options are set as an object and include the collection slug and a condition that is not met', () => {
    const active = isCrowdinActive({
      doc,
      slug: 'posts',
      global: false,
      pluginOptions: {
        ...pluginOptions,
        collections: [
          {
            slug: 'posts',
            condition: ({ doc }) => doc.title !== 'Test doc',
          },
        ],
      },
    });
    expect(active).toBeFalsy();
  });
});
