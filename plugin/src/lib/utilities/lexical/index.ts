import { LexicalRichTextAdapter, SanitizedEditorConfig } from "@payloadcms/richtext-lexical";
import { RichTextField } from "payload/types";

export const isLexical = (field: RichTextField): field is RichTextField => field.editor && "editorConfig" in field.editor && "lexical" in (field.editor as LexicalRichTextAdapter).editorConfig || false

export const getLexicalEditorConfig = (field: RichTextField) => {
  if (isLexical(field)) {
    // we know the field is lexical - any better way than casting the type?
    const editor = field.editor as LexicalRichTextAdapter
    return editor.editorConfig
  }
  return undefined
}

export const getLexicalBlockFields = (editorConfig: SanitizedEditorConfig) => editorConfig.resolvedFeatureMap.get('blocks')?.props
