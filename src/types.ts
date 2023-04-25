import { Field, PayloadRequest } from "payload/types"
import { crowdinAPIService } from "./api"

export interface CollectionOptions {
  directory?: string
}

export interface PluginOptions {
  projectId: number
  /** This should be optional? */
  directoryId: number
  localeMap?: {[key: string]: {
    crowdinId: string
  }}
  collections?: Record<string, CollectionOptions>
}

export declare type CrowdinPluginRequest = PayloadRequest & {
  crowdinClient: crowdinAPIService;
}

export type FieldWithName = Field & { name: string } 
