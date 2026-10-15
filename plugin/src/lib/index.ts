import { crowdinSync } from './plugin';
import {
  payloadHtmlToSlateConfig,
  payloadSlateToHtmlConfig,
} from '@slate-serializers/html';
import * as utilities from './utilities';
import { isDefined, type PluginOptions } from './types';
// helpers
import {
  getFiles,
  getFileByDocumentID,
  getFilesByDocumentID,
  getArticleDirectory,
  getLexicalFieldArticleDirectory,
  getLexicalFieldArticleDirectories,
} from './api/helpers';
import { backfillArticleDirectoryPolymorphicLinks } from './migrations/backfillArticleDirectoryPolymorphicLinks';
// translations api
import { payloadCrowdinSyncTranslationsApi } from './api/translations';
import { getLocalizedFields } from './utilities';
import * as localizedFields from 'payload-localized-fields';
import {
  extractLexicalBlockContent,
  getLexicalBlockFields,
  getLexicalEditorConfig,
  isLexical,
} from './utilities/lexical';
import { mockCrowdinClient } from './api/mock/crowdin-api-responses';
import { getRelationshipId } from './utilities/payload';
import {
  applyDocumentSlice,
  syncDocumentSource,
} from './api/adapters';

export {
  getFiles,
  crowdinSync,
  payloadCrowdinSyncTranslationsApi,
  payloadHtmlToSlateConfig,
  payloadSlateToHtmlConfig,
  PluginOptions,
  utilities,
  getFileByDocumentID,
  getFilesByDocumentID,
  getArticleDirectory,
  isDefined,
  localizedFields,
  getLocalizedFields,
  getLexicalBlockFields,
  getLexicalEditorConfig,
  isLexical,
  mockCrowdinClient,
  extractLexicalBlockContent,
  getLexicalFieldArticleDirectory,
  getLexicalFieldArticleDirectories,
  getRelationshipId,
  backfillArticleDirectoryPolymorphicLinks,
  applyDocumentSlice,
  syncDocumentSource,
};

export type {
  DocumentSlice,
  SourceWriter,
  TranslationReader,
} from './api/adapters';

export type { ArticleDirectoryRootLookup } from './api/helpers';
export type { BackfillArticleDirectoryLinksResult } from './migrations/backfillArticleDirectoryPolymorphicLinks';
