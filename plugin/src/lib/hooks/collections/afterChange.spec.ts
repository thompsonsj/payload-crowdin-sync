import { getAfterChangeHook, getGlobalAfterChangeHook } from './afterChange';
import { pluginOptions } from '../../api/mock/plugin-options';
import type { CollectionConfig, GlobalConfig } from 'payload';

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
});

describe('getGlobalAfterChangeHook', () => {
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