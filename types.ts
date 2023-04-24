import { Field, PayloadRequest } from "payload/types"
import { crowdinAPIService } from "./api"

export interface CollectionOptions {
  directory?: string
}

export interface PluginOptions {
  projectId: number
  directoryId?: number
  collections?: Record<string, CollectionOptions>
}

export declare type CrowdinPluginRequest = PayloadRequest & {
  crowdinClient: crowdinAPIService;
}

export type FieldWithName = Field & { name: string } 
