import type { SerializedBlockNode } from "@payloadcms/richtext-lexical"
import type { SlateNodeConverter } from '@payloadcms/richtext-lexical'

export const SlateBlockConverter: SlateNodeConverter = {
  converter({ slateNode }) {
    return {
      fields: slateNode['translation'],
      format: '',
      type: slateNode['translation'] ? 'block' : 'noTranslation',
      version: 2,
    } as const as SerializedBlockNode
  },
  nodeTypes: ['pcs-block'],
}
