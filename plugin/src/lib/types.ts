import { CollectionConfig, Field } from "payload/types";
import { type SlateToHtmlConfig, type HtmlToSlateConfig } from '@slate-serializers/html'

type CollectionOrGlobalConfigSlug = string
type CollectionOrGlobalConfigObject = {
  slug: string;
  manualDocumentTranslationFlag?: boolean;
} 

type CollectionOrGlobalConfig = CollectionOrGlobalConfigSlug | CollectionOrGlobalConfigObject

// type guard: determine type of config 
export const isCollectionOrGlobalConfigObject = (collectionOrGlobalConfig: CollectionOrGlobalConfig): collectionOrGlobalConfig is CollectionOrGlobalConfigObject => typeof collectionOrGlobalConfig === 'object';

export interface PluginOptions {
  projectId: number;
  /** This should be optional? */
  directoryId?: number;
  token: string;
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
}

export type FieldWithName = Field & { name: string };
