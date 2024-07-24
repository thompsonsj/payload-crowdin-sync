import { Payload } from "payload";
import { CrowdinArticleDirectory } from "../../../payload-types";
import { Config } from "payload/config";
import { PluginOptions } from "../../../types";
import { Document } from 'payload/types';
import { toWords } from 'payload/dist/utilities/formatLabels';
import crowdin, { Credentials, SourceFiles } from "@crowdin/crowdin-api-client";
import { payloadCrowdinSyncDocumentFilesApi } from "./document";

interface IfindOrCreateCollectionDirectory {
  collectionSlug: keyof Config['collections'] | "globals";
}

export class filesApiByDocument {
  sourceFilesApi: SourceFiles;
  projectId: number;
  directoryId?: number;
  document: Document
  articleDirectory: CrowdinArticleDirectory
  collectionSlug: keyof Config['collections'] | "globals";
  global: boolean;
  pluginOptions: PluginOptions;
  payload: Payload;

  constructor({
    document,
    collectionSlug,
    global,
    pluginOptions,
    payload,
  }: {
    document: Document,
    collectionSlug:  keyof Config['collections'] | "globals",
    global: boolean,
    pluginOptions: PluginOptions,
    payload: Payload
  }) {
    // credentials
    const credentials: Credentials = {
      token: pluginOptions.token,
    };
    const { sourceFilesApi } = new crowdin(credentials);
    this.projectId = pluginOptions.projectId;
    this.directoryId = pluginOptions.directoryId;
    this.sourceFilesApi = sourceFilesApi;
    this.document = document
    this.collectionSlug = collectionSlug
    this.global = global
    this.pluginOptions = pluginOptions
    this.payload = payload
    /**
     * Create a undefined Crowdin Article Directory
     * 
     * Alternative approach: https://www.typescriptlang.org/tsconfig#strictPropertyInitialization
     */
    this.articleDirectory = {
      id: `undefined`,
      createdAt: `undefined`,
      updatedAt: `undefined`,
    }
  }

  async get() {
    await this.assertArticleDirectoryProvided()
    return new payloadCrowdinSyncDocumentFilesApi({
      document: this.document,
      articleDirectory: this.articleDirectory,
      collectionSlug: this.collectionSlug,
      global: this.global
    }, this.pluginOptions, this.payload)
  }

  async assertArticleDirectoryProvided() {
    if (!this.articleDirectory || this.articleDirectory.id === `undefined`) {
      this.articleDirectory = await this.findOrCreateArticleDirectory()
    }
  }

  async findOrCreateArticleDirectory(): Promise<CrowdinArticleDirectory> {
    let crowdinPayloadArticleDirectory;

    if (this.document.crowdinArticleDirectory) {
      // Update not possible. Article name needs to be updated manually on Crowdin.
      // The name of the directory is Crowdin specific helper text to give
      // context to translators.
      // See https://developer.crowdin.com/api/v2/#operation/api.projects.directories.getMany
      crowdinPayloadArticleDirectory = this.document.crowdinArticleDirectory.id ? this.document.crowdinArticleDirectory : await this.payload.findByID({
        collection: "crowdin-article-directories",
        id: this.document.crowdinArticleDirectory,
      }) as unknown;
    } else {
      const crowdinPayloadCollectionDirectory =
        await this.findOrCreateCollectionDirectory({
          collectionSlug: this.global ? "globals" : this.collectionSlug,
        });

      // Create article directory on Crowdin
      const name = this.global ? this.collectionSlug : this.document.id
      const crowdinDirectory = await this.sourceFilesApi.createDirectory(
        this.projectId,
        {
          directoryId: crowdinPayloadCollectionDirectory['originalId'] as number,
          name,
          title: this.global
            ? toWords(this.collectionSlug)
            : this.document.title || this.document.name, // no tests for this Crowdin metadata, but makes it easier for translators
        }
      );

      // Store result in Payload CMS
      const result = await this.payload.create({
        collection: "crowdin-article-directories",
        data: {
          crowdinCollectionDirectory: `${crowdinPayloadCollectionDirectory['id']}`,
          originalId: crowdinDirectory.data.id,
          directoryId: crowdinDirectory.data.directoryId,
          name,
          reference: {
            createdAt: crowdinDirectory.data.createdAt,
            updatedAt: crowdinDirectory.data.updatedAt,
            projectId: this.projectId,
          }
        },
      }) as unknown;
      crowdinPayloadArticleDirectory = result as CrowdinArticleDirectory
      const crowdinArticleDirectory = crowdinPayloadArticleDirectory.id

      // Associate result with document
      if (this.global) {
        await this.payload.updateGlobal({
          slug: this.collectionSlug as keyof Config["globals"],
          data: {
            crowdinArticleDirectory,
          } as never,
        });
      } else {
        await this.payload.update({
          collection: this.collectionSlug as keyof Config["collections"],
          id: this.document.id,
          data: {
            crowdinArticleDirectory,
          } as never,
        });
      }
    }

    this.articleDirectory = crowdinPayloadArticleDirectory;
    return crowdinPayloadArticleDirectory;
  }

  private async findOrCreateCollectionDirectory({
    collectionSlug,
  }: IfindOrCreateCollectionDirectory) {
    let crowdinPayloadCollectionDirectory;
    // Check whether collection directory exists on Crowdin
    const query = await this.payload.find({
      collection: "crowdin-collection-directories",
      where: {
        collectionSlug: {
          equals: collectionSlug,
        },
      },
    });

    if (query.totalDocs === 0) {
      // Create collection directory on Crowdin
      const crowdinDirectory = await this.sourceFilesApi.createDirectory(
        this.projectId,
        {
          directoryId: this.directoryId,
          name: collectionSlug,
          title: toWords(collectionSlug), // is this transformed value available on the collection object?
        }
      );

      // Store result in Payload CMS
      crowdinPayloadCollectionDirectory = await this.payload.create({
        collection: "crowdin-collection-directories",
        data: {
          collectionSlug: collectionSlug,
          originalId: crowdinDirectory.data.id,
          
          directoryId: crowdinDirectory.data.directoryId,
          name: collectionSlug,
          title: crowdinDirectory.data.title,
          reference: {
            createdAt: crowdinDirectory.data.createdAt,
            updatedAt: crowdinDirectory.data.updatedAt,
            projectId: this.projectId,
          }
        },
      });
    } else {
      crowdinPayloadCollectionDirectory = query.docs[0];
    }

    return crowdinPayloadCollectionDirectory;
  }
}
