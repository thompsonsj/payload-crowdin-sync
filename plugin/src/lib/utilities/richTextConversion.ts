import {
  slateToHtml,
  payloadSlateToHtmlConfig,
  type SlateToHtmlConfig,
  htmlToSlate,
  payloadHtmlToSlateConfig,
  type HtmlToSlateConfig,
} from '@slate-serializers/html';

import {
  SerializedRelationshipNode,
  SerializedUploadNode,
  type SanitizedServerEditorConfig as SanitizedEditorConfig,
} from '@payloadcms/richtext-lexical';

import {
  convertLexicalToHTML,
  HTMLConverters,
} from '@payloadcms/richtext-lexical/html';

import {
  convertSlateToLexical,
  defaultSlateConverters,
} from '@payloadcms/richtext-lexical/migrate';

import { Element } from 'domhandler';
import { findOne, getAttributeValue } from 'domutils';
import { SlateBlockConverter } from './lexical/slateBlockConverter';
import { cloneDeep } from 'es-toolkit';

import type { Descendant } from 'slate';
import type { SerializedEditorState } from 'lexical';

import { getLexicalBlockFields } from './lexical';
import {
  SlateTableCellConverter,
  SlateTableConverter,
  SlateTableRowConverter,
} from './lexical/slateTableConverter';

// use editorConfig to determine custom convertors
export const converters = cloneDeep([
  ...defaultSlateConverters,
  SlateBlockConverter,
  SlateTableConverter,
  SlateTableRowConverter,
  SlateTableCellConverter,
  // AnotherCustomConverter
]);

export const convertLexicalToHtml = async (
  editorData: SerializedEditorState,
  editorConfig: SanitizedEditorConfig,
) => {
  const blockSlugs = getLexicalBlockFields(editorConfig)?.blocks.map(
    (block) => block.slug,
  );
  const blockConvertors =
    blockSlugs?.reduce((acc, slug) => {
      acc[slug] = ({ node }) => {
        const blockId = node.fields.id;
        const blockType = node.fields.blockType;
        return `<span data-block-id=${blockId} data-block-type=${blockType}></span>`;
      };
      return acc;
    }, {}) || {};

  /**
   * This is a custom HTML converter for the Upload node type.
   *
   * Place a marker in the HTML output to indicate where the upload node is.
   * When translations are applied, the marker will be replaced with the actual upload node.
   */
  const UploadHTMLConverter: HTMLConverters<SerializedUploadNode> = {
    upload: ({ node }) => {
      const uploadValueId = (node: SerializedUploadNode) => {
        if (typeof node.value === 'number') {
          return `${node.value}`;
        }
        if (typeof node.value === 'string') {
          return node.value;
        }
        return node.value.id;
      };

      // naming is unfortunate here - we are reusing structure from blocks
      // refactor to indicate type? i.e. block or upload?
      // in this case, data-block-id is not block id, but upload id
      return `<span data-block-id=${uploadValueId(node)} data-relation-to=${node.relationTo} data-block-type="pcsUpload"></span>`;
    },
  };

  /**
   * This is a custom HTML converter for the Upload node type.
   *
   * Place a marker in the HTML output to indicate where the upload node is.
   * When translations are applied, the marker will be replaced with the actual upload node.
   */
  const RelationshipHTMLConverter: HTMLConverters<SerializedRelationshipNode> = {
    relationship: ({ node }) => {
      const relationshipValueId = (node: SerializedRelationshipNode) => {
        if (typeof node.value === 'number') {
          return `${node.value}`;
        }
        if (typeof node.value === 'string') {
          return node.value;
        }
        return node.value.id;
      };

      // naming is unfortunate here - we are reusing structure from blocks
      // refactor to indicate type? i.e. block or upload?
      // in this case, data-block-id is not block id, but upload id
      return `<span data-block-id=${relationshipValueId(node)} data-relation-to=${node.relationTo} data-block-type="pcsRelationship"></span>`;
    },
  };

  return convertLexicalToHTML({
    converters: ({ defaultConverters }) => ({
      ...defaultConverters,
      ...UploadHTMLConverter,
      ...RelationshipHTMLConverter,
      blocks: blockConvertors,
    }),
    data: editorData,
    disableContainer: true,
  });
};

