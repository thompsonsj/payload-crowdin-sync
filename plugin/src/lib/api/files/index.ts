import { PluginOptions } from "../../types";
import {
  getArticleDirectory,
  getFileByDocumentID,
  getFilesByDocumentID,
} from "../helpers";

import { CrowdinArticleDirectory } from '../../payload-types'
import { PayloadRequest } from "payload";

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crowdin = require('@crowdin/crowdin-api-client');
import {
  Credentials,
  SourceFiles,
  UploadStorage,
} from "@crowdin/crowdin-api-client";

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
    if (pluginOptions.organization) {
      credentials.organization = pluginOptions.organization;
    }
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
    let result = undefined
    try {
      result = await getArticleDirectory({
        documentId,
        payload: this.req.payload,
        req: this.req
      });
    } catch (error) {
      console.log(error)
    }
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
