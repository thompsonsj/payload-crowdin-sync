import {
  CrowdinArticleDirectory,
  CrowdinCollectionDirectory,
} from '../../payload-types';
import { isCrowdinArticleDirectory, PluginOptions } from '../../types';
import type {
  CollectionConfig,
  CollectionSlug,
  Document,
  GlobalConfig,
  GlobalSlug,
  PayloadRequest,
} from 'payload';
import { toWords } from 'payload';
import { payloadCrowdinSyncDocumentFilesApi } from './document';
import { getCollectionConfig } from '../helpers';

import * as crowdin from '@crowdin/crowdin-api-client';

import {
  Client,
  Credentials,
  ResponseObject,
  SourceFiles,
  SourceFilesModel,
} from '@crowdin/crowdin-api-client';

interface IfindOrCreateCollectionDirectory {
  collectionSlug: CollectionSlug | 'globals';
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
  document: Document;
  articleDirectory: CrowdinArticleDirectory;
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
    document: Document;
    collectionSlug: CollectionSlug | GlobalSlug;
    global: boolean;
    pluginOptions: PluginOptions;
    req: PayloadRequest;
    /** Lexical field blocks use their own CrowdinArticleDirectory. */
    parent?: CrowdinArticleDirectory['parent'];
  }) {
    // credentials
    const credentials: Credentials = {
      token: pluginOptions.token,
      organization: pluginOptions.organization,
    };
    const { sourceFilesApi } = new Client(credentials);
    this.projectId = pluginOptions.projectId;
    this.directoryId = pluginOptions.directoryId;
    this.sourceFilesApi = sourceFilesApi;
    this.document = document;
    this.collectionSlug = collectionSlug;
    this.global = global;
    this.pluginOptions = pluginOptions;
    // This class performs side-effectful, long-running operations (Crowdin API + DB reads/writes).
    // In tests (and sometimes in app code), hooks can carry `req.transactionID` from an active write.
    // Reusing that transaction/session for nested local API calls is a common source of MongoDB
    // transaction/session mismatch errors (especially with Mongo Memory Server / replica sets).
    // Strip the transaction so reads operate on committed state and writes don't hold locks longer than needed.
    this.req = {
      ...req,
      transactionID: undefined,
    } as PayloadRequest;
    this.parent = parent;
    /**
     * Create a undefined Crowdin Article Directory
     *
     * Alternative approach: https://www.typescriptlang.org/tsconfig#strictPropertyInitialization
     */
    this.articleDirectory = {
      id: `undefined`,
      createdAt: `undefined`,
      updatedAt: `undefined`,
    };
  }

  async get() {
    await this.assertArticleDirectoryProvided();
    return new payloadCrowdinSyncDocumentFilesApi(
      {
        document: this.document,
        articleDirectory: this.articleDirectory,
        collectionSlug: this.collectionSlug,
        global: this.global,
      },
      this.pluginOptions,
      this.req,
    );
  }

  async assertArticleDirectoryProvided() {
    if (!this.articleDirectory || this.articleDirectory.id === `undefined`) {
      this.articleDirectory = await this.findOrCreateArticleDirectory();
    }
  }

  /** this is where the problem lies? */
  async findOrCreateArticleDirectory(): Promise<CrowdinArticleDirectory> {
    let crowdinPayloadArticleDirectory;
    if (this.document.crowdinArticleDirectory) {
      // Update not possible. Article name needs to be updated manually on Crowdin.
      // The name of the directory is Crowdin specific helper text to give
      // context to translators.
      // See https://developer.crowdin.com/api/v2/#operation/api.projects.directories.getMany
      crowdinPayloadArticleDirectory = this.document.crowdinArticleDirectory.id
        ? this.document.crowdinArticleDirectory
        : ((await this.req.payload.findByID({
            collection: 'crowdin-article-directories',
            id: this.document.crowdinArticleDirectory,
            req: this.req,
          })) as unknown);
    } else {
      const crowdinPayloadCollectionDirectory =
        await this.findOrCreateCollectionDirectory({
          collectionSlug: this.global ? 'globals' : this.collectionSlug,
        });

      const parent = isCrowdinArticleDirectory(this.parent)
        ? this.parent
        : this.parent &&
          ((await this.req.payload.findByID({
            collection: 'crowdin-article-directories',
            id: this.parent,
            req: this.req,
          })) as CrowdinArticleDirectory);

      // Create article directory on Crowdin
      const name = this.global ? this.collectionSlug : this.document.id;
      let collectionConfig: CollectionConfig | GlobalConfig;
      try {
        collectionConfig = getCollectionConfig(
          this.collectionSlug,
          this.global,
          this.req.payload,
        );
      } catch (error) {
        console.log(error);
      }
      const useAsTitle = (collectionConfig as CollectionConfig)?.admin
        ?.useAsTitle;

      crowdinPayloadArticleDirectory = await this.crowdinFindOrCreateDirectory({
        parent,
        crowdinPayloadCollectionDirectory,
        name,
        useAsTitle,
      });

      // Store result in Payload CMS
      if (!crowdinPayloadArticleDirectory) {
        throw new Error('Crowdin article directory not found');
      }
      const crowdinArticleDirectory = crowdinPayloadArticleDirectory.id;

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
  }: IfindOrCreateCollectionDirectory): Promise<
    CrowdinCollectionDirectory | undefined
  > {
    if (this.parent) {
      return undefined;
    }

    let crowdinPayloadCollectionDirectory;
    // Check whether collection directory exists on Crowdin
    const query = await this.req.payload.find({
      collection: 'crowdin-collection-directories',
      where: {
        collectionSlug: {
          equals: collectionSlug,
        },
      },
      req: this.req,
    });

    if (query.totalDocs === 0) {
      // Create collection directory on Crowdin
      if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
        console.log(
          `Creating collection directory on Crowdin: ${collectionSlug}`,
        );
      }
      const crowdinDirectory = await this.sourceFilesApi.createDirectory(
        this.projectId,
        {
          directoryId: this.directoryId,
          name: collectionSlug,
          title: toWords(collectionSlug), // is this transformed value available on the collection object?
        },
      );

      // Store result in Payload CMS
      crowdinPayloadCollectionDirectory = await this.req.payload.create({
        collection: 'crowdin-collection-directories',
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
          },
        },
        req: this.req,
      });
    } else {
      crowdinPayloadCollectionDirectory = query.docs[0];
    }

    return crowdinPayloadCollectionDirectory;
  }

  /**
   * Check if a directory exists on Crowdin
   *
   * Field directories are stored in article directories.
   *
   * The existence check is done in Payload CMS -
   * check for a CrowdinArticleDirectory with the same name.
   */
  async crowdinFindFieldDirectory({
    parent,
    name,
  }: {
    parent: CrowdinArticleDirectory;
    name: string;
  }) {
    try {
      const result = await this.req.payload.find({
        collection: 'crowdin-article-directories',
        where: {
          name: {
            equals: name,
          },
          parent: {
            equals: parent.id,
          },
        },
      });
      if (result.totalDocs === 0) {
        return undefined;
      }
      return result.docs[0] as CrowdinArticleDirectory;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Find an existing directory on Crowdin by listing directories
   */
  async crowdinFindDirectoryByName(
    name: string,
    parentDirectoryId: number,
  ): Promise<ResponseObject<SourceFilesModel.Directory> | undefined> {
    try {
      // List all directories in the parent directory
      const response = await this.sourceFilesApi.listProjectDirectories(
        this.projectId,
        {
          directoryId: parentDirectoryId,
        },
      );

      // Find the directory with matching name
      const directory = response.data.find((d) => d.data.name === name);
      return directory;
    } catch (error) {
      console.error(
        `Error finding directory "${name}" in parent directory ${parentDirectoryId}:`,
        error,
      );
      return undefined;
    }
  }

  /**
   * Create a directory on Crowdin
   */
  async crowdinFindOrCreateDirectory({
    parent,
    crowdinPayloadCollectionDirectory,
    name,
    useAsTitle,
  }: {
    parent?: CrowdinArticleDirectory;
    crowdinPayloadCollectionDirectory?: CrowdinCollectionDirectory;
    name: string;
    useAsTitle?: string;
  }) {
    try {
      // Check if directory already exists in Payload database
      const existingDirectory =
        parent &&
        (await this.crowdinFindFieldDirectory({
          parent,
          name,
        }));
      if (existingDirectory) {
        // Directory already exists in Payload
        return existingDirectory;
      }

      const parentDirectoryId = (parent
        ? parent.originalId
        : crowdinPayloadCollectionDirectory?.['originalId']) as number;

      const title = this.global
        ? toWords(this.collectionSlug)
        : (useAsTitle && this.document[useAsTitle]) ||
          this.document.title ||
          this.document.name;

      try {
        const crowdinDirectory = await this.sourceFilesApi.createDirectory(
          this.projectId,
          {
            directoryId: parentDirectoryId,
            name,
            title, // no tests for this Crowdin metadata, but makes it easier for translators
          },
        );
        const result = await this.payloadStoreCrowdinDirectory({
          crowdinDirectory,
          crowdinPayloadCollectionDirectory,
          name,
          parent,
        });
        return result as CrowdinArticleDirectory;
      } catch (createError: any) {
        // Check if this is a "name must be unique" error
        const isNameConflictError =
          createError?.error?.errors?.some(
            (e: any) =>
              e?.error?.key === 'directory.name.is_already_exists' ||
              e?.error?.key === 'directory.name' ||
              String(createError).includes('Name must be unique'),
          ) || String(createError).includes('Name must be unique');

        if (isNameConflictError) {
          console.log(
            `Directory "${name}" already exists on Crowdin in parent directory ${parentDirectoryId}. Attempting to find and sync existing directory...`,
          );

          // Try to find the existing directory on Crowdin
          const existingCrowdinDirectory =
            await this.crowdinFindDirectoryByName(name, parentDirectoryId);

          if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
            console.log('existingCrowdinDirectory', existingCrowdinDirectory);
          }

          if (existingCrowdinDirectory) {
            console.log(
              `Found existing directory on Crowdin. Directory ID: ${existingCrowdinDirectory.data.id}`,
            );

            // Check if it already exists in Payload (might have been created by another process)
            if (parent) {
              const existingInPayload = await this.crowdinFindFieldDirectory({
                parent: parent,
                name,
              });

              if (existingInPayload) {
                return existingInPayload;
              }
            }

            // Store the existing directory in Payload database
            const result = await this.payloadStoreCrowdinDirectory({
              crowdinDirectory: existingCrowdinDirectory,
              crowdinPayloadCollectionDirectory,
              name,
              parent,
            });
            return result as CrowdinArticleDirectory;
          } else {
            console.error(
              `Could not find existing directory "${name}" on Crowdin despite name conflict error.`,
            );
            throw createError;
          }
        } else {
          // Different error, re-throw
          throw createError;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Store a record of the Crowdin directory in Payload CMS
   *
   * This is how we can find the directory on Crowdin later.
   */
  async payloadStoreCrowdinDirectory({
    crowdinDirectory,
    crowdinPayloadCollectionDirectory,
    name,
    parent,
  }: {
    crowdinDirectory: ResponseObject<SourceFilesModel.Directory>;
    crowdinPayloadCollectionDirectory?: CrowdinCollectionDirectory;
    name: string;
    parent?: CrowdinArticleDirectory;
  }) {
    try {
      const result = await this.req.payload.create({
        collection: 'crowdin-article-directories',
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
          }),
        },
        req: this.req,
      });
      return result as CrowdinArticleDirectory;
    } catch (error) {
      console.error(error);
    }
  }
}
