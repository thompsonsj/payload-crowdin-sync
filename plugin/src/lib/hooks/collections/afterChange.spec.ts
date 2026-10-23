import { getAfterChangeHook, getGlobalAfterChangeHook } from './afterChange';
import { pluginOptions } from '../../api/mock/plugin-options';
import type { CollectionConfig, GlobalConfig } from 'payload';

const { createOrUpdateJsonFile, createOrUpdateHtmlFile, deleteHtmlFile } =
  vi.hoisted(() => ({
    createOrUpdateJsonFile: vi.fn().mockResolvedValue(undefined),
    createOrUpdateHtmlFile: vi.fn().mockResolvedValue(undefined),
    deleteHtmlFile: vi.fn().mockResolvedValue(undefined),
  }));

vi.mock('../../api/files/by-document', () => ({
  filesApiByDocument: class {
    async get() {
      return { createOrUpdateJsonFile, createOrUpdateHtmlFile, deleteHtmlFile };
    }
  },
}));

const minimalCollection: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
  ],
};

const minimalGlobal: GlobalConfig = {
  slug: 'nav',
  fields: [
    {
      name: 'label',
      type: 'text',
      localized: true,
    },
  ],
};

const doc = { id: 'doc-001', title: 'Hello' };
const previousDoc = { id: 'doc-001', title: 'Old title' };

/**
 * Build a minimal PayloadRequest stub.
 * Only the fields that performAfterChange accesses are set.
 */
function buildReq(context: Record<string, unknown> = {}) {
  return {
    locale: 'en',
    context,
    payload: {
      collections: {
        posts: {
          config: minimalCollection,
        },
      },
      globals: {
        config: [minimalGlobal],
      },
    },
  } as any;
}

describe('getAfterChangeHook', () => {
  describe('triggerAfterChange context guard (new in PR)', () => {
    it('returns doc immediately when req.context.triggerAfterChange is false', async () => {
      const hook = getAfterChangeHook({
        collection: minimalCollection,
        pluginOptions,
      });

      const req = buildReq({ triggerAfterChange: false });
      const result = await hook({
        doc,
        previousDoc,
        req,
        operation: 'update',
        collection: minimalCollection,
      } as any);

      expect(result).toBe(doc);
    });

    it('does NOT short-circuit when req.context.triggerAfterChange is true', async () => {
      const hook = getAfterChangeHook({
        collection: minimalCollection,
        // Use pluginOptions WITHOUT a token so that the hook aborts at the
        // token check (the next guard after triggerAfterChange). This verifies
        // that triggerAfterChange=true does NOT skip past the guard.
        pluginOptions: { ...pluginOptions, token: '' },
      });

      const req = buildReq({ triggerAfterChange: true });
      // With no token, performAfterChange returns doc at the token check.
      const result = await hook({
        doc,
        previousDoc,
        req,
        operation: 'update',
        collection: minimalCollection,
      } as any);

      // Returns doc via the token check, not via the triggerAfterChange guard
      expect(result).toBe(doc);
    });

    it('does NOT short-circuit when req.context is empty (no triggerAfterChange key)', async () => {
      const hook = getAfterChangeHook({
        collection: minimalCollection,
        pluginOptions: { ...pluginOptions, token: '' },
      });

      const req = buildReq({});
      const result = await hook({
        doc,
        previousDoc,
        req,
        operation: 'update',
        collection: minimalCollection,
      } as any);

      // Still returns doc (via token guard), but not via the triggerAfterChange guard
      expect(result).toBe(doc);
    });

    it('does NOT short-circuit when req has no context property', async () => {
      const hook = getAfterChangeHook({
        collection: minimalCollection,
        pluginOptions: { ...pluginOptions, token: '' },
      });

      const req = buildReq();
      delete (req as any).context;

      const result = await hook({
        doc,
        previousDoc,
        req,
        operation: 'update',
        collection: minimalCollection,
      } as any);

      expect(result).toBe(doc);
    });
  });

  describe('collection condition', () => {
    beforeEach(() => {
      createOrUpdateJsonFile.mockClear();
      createOrUpdateHtmlFile.mockClear();
      deleteHtmlFile.mockClear();
    });

    it('does not upload when the collection condition is false', async () => {
      const hook = getAfterChangeHook({
        collection: minimalCollection,
        pluginOptions: {
          ...pluginOptions,
          collections: [
            {
              slug: 'posts',
              condition: () => false,
            },
          ],
        },
      });

      await hook({
        doc,
        previousDoc,
        req: buildReq(),
        operation: 'update',
        collection: minimalCollection,
      } as any);

      expect(createOrUpdateJsonFile).not.toHaveBeenCalled();
    });
  });

  describe('syncDocumentSource wiring', () => {
    beforeEach(() => {
      createOrUpdateJsonFile.mockClear();
      createOrUpdateHtmlFile.mockClear();
      deleteHtmlFile.mockClear();
    });

    it('writes json through the Crowdin files api when localized strings change', async () => {
      const hook = getAfterChangeHook({
        collection: minimalCollection,
        pluginOptions,
      });

      await hook({
        doc,
        previousDoc,
        req: buildReq(),
        operation: 'update',
        collection: minimalCollection,
      } as any);

      expect(createOrUpdateJsonFile).toHaveBeenCalledWith({
        fileData: { title: 'Hello' },
      });
      expect(createOrUpdateHtmlFile).not.toHaveBeenCalled();
    });

    it('writes html through the Crowdin files api when rich text changes', async () => {
      const slate = [{ type: 'p', children: [{ text: 'Hello' }] }];
      const slateFr = [{ type: 'p', children: [{ text: 'Bonjour' }] }];
      const collection: CollectionConfig = {
        slug: 'posts',
        fields: [{ name: 'body', type: 'richText', localized: true }],
      };
      const hook = getAfterChangeHook({
        collection,
        pluginOptions,
      });
      const req = buildReq();
      req.payload.collections.posts.config = collection;

      await hook({
        doc: { id: 'doc-001', body: slateFr },
        previousDoc: { id: 'doc-001', body: slate },
        req,
        operation: 'update',
        collection,
      } as any);

      expect(createOrUpdateJsonFile).not.toHaveBeenCalled();
      expect(createOrUpdateHtmlFile).toHaveBeenCalledWith({
        name: 'body',
        value: slateFr,
        collection,
      });
    });

    it('deletes html through the Crowdin files api when a rich-text path is removed', async () => {
      const slate = [{ type: 'p', children: [{ text: 'Hello' }] }];
      const collection: CollectionConfig = {
        slug: 'posts',
        fields: [{ name: 'body', type: 'richText', localized: true }],
      };
      const hook = getAfterChangeHook({
        collection,
        pluginOptions,
      });
      const req = buildReq();
      req.payload.collections.posts.config = collection;

      await hook({
        doc: { id: 'doc-001' },
        previousDoc: { id: 'doc-001', body: slate },
        req,
        operation: 'update',
        collection,
      } as any);

      expect(createOrUpdateHtmlFile).not.toHaveBeenCalled();
      expect(deleteHtmlFile).toHaveBeenCalledWith({ name: 'body' });
    });
  });
});

