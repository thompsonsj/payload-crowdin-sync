import { mockCrowdinClient } from 'payload-crowdin-sync'
import type { Payload } from 'payload'
import { initPayloadInt } from '../helpers/initPayloadInt.js'
import { pluginConfig } from '../helpers/plugin-config.js'

export const pluginOptions = pluginConfig()
export const mockClient = mockCrowdinClient(pluginOptions)
export const SNAPSHOT_MEDIA_ID = '65d67e6a7fb7e9426b3f9f5f'

export const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PwYhWQAAAABJRU5ErkJggg==',
  'base64',
)

export function injectImageRelationship(content: unknown, newMediaID: string): unknown {
  if (Array.isArray(content)) {
    return content.map((item) => injectImageRelationship(item, newMediaID))
  }
  if (!content || typeof content !== 'object') {
    return content
  }

  const node = content as Record<string, unknown>

  if (
    node.type === 'block' &&
    typeof node.fields === 'object' &&
    node.fields !== null &&
    (node.fields as Record<string, unknown>).blockType === 'imageText'
  ) {
    return {
      ...node,
      fields: {
        ...(node.fields as Record<string, unknown>),
        image: newMediaID,
      },
    }
  }

  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node)) {
    out[key] = injectImageRelationship(value, newMediaID)
  }
  return out
}

async function deleteAllPayloadDocs(
  payload: Payload,
  collection: 'crowdin-files' | 'crowdin-article-directories' | 'crowdin-collection-directories',
): Promise<void> {
  const limit = 100
  let page = 1

  for (;;) {
    const result = await payload.find({
      collection,
      limit,
      page,
      pagination: true,
      overrideAccess: true,
    })

    for (const doc of result.docs) {
      await payload.delete({
        collection,
        id: doc.id,
        overrideAccess: true,
      })
    }

    if (!result.hasNextPage) {
      break
    }
    page = result.nextPage ?? page + 1
  }
}

async function deleteAllCrowdinArticleDirectories(payload: Payload): Promise<void> {
  for (;;) {
    const result = await payload.find({
      collection: 'crowdin-article-directories',
      limit: 500,
      pagination: false,
      overrideAccess: true,
    })

    if (result.docs.length === 0) {
      return
    }

    const parentOfAnother = new Set<string>()
    for (const doc of result.docs) {
      const parent = doc.parent
      if (parent === null || parent === undefined) {
        continue
      }
      parentOfAnother.add(typeof parent === 'object' ? String(parent.id) : String(parent))
    }

    const deletable = result.docs.filter((doc) => !parentOfAnother.has(String(doc.id)))

    if (deletable.length === 0) {
      await payload.delete({
        collection: 'crowdin-article-directories',
        id: result.docs[0].id,
        overrideAccess: true,
      })
      continue
    }

    for (const doc of deletable) {
      await payload.delete({
        collection: 'crowdin-article-directories',
        id: doc.id,
        overrideAccess: true,
      })
    }
  }
}

/** Clears Crowdin directory/file Payload records so each test can mock directory creation in isolation. */
export async function resetLexicalMultipleBlocksCrowdinDirectories(
  payload: Payload,
): Promise<void> {
  await deleteAllPayloadDocs(payload, 'crowdin-files')
  await deleteAllCrowdinArticleDirectories(payload)
  await deleteAllPayloadDocs(payload, 'crowdin-collection-directories')
}

export async function setupLexicalMultipleBlocksTest(): Promise<{
  payload: Payload
  mediaID: string
}> {
  const initialized = await initPayloadInt()
  const { payload } = initialized as { payload: Payload }

  await resetLexicalMultipleBlocksCrowdinDirectories(payload)

  const media = await payload.create({
    collection: 'media',
    data: {
      alt: 'Test image',
    },
    file: {
      data: onePixelPng,
      mimetype: 'image/png',
      name: 'test.png',
      size: onePixelPng.length,
    } as never,
  })

  return { payload, mediaID: String(media.id) }
}

export async function teardownLexicalMultipleBlocksTest(payload: Payload): Promise<void> {
  if (typeof payload.db.destroy === 'function') {
    await payload.db.destroy()
  }
}
