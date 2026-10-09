import type {
  BlocksField as BlockField,
  CollectionConfig,
  CollectionSlug,
  Field,
  GlobalConfig,
  GlobalSlug,
  PayloadRequest,
} from 'payload';
import { merge } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import type { CrowdinHtmlObject, PluginOptions } from '../../types';
import type { CrowdinArticleDirectory } from '../../payload-types';
import {
  buildCrowdinHtmlObject,
  buildCrowdinJsonObject,
  buildPayloadUpdateObject,
  reLocalizeField,
} from '../../utilities';

export const LEXICAL_BLOCKS_COLLECTION_SLUG =
  'mock-collection-for-lexical-blocks';

export const LEXICAL_BLOCKS_FIELD_NAME = 'blocks';

export const isLexicalBlocksCollectionSlug = (
  collectionSlug?: string,
): boolean => collectionSlug === LEXICAL_BLOCKS_COLLECTION_SLUG;

export const filterLocalizedFieldsForCollection = (
  collectionSlug?: string,
): boolean => !isLexicalBlocksCollectionSlug(collectionSlug);

export const lexicalBlocksFolderName = (
  prefix: string | undefined,
  fieldName: string,
): string => `${prefix ?? ''}${fieldName}`;

export const buildLexicalBlocksField = (blockConfig: BlockField): BlockField => ({
  name: LEXICAL_BLOCKS_FIELD_NAME,
  type: 'blocks',
  localized: true,
  blocks: blockConfig.blocks,
});

export const buildLexicalBlocksCollectionConfig = (
  blockConfig: BlockField,
): Pick<CollectionConfig, 'slug' | 'fields'> => ({
  slug: LEXICAL_BLOCKS_COLLECTION_SLUG as CollectionConfig['slug'],
  fields: [buildLexicalBlocksField(blockConfig)],
});

export const buildLexicalBlocksDoc = (blockContent: unknown[]) => ({
  [LEXICAL_BLOCKS_FIELD_NAME]: blockContent,
});

export type LexicalBlocksFilesApi = {
  createOrUpdateJsonFile: (args: {
    fileData: string | object;
    fileName?: string;
    req?: PayloadRequest;
  }) => Promise<unknown>;
  createOrUpdateHtmlFile: (args: {
    name: string;
    value: unknown;
    collection: CollectionConfig | GlobalConfig;
  }) => Promise<unknown>;
};

export type LexicalBlocksChildDocumentOptions = {
  document: {
    id: string;
    title: string;
  };
  collectionSlug: CollectionSlug | GlobalSlug;
  global: false;
  pluginOptions: PluginOptions;
  req: PayloadRequest;
  parent?: CrowdinArticleDirectory['parent'];
};

export const lexicalBlocksChildDocumentOptions = ({
  folderName,
  fieldName,
  collectionSlug,
  pluginOptions,
  req,
  parent,
}: {
  folderName: string;
  fieldName: string;
  collectionSlug: CollectionSlug | GlobalSlug;
  pluginOptions: PluginOptions;
  req: PayloadRequest;
  parent?: CrowdinArticleDirectory['parent'];
}): LexicalBlocksChildDocumentOptions => ({
  document: {
    id: folderName,
    title: fieldName,
  },
  collectionSlug,
  global: false,
  pluginOptions,
  req,
  parent,
});

export const writeLexicalBlockFiles = async ({
  filesApi,
  blockContent,
  blockConfig,
  req,
}: {
  filesApi: LexicalBlocksFilesApi;
  blockContent: unknown[];
  blockConfig: BlockField;
  req: PayloadRequest;
}) => {
  const fields: Field[] = [buildLexicalBlocksField(blockConfig)];
  const doc = buildLexicalBlocksDoc(blockContent);
  const currentCrowdinJsonData = buildCrowdinJsonObject({
    doc,
    fields,
    isLocalized: reLocalizeField,
  });
  const currentCrowdinHtmlData = buildCrowdinHtmlObject({
    doc,
    fields,
    isLocalized: reLocalizeField,
  });
  await filesApi.createOrUpdateJsonFile({
    fileData: currentCrowdinJsonData,
    fileName: LEXICAL_BLOCKS_FIELD_NAME,
    req,
  });
  await Promise.allSettled(
    Object.keys(currentCrowdinHtmlData).map(async (name) => {
      await filesApi.createOrUpdateHtmlFile({
        name,
        value: currentCrowdinHtmlData[name],
        collection: buildLexicalBlocksCollectionConfig(
          blockConfig,
        ) as CollectionConfig,
      });
    }),
  );
};

export const syncLexicalBlocks = async ({
  fieldName,
  collectionSlug,
  blockContent,
  blockConfig,
  pluginOptions,
  req,
  parent,
  getNestedFilesApi,
}: {
  fieldName: string;
  collectionSlug: CollectionSlug | GlobalSlug;
  blockContent: unknown[];
  blockConfig: BlockField;
  pluginOptions: PluginOptions;
  req: PayloadRequest;
  parent?: CrowdinArticleDirectory['parent'];
  getNestedFilesApi: (
    options: LexicalBlocksChildDocumentOptions,
  ) => Promise<LexicalBlocksFilesApi>;
}) => {
  const folderName = lexicalBlocksFolderName(
    pluginOptions.lexicalBlockFolderPrefix,
    fieldName,
  );
  const filesApi = await getNestedFilesApi(
    lexicalBlocksChildDocumentOptions({
      folderName,
      fieldName,
      collectionSlug,
      pluginOptions,
      req,
      parent,
    }),
  );
  await writeLexicalBlockFiles({
    filesApi,
    blockContent,
    blockConfig,
    req,
  });
};

const parseSourceBlocks = (sourceBlocks: unknown): unknown[] | undefined => {
  if (typeof sourceBlocks === 'string') {
    return sourceBlocks ? JSON.parse(sourceBlocks) : undefined;
  }
  if (Array.isArray(sourceBlocks)) {
    return sourceBlocks;
  }
  return undefined;
};

export const mergeLexicalBlockTranslations = ({
  blockConfig,
  crowdinJsonObject,
  crowdinHtmlObject,
  sourceBlocks,
}: {
  blockConfig: BlockField;
  crowdinJsonObject: { [key: string]: any };
  crowdinHtmlObject?: CrowdinHtmlObject;
  sourceBlocks?: unknown;
}): { [key: string]: any } => {
  const fields: Field[] = [buildLexicalBlocksField(blockConfig)];
  const docTranslations = buildPayloadUpdateObject({
    crowdinJsonObject,
    crowdinHtmlObject,
    fields,
    isLocalized: (field) => !!field,
  });

  const parsedSource = parseSourceBlocks(sourceBlocks);
  if (!parsedSource || isEmpty(parsedSource)) {
    return docTranslations;
  }

  const sourceCrowdinJsonObject = buildCrowdinJsonObject({
    doc: buildLexicalBlocksDoc(parsedSource),
    fields,
    isLocalized: (field) => !!field,
  });
  const sourcePayloadUpdateObject = buildPayloadUpdateObject({
    crowdinJsonObject: sourceCrowdinJsonObject,
    fields,
    isLocalized: (field) => !!field,
  });

  return merge(sourcePayloadUpdateObject, docTranslations);
};
