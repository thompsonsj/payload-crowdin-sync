import type { BlocksField as BlockField } from 'payload';
import type { PayloadRequest } from 'payload';
import {
  LEXICAL_BLOCKS_COLLECTION_SLUG,
  LEXICAL_BLOCKS_FIELD_NAME,
  buildLexicalBlocksCollectionConfig,
  buildLexicalBlocksDoc,
  buildLexicalBlocksField,
  filterLocalizedFieldsForCollection,
  isLexicalBlocksCollectionSlug,
  lexicalBlocksChildDocumentOptions,
  lexicalBlocksFolderName,
  mergeLexicalBlockTranslations,
  syncLexicalBlocks,
  writeLexicalBlockFiles,
} from './lexical-blocks';
import { pluginOptions } from '../mock/plugin-options';

const highlightBlockConfig: BlockField = {
  name: 'blocks',
  type: 'blocks',
  blocks: [
    {
      slug: 'highlight',
      fields: [
        {
          name: 'color',
          type: 'select',
          options: ['yellow', 'gray'],
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'content',
          type: 'richText',
        },
      ],
    },
  ],
};

const highlightBlock = {
  id: 'block-1',
  blockType: 'highlight' as const,
  color: 'yellow',
  title: 'Highlight title',
  content: [{ type: 'p', children: [{ text: 'Hello' }] }],
};

const req = {} as PayloadRequest;

