import { Payload } from "payload";
import { CrowdinArticleDirectory, CrowdinCollectionDirectory } from "../../../payload-types";
import { Config } from "payload/config";
import { PluginOptions, isCrowdinCollectionDirectory } from "../../../types";
import { Document } from 'payload/types';
import { payloadCrowdinSyncDocumentFilesApi } from "./document";

export class filesApiByArticleDirectory {
  directoryId?: number;
  document: Document
  articleDirectory: CrowdinArticleDirectory
  collectionSlug: keyof Config['collections'] | "globals";
  global: boolean;
  pluginOptions: PluginOptions;
  payload: Payload;

  constructor({
    articleDirectory,
    pluginOptions,
    payload,
  }: {
    articleDirectory: CrowdinArticleDirectory,
    pluginOptions: PluginOptions,
    payload: Payload
  }) {
    this.document = document
    this.global = false // will be set in findDocument
    this.collectionSlug = "globals" // will be set in findDocument
    this.pluginOptions = pluginOptions
    this.payload = payload
    this.articleDirectory = articleDirectory
  }

  async get() {
    await this.assertDocumentProvided()
    return new payloadCrowdinSyncDocumentFilesApi({
      document: this.document,
      articleDirectory: this.articleDirectory,
      collectionSlug: this.collectionSlug,
      global: this.global
    }, this.pluginOptions, this.payload)
  }

  async assertDocumentProvided() {
    if (!this.document || this.document.id === `undefined`) {
      this.document = await this.findDocument()
    }
  }

  async findDocument(): Promise<Document> {
    const collectionDirectoryResult = isCrowdinCollectionDirectory(this.articleDirectory.crowdinCollectionDirectory) ? this.articleDirectory.crowdinCollectionDirectory : await this.payload.findByID({
      collection: "crowdin-collection-directories",
      id: `${this.articleDirectory.crowdinCollectionDirectory}`,
    }) as unknown;
    const collectionDirectory = collectionDirectoryResult as CrowdinCollectionDirectory
    this.collectionSlug = collectionDirectory.collectionSlug as keyof Config['collections'] | "globals"
    this.global = this.collectionSlug === "globals"
    if (this.global) {
      return this.payload.findGlobal({
        slug: `${this.articleDirectory.name}`
      })
    }
    return this.payload.findByID({
      id: `${this.articleDirectory.name}`,
      collection: `${(collectionDirectory as CrowdinCollectionDirectory).name}`
    })
  }
}
