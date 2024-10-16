import type { SerializedBlockNode } from "@payloadcms/richtext-lexical"
import type { SlateNodeConverter } from '@payloadcms/richtext-lexical'

export const SlateUploadConverter: SlateNodeConverter = {
  converter({ slateNode }) {


    return {
      fields: {
      },
      format: '',
      type: 'block',
      version: 2,
    } as const as SerializedBlockNode
  },
  nodeTypes: ['upload'],
}