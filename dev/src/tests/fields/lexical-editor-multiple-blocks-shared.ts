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

export async function setupLexicalMultipleBlocksTest(): Promise<{
  payload: Payload
  mediaID: string
}> {
  const initialized = await initPayloadInt()
  const { payload } = initialized as { payload: Payload }

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
