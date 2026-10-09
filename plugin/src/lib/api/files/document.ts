import { PluginOptions } from '../../index';
import { payloadCrowdinSyncFilesApi } from '.';
import { CrowdinArticleDirectory, CrowdinFile } from '../../payload-types';
import {
  BlocksField as BlockField,
  CollectionConfig,
  Document,
  GlobalConfig,
  PayloadRequest,
  RichTextField,
} from 'payload';

import { isEmpty } from 'es-toolkit/compat';
import { getFile, getFiles } from '../helpers';
import { Descendant } from 'slate';
import { findField } from '../../utilities';
import {
  convertLexicalToHtml,
  convertSlateToHtml,
} from '../../utilities/richTextConversion';
import {
  extractLexicalBlockContent,
  getLexicalBlockFields,
  getLexicalEditorConfig,
} from '../../utilities/lexical';
import { filesApiByDocument } from './by-document';
import { CollectionSlug, GlobalSlug } from 'payload';
import {
  filterLocalizedFieldsForCollection,
  syncLexicalBlocks,
} from './lexical-blocks';

type FileData = string | object;

interface IupdateOrCreateFile {
  name: string;
  fileData: FileData;
  fileType: 'html' | 'json';
  sourceBlocks?: unknown[];
}

export interface IpayloadCrowdinSyncDocumentFilesApiOptions {
  document: Document;
  articleDirectory: CrowdinArticleDirectory;
  collectionSlug: CollectionSlug | 'globals';
  global?: boolean;
}

export class payloadCrowdinSyncDocumentFilesApi extends payloadCrowdinSyncFilesApi {
  document: Document;
  articleDirectory: CrowdinArticleDirectory;
  collectionSlug: CollectionSlug | 'globals';
  global?: boolean;

