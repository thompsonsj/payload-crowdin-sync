import type {
  BlocksField as BlockField,
  CollectionAfterChangeHook,
  CollectionConfig,
  Config,
  Document,
  Field,
  GlobalConfig,
  GlobalAfterChangeHook,
  PayloadRequest,
  RichTextField,
  CollectionSlug,
  GlobalSlug,
} from "payload";
import { Descendant } from "slate";
import {isCrowdinArticleDirectory, PluginOptions } from "../../types";
import {
  buildCrowdinHtmlObject,
  buildCrowdinJsonObject,
  fieldChanged,
  findField,
  reLocalizeField
} from "../../utilities";
import deepEqual from "deep-equal";
import { getLocalizedFields } from "../../utilities";
import {
  isCrowdinActive,
  getFile,
  getFiles
} from "../../api/helpers";

import { CrowdinArticleDirectory, CrowdinFile } from "./../../payload-types";
import { toWords } from 'payload';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crowdin = require('@crowdin/crowdin-api-client');
import { Credentials, SourceFiles, UploadStorage } from "@crowdin/crowdin-api-client";

import { getCollectionConfig, getArticleDirectory,
  getFileByDocumentID,
  getFilesByDocumentID, } from "./../../api/helpers";

import { isEmpty } from 'es-toolkit/compat';

import { convertLexicalToHtml, convertSlateToHtml } from '../../utilities/richTextConversion'
import { extractLexicalBlockContent, getLexicalBlockFields, getLexicalEditorConfig } from '../../utilities/lexical';

interface IcreateOrUpdateFile {
  name: string;
  fileData: string | object;
  fileType: "html" | "json";
}

interface IcreateFile extends IcreateOrUpdateFile {
  directoryId: number;
}

interface IupdateCrowdinFile extends IcreateOrUpdateFile {
  fileId: number;
}

export class payloadCrowdinSyncFilesApi {
  sourceFilesApi: SourceFiles; 
  uploadStorageApi: UploadStorage;
  projectId: number;
  directoryId?: number;
  req: PayloadRequest;
  pluginOptions: PluginOptions;

  constructor(pluginOptions: PluginOptions, req: PayloadRequest) {
    // credentials
    const credentials: Credentials = {
      token: pluginOptions.token,
    };
    const { sourceFilesApi, uploadStorageApi } = new crowdin.default(credentials);
    this.projectId = pluginOptions.projectId;
    this.directoryId = pluginOptions.directoryId;
    this.sourceFilesApi = sourceFilesApi;
    this.uploadStorageApi = uploadStorageApi;
    this.req = req;
    this.pluginOptions = pluginOptions;
  }

  protected async crowdinUpdateFile({
    fileId,
    name,
    fileData,
    fileType,
  }: IupdateCrowdinFile) {
    const storage = await this.uploadStorageApi.addStorage(
      name,
      fileData,
      fileType
    );
    //const file = await sourceFilesApi.deleteFile(projectId, 1161)
    const file = await this.sourceFilesApi.updateOrRestoreFile(
      this.projectId,
      fileId,
      {
        storageId: storage.data.id,
      }
    );
    return file;
  }

  protected async crowdinCreateFile({
    name,
    fileData,
    fileType,
    directoryId,
  }: IcreateFile) {
    const storage = await this.uploadStorageApi.addStorage(
      name,
      fileData,
      fileType
    );
    const options = {
      name: `${name}.${fileType}`,
      title: name,
      storageId: storage.data.id,
      directoryId,
      type: fileType,
    };
    try {
      const file = await this.sourceFilesApi.createFile(
        this.projectId,
        options
      );
      return file;
    } catch (error) {
      console.error(error, options);
    }
    return
  }

  async getArticleDirectory(documentId: string): Promise<CrowdinArticleDirectory | undefined> {
    const result = await getArticleDirectory({
      documentId,
      payload: this.req.payload,
      req: this.req
    });
    return result as CrowdinArticleDirectory | undefined;
  }

