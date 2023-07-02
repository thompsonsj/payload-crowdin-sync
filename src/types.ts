import { Field, PayloadRequest } from "payload/types"

export interface CollectionOptions {
  directory?: string
}

export interface PluginOptions {
  projectId: number
  /** This should be optional? */
  directoryId?: number
  token: string,
  //client: crowdinAPIService,
  localeMap: {[key: string]: {
    crowdinId: string
  }}
  collections?: Record<string, CollectionOptions>
}

export type FieldWithName = Field & { name: string } 
