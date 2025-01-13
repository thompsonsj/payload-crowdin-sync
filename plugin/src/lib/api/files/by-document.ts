import { CrowdinArticleDirectory } from "../../payload-types";
import { isCrowdinArticleDirectory, PluginOptions } from "../../types";
import type { CollectionConfig, CollectionSlug, Document, GlobalSlug, PayloadRequest } from 'payload';
import { toWords } from 'payload';
import { payloadCrowdinSyncDocumentFilesApi } from "./document";
import { getCollectionConfig } from "../helpers";

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crowdin = require('@crowdin/crowdin-api-client');
import { Credentials, SourceFiles } from "@crowdin/crowdin-api-client";

interface IfindOrCreateCollectionDirectory {
  collectionSlug: CollectionSlug | "globals";
}

/**
 * Get Files API by document
 *
 * Initialize filesApiByDocument and use the getter to retrive
 * an instance of the files API.
 *
 * The files API does not need to know specifics about setting
 * up Crowdin Article Directories...etc. All that logic is
 * handled here and a getter is used in order to be able to
 * pass properties dynamically.
 */
export class filesApiByDocument {
  sourceFilesApi: SourceFiles;
  projectId: number;
  directoryId?: number;
  document: Document
  articleDirectory: CrowdinArticleDirectory
  collectionSlug: CollectionSlug | GlobalSlug;
  global: boolean;
  pluginOptions: PluginOptions;
  req: PayloadRequest;
  parent?: CrowdinArticleDirectory['parent'];

  constructor({
    document,
    collectionSlug,
    global,
    pluginOptions,
    req,
    parent,
  }: {
    document: Document,
    collectionSlug: CollectionSlug | GlobalSlug,
    global: boolean,
    pluginOptions: PluginOptions,
    req: PayloadRequest,
    /** Lexical field blocks use their own CrowdinArticleDirectory. */
    parent?: CrowdinArticleDirectory['parent'],
  }) {
    // credentials
    const credentials: Credentials = {
      token: pluginOptions.token,
      organization: pluginOptions.organization,
    };
    const { sourceFilesApi } = new crowdin.default(credentials);
    this.projectId = pluginOptions.projectId;
    this.directoryId = pluginOptions.directoryId;
    this.sourceFilesApi = sourceFilesApi;
    this.document = document
    this.collectionSlug = collectionSlug
    this.global = global
    this.pluginOptions = pluginOptions
    this.req = req
    this.parent = parent
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
    }, this.pluginOptions, this.req)
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
      crowdinPayloadArticleDirectory = this.document.crowdinArticleDirectory.id ? this.document.crowdinArticleDirectory : await this.req.payload.findByID({
        collection: "crowdin-article-directories",
        id: this.document.crowdinArticleDirectory,
        req: this.req,
      }) as unknown;
    } else {
      const crowdinPayloadCollectionDirectory =
        await this.findOrCreateCollectionDirectory({
          collectionSlug: this.global ? "globals" : this.collectionSlug,
        });

      const parent: CrowdinArticleDirectory = isCrowdinArticleDirectory(this.parent) ? this.parent : this.parent && await this.req.payload.findByID({
          collection: "crowdin-article-directories",
          id: this.parent,
          req: this.req,
        }) as any;

      // Create article directory on Crowdin
      const name = this.global ? this.collectionSlug : this.document.id
      const collectionConfig = this.global ? undefined : getCollectionConfig(
        this.collectionSlug,
        false,
        this.req.payload
      )
      const useAsTitle = (collectionConfig as CollectionConfig)?.admin?.useAsTitle
      const crowdinDirectory = await this.sourceFilesApi.createDirectory(
        this.projectId,
        {
          directoryId: (parent ? parent.originalId : crowdinPayloadCollectionDirectory?.['originalId']) as number,
          name,
          title: this.global
            ? toWords(this.collectionSlug)
            : useAsTitle && this.document[useAsTitle] || this.document.title || this.document.name, // no tests for this Crowdin metadata, but makes it easier for translators
        }
      );

      // Store result in Payload CMS
      const result = await this.req.payload.create({
        collection: "crowdin-article-directories",
        data: {
          ...(crowdinPayloadCollectionDirectory?.['id'] && {
            crowdinCollectionDirectory: `${crowdinPayloadCollectionDirectory?.['id']}`,
          }),
          originalId: crowdinDirectory.data.id,
          directoryId: crowdinDirectory.data.directoryId,
          name,
          reference: {
            createdAt: crowdinDirectory.data.createdAt,
            updatedAt: crowdinDirectory.data.updatedAt,
            projectId: this.projectId,
          },
          ...(parent && {
            parent: parent.id,
          })
        },
        req: this.req,
      }) as unknown;
      crowdinPayloadArticleDirectory = result as CrowdinArticleDirectory
      const crowdinArticleDirectory = crowdinPayloadArticleDirectory.id

      // Associate result with document
      if (!this.parent) {
        if (this.global) {
          await this.req.payload.updateGlobal({
            slug: this.collectionSlug as GlobalSlug,
            data: {
              crowdinArticleDirectory,
            } as never,
            req: this.req,
          });
        } else {
          await this.req.payload.update({
            collection: this.collectionSlug as CollectionSlug,
            id: this.document.id,
            data: {
              crowdinArticleDirectory,
            } as never,
            req: this.req,
          });
        }
      }
    }

    this.articleDirectory = crowdinPayloadArticleDirectory;
    return crowdinPayloadArticleDirectory;
  }

  private async findOrCreateCollectionDirectory({
    collectionSlug,
  }: IfindOrCreateCollectionDirectory) {
    if (this.parent) {
      return undefined
    }

    let crowdinPayloadCollectionDirectory;
    // Check whether collection directory exists on Crowdin
    const query = await this.req.payload.find({
      collection: "crowdin-collection-directories",
      where: {
        collectionSlug: {
          equals: collectionSlug,
        },
      },
      req: this.req,
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
      crowdinPayloadCollectionDirectory = await this.req.payload.create({
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
        req: this.req,
      });
    } else {
      crowdinPayloadCollectionDirectory = query.docs[0];
    }

    return crowdinPayloadCollectionDirectory;
  }
}
