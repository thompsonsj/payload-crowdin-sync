import type {
  SerializedTableCellNode,
  SerializedTableNode,
  SerializedTableRowNode,
} from '@payloadcms/richtext-lexical';
import type { SlateNodeConverter } from '@payloadcms/richtext-lexical';
import { converters } from './../richTextConversion';
import {
  convertSlateNodesToLexical,
  convertSlateToLexical,
} from '@payloadcms/richtext-lexical/migrate';

// note that there is no attempt to restore any formatting on the table when loading translations - only content.
// to avoid repetition, define default values for each node in one place
const defaultLexicalNodeProps = {
  format: '',
  direction: null,
  version: 1,
  indent: 0,
};

export const SlateTableConverter: SlateNodeConverter = {
  converter({ slateNode }) {
    return {
      type: 'table',
      ...defaultLexicalNodeProps,
      children: convertSlateNodesToLexical({
        canContainParagraphs: false,
        converters,
        parentNodeType: 'table',
        slateNodes: slateNode.children,
      }),
    } as const as SerializedTableNode;
  },
  nodeTypes: ['table'],
};

export const SlateTableRowConverter: SlateNodeConverter = {
  converter({ slateNode }) {
    return {
      type: 'tablerow',
      ...defaultLexicalNodeProps,
      children: convertSlateNodesToLexical({
        canContainParagraphs: false,
        converters,
        parentNodeType: 'tablerow',
        slateNodes: slateNode.children,
      }),
    } as const as SerializedTableRowNode;
  },
  nodeTypes: ['table-row'],
};

export const SlateTableCellConverter: SlateNodeConverter = {
  converter({ slateNode }) {
    return {
      type: 'tablecell',
      headerState: slateNode.type === 'table-header-cell' ? 1 : 0,
      ...defaultLexicalNodeProps,
      children: convertSlateNodesToLexical({
        canContainParagraphs: false,
        converters,
        parentNodeType: 'tablecell',
        slateNodes: slateNode.children,
      }),
    } as const as SerializedTableCellNode;
  },
  nodeTypes: ['table-cell', 'table-header-cell'],
};