describe('lexical-blocks', () => {
  describe('collection identity', () => {
    it('uses the mock collection slug and blocks field name', () => {
      expect(LEXICAL_BLOCKS_COLLECTION_SLUG).toBe(
        'mock-collection-for-lexical-blocks',
      );
      expect(LEXICAL_BLOCKS_FIELD_NAME).toBe('blocks');
    });

    it('recognises the mock collection slug', () => {
      expect(
        isLexicalBlocksCollectionSlug(LEXICAL_BLOCKS_COLLECTION_SLUG),
      ).toBe(true);
      expect(isLexicalBlocksCollectionSlug('posts')).toBe(false);
      expect(isLexicalBlocksCollectionSlug(undefined)).toBe(false);
    });

    it('skips localized-field filtering only for the mock collection', () => {
      expect(
        filterLocalizedFieldsForCollection(LEXICAL_BLOCKS_COLLECTION_SLUG),
      ).toBe(false);
      expect(filterLocalizedFieldsForCollection('posts')).toBe(true);
    });
  });

  describe('folder naming', () => {
    it('prefixes the Lexical field name, including nested dot notation', () => {
      expect(lexicalBlocksFolderName('lex.', 'content')).toBe('lex.content');
      expect(
        lexicalBlocksFolderName('lex.', 'group.array.abc.content'),
      ).toBe('lex.group.array.abc.content');
    });

    it('treats a missing prefix as an empty string', () => {
      expect(lexicalBlocksFolderName(undefined, 'content')).toBe('content');
    });
  });

  describe('mock collection and document', () => {
    it('builds a localized blocks field from the editor block config', () => {
      expect(buildLexicalBlocksField(highlightBlockConfig)).toEqual({
        name: LEXICAL_BLOCKS_FIELD_NAME,
        type: 'blocks',
        localized: true,
        blocks: highlightBlockConfig.blocks,
      });
    });

    it('builds the mock collection used for nested HTML sync', () => {
      expect(buildLexicalBlocksCollectionConfig(highlightBlockConfig)).toEqual({
        slug: LEXICAL_BLOCKS_COLLECTION_SLUG,
        fields: [buildLexicalBlocksField(highlightBlockConfig)],
      });
    });

    it('wraps extracted block content as a document with a blocks field', () => {
      expect(buildLexicalBlocksDoc([highlightBlock])).toEqual({
        blocks: [highlightBlock],
      });
    });
  });

  describe('lexicalBlocksChildDocumentOptions', () => {
    it('names the nested Crowdin directory after the prefixed field', () => {
      const parent = 'parent-dir';
      expect(
        lexicalBlocksChildDocumentOptions({
          folderName: 'lex.content',
          fieldName: 'content',
          collectionSlug: 'posts',
          pluginOptions,
          req,
          parent,
        }),
      ).toEqual({
        document: {
          id: 'lex.content',
          title: 'content',
        },
        collectionSlug: 'posts',
        global: false,
        pluginOptions,
        req,
        parent,
      });
    });
  });

  describe('writeLexicalBlockFiles', () => {
    it('writes JSON keyed by block id and HTML under the mock collection', async () => {
      const filesApi = {
        createOrUpdateJsonFile: vi.fn().mockResolvedValue(undefined),
        createOrUpdateHtmlFile: vi.fn().mockResolvedValue(undefined),
      };

      await writeLexicalBlockFiles({
        filesApi,
        blockContent: [highlightBlock],
        blockConfig: highlightBlockConfig,
        req,
      });

      expect(filesApi.createOrUpdateJsonFile).toHaveBeenCalledTimes(1);
      expect(filesApi.createOrUpdateJsonFile).toHaveBeenCalledWith({
        fileData: {
          blocks: {
            'block-1': {
              highlight: {
                title: 'Highlight title',
              },
            },
          },
        },
        fileName: LEXICAL_BLOCKS_FIELD_NAME,
        req,
      });

      expect(filesApi.createOrUpdateHtmlFile).toHaveBeenCalledTimes(1);
      expect(filesApi.createOrUpdateHtmlFile).toHaveBeenCalledWith({
        name: 'blocks.block-1.highlight.content',
        value: highlightBlock.content,
        collection: buildLexicalBlocksCollectionConfig(highlightBlockConfig),
      });
    });
  });

  describe('syncLexicalBlocks', () => {
    it('opens a nested files API for the prefixed folder, then writes files', async () => {
      const parent = 'parent-dir';
      const filesApi = {
        createOrUpdateJsonFile: vi.fn().mockResolvedValue(undefined),
        createOrUpdateHtmlFile: vi.fn().mockResolvedValue(undefined),
      };
      const getNestedFilesApi = vi.fn().mockResolvedValue(filesApi);

      await syncLexicalBlocks({
        fieldName: 'content',
        collectionSlug: 'posts',
        blockContent: [highlightBlock],
        blockConfig: highlightBlockConfig,
        pluginOptions: { ...pluginOptions, lexicalBlockFolderPrefix: 'lex.' },
        req,
        parent,
        getNestedFilesApi,
      });

      expect(getNestedFilesApi).toHaveBeenCalledWith(
        lexicalBlocksChildDocumentOptions({
          folderName: 'lex.content',
          fieldName: 'content',
          collectionSlug: 'posts',
          pluginOptions: {
            ...pluginOptions,
            lexicalBlockFolderPrefix: 'lex.',
          },
          req,
          parent,
        }),
      );
      expect(filesApi.createOrUpdateJsonFile).toHaveBeenCalled();
      expect(filesApi.createOrUpdateHtmlFile).toHaveBeenCalled();
    });
  });

  describe('mergeLexicalBlockTranslations', () => {
    const translatedContent = [{ type: 'p', children: [{ text: 'Bonjour' }] }];

    it('keeps source-only json fields and uses translated text and html', () => {
      const result = mergeLexicalBlockTranslations({
        blockConfig: highlightBlockConfig,
        crowdinJsonObject: {
          blocks: {
            'block-1': {
              highlight: {
                title: 'Titre',
              },
            },
          },
        },
        crowdinHtmlObject: {
          'blocks.block-1.highlight.content': translatedContent,
        },
        sourceBlocks: [highlightBlock],
      });

      expect(result).toEqual({
        blocks: [
          {
            id: 'block-1',
            blockType: 'highlight',
            color: 'yellow',
            title: 'Titre',
            content: translatedContent,
          },
        ],
      });
    });

    it('parses sourceBlocks JSON stored on Crowdin files', () => {
      const result = mergeLexicalBlockTranslations({
        blockConfig: highlightBlockConfig,
        crowdinJsonObject: {
          blocks: {
            'block-1': {
              highlight: {
                title: 'Titre',
              },
            },
          },
        },
        sourceBlocks: JSON.stringify([highlightBlock]),
      });

      expect(result.blocks[0].color).toBe('yellow');
      expect(result.blocks[0].title).toBe('Titre');
    });

    it('returns translations unchanged when there is no source', () => {
      const result = mergeLexicalBlockTranslations({
        blockConfig: highlightBlockConfig,
        crowdinJsonObject: {
          blocks: {
            'block-1': {
              highlight: {
                title: 'Titre',
              },
            },
          },
        },
      });

      expect(result).toEqual({
        blocks: [
          {
            id: 'block-1',
            blockType: 'highlight',
            title: 'Titre',
          },
        ],
      });
    });
  });
});
