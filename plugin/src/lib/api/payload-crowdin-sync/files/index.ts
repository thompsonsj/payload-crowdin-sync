import crowdin, {
  Credentials,
  SourceFiles,
  UploadStorage,
} from "@crowdin/crowdin-api-client";
import { Payload } from "payload";
import { PluginOptions } from "../../../types";
import {
  getArticleDirectory,
  getFileByDocumentID,
  getFilesByDocumentID,
} from "../../helpers";

import { CrowdinArticleDirectory } from '../../../payload-types'

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
  payload: Payload;
  pluginOptions: PluginOptions;

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
    const result = await getArticleDirectory(documentId, this.payload);
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