  async deleteArticleDirectory(documentId: string) {
    const crowdinPayloadArticleDirectory = await this.getArticleDirectory(
      documentId
    );
    if (!crowdinPayloadArticleDirectory || !crowdinPayloadArticleDirectory.originalId) {
      return
    }
    await this.sourceFilesApi.deleteDirectory(
      this.projectId,
      crowdinPayloadArticleDirectory.originalId
    );
    await this.req.payload.delete({
      collection: "crowdin-article-directories",
      id: crowdinPayloadArticleDirectory.id,
      req: this.req,
    });
  }

  async getFileByDocumentID(name: string, documentId: string) {
    const result = await getFileByDocumentID(name, documentId, this.req.payload);
    return result;
  }

  async getFilesByDocumentID(documentId: string) {
    const result = await getFilesByDocumentID({documentId, payload: this.req.payload});
    return result;
  }
}


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

type FileData = string | object;

interface IupdateOrCreateFile {
  name: string;
  fileData: FileData;
  fileType: "html" | "json";
  sourceBlocks?: unknown[]
}

class payloadCrowdinSyncDocumentFilesApi extends payloadCrowdinSyncFilesApi {
  document: Document
  articleDirectory: CrowdinArticleDirectory
  collectionSlug: CollectionSlug | "globals";
  global?: boolean;

  constructor({
    document,
    articleDirectory,
    collectionSlug,
    global,
  }: {
    document: Document,
    articleDirectory: CrowdinArticleDirectory,
    collectionSlug:  CollectionSlug | "globals",
    global: boolean,
  }, pluginOptions: PluginOptions, req: PayloadRequest) {
    super(pluginOptions, req);
    this.document = document
    this.articleDirectory = articleDirectory
    this.collectionSlug = collectionSlug
    this.global = global
  }

  /**
   * getFile
   * 
   * Retrieve a CrowdinFile associated with this document by name. 
   * 
   * @param name file name
   * @returns CrowdinFile
   */
  async getFile(name: string): Promise<CrowdinFile> {
    return getFile(name, this.articleDirectory.id, this.req.payload);
  }

  /**
   * getFiles
   * 
   * Retrieve all CrowdinFile types associated with this document. 
   * 
   * @returns CrowdinFile[]
   */
  async getFiles(): Promise<CrowdinFile[]> {
    return getFiles(this.articleDirectory.id, this.req.payload);
  }

  /**
   * Create/Update/Delete a file on Crowdin
   *
   * Records the file in Payload CMS under the `crowdin-files` collection.
   *
   * - Create a file if it doesn't exist on Crowdin and the supplied content is not empty
   * - Update a file if it exists on Crowdin and the supplied content is not empty
   * - Delete a file if it exists on Crowdin and the supplied file content is empty
   */
  async createOrUpdateFile({
    name,
    fileData,
    fileType,
    sourceBlocks,
  }: IupdateOrCreateFile) {
    const empty = isEmpty(fileData);
    // Check whether file exists on Crowdin
    const crowdinFile = await this.getFile(name);
    let updatedCrowdinFile;
    if (!empty) {
      if (!crowdinFile) {
        updatedCrowdinFile = await this.createFile({
          name,
          fileData,
          fileType,
          sourceBlocks,
        });
      } else {
        updatedCrowdinFile = await this.updateFile({
          crowdinFile,
          name: name,
          fileData,
          fileType,
          sourceBlocks,
        });
      }
    } else {
      if (crowdinFile) {
        updatedCrowdinFile = await this.deleteFile(crowdinFile);
      }
    }
    return updatedCrowdinFile;
  }

