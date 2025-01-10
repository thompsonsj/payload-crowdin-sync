import {
  slateToHtml,
  payloadSlateToHtmlConfig,
  type SlateToHtmlConfig,
  htmlToSlate,
  payloadHtmlToSlateConfig,
  type HtmlToSlateConfig,
} from "@slate-serializers/html"

import {
  ServerBlockNode as BlockNode,
  HTMLConverter,
  type SanitizedServerEditorConfig as SanitizedEditorConfig,
  convertLexicalToHTML,
  consolidateHTMLConverters,
} from '@payloadcms/richtext-lexical'

import {
  convertSlateToLexical,
  defaultSlateConverters,
} from '@payloadcms/richtext-lexical/migrate'

import { getAttributeValue } from 'domutils'
import { SlateBlockConverter } from "./lexical/slateBlockConverter";
import { cloneDeep } from "es-toolkit";

import type { Descendant } from "slate";
import type { SerializedEditorState } from 'lexical'

const BlockHTMLConverter: HTMLConverter<any> = {
  converter: async ({ node }) => {
    return `<span data-block-id=${node.fields.id} data-block-type=${node.fields.blockType}></span>`
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

export const convertHtmlToLexical = (htmlString: string, editorConfig: SanitizedEditorConfig, blockTranslations?: {
  [key: string]: any;
} | null) => {
  // use editorConfig to determine custom convertors
  const converters = cloneDeep([
    ...defaultSlateConverters,
    SlateBlockConverter,
    // AnotherCustomConverter
  ])

  const htmlToSlateConfig = {
    ...payloadHtmlToSlateConfig,
    elementTags: {
      ...payloadHtmlToSlateConfig.elementTags,
      span: (el) => {
        const blockId = el && getAttributeValue(el, 'data-block-id')
        const blockType = el && getAttributeValue(el, 'data-block-type')
        const translation = (blockTranslations?.['blocks'] || []).find((block: any) => block.id === blockId)

          return {
          // use a relatively obscure name to reduce likelihood of a clash with an existing Slate editor configuration `nodeType`.
          type: 'pcs-block',
          // fieldName needed to obtain translations?
          translation,
          blockId,
          blockType,
        }
      },
    },
  } as HtmlToSlateConfig
  return convertSlateToLexical({
    converters: converters,
    slateData: convertHtmlToSlate(htmlString, htmlToSlateConfig),
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
