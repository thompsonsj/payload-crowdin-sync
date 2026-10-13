import { convertHTMLToLexical } from '@payloadcms/richtext-lexical';
import { convertHtmlToLexical } from '../../htmlToLexical';
import { getTestLexicalEditorConfig } from './editor-config';

vi.mock('@payloadcms/richtext-lexical', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@payloadcms/richtext-lexical')>();
  return {
    ...actual,
    convertHTMLToLexical: vi.fn(actual.convertHTMLToLexical),
  };
});

const mockedConvert = vi.mocked(convertHTMLToLexical);

describe('fn: convertHtmlToLexical error handling', () => {
  it('returns an empty root when convertHTMLToLexical throws Selection is null', async () => {
    mockedConvert.mockImplementationOnce(() => {
      throw new Error('Selection is null');
    });
    const editorConfig = await getTestLexicalEditorConfig();
    const result = convertHtmlToLexical('<p>x</p>', { editorConfig });
    expect(result.root.type).toBe('root');
    expect(result.root.children).toEqual([]);
  });

  it('rethrows other convertHTMLToLexical errors', async () => {
    mockedConvert.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const editorConfig = await getTestLexicalEditorConfig();
    expect(() => convertHtmlToLexical('<p>x</p>', { editorConfig })).toThrow(
      'boom',
    );
  });

  it('rethrows non-Error throws from convertHTMLToLexical', async () => {
    mockedConvert.mockImplementationOnce(() => {
      throw 'not-an-error';
    });
    const editorConfig = await getTestLexicalEditorConfig();
    expect(() => convertHtmlToLexical('<p>x</p>', { editorConfig })).toThrow(
      'not-an-error',
    );
  });
});