  private async updateFile({
    crowdinFile,
    name,
    fileData,
    fileType,
    sourceBlocks,
  }: {crowdinFile: CrowdinFile} & IupdateOrCreateFile) {
    // Update file on Crowdin
    const updatedCrowdinFile = await this.crowdinUpdateFile({
      fileId: crowdinFile.originalId as number,
      name,
      fileData,
      fileType,
    });

    await this.req.payload.update({
      collection: "crowdin-files", // required
      id: crowdinFile.id,
      data: {
        // required
        updatedAt: updatedCrowdinFile.data.updatedAt,
        revisionId: updatedCrowdinFile.data.revisionId,
        ...(fileType === "json" && { fileData: { json: (fileData as {
          [k: string]: Partial<unknown>;
        }) }}),
        ...(fileType === "html" && { fileData: { html: typeof fileData === 'string' ? fileData : JSON.stringify(fileData), ...(sourceBlocks && { sourceBlocks: JSON.stringify(sourceBlocks) }) } }),
      },
      req: this.req,
    });
  }

  private async createFile({
    name,
    fileData,
    fileType,
    sourceBlocks,
  }: IupdateOrCreateFile) {
    // Create file on Crowdin
    const originalId = this.articleDirectory.originalId
    if (originalId) {
      const crowdinFile = await this.crowdinCreateFile({
        directoryId: originalId,
        name,
        fileData,
        fileType,
      });
      // Store result on Payload CMS
      if (crowdinFile) {
        const payloadCrowdinFile = await this.req.payload.create({
          collection: "crowdin-files", // required
          data: {
            // required
            title: name,
            field: name,
            crowdinArticleDirectory: this.articleDirectory.id,
            reference: {
              createdAt: crowdinFile.data.createdAt,
              updatedAt: crowdinFile.data.updatedAt,
              projectId: crowdinFile.data.projectId,
            },
            originalId: crowdinFile.data.id,
            directoryId: crowdinFile.data.directoryId,
            revisionId: crowdinFile.data.revisionId,
            name: `${name}.${fileType}`,
            type: fileType,
            path: crowdinFile.data.path,
            ...(fileType === "json" && { fileData: { json: (fileData as {
              [k: string]: Partial<unknown>;
            }) } }),
            ...(fileType === "html" && { fileData: { html: typeof fileData === 'string' ? fileData : JSON.stringify(fileData), ...(sourceBlocks && { sourceBlocks: JSON.stringify(sourceBlocks) })} }),
          },
          req: this.req,
        });
        return payloadCrowdinFile;
      }
    }
    return
  }

  async deleteFile(crowdinFile: CrowdinFile) {
    await this.sourceFilesApi.deleteFile(
      this.projectId,
      crowdinFile.originalId as number
    );
    const payloadFile = await this.req.payload.delete({
      collection: "crowdin-files", // required
      id: crowdinFile.id, // required
      req: this.req,
    });
    return payloadFile;
  }

  async createOrUpdateJsonFile({
    fileData,
    fileName = "fields",
    req,
  }: {
    fileData: FileData,
    fileName?: string,
    req?: PayloadRequest
  }) {
    await this.createOrUpdateFile({
      name: fileName,
      fileData,
      fileType: "json",
    });
  }

  async createOrUpdateHtmlFile({
    name,
    value,
    collection,
  }: {
    name: string;
    value: Descendant[] | any;
    collection: CollectionConfig | GlobalConfig;
  }) {
    // brittle check for Lexical value - improve this detection. Type check? Anything from Payload to indicate the type?
    let html, blockContent, blockConfig: BlockField | undefined
    const isLexical = Object.prototype.hasOwnProperty.call(value, "root")
    
    if (isLexical) {
      const field = findField({
        dotNotation: name,
        fields: collection.fields,
        filterLocalizedFields: collection.slug === 'mock-collection-for-lexical-blocks' ? false : true,
      }) as RichTextField

      const editorConfig = getLexicalEditorConfig(field)

      if (editorConfig) {
        html = await convertLexicalToHtml(value, editorConfig)
        // no need to detect change - this has already been done on the field's JSON object
        blockContent = value && extractLexicalBlockContent(value.root)
        blockConfig = editorConfig && getLexicalBlockFields(editorConfig)
        if (blockContent && blockContent.length > 0 && blockConfig) {
          await this.createLexicalBlocks({
            collection,
            blockContent,
            blockConfig,
            name,
            req: this.req,
          })
        }
      } else {
        html = "<span>lexical configuration not found</span>"
      }
    } else {
      html = convertSlateToHtml(value, this.pluginOptions.slateToHtmlConfig)
    }

    await this.createOrUpdateFile({
      name: name,
      fileData: html,
      fileType: "html",
      ...(!isEmpty(blockContent) && {
        sourceBlocks: blockContent
      }),
    });
  }

