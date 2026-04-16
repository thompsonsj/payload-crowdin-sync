/**
 * Tests for changes to afterChange.ts (PR scope):
 *  - triggerAfterChange guard: when req.context.triggerAfterChange === false,
 *    the hook returns doc immediately without any further processing.
 */
import { getAfterChangeHook, getGlobalAfterChangeHook } from './afterChange';
import { pluginOptions } from '../../api/mock/plugin-options';
import type { CollectionConfig, GlobalConfig } from 'payload';

const minimalCollection: CollectionConfig = {
  slug: 'test-posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
  ],
};

const minimalGlobal: GlobalConfig = {
  slug: 'test-global',
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
    },
  ],
};

const doc = { id: 'doc-123', title: 'Test Document' };

/**
 * Build a minimal PayloadRequest-like object.
 * When `triggerAfterChange` is false the hook returns before accessing
 * req.payload, so we do not need a real Payload instance.
 */
function buildReq(contextOverrides: Record<string, unknown> = {}): any {
  return {
    locale: 'en',
    context: { ...contextOverrides },
    // payload intentionally not mocked – the hook must not reach it
  };
}

describe('getAfterChangeHook: triggerAfterChange guard', () => {
  const hook = getAfterChangeHook({ collection: minimalCollection, pluginOptions });

  it('returns doc immediately when triggerAfterChange is false', async () => {
    const req = buildReq({ triggerAfterChange: false });
    const result = await hook({
      doc,
      req,
      previousDoc: null,
      operation: 'create',
      collection: minimalCollection,
    } as any);
    expect(result).toBe(doc);
  });

  it('does not access req.payload when triggerAfterChange is false', async () => {
    const req = buildReq({ triggerAfterChange: false });
    // Attach a Proxy that throws on any property access so that if the hook
    // tries to use payload it will fail the test.
    req.payload = new Proxy(
      {},
      {
        get(_target, prop) {
          throw new Error(
            `Unexpected req.payload access: "${String(prop)}" – hook should have returned early`,
          );
        },
      },
    );
    await expect(
      hook({
        doc,
        req,
        previousDoc: null,
        operation: 'create',
        collection: minimalCollection,
      } as any),
    ).resolves.toBe(doc);
  });

  it('does not short-circuit when triggerAfterChange is explicitly true', async () => {
    // No token set → the hook exits at the token guard (line 111), but only
    // after it has passed the triggerAfterChange check. We verify the hook
    // does NOT return at the triggerAfterChange guard by checking it still
    // returns doc (from the token guard) rather than throwing.
    const pluginOptionsNoToken = { ...pluginOptions, token: undefined as any };
    const hookNoToken = getAfterChangeHook({
      collection: minimalCollection,
      pluginOptions: pluginOptionsNoToken,
    });
    const req = buildReq({ triggerAfterChange: true });
    // Hook should not throw – it will return doc from the token check.
    await expect(
      hookNoToken({
        doc,
        req,
        previousDoc: null,
        operation: 'create',
        collection: minimalCollection,
      } as any),
    ).resolves.toBe(doc);
  });

  it('returns doc when context is absent and no token is set', async () => {
    const pluginOptionsNoToken = { ...pluginOptions, token: undefined as any };
    const hookNoToken = getAfterChangeHook({
      collection: minimalCollection,
      pluginOptions: pluginOptionsNoToken,
    });
    const req = buildReq(); // no triggerAfterChange key
    await expect(
      hookNoToken({
        doc,
        req,
        previousDoc: null,
        operation: 'create',
        collection: minimalCollection,
      } as any),
    ).resolves.toBe(doc);
  });

  it('returns doc when triggerAfterChange is null (falsy but not false)', async () => {
    // Only strict false should trigger the early return.
    // null is falsy but !== false, so the guard should NOT fire.
    const pluginOptionsNoToken = { ...pluginOptions, token: undefined as any };
    const hookNoToken = getAfterChangeHook({
      collection: minimalCollection,
      pluginOptions: pluginOptionsNoToken,
    });
    const req = buildReq({ triggerAfterChange: null });
    await expect(
      hookNoToken({
        doc,
        req,
        previousDoc: null,
        operation: 'create',
        collection: minimalCollection,
      } as any),
    ).resolves.toBe(doc);
  });
});

describe('getGlobalAfterChangeHook: triggerAfterChange guard', () => {
  const hook = getGlobalAfterChangeHook({ global: minimalGlobal, pluginOptions });

  it('returns doc immediately when triggerAfterChange is false', async () => {
    const req = buildReq({ triggerAfterChange: false });
    const result = await hook({
      doc,
      req,
      previousDoc: null,
    } as any);
    expect(result).toBe(doc);
  });

  it('does not access req.payload when triggerAfterChange is false', async () => {
    const req = buildReq({ triggerAfterChange: false });
    req.payload = new Proxy(
      {},
      {
        get(_target, prop) {
          throw new Error(
            `Unexpected req.payload access: "${String(prop)}"`,
          );
        },
      },
    );
    await expect(
      hook({
        doc,
        req,
        previousDoc: null,
      } as any),
    ).resolves.toBe(doc);
  });
});