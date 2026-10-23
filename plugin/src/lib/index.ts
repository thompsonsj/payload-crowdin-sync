import { crowdinSync } from './plugin.js';
import {
  payloadHtmlToSlateConfig,
  payloadSlateToHtmlConfig,
} from '@slate-serializers/html';
import * as utilities from './utilities/index.js';
import { isDefined, type PluginOptions } from './types.js';
// helpers
import {
  getFiles,
  getFileByDocumentID,
  getFilesByDocumentID,
  getArticleDirectory,
  getLexicalFieldArticleDirectory,
  getLexicalFieldArticleDirectories,
} from './api/helpers.js';
import { backfillArticleDirectoryPolymorphicLinks } from './migrations/backfillArticleDirectoryPolymorphicLinks.js';
// translations api
import { payloadCrowdinSyncTranslationsApi } from './api/translations.js';
import { getLocalizedFields } from './utilities/index.js';
import * as localizedFields from 'payload-localized-fields';
import {
  extractLexicalBlockContent,
  getLexicalBlockFields,
  getLexicalEditorConfig,
  isLexical,
} from './utilities/lexical/index.js';
import { mockCrowdinClient } from './api/mock/crowdin-api-responses.js';
import { filesApiByDocument } from './api/files/by-document.js';
import { getRelationshipId } from './utilities/payload.js';
import {
  applyDocumentSlice,
  syncDocumentSource,
} from './api/adapters/index.js';

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
  filesApiByDocument,
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
} from './api/adapters/index.js';

export type { ArticleDirectoryRootLookup } from './api/helpers.js';
export type { BackfillArticleDirectoryLinksResult } from './migrations/backfillArticleDirectoryPolymorphicLinks.js';