  async createLexicalBlocks({
    collection,
    blockContent,
    blockConfig,
    name,
    req,
  }: {
    collection: CollectionConfig | GlobalConfig
    blockContent: unknown[]
    blockConfig: BlockField
    name: string
    req: PayloadRequest
  }) {    
    // directory name must be unique from file names - Crowdin API
    const folderName = `${this.pluginOptions.lexicalBlockFolderPrefix}${name}`
    /**
     * Initialize Crowdin client sourceFilesApi
     */
    const apiByDocument = new filesApiByDocument(
      {
        document: {
          // Lexical field name used for documentId
          id: folderName,
          // Friendly name for directory
          title: name,
        },
        collectionSlug: collection.slug as CollectionSlug | GlobalSlug,
        global: false,
        pluginOptions: this.pluginOptions,
        req,
        // Important: Identify that this article directory has a parent - logic changes for non-top-level directories.
        parent: this.articleDirectory,
      },
    );

    const filesApi = await apiByDocument.get()
      const fieldName = `blocks`
      const currentCrowdinJsonData = buildCrowdinJsonObject({
        doc: {
          [fieldName]: blockContent,
        },
        fields: [
          {
            name: fieldName,
            type: 'blocks',
            blocks: blockConfig.blocks,
          }
        ],
        isLocalized: reLocalizeField, // ignore localized attribute
      });
      const currentCrowdinHtmlData = buildCrowdinHtmlObject({
        doc: {
          [fieldName]: blockContent,
        },
        fields: [
          {
            name: fieldName,
            type: 'blocks',
            blocks: blockConfig.blocks,
          }
        ],
        isLocalized: reLocalizeField, // ignore localized attribute
      });

    await filesApi.createOrUpdateJsonFile({
      fileData: currentCrowdinJsonData,
      fileName: fieldName,
      req,
    });
    await Promise.allSettled(Object.keys(currentCrowdinHtmlData).map(async (name) => {
      await filesApi.createOrUpdateHtmlFile({
        name,
        value: currentCrowdinHtmlData[name] as Descendant[],
        collection: {
          slug: 'mock-collection-for-lexical-blocks',
          fields: [
            {
              name: fieldName,
              type: 'blocks',
              blocks: blockConfig ? blockConfig.blocks : [],
            }
          ],
        },
      });
    }));
  }

  async deleteFilesAndDirectory() {
    const files = await this.getFiles();

    for (const file of files) {
      await this.deleteFile(file);
    }

    await this.deleteArticleDirectory(this.document.id);
  }
}



/**
 * Update Crowdin collections and make updates in Crowdin
 *
 * This functionality used to be split into field hooks.
 * However, it is more reliable to loop through localized
 * fields and perform opeerations in one place. The
 * asynchronous nature of operations means that
 * we need to be careful updates are not made sooner than
 * expected.
 */

interface CommonArgs {
  pluginOptions: PluginOptions;
}

interface Args extends CommonArgs {
  collection: CollectionConfig;
}

interface GlobalArgs extends CommonArgs {
  global: GlobalConfig;
}

export const getGlobalAfterChangeHook =
  ({ global, pluginOptions }: GlobalArgs): GlobalAfterChangeHook =>
  async ({
    doc, // full document data
    previousDoc, // document data before updating the collection
    req, // full express request
  }) => {
    const operation = previousDoc ? "update" : "create";
    return performAfterChange({
      doc,
      req,
      previousDoc,
      operation,
      collection: global,
      global: true,
      pluginOptions,
    });
  };

export const getAfterChangeHook =
  ({ collection, pluginOptions }: Args): CollectionAfterChangeHook =>
  async ({
    doc, // full document data
    req, // full express request
    previousDoc, // document data before updating the collection
    operation, // name of the operation ie. 'create', 'update'
  }) => {
    return performAfterChange({
      doc,
      req,
      previousDoc,
      operation,
      collection,
      pluginOptions,
    });
  };