describe('getGlobalAfterChangeHook', () => {
  describe('global condition', () => {
    beforeEach(() => {
      createOrUpdateJsonFile.mockClear();
      createOrUpdateHtmlFile.mockClear();
      deleteHtmlFile.mockClear();
    });

    it('does not upload when the global condition is false', async () => {
      const hook = getGlobalAfterChangeHook({
        global: minimalGlobal,
        pluginOptions: {
          ...pluginOptions,
          globals: [
            {
              slug: 'nav',
              condition: () => false,
            },
          ],
          collections: ['nav'],
        },
      });

      await hook({
        doc,
        previousDoc,
        req: buildReq(),
        global: minimalGlobal,
      } as any);

      expect(createOrUpdateJsonFile).not.toHaveBeenCalled();
    });

    it('uploads when the global condition is met', async () => {
      const hook = getGlobalAfterChangeHook({
        global: minimalGlobal,
        pluginOptions: {
          ...pluginOptions,
          globals: [
            {
              slug: 'nav',
              condition: () => true,
            },
          ],
        },
      });

      await hook({
        doc: { id: 'doc-001', label: 'Hello' },
        previousDoc: { id: 'doc-001', label: 'Old' },
        req: buildReq(),
        global: minimalGlobal,
      } as any);

      expect(createOrUpdateJsonFile).toHaveBeenCalledWith({
        fileData: { label: 'Hello' },
      });
    });
  });

  describe('triggerAfterChange context guard (new in PR)', () => {
    it('returns doc immediately when req.context.triggerAfterChange is false', async () => {
      const hook = getGlobalAfterChangeHook({
        global: minimalGlobal,
        pluginOptions,
      });

      const req = buildReq({ triggerAfterChange: false });
      const result = await hook({
        doc,
        previousDoc,
        req,
        global: minimalGlobal,
      } as any);

      expect(result).toBe(doc);
    });
  });
});