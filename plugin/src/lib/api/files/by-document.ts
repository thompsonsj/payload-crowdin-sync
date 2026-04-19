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
import {
  findRootArticleDirectoryPolymorphic,
  getCollectionConfig,
} from '../helpers';

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
    // Preserve `req.transactionID` here.
    // This class is used from within hooks where we may need to read/write the same document
    // inside an active transaction (e.g. attach `crowdinArticleDirectory` immediately after create).
    // Transaction stripping should be applied only to *specific committed-state reads* (e.g. uniqueness checks),
    // not blanket-applied to all operations in this workflow.
    this.req = req;
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
    let crowdinPayloadArticleDirectory: CrowdinArticleDirectory | undefined;

    crowdinPayloadArticleDirectory = await findRootArticleDirectoryPolymorphic({
      payload: this.req.payload,
      req: this.req,
      documentId: this.global
        ? (this.collectionSlug as string)
        : this.document.id,
      rootLookup: {
        collectionSlug: this.collectionSlug as string,
        global: this.global,
      },
    });

    if (!crowdinPayloadArticleDirectory && this.document.crowdinArticleDirectory) {
      // Legacy: directory id stored on the synced document (plus in-place population).
      // See https://developer.crowdin.com/api/v2/#operation/api.projects.directories.getMany
      crowdinPayloadArticleDirectory = this.document.crowdinArticleDirectory.id
        ? this.document.crowdinArticleDirectory
        : ((await this.req.payload.findByID({
            collection: 'crowdin-article-directories',
            id: this.document.crowdinArticleDirectory,
            req: this.req,
          })) as unknown);
    }

    if (!crowdinPayloadArticleDirectory) {
      const crowdinPayloadCollectionDirectory =
        await this.findOrCreateCollectionDirectory({
          collectionSlug: this.global ? 'globals' : this.collectionSlug,
        });

      if (!this.parent) {
        if (this.global) {
          const existingGlobalRoot = await this.req.payload.find({
            collection: 'crowdin-article-directories',
            where: {
              name: { equals: this.collectionSlug as string },
            },
            limit: 1,
            req: this.req,
            overrideAccess: true,
          });
          if (existingGlobalRoot.docs[0]) {
            crowdinPayloadArticleDirectory =
              existingGlobalRoot.docs[0] as CrowdinArticleDirectory;
          }
        } else if (crowdinPayloadCollectionDirectory?.id) {
          const existingCollectionRoot = await this.req.payload.find({
            collection: 'crowdin-article-directories',
            where: {
              and: [
                { name: { equals: `${this.document.id}` } },
                {
                  crowdinCollectionDirectory: {
                    equals: crowdinPayloadCollectionDirectory.id,
                  },
                },
              ],
            },
            limit: 1,
            req: this.req,
            overrideAccess: true,
          });
          if (existingCollectionRoot.docs[0]) {
            crowdinPayloadArticleDirectory =
              existingCollectionRoot.docs[0] as CrowdinArticleDirectory;
          }
        }
      }

      if (!crowdinPayloadArticleDirectory) {
        const parent =
          isCrowdinArticleDirectory(this.parent) ? this.parent : undefined;
        const parentId =
          typeof this.parent === 'string' && this.parent.length > 0
            ? this.parent
            : undefined;
        const resolvedParent =
          parent ??
          (parentId
            ? ((await this.req.payload.findByID({
                collection: 'crowdin-article-directories',
                id: parentId,
                req: this.req,
              })) as CrowdinArticleDirectory)
            : undefined);

        // Create article directory on Crowdin
        const name = this.global ? this.collectionSlug : this.document.id;
        let collectionConfig: CollectionConfig | GlobalConfig | undefined;
        try {
          // Lexical block syncing uses an internal "mock" collection config to
          // avoid requiring a real collection definition for derived block fields.
          // That slug will never exist in the Payload config, so skip lookup.
          if (this.collectionSlug !== 'mock-collection-for-lexical-blocks') {
            collectionConfig = getCollectionConfig(
              this.collectionSlug,
              this.global,
              this.req.payload,
            );
          }
        } catch (error) {
          // Avoid noisy logs for non-critical config lookup failures.
          if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
            console.log(error);
          }
        }
        const useAsTitle = (collectionConfig as CollectionConfig | undefined)
          ?.admin?.useAsTitle;

        crowdinPayloadArticleDirectory = await this.crowdinFindOrCreateDirectory({
          parent: resolvedParent,
          crowdinPayloadCollectionDirectory,
          name,
          useAsTitle,
        });

        if (!crowdinPayloadArticleDirectory) {
          throw new Error('Crowdin article directory not found');
        }

        // Canonical link lives on crowdin-article-directories (collectionDocument / globalSlug).
        // Do not write crowdinArticleDirectory back onto the source document or global.
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
      overrideAccess: true,
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
        overrideAccess: true,
      });
    } else {
      crowdinPayloadCollectionDirectory = query.docs[0];
    }

    return crowdinPayloadCollectionDirectory as CrowdinCollectionDirectory;
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
          if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
            console.log(
              `Directory "${name}" already exists on Crowdin in parent directory ${parentDirectoryId}. Attempting to find and sync existing directory...`,
            );
          }

          // Try to find the existing directory on Crowdin
          const existingCrowdinDirectory =
            await this.crowdinFindDirectoryByName(name, parentDirectoryId);

          if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
            console.log('existingCrowdinDirectory', existingCrowdinDirectory);
          }

          if (existingCrowdinDirectory) {
            if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
              console.log(
                `Found existing directory on Crowdin. Directory ID: ${existingCrowdinDirectory.data.id}`,
              );
            }

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
          ...(this.global && !parent && {
            globalSlug: this.collectionSlug as string,
          }),
        },
        req: this.req,
      });
      return result as CrowdinArticleDirectory
    } catch (error) {
      console.error(error);
    }
  }
}
