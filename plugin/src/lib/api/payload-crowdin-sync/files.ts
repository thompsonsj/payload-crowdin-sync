import crowdin, {
  Credentials,
  SourceFiles,
  UploadStorage,
} from "@crowdin/crowdin-api-client";
import { Payload } from "payload";
import { PluginOptions } from "../../types";
import { toWords } from "payload/dist/utilities/formatLabels";
import {
  getArticleDirectory,
  getFile,
  getFiles,
  getFileByDocumentID,
  getFilesByDocumentID,
} from "../helpers";
import { isEmpty } from "lodash";

import { Config, CrowdinArticleDirectory, CrowdinFile } from '../../payload-types'

interface IfindOrCreateCollectionDirectory {
  collectionSlug: keyof Config['collections'] | "globals";
}

interface IfindOrCreateArticleDirectory
  extends IfindOrCreateCollectionDirectory {
  document: any;
  global?: boolean;
}

interface IupdateOrCreateFile {
  name: string;
  value: string | object;
  fileType: "html" | "json";
  articleDirectory: any;
}

interface IcreateOrUpdateFile {
  name: string;
  fileData: string | object;
  fileType: "html" | "json";
}

interface IcreateFile extends IcreateOrUpdateFile {
  directoryId: number;
}

interface IupdateFile extends IcreateOrUpdateFile {
  crowdinFile: CrowdinFile;
}

interface IupdateCrowdinFile extends IcreateOrUpdateFile {
  fileId: number;
}

export class payloadCrowdinSyncFilesApi {
  sourceFilesApi: SourceFiles;
  uploadStorageApi: UploadStorage;
  projectId: number;
  directoryId?: number;
  payload: Payload;

  constructor(pluginOptions: PluginOptions, payload: Payload) {
    // credentials
    const credentials: Credentials = {
      token: pluginOptions.token,
    };
    const { sourceFilesApi, uploadStorageApi } = new crowdin(credentials);
    this.projectId = pluginOptions.projectId;
    this.directoryId = pluginOptions.directoryId;
    this.sourceFilesApi = sourceFilesApi;
    this.uploadStorageApi = uploadStorageApi;
    this.payload = payload;
  }