  constructor(
    {
      document,
      articleDirectory,
      collectionSlug,
      global,
    }: IpayloadCrowdinSyncDocumentFilesApiOptions,
    pluginOptions: PluginOptions,
    req: PayloadRequest,
  ) {
    super(pluginOptions, req);
    this.document = document;
    this.articleDirectory = articleDirectory;
    this.collectionSlug = collectionSlug;
    this.global = global;
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
  }: { crowdinFile: CrowdinFile } & IupdateOrCreateFile) {
    if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
      console.log('updateFile', {
        crowdinFile,
        name,
        fileData,
        fileType,
        sourceBlocks,
      });
    }
    // Update file on Crowdin
    const updatedCrowdinFile = await this.crowdinUpdateFile({
      fileId: crowdinFile.originalId as number,
      name,
      fileData,
      fileType,
    });

    await this.req.payload.update({
      collection: 'crowdin-files', // required
      id: crowdinFile.id,
      data: {
        // required
        updatedAt: updatedCrowdinFile.data.updatedAt,
        revisionId: updatedCrowdinFile.data.revisionId,
        ...(fileType === 'json' && {
          fileData: {
            json: fileData as {
              [k: string]: Partial<unknown>;
            },
          },
        }),
        ...(fileType === 'html' && {
          fileData: {
            html:
              typeof fileData === 'string'
                ? fileData
                : JSON.stringify(fileData),
            ...(sourceBlocks && { sourceBlocks: JSON.stringify(sourceBlocks) }),
          },
        }),
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
    if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
      console.log('createFile', { name, fileData, fileType, sourceBlocks });
    }

    const originalId = this.articleDirectory.originalId;
    if (!originalId) return;

    const crowdinFile = await this.crowdinCreateFile({
      directoryId: originalId,
      name,
      fileData,
      fileType,
    });
    if (!crowdinFile) return;

    const existingPayloadFile = await this.getFile(name);
    if (existingPayloadFile) {
      return this.syncExistingPayloadFile({
        existingPayloadFile,
        crowdinFileData: crowdinFile.data,
        name,
        fileData,
        fileType,
        sourceBlocks,
      });
    }

    const payloadCrowdinFile = await this.req.payload.create({
      collection: 'crowdin-files',
      data: {
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
        ...(fileType === 'json' && {
          fileData: { json: fileData as { [k: string]: Partial<unknown> } },
        }),
        ...(fileType === 'html' && {
          fileData: {
            html: typeof fileData === 'string' ? fileData : JSON.stringify(fileData),
            ...(sourceBlocks && { sourceBlocks: JSON.stringify(sourceBlocks) }),
          },
        }),
      },
      req: this.req,
    });

    // File exists on Crowdin but was missing from our database — push current content.
    if (crowdinFile.data.revisionId > 1) {
      if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
        console.log(
          `Updating content for existing Crowdin file "${name}" (File ID: ${crowdinFile.data.id})`,
        );
      }
      const updatedCrowdinFile = await this.crowdinUpdateFile({ fileId: crowdinFile.data.id, name, fileData, fileType });
      await this.req.payload.update({
        collection: 'crowdin-files',
        id: payloadCrowdinFile.id,
        data: {
          updatedAt: updatedCrowdinFile.data.updatedAt,
          revisionId: updatedCrowdinFile.data.revisionId,
        },
        req: this.req,
      });
    }

    return payloadCrowdinFile;
  }

  private async syncExistingPayloadFile({
    existingPayloadFile,
    crowdinFileData,
    name,
    fileData,
    fileType,
    sourceBlocks,
  }: {
    existingPayloadFile: CrowdinFile;
    crowdinFileData: { id: number; updatedAt: string; revisionId: number };
    name: string;
    fileData: FileData;
    fileType: 'html' | 'json';
    sourceBlocks?: unknown[];
  }) {
    if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
      console.log(`File "${name}" already exists in Payload database. Updating instead of creating.`);
    }
    const updatedCrowdinFile = await this.crowdinUpdateFile({ fileId: crowdinFileData.id, name, fileData, fileType });
    return this.req.payload.update({
      collection: 'crowdin-files',
      id: existingPayloadFile.id,
      data: {
        updatedAt: updatedCrowdinFile.data.updatedAt,
        revisionId: updatedCrowdinFile.data.revisionId,
        ...(fileType === 'json' && {
          fileData: { json: fileData as { [k: string]: Partial<unknown> } },
        }),
        ...(fileType === 'html' && {
          fileData: {
            html: typeof fileData === 'string' ? fileData : JSON.stringify(fileData),
            ...(sourceBlocks && { sourceBlocks: JSON.stringify(sourceBlocks) }),
          },
        }),
      },
      req: this.req,
    });
  }

  async deleteFile(crowdinFile: CrowdinFile) {
    if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
      console.log('deleteFile', {
        crowdinFile,
      });
    }
    if (this.pluginOptions.deleteCrowdinFiles && crowdinFile.originalId) {
      await this.sourceFilesApi.deleteFile(
        this.projectId,
        crowdinFile.originalId as number,
      );
    }

    const payloadFile = await this.req.payload.delete({
      collection: 'crowdin-files', // required
      id: crowdinFile.id, // required
      req: this.req,
    });
    return payloadFile;
  }

  async createOrUpdateJsonFile({
    fileData,
    fileName = 'fields',
    req,
  }: {
    fileData: FileData;
    fileName?: string;
    req?: PayloadRequest;
  }) {
    await this.createOrUpdateFile({
      name: fileName,
      fileData,
      fileType: 'json',
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
    let blockContent, blockConfig: BlockField | undefined;
    const isLexical = Object.prototype.hasOwnProperty.call(value, 'root');

    if (isLexical) {
      const field = findField({
        dotNotation: name,
        fields: collection.fields,
        filterLocalizedFields: filterLocalizedFieldsForCollection(
          collection.slug,
        ),
      }) as RichTextField;

      const editorConfig = getLexicalEditorConfig(field);

      if (editorConfig) {
        const html = await convertLexicalToHtml(value, editorConfig);
        // no need to detect change - this has already been done on the field's JSON object
        blockContent = value && extractLexicalBlockContent(value.root);
        blockConfig = editorConfig && getLexicalBlockFields(editorConfig);

        if (blockContent && blockContent.length > 0 && blockConfig) {
          await syncLexicalBlocks({
            fieldName: name,
            collectionSlug: collection.slug as CollectionSlug | GlobalSlug,
            blockContent,
            blockConfig,
            pluginOptions: this.pluginOptions,
            req: this.req,
            parent: this.articleDirectory,
            getNestedFilesApi: async (options) => {
              const apiByDocument = new filesApiByDocument(options);
              return apiByDocument.get();
            },
          });
        }
        await this.createOrUpdateFile({
          name: name,
          fileData: html,
          fileType: 'html',
          ...(!isEmpty(blockContent) && {
            sourceBlocks: blockContent,
          }),
        });
      } else {
        const html = '<span>lexical configuration not found</span>';
        await this.createOrUpdateFile({
          name: name,
          fileData: html,
          fileType: 'html',
        });
      }
    } else {
      const html = convertSlateToHtml(
        value,
        this.pluginOptions.slateToHtmlConfig,
      );
      await this.createOrUpdateFile({
        name: name,
        fileData: html,
        fileType: 'html',
      });
    }
  }

  /**
   * Delete the document's files, then its article directory. A file that
   * fails to delete is logged and skipped so the directory is still removed.
   */
  async deleteFilesAndDirectory() {
    const files = await this.getFiles();

    for (const file of files) {
      try {
        await this.deleteFile(file);
      } catch (error) {
        console.warn(`Error deleting file: `, error);
      }
    }

    await this.deleteArticleDirectory(this.articleDirectory);
  }
}
