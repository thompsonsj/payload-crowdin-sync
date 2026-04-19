import { PluginOptions } from '../../types';
import {
  getArticleDirectory,
  getFileByDocumentID,
  getFilesByDocumentID,
} from '../helpers';

import { CrowdinArticleDirectory } from '../../payload-types';
import { PayloadRequest } from 'payload';

import * as crowdin from '@crowdin/crowdin-api-client';

import {
  Client,
  Credentials,
  SourceFiles,
  UploadStorage,
} from '@crowdin/crowdin-api-client';

interface IcreateOrUpdateFile {
  name: string;
  fileData: string | object;
  fileType: 'html' | 'json';
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
    if (pluginOptions.organization) {
      credentials.organization = pluginOptions.organization;
    }
    const { sourceFilesApi, uploadStorageApi } = new Client(
      credentials,
    );
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
    );
    //const file = await sourceFilesApi.deleteFile(projectId, 1161)
    const file = await this.sourceFilesApi.updateOrRestoreFile(
      this.projectId,
      fileId,
      {
        storageId: storage.data.id,
      },
    );
    return file;
  }

  /**
   * Find an existing file on Crowdin by name and directory
   *
   * @param fileName - Full file name with extension (e.g., 'fields.json')
   * @param directoryId - Crowdin directory ID to search in
   * @returns The file if found, otherwise undefined
   */
  protected async crowdinFindFileByName(
    fileName: string,
    directoryId: number,
  ) {
    try {
      // List all files in the directory
      const response = await this.sourceFilesApi.listProjectFiles(
        this.projectId,
        {
          directoryId,
        },
      );

      // Find the file with matching name
      const file = response.data.find((f) => f.data.name === fileName);
      return file;
    } catch (error) {
      console.error(
        `Error finding file ${fileName} in directory ${directoryId}:`,
        error,
      );
      return undefined;
    }
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
    );
    const fullFileName = `${name}.${fileType}`;
    const options = {
      name: fullFileName,
      title: name,
      storageId: storage.data.id,
      directoryId,
      type: fileType,
    };
    try {
      const file = await this.sourceFilesApi.createFile(
        this.projectId,
        options,
      );
      return file;
    } catch (error: any) {
      // Check if this is a "name must be unique" error
      const isNameConflictError =
        error?.error?.errors?.some(
          (e: any) =>
            e?.error?.key === 'file.name.is_already_exists' ||
            e?.error?.key === 'file.name' ||
            String(error).includes('Name must be unique'),
        ) || String(error).includes('Name must be unique');

      if (isNameConflictError) {
        if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
          console.log(
            `File "${fullFileName}" already exists on Crowdin in directory ${directoryId}. Attempting to find and sync existing file...`,
          );
        }

        // Try to find the existing file on Crowdin
        const existingFile = await this.crowdinFindFileByName(
          fullFileName,
          directoryId,
        );
        if (existingFile) {
          if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
            console.log(
              `Found existing file on Crowdin. File ID: ${existingFile.data.id}`,
            );
          }
          // Return the existing file so it can be synced to the local database
          (existingFile as any)._payloadCrowdinSyncWasExisting = true;
          return existingFile;
        }
        console.error(
          `Could not find existing file "${fullFileName}" on Crowdin despite name conflict error.`,
          error,
          options,
        );
      } else {
        console.error(error, options);
      }

      return;
    }
  }

  async getArticleDirectory(
    documentId: string,
  ): Promise<CrowdinArticleDirectory | undefined> {
    let result = undefined;
    try {
      result = await getArticleDirectory({
        documentId,
        payload: this.req.payload,
        req: this.req,
      });
    } catch (error) {
      console.error(error);
    }
    return result as CrowdinArticleDirectory | undefined;
  }

  async deleteArticleDirectory(documentId: string) {
    const crowdinPayloadArticleDirectory =
      await this.getArticleDirectory(documentId);
    if (
      !crowdinPayloadArticleDirectory ||
      !crowdinPayloadArticleDirectory.originalId
    ) {
      return;
    }
    if (this.pluginOptions.deleteCrowdinFiles) {
      await this.sourceFilesApi.deleteDirectory(
        this.projectId,
        crowdinPayloadArticleDirectory.originalId,
      );
    }
    await this.req.payload.delete({
      collection: 'crowdin-article-directories',
      id: crowdinPayloadArticleDirectory.id,
      req: this.req,
    });
  }

  async getFileByDocumentID(name: string, documentId: string) {
    const result = await getFileByDocumentID(
      name,
      documentId,
      this.req.payload,
    );
    return result;
  }

  async getFilesByDocumentID(documentId: string) {
    const result = await getFilesByDocumentID({
      documentId,
      payload: this.req.payload,
    });
    return result;
  }
}