  async findOrCreateArticleDirectory({
    document,
    collectionSlug,
    global = false,
  }: IfindOrCreateArticleDirectory) {
    let crowdinPayloadArticleDirectory;

    if (document.crowdinArticleDirectory) {
      // Update not possible. Article name needs to be updated manually on Crowdin.
      // The name of the directory is Crowdin specific helper text to give
      // context to translators.
      // See https://developer.crowdin.com/api/v2/#operation/api.projects.directories.getMany
      crowdinPayloadArticleDirectory = await this.payload.findByID({
        collection: "crowdin-article-directories",
        id:
          document.crowdinArticleDirectory.id ||
          document.crowdinArticleDirectory,
      });
    } else {
      const crowdinPayloadCollectionDirectory =
        await this.findOrCreateCollectionDirectory({
          collectionSlug: global ? "globals" : collectionSlug,
        });

      // Create article directory on Crowdin
      const name = global ? collectionSlug : document.id
      const crowdinDirectory = await this.sourceFilesApi.createDirectory(
        this.projectId,
        {
          directoryId: crowdinPayloadCollectionDirectory['originalId'] as number,
          name,
          title: global
            ? toWords(collectionSlug)
            : document.title || document.name, // no tests for this Crowdin metadata, but makes it easier for translators
        }
      );

      // Store result in Payload CMS
      crowdinPayloadArticleDirectory = await this.payload.create({
        collection: "crowdin-article-directories",
        data: {
          crowdinCollectionDirectory: crowdinPayloadCollectionDirectory.id,
          originalId: crowdinDirectory.data.id,
          directoryId: crowdinDirectory.data.directoryId,
          name,
          reference: {
            createdAt: crowdinDirectory.data.createdAt,
            updatedAt: crowdinDirectory.data.updatedAt,
            projectId: this.projectId,
          }
        },
      });

      // Associate result with document
      if (global) {
        await this.payload.updateGlobal({
          slug: collectionSlug as keyof Config["globals"],
          data: {
            crowdinArticleDirectory: crowdinPayloadArticleDirectory.id,
          } as any,
        });
      } else {
        await this.payload.update({
          collection: collectionSlug as keyof Config["collections"],
          id: document.id,
          data: {
            crowdinArticleDirectory: crowdinPayloadArticleDirectory.id,
          } as any,
        });
      }
    }

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

  async getFile(name: string, crowdinArticleDirectoryId: string): Promise<any> {
    return getFile(name, crowdinArticleDirectoryId, this.payload);
  }

  async getFiles(crowdinArticleDirectoryId: string): Promise<any> {
    return getFiles(crowdinArticleDirectoryId, this.payload);
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
    value,
    fileType,
    articleDirectory,
  }: IupdateOrCreateFile) {
    const empty = isEmpty(value);
    // Check whether file exists on Crowdin
    let crowdinFile = await this.getFile(name, articleDirectory.id);
    let updatedCrowdinFile;
    if (!empty) {
      if (!crowdinFile) {
        updatedCrowdinFile = await this.createFile({
          name,
          value,
          fileType,
          articleDirectory,
        });
      } else {
        updatedCrowdinFile = await this.updateFile({
          crowdinFile,
          name: name,
          fileData: value,
          fileType: fileType,
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
  }: IupdateFile) {
    // Update file on Crowdin
    const updatedCrowdinFile = await this.crowdinUpdateFile({
      fileId: crowdinFile.originalId as number,
      name,
      fileData,
      fileType,
    });

    await this.payload.update({
      collection: "crowdin-files", // required
      id: crowdinFile.id,
      data: {
        // required
        updatedAt: updatedCrowdinFile.data.updatedAt,
        revisionId: updatedCrowdinFile.data.revisionId,
        ...(fileType === "json" && { fileData: { json: (fileData as {
          [k: string]: Partial<unknown>;
        }) }}),
        ...(fileType === "html" && { fileData: { html: typeof fileData === 'string' ? fileData : JSON.stringify(fileData) } }),
      },
    });
  }

  private async createFile({
    name,
    value,
    fileType,
    articleDirectory,
  }: IupdateOrCreateFile) {
    // Create file on Crowdin
    const crowdinFile = await this.crowdinCreateFile({
      directoryId: articleDirectory.originalId,
      name,
      fileData: value,
      fileType: fileType,
    });

    // createFile has been intermittent in not being available
    // perhaps logic goes wrong somewhere and express middleware
    // is hard to debug?
    /*const crowdinFile =  {data: {
      revisionId: 5,
      status: 'active',
      priority: 'normal',
      importOptions: { contentSegmentation: true, customSegmentation: false },
      exportOptions: null,
      excludedTargetLanguages: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: 1079,
      projectId: 323731,
      branchId: null,
      directoryId: 1077,
      name: name,
      title: null,
      type: fileType,
      path: `/policies/security-and-privacy/${name}.${fileType}`
    }}*/

    // Store result on Payload CMS

    if (crowdinFile) {
      const payloadCrowdinFile = await this.payload.create({
        collection: "crowdin-files", // required
        data: {
          // required
          title: name,
          field: name,
          crowdinArticleDirectory: articleDirectory.id,
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
          ...(fileType === "json" && { fileData: { json: (value as {
            [k: string]: Partial<unknown>;
          }) } }),
          ...(fileType === "html" && { fileData: { html: typeof value === 'string' ? value : JSON.stringify(value) } }),
        },
      });

      return payloadCrowdinFile;
    }
    return
  }

  async deleteFile(crowdinFile: CrowdinFile) {
    await this.sourceFilesApi.deleteFile(
      this.projectId,
      crowdinFile.originalId as number
    );
    const payloadFile = await this.payload.delete({
      collection: "crowdin-files", // required
      id: crowdinFile.id, // required
    });
    return payloadFile;
  }

  private async crowdinUpdateFile({
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

  private async crowdinCreateFile({
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
    const result = await getArticleDirectory(documentId, this.payload);
    return result as CrowdinArticleDirectory | undefined;
  }

  async deleteFilesAndDirectory(documentId: string) {
    const files = await this.getFilesByDocumentID(documentId);

    for (const file of files) {
      await this.deleteFile(file);
    }

    await this.deleteArticleDirectory(documentId);
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
    await this.payload.delete({
      collection: "crowdin-article-directories",
      id: crowdinPayloadArticleDirectory.id,
    });
  }

  async getFileByDocumentID(name: string, documentId: string) {
    const result = await getFileByDocumentID(name, documentId, this.payload);
    return result;
  }

  async getFilesByDocumentID(documentId: string) {
    const result = await getFilesByDocumentID(documentId, this.payload);
    return result;
  }
}
