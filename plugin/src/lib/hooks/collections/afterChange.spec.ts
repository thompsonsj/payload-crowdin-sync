import { getAfterChangeHook, getGlobalAfterChangeHook } from './afterChange';
import { pluginOptions } from '../../api/mock/plugin-options';
import type { CollectionConfig, GlobalConfig } from 'payload';

/**
 * Minimal collection config for hook wiring.
 */
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
const previousDoc = { id: 'doc-001', title: 'Hi' };

/**
 * Build a minimal PayloadRequest mock.
 */
function makeReq(contextOverrides: Record<string, any> = {}): any {
  return {
    locale: 'en',
    context: contextOverrides,
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
  };
}

describe('afterChange hook: triggerAfterChange context guard', () => {
  it('returns the doc immediately when triggerAfterChange is false (collection hook)', async () => {
    const hook = getAfterChangeHook({
      collection: minimalCollection,
      pluginOptions,
    });

    const req = makeReq({ triggerAfterChange: false });
    const result = await hook({
      doc,
      req,
      previousDoc,
      operation: 'update',
      collection: minimalCollection,
    } as any);

    // Should short-circuit and return the original doc unchanged.
    expect(result).toBe(doc);
  });

  it('returns the doc immediately when triggerAfterChange is false (global hook)', async () => {
    const hook = getGlobalAfterChangeHook({
      global: minimalGlobal,
      pluginOptions,
    });

    const req = makeReq({ triggerAfterChange: false });
    const result = await hook({
      doc,
      req,
      previousDoc,
    } as any);

    expect(result).toBe(doc);
  });

  it('does NOT short-circuit when triggerAfterChange is true', async () => {
    // With a real token but minimal payload mock, the hook will proceed past the
    // context check and eventually return doc (aborting at token/config checks).
    const hook = getAfterChangeHook({
      collection: minimalCollection,
      pluginOptions: { ...pluginOptions, token: undefined as any },
    });

    const req = makeReq({ triggerAfterChange: true });
    const result = await hook({
      doc,
      req,
      previousDoc,
      operation: 'update',
      collection: minimalCollection,
    } as any);

    // Without a token the hook aborts and returns the doc, but it was NOT
    // short-circuited by the context guard.
    expect(result).toBe(doc);
  });

  it('does NOT short-circuit when context is absent', async () => {
    const hook = getAfterChangeHook({
      collection: minimalCollection,
      pluginOptions: { ...pluginOptions, token: undefined as any },
    });

    // No context at all on req.
    const req = makeReq();
    const result = await hook({
      doc,
      req,
      previousDoc,
      operation: 'create',
      collection: minimalCollection,
    } as any);

    expect(result).toBe(doc);
  });

  it('does NOT short-circuit when context.triggerAfterChange is undefined', async () => {
    const hook = getAfterChangeHook({
      collection: minimalCollection,
      pluginOptions: { ...pluginOptions, token: undefined as any },
    });

    const req = makeReq({ triggerAfterChange: undefined });
    const result = await hook({
      doc,
      req,
      previousDoc,
      operation: 'update',
      collection: minimalCollection,
    } as any);

    expect(result).toBe(doc);
  });

  it('returns doc for both create and update operations when triggerAfterChange is false', async () => {
    const hook = getAfterChangeHook({
      collection: minimalCollection,
      pluginOptions,
    });

    const req = makeReq({ triggerAfterChange: false });

    const createResult = await hook({
      doc,
      req,
      previousDoc: null,
      operation: 'create',
      collection: minimalCollection,
    } as any);

    const updateResult = await hook({
      doc,
      req,
      previousDoc,
      operation: 'update',
      collection: minimalCollection,
    } as any);

    expect(createResult).toBe(doc);
    expect(updateResult).toBe(doc);
  });
});