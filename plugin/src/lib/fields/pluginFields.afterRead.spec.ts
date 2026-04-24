import { describe, expect, it, vi } from 'vitest'
import { pluginCollectionOrGlobalFields } from './pluginFields'
import type { PluginOptions } from '../types'

function getAfterReadHook() {
  const pluginOptions = {
    projectId: 123,
    token: 'fake-token',
    organization: '',
    localeMap: {},
    sourceLocale: 'en',
  } as unknown as PluginOptions

  const fields = pluginCollectionOrGlobalFields({ fields: [], pluginOptions })
  const field = fields.find((f) => f && typeof f === 'object' && (f as any).name === 'crowdinArticleDirectory') as any
  expect(field).toBeTruthy()
  const hook = field?.hooks?.afterRead?.[0]
  expect(typeof hook).toBe('function')
  return hook as (args: any) => Promise<any>
}

describe('pluginFields - crowdinArticleDirectory afterRead', () => {
  it('skips lookup when req.context.triggerAfterChange === false', async () => {
    const afterRead = getAfterReadHook()
    const req = {
      context: { triggerAfterChange: false },
      payload: { find: vi.fn() },
    }
    const res = await afterRead({
      data: { id: 'doc1' },
      req,
      collection: { slug: 'localized-posts' },
    })
    expect(res).toBeUndefined()
    expect(req.payload.find).not.toHaveBeenCalled()
  })

  it('returns existing populated crowdinArticleDirectory without querying', async () => {
    const afterRead = getAfterReadHook()
    const existing = { id: 'ad1', name: 'doc1' }
    const req = {
      context: {},
      payload: { find: vi.fn() },
    }
    const res = await afterRead({
      data: { id: 'doc1', crowdinArticleDirectory: existing },
      req,
      collection: { slug: 'localized-posts' },
    })
    expect(res).toBe(existing)
    expect(req.payload.find).not.toHaveBeenCalled()
  })

  it('memoizes per request (collection slug) and avoids repeated finds', async () => {
    const afterRead = getAfterReadHook()
    const resolved = { id: 'ad1' }
    const find = vi.fn().mockResolvedValue({ totalDocs: 1, docs: [resolved] })
    const req = { context: {}, payload: { find } }

    const first = await afterRead({
      data: { id: 'doc1' },
      req,
      collection: { slug: 'localized-posts' },
    })
    const second = await afterRead({
      data: { id: 'doc1' },
      req,
      collection: { slug: 'localized-posts' },
    })

    expect(first).toBe(resolved)
    expect(second).toBe(resolved)
    expect(find).toHaveBeenCalledTimes(1)
  })

  it('memoizes misses (undefined) per request', async () => {
    const afterRead = getAfterReadHook()
    const find = vi.fn().mockResolvedValue({ totalDocs: 0, docs: [] })
    const req = { context: {}, payload: { find } }

    const first = await afterRead({
      data: { id: 'doc1' },
      req,
      collection: { slug: 'localized-posts' },
    })
    const second = await afterRead({
      data: { id: 'doc1' },
      req,
      collection: { slug: 'localized-posts' },
    })

    expect(first).toBeUndefined()
    expect(second).toBeUndefined()
    // First call: polymorphic lookup + collection directory lookup (legacy fallback path).
    // Second call: served from cache.
    expect(find).toHaveBeenCalledTimes(2)
  })

  it('performs legacy fallback once, then reuses cached value', async () => {
    const afterRead = getAfterReadHook()
    const resolved = { id: 'ad-legacy-1' }
    const find = vi
      .fn()
      // polymorphic lookup: none
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      // collection directory lookup: one doc
      .mockResolvedValueOnce({ totalDocs: 1, docs: [{ id: 'cd1' }] })
      // legacy lookup: resolves
      .mockResolvedValueOnce({ totalDocs: 1, docs: [resolved] })

    const req = { context: {}, payload: { find } }

    const first = await afterRead({
      data: { id: 'doc1' },
      req,
      collection: { slug: 'localized-posts' },
    })
    const second = await afterRead({
      data: { id: 'doc1' },
      req,
      collection: { slug: 'localized-posts' },
    })

    expect(first).toBe(resolved)
    expect(second).toBe(resolved)
    expect(find).toHaveBeenCalledTimes(3)
  })

  it('memoizes separately for globals vs collections (different cache keys)', async () => {
    const afterRead = getAfterReadHook()
    const find = vi.fn().mockResolvedValue({ totalDocs: 0, docs: [] })
    const req = { context: {}, payload: { find } }

    await afterRead({
      data: { id: 'doc1' },
      req,
      collection: { slug: 'localized-posts' },
    })
    await afterRead({
      data: { id: 'doc1' },
      req,
      global: { slug: 'nav' },
    })

    // two different cache keys → two separate lookups
    // collection miss: 2 finds (article-directories + collection-directories)
    // global miss: 1 find (article-directories by globalSlug)
    expect(find).toHaveBeenCalledTimes(3)
  })
})

