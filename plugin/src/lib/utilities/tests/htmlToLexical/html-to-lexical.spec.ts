import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { convertHtmlToLexical, convertLexicalToHtml } from '../../richTextConversion';
import { asNode } from './as-node';
import { getTestLexicalEditorConfig } from './editor-config';
import type { SanitizedServerEditorConfig } from '@payloadcms/richtext-lexical';

type TextParent = { children: Array<{ text: string; format: number }> };

const textNode = (n: { text: string; format?: number }) =>
  expect.objectContaining({
    type: 'text',
    text: n.text,
    ...(n.format !== undefined ? { format: n.format } : {}),
  });

const childTypes = (state: SerializedEditorState) =>
  state.root.children.map((node) => node.type);

describe('fn: convertHtmlToLexical (Payload convertHTMLToLexical, no Slate hop)', () => {
  let editorConfig: SanitizedServerEditorConfig;

  beforeAll(async () => {
    editorConfig = await getTestLexicalEditorConfig();
  });

  const convert = (
    html: string,
    blockTranslations?: { [key: string]: any } | null,
  ) => convertHtmlToLexical(html, { editorConfig, blockTranslations });

  describe('text and formatting', () => {
    it('converts a paragraph with bold', () => {
      const result = convert('<p>Hello, <strong>world</strong>!</p>');
      expect(childTypes(result)).toEqual(['paragraph']);
      const paragraph = asNode<TextParent>(result.root.children[0]);
      expect(paragraph.children.map((c) => c.text)).toEqual([
        'Hello, ',
        'world',
        '!',
      ]);
      expect(paragraph.children[1]?.format & 1).toBeTruthy();
    });

    it('converts italic, underline, strikethrough, subscript and superscript', () => {
      const result = convert(
        '<p><em>italic</em> <u>under</u> <s>strike</s> <sub>sub</sub> <sup>sup</sup></p>',
      );
      const texts = (
        asNode<TextParent>(result.root.children[0])
      ).children.filter((c) => c.text?.trim());
      expect(texts.map((c) => c.text)).toEqual([
        'italic',
        'under',
        'strike',
        'sub',
        'sup',
      ]);
      expect(texts[0]?.format & 2).toBeTruthy();
      expect(texts[1]?.format & 8).toBeTruthy();
      expect(texts[2]?.format & 4).toBeTruthy();
      expect(texts[3]?.format & 32).toBeTruthy();
      expect(texts[4]?.format & 64).toBeTruthy();
    });

    it('restores underline and strikethrough from Payload span style output', () => {
      const result = convert(
        '<p><span style="text-decoration: underline;">under</span><span style="text-decoration: line-through;">strike</span></p>',
      );
      const texts = (
        asNode<TextParent>(result.root.children[0])
      ).children.filter((c) => c.text);
      expect(texts[0]).toEqual(textNode({ text: 'under', format: 8 }));
      expect(texts[1]).toEqual(textNode({ text: 'strike', format: 4 }));
    });

    it('converts headings, quotes, lists and links', () => {
      const result = convert(
        '<h2>Title</h2><blockquote>Quote</blockquote><ul><li>One</li><li>Two</li></ul><p><a href="https://example.com">link</a></p>',
      );
      expect(childTypes(result)).toEqual([
        'heading',
        'quote',
        'list',
        'paragraph',
      ]);
      expect(result.root.children[0]).toEqual(
        expect.objectContaining({ type: 'heading', tag: 'h2' }),
      );
      const list = asNode<{ listType?: string; tag?: string }>(
        result.root.children[2],
      );
      expect(list.listType ?? list.tag).toMatch(/bullet|ul/);
      const paragraph = asNode<{
        children: Array<{
          type: string;
          url?: string;
          fields?: { url?: string };
        }>;
      }>(result.root.children[3]);
      const link = paragraph.children.find((c) => c.type === 'link');
      expect(link).toBeDefined();
      expect(link?.url ?? link?.fields?.url).toBe('https://example.com');
    });

    it('converts inline code', () => {
      const result = convert('<p>use <code>code</code></p>');
      const code = (
        asNode<TextParent>(result.root.children[0])
      ).children.find((c) => c.text === 'code');
      expect((code?.format ?? 0) & 16).toBeTruthy();
    });
  });

  describe('Payload-native HTML (not Crowdin span markers)', () => {
    it('imports an upload from data-lexical-upload attributes', () => {
      const result = convert(
        '<p>before</p><img data-lexical-upload-id="media-1" data-lexical-upload-relation-to="media" src="/media/file.jpg" alt="" /><p>after</p>',
      );
      const upload = asNode<{
        relationTo: string;
        value: string;
        version: number;
        id?: string;
      }>(result.root.children.find((n) => n.type === 'upload'));
      expect(upload).toMatchObject({
        type: 'upload',
        relationTo: 'media',
        value: 'media-1',
        version: 3,
      });
      expect(typeof upload.id).toBe('string');
    });

    it('imports a relationship from data-lexical-relationship attributes', () => {
      const result = convert(
        '<p>before</p><div data-lexical-relationship-id="page-1" data-lexical-relationship-relationTo="pages"></div><p>after</p>',
      );
      const relationship = result.root.children.find((n) => n.type === 'relationship');
      expect(relationship).toMatchObject({
        type: 'relationship',
        relationTo: 'pages',
        value: 'page-1',
      });
    });
  });

  describe('Crowdin span markers', () => {
    it('restores uploads from pcsUpload spans', () => {
      const result = convert(
        '<span data-block-id="123" data-block-type="pcsUpload" data-relation-to="media">Upload</span>',
      );
      const upload = asNode<{
        value: unknown;
        version: number;
      }>(result.root.children.find((n) => n.type === 'upload'));
      expect(upload).toMatchObject({
        type: 'upload',
        relationTo: 'media',
        version: 3,
      });
      expect(upload.value === '123' || (upload.value as { id?: string })?.id === '123').toBe(
        true,
      );
    });

    it('restores relationships from pcsRelationship spans', () => {
      const result = convert(
        '<span data-block-id="page-9" data-block-type="pcsRelationship" data-relation-to="pages">Rel</span>',
      );
      expect(result.root.children.find((n) => n.type === 'relationship')).toMatchObject({
        type: 'relationship',
        relationTo: 'pages',
        value: 'page-9',
      });
    });

    it('restores lexical blocks from span markers and Crowdin block translations', () => {
      const result = convert(
        '<span data-block-id="123" data-block-type="custom">Custom Block</span>',
        { blocks: [{ id: '123', blockType: 'custom', name: 'Bloque personalizado' }] },
      );
      const block = result.root.children.find((n) => n.type === 'block');
      expect(block).toMatchObject({
        type: 'block',
        fields: {
          id: '123',
          name: 'Bloque personalizado',
        },
      });
    });

    it('keeps block type when a marker has no matching translation', () => {
      const result = convert(
        '<p>intro</p><span data-block-id="missing" data-block-type="highlight"></span><p>outro</p>',
      );
      const block = result.root.children.find(
        (n) => n.type === 'block' || n.type === 'noTranslation',
      );
      expect(block).toBeDefined();
      if (block?.type === 'block') {
        expect(asNode<{ fields: { id: string; blockType: string } }>(block).fields).toMatchObject({
          id: 'missing',
          blockType: 'highlight',
        });
      } else {
        expect(block?.type).toBe('noTranslation');
      }
    });
  });

  describe('tables', () => {
    it('converts a lexical-table HTML fragment to table / tablerow / tablecell nodes', () => {
      const html = `<div class="lexical-table-container"><table class="lexical-table" style="border-collapse: collapse;"><tbody><tr class="lexical-table-row"><th class="lexical-table-cell lexical-table-cell-header-1">Head</th><td class="lexical-table-cell lexical-table-cell-header-0">Cell</td></tr></tbody></table></div>`;
      const result = convert(html);
      const table = asNode<{
        children: Array<{
          type: string;
          children: Array<{ type: string; headerState?: number; children: unknown[] }>;
        }>;
      }>(result.root.children.find((n) => n.type === 'table'));
      expect(table).toBeDefined();
      expect(table.children[0]?.type).toBe('tablerow');
      const cells = table.children[0]?.children ?? [];
      expect(cells.map((c) => c.type)).toEqual(['tablecell', 'tablecell']);
      expect(cells[0]?.headerState).toBeGreaterThan(0);
      expect(cells[1]?.headerState ?? 0).toBe(0);
    });

    it('keeps paragraphs inside table cells', () => {
      const html = `<table><tr><td><p>One</p><p>Two</p></td></tr></table>`;
      const result = convert(html);
      const table = asNode<{
        children: Array<{
          children: Array<{
            children: Array<{ type: string; children?: Array<{ text: string }> }>;
          }>;
        }>;
      }>(result.root.children.find((n) => n.type === 'table'));
      const cellChildren = table.children[0]?.children[0]?.children ?? [];
      expect(cellChildren.map((c) => c.type)).toContain('paragraph');
      const texts = cellChildren.flatMap(
        (c) => c.children?.map((t) => t.text) ?? [],
      );
      expect(texts).toEqual(expect.arrayContaining(['One', 'Two']));
    });
  });

  describe('mixed documents and round-trip', () => {
    it('preserves order of paragraph, block marker and upload marker', () => {
      const result = convert(
        '<p>Intro</p><span data-block-id="b1" data-block-type="custom"></span><span data-block-id="u1" data-block-type="pcsUpload" data-relation-to="media"></span><p>Outro</p>',
        { blocks: [{ id: 'b1', blockType: 'custom', name: 'X' }] },
      );
      expect(childTypes(result)).toEqual([
        'paragraph',
        'block',
        'upload',
        'paragraph',
      ]);
    });

    it('round-trips convertLexicalToHtml output back to Lexical without a Slate hop', async () => {
      const html = await convertLexicalToHtml(
        {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            direction: 'ltr',
            version: 1,
            children: [
              {
                type: 'heading',
                tag: 'h2',
                format: '',
                indent: 0,
                direction: 'ltr',
                version: 1,
                children: [
                  {
                    type: 'text',
                    text: 'Hello',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    version: 1,
                  },
                ],
              },
              {
                type: 'paragraph',
                format: '',
                indent: 0,
                direction: 'ltr',
                version: 1,
                textFormat: 0,
                textStyle: '',
                children: [
                  {
                    type: 'text',
                    text: 'bold',
                    detail: 0,
                    format: 1,
                    mode: 'normal',
                    style: '',
                    version: 1,
                  },
                ],
              },
            ],
          },
        } as unknown as SerializedEditorState,
        editorConfig,
      );
      const result = convert(html);
      expect(childTypes(result)).toEqual(['heading', 'paragraph']);
      expect(result.root.children[0]).toEqual(
        expect.objectContaining({ type: 'heading', tag: 'h2' }),
      );
      const paragraph = asNode<TextParent>(result.root.children[1]);
      expect(paragraph.children[0]?.text).toBe('bold');
      expect(paragraph.children[0]?.format & 1).toBeTruthy();
    });

    it('returns an empty root for empty HTML', () => {
      const result = convert('');
      expect(result.root.type).toBe('root');
      expect(Array.isArray(result.root.children)).toBe(true);
    });

    it('returns an empty root for whitespace-only HTML', () => {
      const result = convert('   \n  ');
      expect(result.root.type).toBe('root');
      expect(result.root.children).toEqual([]);
    });
  });

  describe('additional formatting and lists', () => {
    it('converts ordered lists', () => {
      const result = convert('<ol><li>First</li><li>Second</li></ol>');
      expect(childTypes(result)).toEqual(['list']);
      const list = asNode<{
        listType?: string;
        tag?: string;
        children: Array<{ type: string }>;
      }>(result.root.children[0]);
      expect(list.listType ?? list.tag).toMatch(/number|ol/);
      expect(list.children.map((c) => c.type)).toEqual(['listitem', 'listitem']);
    });

    it('restores checklists from Payload list-check HTML', () => {
      const result = convert(
        '<ul class="list-check"><li aria-checked="false" class="list-item-checkbox" role="checkbox" value="1"><input type="checkbox" /><label>One</label></li></ul>',
      );
      const list = asNode<{
        listType?: string;
        children: Array<{ checked?: boolean }>;
      }>(result.root.children.find((n) => n.type === 'list'));
      expect(list.listType).toBe('check');
      expect(list.children[0]?.checked).toBe(false);
    });

    it('keeps bullet lists with class="list-bullet"', () => {
      const result = convert(
        '<ul class="list-bullet"><li value="1">One</li></ul>',
      );
      expect(
        asNode<{ listType?: string }>(
          result.root.children.find((n) => n.type === 'list'),
        ).listType,
      ).toBe('bullet');
    });

    it('sets direction to ltr when convertHTMLToLexical leaves it null', () => {
      const result = convert('<p>Hello</p>');
      expect(result.root.direction).toBe('ltr');
      expect(
        asNode<{ direction?: string | null }>(result.root.children[0]).direction,
      ).toBe('ltr');
    });

    it('imports links as version 3 nodes with a generated id', () => {
      const result = convert(
        '<p><a href="https://example.com">link</a></p>',
      );
      const paragraph = asNode<{
        children: Array<{
          type: string;
          version?: number;
          id?: string;
          url?: string;
          fields?: { url?: string };
        }>;
      }>(result.root.children[0]);
      const link = paragraph.children.find((c) => c.type === 'link');
      expect(link?.version).toBe(3);
      expect(typeof link?.id).toBe('string');
      expect(link?.fields?.url ?? link?.url).toBe('https://example.com');
    });

    it('converts a horizontal rule', () => {
      const result = convert('<p>before</p><hr /><p>after</p>');
      expect(childTypes(result)).toEqual(['paragraph', 'horizontalrule', 'paragraph']);
    });

    it('keeps nested bold and italic', () => {
      const result = convert('<p><strong><em>both</em></strong></p>');
      const texts = (
        asNode<TextParent>(result.root.children[0])
      ).children.filter((c) => c.text);
      expect(texts[0]?.text).toBe('both');
      expect(texts[0]?.format & 1).toBeTruthy();
      expect(texts[0]?.format & 2).toBeTruthy();
    });

    it('restores combined underline and strikethrough from nested Payload style spans', () => {
      const result = convert(
        '<p><span style="text-decoration: underline;"><span style="text-decoration: line-through;">both</span></span></p>',
      );
      const texts = (
        asNode<TextParent>(result.root.children[0])
      ).children.filter((c) => c.text);
      expect(texts[0]?.text).toBe('both');
      expect(texts[0]?.format & 8).toBeTruthy();
      expect(texts[0]?.format & 4).toBeTruthy();
    });
  });

  describe('Crowdin marker variants', () => {
    it('restores unquoted Crowdin attributes (convertLexicalToHtml output)', () => {
      const result = convert(
        '<span data-block-id=abc data-block-type=pcsUpload data-relation-to=media></span>',
      );
      expect(result.root.children.find((n) => n.type === 'upload')).toMatchObject({
        type: 'upload',
        relationTo: 'media',
        value: 'abc',
      });
    });

    it('restores quoted Crowdin attributes', () => {
      const result = convert(
        '<span data-block-id="abc" data-block-type="pcsUpload" data-relation-to="media"></span>',
      );
      expect(result.root.children.find((n) => n.type === 'upload')).toMatchObject({
        type: 'upload',
        relationTo: 'media',
        value: 'abc',
      });
    });

    it('attaches nested block translation fields', () => {
      const result = convert(
        '<span data-block-id="h1" data-block-type="highlight"></span>',
        {
          blocks: [
            {
              id: 'h1',
              blockType: 'highlight',
              heading: { title: 'Título' },
              color: 'yellow',
            },
          ],
        },
      );
      expect(result.root.children.find((n) => n.type === 'block')).toMatchObject({
        type: 'block',
        fields: {
          id: 'h1',
          blockType: 'highlight',
          heading: { title: 'Título' },
          color: 'yellow',
        },
      });
    });

    it('restores multiple blocks in order', () => {
      const result = convert(
        '<span data-block-id="1" data-block-type="custom"></span><span data-block-id="2" data-block-type="highlight"></span>',
        {
          blocks: [
            { id: '1', blockType: 'custom', name: 'Uno' },
            { id: '2', blockType: 'highlight', color: 'green' },
          ],
        },
      );
      const blocks = asNode<Array<{ fields: { id: string } }>>(
        result.root.children.filter((n) => n.type === 'block'),
      );
      expect(blocks.map((b) => b.fields.id)).toEqual(['1', '2']);
    });

    it('restores a block marker from unclosed Crowdin paragraphs as a sibling, not a nested child', () => {
      const result = convert(
        '<p>Intro<p><span data-block-id="b1" data-block-type="custom"></span><p>Outro',
        { blocks: [{ id: 'b1', blockType: 'custom', name: 'X' }] },
      );
      expect(childTypes(result)).toEqual(['paragraph', 'block', 'paragraph']);
    });

    it('does not treat user text that mentions PCS_BLOCK as a block node', () => {
      const result = convert('<p>See PCS_BLOCK::not-a-block::custom in the docs</p>');
      expect(childTypes(result)).toEqual(['paragraph']);
      expect(result.root.children.find((n) => n.type === 'block')).toBeUndefined();
    });

    it('does not emit Slate hop node types', () => {
      const result = convert(
        '<p>Hi</p><span data-block-id="b1" data-block-type="custom"></span><table><tr><td>Cell</td></tr></table>',
        { blocks: [{ id: 'b1', blockType: 'custom', name: 'X' }] },
      );
      const types = new Set<string>();
      const walk = (nodes: Array<{ type: string; children?: unknown[] }>) => {
        for (const node of nodes) {
          types.add(node.type);
          if (Array.isArray(node.children)) {
            walk(asNode<Array<{ type: string; children?: unknown[] }>>(node.children));
          }
        }
      };
      walk(asNode<Array<{ type: string; children?: unknown[] }>>(result.root.children));
      expect(types.has('pcs-block')).toBe(false);
      expect(types.has('table-row')).toBe(false);
      expect(types.has('table-cell')).toBe(false);
      expect(types.has('table-header-cell')).toBe(false);
      expect(types.has('block')).toBe(true);
      expect(types.has('table')).toBe(true);
      expect(types.has('tablerow')).toBe(true);
      expect(types.has('tablecell')).toBe(true);
    });
  });

  describe('round-trip via convertLexicalToHtml Crowdin markers', () => {
    const lexicalRoot = (children: unknown[]): SerializedEditorState =>
      ({
        root: {
          type: 'root',
          format: '',
          indent: 0,
          direction: 'ltr',
          version: 1,
          children,
        },
      }) as unknown as SerializedEditorState;

    it('round-trips an upload node through Crowdin span markers', async () => {
      const html = await convertLexicalToHtml(
        lexicalRoot([
          {
            type: 'upload',
            version: 3,
            id: 'node-1',
            format: '',
            relationTo: 'media',
            value: 'media-99',
            fields: {},
          },
        ]),
        editorConfig,
      );
      expect(html).toContain('pcsUpload');
      const result = convert(html);
      expect(result.root.children.find((n) => n.type === 'upload')).toMatchObject({
        type: 'upload',
        relationTo: 'media',
        value: 'media-99',
        version: 3,
      });
    });

    it('round-trips a relationship node through Crowdin span markers', async () => {
      const html = await convertLexicalToHtml(
        lexicalRoot([
          {
            type: 'relationship',
            version: 2,
            format: '',
            relationTo: 'pages',
            value: 'page-2',
          },
        ]),
        editorConfig,
      );
      expect(html).toContain('pcsRelationship');
      expect(resultOf(html)).toMatchObject({
        type: 'relationship',
        relationTo: 'pages',
        value: 'page-2',
      });

      function resultOf(markup: string) {
        return convert(markup).root.children.find((n) => n.type === 'relationship');
      }
    });

    it('round-trips a block node through Crowdin span markers and translations', async () => {
      const html = await convertLexicalToHtml(
        lexicalRoot([
          {
            type: 'block',
            version: 2,
            format: '',
            fields: { id: 'b1', blockType: 'custom', name: 'Hello' },
          },
        ]),
        editorConfig,
      );
      expect(html).toContain('data-block-type=custom');
      const result = convert(html, {
        blocks: [{ id: 'b1', blockType: 'custom', name: 'Hola' }],
      });
      expect(result.root.children.find((n) => n.type === 'block')).toMatchObject({
        type: 'block',
        fields: { id: 'b1', name: 'Hola' },
      });
    });
  });
});
