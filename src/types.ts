import { Field } from "payload/types";

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
}

export type FieldWithName = Field & { name: string };
