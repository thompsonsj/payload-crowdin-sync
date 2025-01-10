import { LexicalRichTextAdapter, SanitizedServerEditorConfig as SanitizedEditorConfig } from "@payloadcms/richtext-lexical";
import type { BlocksField as BlockField, RichTextField } from "payload";
import { SerializedRootNode, SerializedLexicalNode } from "lexical"
import { SerializedBlockNode } from "@payloadcms/richtext-lexical";

const isSerializedBlockNode = (node: SerializedLexicalNode): node is SerializedBlockNode => {
  return node.type === 'block';
}

export const isLexical = (field: RichTextField): field is RichTextField => field && field.editor && "editorConfig" in field.editor && "lexical" in (field.editor as LexicalRichTextAdapter).editorConfig || false

export const getLexicalEditorConfig = (field: RichTextField) => {
  if (isLexical(field)) {
    // we know the field is lexical - any better way than casting the type?
    const editor = field.editor as LexicalRichTextAdapter
    return editor.editorConfig
  }
  return undefined
}

export const getLexicalBlockFields = (editorConfig: SanitizedEditorConfig): BlockField | undefined => {
  const blocks = editorConfig.resolvedFeatureMap.get('blocks')
  if (blocks) {
    return {
      blocks: (blocks.sanitizedServerFeatureProps).blocks, 
      name: "blocks",
      type: "blocks",
    }
  }
  return undefined
}

export const extractLexicalBlockContent = (root: SerializedRootNode) => {
  const nodes = root.children
  return nodes.filter(isSerializedBlockNode).map(node => node.fields)
}
