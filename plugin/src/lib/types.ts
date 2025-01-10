import type { CollectionConfig, Field } from "payload";
import { type SlateToHtmlConfig, type HtmlToSlateConfig } from '@slate-serializers/html'
import { CrowdinArticleDirectory, CrowdinCollectionDirectory } from "./payload-types";

type CollectionOrGlobalConfigSlug = string
type CollectionOrGlobalConfigObject = {
  slug: string;
  condition?: ({ doc }: { doc: any}) => boolean;
}

type CollectionOrGlobalConfig = CollectionOrGlobalConfigSlug | CollectionOrGlobalConfigObject

// type guard: determine type of config
export const isCollectionOrGlobalConfigObject = (collectionOrGlobalConfig: CollectionOrGlobalConfig): collectionOrGlobalConfig is CollectionOrGlobalConfigObject => typeof collectionOrGlobalConfig === 'object';
export const isCollectionOrGlobalConfigSlug = (collectionOrGlobalConfig: CollectionOrGlobalConfig): collectionOrGlobalConfig is CollectionOrGlobalConfigSlug => typeof collectionOrGlobalConfig === 'string';

export const isDefined = <T>(val: T | undefined | null): val is T => {
  return val !== undefined && val !== null;
}

type RichTextValue = string | object | undefined;

export interface CrowdinHtmlObject {
  [key: string]: RichTextValue
}

export interface PluginOptions {
  projectId: number;
  /** This should be optional? */
  directoryId?: number;
  token: string;
  organization?: string;
  //client: crowdinAPIService,
  localeMap: {
    [key: string]: {
      crowdinId: string;
    };
  };
  sourceLocale: string;
  collections?: CollectionOrGlobalConfig[];
  globals?: CollectionOrGlobalConfig[];
  slateToHtmlConfig?: SlateToHtmlConfig;
  htmlToSlateConfig?: HtmlToSlateConfig;
  pluginCollectionAccess?: CollectionConfig["access"];
  pluginCollectionAdmin?: CollectionConfig["admin"];
  tabbedUI?: boolean
  lexicalBlockFolderPrefix?: string
  disableSelfClean?: boolean
}

export type FieldWithName = Field & { name: string };

// Type checkers
export const isCrowdinArticleDirectory = (val: CrowdinArticleDirectory | string | undefined | null): val is CrowdinArticleDirectory => {
  return val !== undefined && val !== null && typeof val !== 'string';
}

export const isCrowdinCollectionDirectory = (val: CrowdinCollectionDirectory | string | undefined | null): val is CrowdinCollectionDirectory => {
  return val !== undefined && val !== null && typeof val !== 'string';
}