interface IPerformChange {
  doc: any;
  req: PayloadRequest;
  previousDoc: any;
  operation: string;
  collection: CollectionConfig | GlobalConfig;
  global?: boolean;
  pluginOptions: PluginOptions;
}

const performAfterChange = async ({
  doc, // full document data
  req, // full express request
  previousDoc,
  operation,
  collection,
  global = false,
  pluginOptions,
}: IPerformChange) => {
  /**
   * Abort if token not set and not in test mode
   */
  if (!pluginOptions.token) {
    return doc;
  }

  const sanitizedCollection = global ? req.payload.globals.config.find(config => config.slug === collection.slug) : req.payload.collections[collection.slug].config

  if (!sanitizedCollection) {
    return doc;
  }

  /**
   * Abort if a document condition has been set and returns false
   */
  const active = isCrowdinActive({
    doc,
    slug: sanitizedCollection.slug,
    global,
    pluginOptions
  })

  if (!active) {
    return doc;
  }

  const localizedFields: Field[] = getLocalizedFields({
    fields: sanitizedCollection.fields,
  });

  /**
   * Abort if there are no fields to localize
   */
  if (localizedFields.length === 0) {
    return doc;
  }

  /**
   * Abort if locale is unavailable or this
   * is an update from the API to the source
   * locale.
   */
  if (!req.locale || req.locale !== pluginOptions.sourceLocale) {
    return doc;
  }

  /**
   * Prepare JSON objects
   *
   * `text` fields are compiled into a single JSON file
   * on Crowdin. Prepare previous and current objects.
   */
  const currentCrowdinJsonData = buildCrowdinJsonObject({
    doc,
    fields: localizedFields,
  });
  const prevCrowdinJsonData = buildCrowdinJsonObject({
    doc: previousDoc,
    fields: localizedFields,
  });

  /**
   * Initialize Crowdin client sourceFilesApi
   */
  const apiByDocument = new filesApiByDocument(
    {
      document: doc,
      collectionSlug: sanitizedCollection.slug as CollectionSlug | GlobalSlug,
      global,
      pluginOptions,
      req: req
    },
  );
  const filesApi = await apiByDocument.get()

  // START: function definitions

  const createOrUpdateJsonSource = async () => {
    if (
      (!deepEqual(currentCrowdinJsonData, prevCrowdinJsonData) &&
        Object.keys(currentCrowdinJsonData).length !== 0) ||
      process.env['PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE'] === "true"
    ) {
      await filesApi.createOrUpdateJsonFile({
        fileData: currentCrowdinJsonData
      });
    }
  };

  /**
   * Recursively send rich text fields to Crowdin as HTML
   *
   * Name these HTML files with dot notation. Examples:
   *
   * * `localizedRichTextField`
   * * `groupField.localizedRichTextField`
   * * `arrayField[0].localizedRichTextField`
   * * `arrayField[1].localizedRichTextField`
   */
  const createOrUpdateHtmlSource = async () => {
    const currentCrowdinHtmlData = buildCrowdinHtmlObject({
      doc,
      fields: localizedFields,
    });
    const prevCrowdinHtmlData = buildCrowdinHtmlObject({
      doc: previousDoc,
      fields: localizedFields,
    });
    await Promise.allSettled(Object.keys(currentCrowdinHtmlData).map(async (name) => {
      const currentValue = currentCrowdinHtmlData[name];
      const prevValue = prevCrowdinHtmlData[name];
      if (
        !fieldChanged(prevValue, currentValue, "richText") &&
        process.env['PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE'] !== "true"
      ) {
        return;
      }
      await filesApi.createOrUpdateHtmlFile({
        name,
        value: currentValue as Descendant[],
        collection: sanitizedCollection,
      });
    }));
  };
  // END: function definitions

  await createOrUpdateJsonSource();
  await createOrUpdateHtmlSource();

  return doc;
};
