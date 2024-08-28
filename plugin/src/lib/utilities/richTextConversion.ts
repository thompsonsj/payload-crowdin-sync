import {
  slateToHtml,
  payloadSlateToHtmlConfig,
  type SlateToHtmlConfig,
  htmlToSlate,
  payloadHtmlToSlateConfig,
  type HtmlToSlateConfig,
} from "@slate-serializers/html"
import type { Descendant } from "slate";

import type { SerializedEditorState } from 'lexical'
import {
  BlockNode,
  HTMLConverter,
  type SanitizedEditorConfig,
  convertLexicalToHTML,
  consolidateHTMLConverters,
} from '@payloadcms/richtext-lexical'

import {
  cloneDeep,
  convertSlateToLexical,
  defaultSlateConverters,
} from '@payloadcms/richtext-lexical'

const BlockHTMLConverter: HTMLConverter<any> = {
  converter: async ({ node }) => {
    return `<span data-block-id=${node.fields.id}></span>`
  },
  nodeTypes: [BlockNode.getType()],
}

export const convertLexicalToHtml = async (editorData: SerializedEditorState, editorConfig: SanitizedEditorConfig) => {
  return await convertLexicalToHTML({
    converters: [
      ...consolidateHTMLConverters({ editorConfig }),
      BlockHTMLConverter,
    ],
    data: editorData,
  })
}

export const convertHtmlToLexical = (htmlString: string, editorConfig: SanitizedEditorConfig) => {
  // use editorConfig to determine custom convertors
  const converters = cloneDeep([
    ...defaultSlateConverters,
    // AnotherCustomConverter
  ])
  return convertSlateToLexical({
    converters: converters,
    slateData: convertHtmlToSlate(htmlString),
  })
}

export const convertSlateToHtml = (slate: Descendant[], customConfig?: SlateToHtmlConfig): string => {
  if (customConfig) {
    return slateToHtml(slate, customConfig);
  }
  return slateToHtml(slate, payloadSlateToHtmlConfig);
};

export const convertHtmlToSlate = (html: string, customConfig?: HtmlToSlateConfig): Descendant[] => {
  if (customConfig) {
    return htmlToSlate(html, customConfig);
  }
  return htmlToSlate(html, payloadHtmlToSlateConfig);
};
