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
// translations api
import { payloadCrowdinSyncTranslationsApi } from './api/translations';
import { getLocalizedFields } from './utilities';
import {
  extractLexicalBlockContent,
  getLexicalBlockFields,
  getLexicalEditorConfig,
  isLexical,
} from './utilities/lexical';
import { getRelationshipId } from './utilities/payload';

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
  getLocalizedFields,
  getLexicalBlockFields,
  getLexicalEditorConfig,
  isLexical,
  extractLexicalBlockContent,
  getLexicalFieldArticleDirectory,
  getLexicalFieldArticleDirectories,
  getRelationshipId,
};
