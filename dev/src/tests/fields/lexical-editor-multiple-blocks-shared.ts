import fs from 'fs'
import path from 'path'
import { getFileByPath } from 'payload'
import type { Payload } from 'payload'
import type { Media } from '../../payload-types'
import { initPayloadInt } from '../helpers/initPayloadInt'
import { FIXTURE_IMAGE_ID } from './lexical-editor-with-multiple-blocks.fixture'

export const removeFiles = (dir: string) => {
  if (fs.existsSync(dir))
    fs.readdirSync(dir).forEach((f) => {
      if (f.startsWith('cristian-palmer-XexawgzYOBc-unsplash')) {
        fs.rmSync(`${dir}/${f}`)
      }
    })
}

/** Replace dynamic media.id (or populated image object) in result so inline snapshots stay stable. */
export function normalizeForSnapshot<T>(obj: T, mediaId: string): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map((item) => normalizeForSnapshot(item, mediaId)) as T
  const out = { ...obj } as T
  for (const key of Object.keys(out as object)) {
    const val = (out as Record<string, unknown>)[key]
    if (key === 'image') {
      if (val === mediaId) {
        ;(out as Record<string, unknown>)[key] = FIXTURE_IMAGE_ID
      } else if (typeof val === 'object' && val !== null && (val as { id?: string }).id === mediaId) {
        ;(out as Record<string, unknown>)[key] = FIXTURE_IMAGE_ID
      } else {
        ;(out as Record<string, unknown>)[key] = normalizeForSnapshot(val, mediaId)
      }
    } else {
      ;(out as Record<string, unknown>)[key] = normalizeForSnapshot(val, mediaId)
    }
  }
  return out
}

export async function setupLexicalTest() {
  const initialized = await initPayloadInt()
  const { payload } = initialized as { payload: Payload }
  
  const uploadsDir = path.resolve(__dirname, './../../media')
  removeFiles(uploadsDir)
  const imageFilePath = path.resolve(__dirname, './cristian-palmer-XexawgzYOBc-unsplash.jpg')
  const imageFile = await getFileByPath(imageFilePath)
  const media = await payload.create({
    collection: 'media',
    data: {},
    file: imageFile,
  })

  return { payload, media: media as Media }
}
