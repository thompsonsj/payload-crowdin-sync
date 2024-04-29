import { LexicalRichTextAdapter, SanitizedEditorConfig } from "@payloadcms/richtext-lexical";
import { Block, RichTextField } from "payload/types";
import { SerializedRootNode, SerializedLexicalNode } from "lexical"
import { SerializedBlockNode } from "@payloadcms/richtext-lexical";

const isSerializedBlockNode = (node: SerializedLexicalNode): node is SerializedBlockNode => {
  return node.type === 'block';
}

export const isLexical = (field: RichTextField): field is RichTextField => field.editor && "editorConfig" in field.editor && "lexical" in (field.editor as LexicalRichTextAdapter).editorConfig || false

export const getLexicalEditorConfig = (field: RichTextField) => {
  if (isLexical(field)) {
    // we know the field is lexical - any better way than casting the type?
    const editor = field.editor as LexicalRichTextAdapter
    return editor.editorConfig
  }
  return undefined
}

export const getLexicalBlockFields = (editorConfig: SanitizedEditorConfig) => editorConfig.resolvedFeatureMap.get('blocks')?.props as {
  blocks: Block[]
}

export const extractLexicalBlockContent = (root: SerializedRootNode) => {
  const nodes = root.children
  return nodes.filter(isSerializedBlockNode).map(node => node.fields)
}