export const convertHtmlToLexical = (
  htmlString: string,
  blockTranslations?: {
    [key: string]: any;
  } | null,
) => {
  const htmlToSlateConfig = {
    ...payloadHtmlToSlateConfig,
    textTags: {
      ...payloadHtmlToSlateConfig.textTags,
      sub: () => ({ subscript: true }),
      sup: () => ({ superscript: true }),
    },
    elementTags: {
      ...payloadHtmlToSlateConfig.elementTags,
      span: (el) => {
        const blockId = el && getAttributeValue(el, 'data-block-id');
        const blockType = el && getAttributeValue(el, 'data-block-type');

        const isBlock = !!blockId && !!blockType;

        if (isBlock && blockType === 'pcsUpload') {
          const relationTo = el && getAttributeValue(el, 'data-relation-to');
          return {
            type: 'upload',
            relationTo,
            value: {
              id: blockId,
            },
          };
        } else if (isBlock && blockType === 'pcsRelationship') {
          const relationTo = el && getAttributeValue(el, 'data-relation-to');
          return {
            type: 'relationship',
            relationTo,
            value: {
              id: blockId,
            },
          };
        } else {
          const translation = (blockTranslations?.['blocks'] || []).find(
            (block: any) => block.id === blockId,
          );

          return {
            // use a relatively obscure name to reduce likelihood of a clash with an existing Slate editor configuration `nodeType`.
            type: 'pcs-block',
            // fieldName needed to obtain translations?
            translation,
            blockId,
            blockType,
          };
        }
      },
      div: () => ({ type: 'div' }),
      table: () => ({ type: 'table' }),
      tr: () => ({ type: 'table-row' }),
      td: () => ({ type: 'table-cell' }),
      // thead: () => ({ type: 'table-header' }),
      th: () => ({ type: 'table-header-cell' }),
      // tbody: () => ({ type: 'table-body' }),
    },
    htmlUpdaterMap: {
      div: (el) => {
        // is this is a direct parent of a table
        const table = findOne((node) => node.name === 'table', [el]);
        if (table) {
          return table;
        }
        return el;
      },
      span: (el) => {
        // is this a formatting span?
        const styleAttribs = (el && getAttributeValue(el, 'style')) || '';
        if (styleAttribs) {
          const styleObject: { [key: string]: boolean } = {};
          styleAttribs.split(';').forEach((item) => {
            const styleItem = item.trim().split(':');
            if (styleItem.length === 2) {
              if (
                styleItem[0].trim() === 'text-decoration' &&
                styleItem[1].trim() === 'underline'
              ) {
                styleObject['underline'] = true;
              }
              if (
                styleItem[0].trim() === 'text-decoration' &&
                styleItem[1].trim() === 'line-through'
              ) {
                styleObject['strikethrough'] = true;
              }
            }
          });
          if (styleObject['strikethrough'] && styleObject['underline']) {
            return new Element('s', el.attribs, [
              new Element('u', el.attribs, el.children),
            ]);
          }
          if (styleObject['underline']) {
            return new Element('u', el.attribs, el.children);
          }
          if (styleObject['strikethrough']) {
            return new Element('s', el.attribs, el.children);
          }
        }
        return el;
      },
    },
  } as HtmlToSlateConfig;
  return convertSlateToLexical({
    converters: converters,
    slateData: convertHtmlToSlate(htmlString, htmlToSlateConfig),
  });
};

export const convertSlateToHtml = (
  slate: Descendant[],
  customConfig?: SlateToHtmlConfig,
): string => {
  if (customConfig) {
    return slateToHtml(slate, customConfig);
  }
  return slateToHtml(slate, payloadSlateToHtmlConfig);
};

export const convertHtmlToSlate = (
  html: string,
  customConfig?: HtmlToSlateConfig,
): Descendant[] => {
  if (customConfig) {
    return htmlToSlate(html, customConfig);
  }
  return htmlToSlate(html, payloadHtmlToSlateConfig);
};
