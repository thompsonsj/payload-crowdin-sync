import { CollectionConfig, Field } from "payload/types";
import { type SlateToHtmlConfig, type HtmlToSlateConfig } from '@slate-serializers/html'

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
  collections?: string[];
  globals?: string[];
  slateToHtmlConfig?: SlateToHtmlConfig;
  htmlToSlateConfig?: HtmlToSlateConfig;
  pluginCollectionAccess?: CollectionConfig["access"];
  pluginCollectionAdmin?: CollectionConfig["admin"];
  tabbedUI?: boolean
}

export type FieldWithName = Field & { name: string };
