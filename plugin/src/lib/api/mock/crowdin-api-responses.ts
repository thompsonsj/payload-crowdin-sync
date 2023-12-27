import { PluginOptions } from "../../types";
import {
  ResponseObject,
  SourceFilesModel,
  UploadStorageModel,
  TranslationsModel,
} from "@crowdin/crowdin-api-client";

/*
  Crowdin Service mock

  Although it is against best practice to mock an API
  response, Crowdin and Payload CMS need to perform
  multiple interdependent operations.

  As a result, for effective testing, mocks are required
  to provide Payload with expected data for subsequent
  operations.

  Importing types from the Crowdin API client provides
  assurance that the mock returns expected data structures.
*/

class crowdinAPIWrapper {
  projectId: number;
  directoryId?: number;
  branchId: number;

  constructor(pluginOptions: PluginOptions) {
    this.projectId = pluginOptions.projectId;
    this.directoryId = pluginOptions.directoryId;
    this.branchId = 4;
  }

  async listFileRevisions(projectId: number, fileId: number) {
    return await Promise.resolve(1).then(() => undefined);
  }

  createDirectory({
    request = {
      directoryId: 1179,
      name: "post id",
      title: "undefined",
    }
  }: {
    request?: SourceFilesModel.CreateDirectoryRequest
  }): { data: SourceFilesModel.Directory } {
    const date = new Date().toISOString();
    return {
      data: {
        id: 1169,
        projectId: this.projectId,
        branchId: this.branchId,
        directoryId: request.directoryId || 1179,
        name: request.name,
        title: request.title || "undefined",
        exportPattern: "**",
        priority: "normal",
        path: "",
        createdAt: date,
        updatedAt: date,
      },
    };
  }

  addStorage(
    fileName?: string,
    request?: any,
    contentType?: string
  ): { data: UploadStorageModel.Storage } {
    const storage = {
      data: {
        id: 1788135621,
        fileName: fileName || `fields.json`,
      },
    };
    return storage;
  }

  async deleteFile(projectId: number, fileId: number): Promise<void> {
    await Promise.resolve(1).then(() => undefined);
  }

  async deleteDirectory(projectId: number, directoryId: number): Promise<void> {
    await Promise.resolve(1).then(() => undefined);
  }

  createFile(
    {
      fileId = 1079,
      request: {
      directoryId = 1172,
      name,
      storageId,
      type = "html",
    }
  }: {
      fileId?: number,
      request: SourceFilesModel.CreateFileRequest
    }
  ): { data: SourceFilesModel.File } {
    /*const storageId = await this.addStorage({
      name,
      fileData,
      fileType,
    })*/
    const date = new Date().toISOString();
    const file = {
      data: {
        revisionId: 5,
        status: "active",
        priority: "normal" as SourceFilesModel.Priority,
        importOptions: {} as any,
        exportOptions: {} as any,
        excludedTargetLanguages: [],
        createdAt: date,
        updatedAt: date,
        id: fileId,
        projectId: this.projectId,
        branchId: this.branchId,
        directoryId,
        name: name,
        title: name,
        type,
        path: `/policies/security-and-privacy/${name}`,
        parserVersion: 3,
        context: "",
      },
    };
    return file;
  }

  updateOrRestoreFile({
    fileId = 1079,
    request
  }: {
    fileId: number,
    request?: SourceFilesModel.ReplaceFileFromStorageRequest
  }): { data: SourceFilesModel.File } {
    /*const storageId = await this.addStorage({
      name,
      fileData,
      fileType,
    })*/
    const date = new Date().toISOString();
    const file = {
      data: {
        revisionId: 5,
        status: "active",
        priority: "normal" as SourceFilesModel.Priority,
        importOptions: {} as any,
        exportOptions: {} as any,
        excludedTargetLanguages: [],
        createdAt: date,
        updatedAt: date,
        id: fileId,
        projectId: this.projectId,
        branchId: this.branchId,
        directoryId: this.directoryId as number,
        name: "file",
        title: "file",
        type: "html",
        path: `/policies/security-and-privacy/file.filetype`,
        parserVersion: 3,
        context: "",
      },
    };
    return file;
  }

  async buildProjectFileTranslation(
    projectId: number,
    fileId: number,
    { targetLanguageId }: TranslationsModel.BuildProjectFileTranslationRequest
  ): Promise<
    ResponseObject<TranslationsModel.BuildProjectFileTranslationResponse>
  > {
    const build = await Promise.resolve(1).then(() => {
      const date = new Date().toISOString();
      return {
        data: {
          id: 1,
          projectId,
          branchId: this.branchId,
          fileId,
          languageId: "en",
          status: "inProgress",
          progress: 0,
          createdAt: date,
          updatedAt: date,
          etag: "string",
          url: `https://api.crowdin.com/api/v2/projects/1/translations/builds/1/download?targetLanguageId=${targetLanguageId}`,
          expireIn: "string",
        },
      };
    });
    return build;
  }
}

export function mockCrowdinClient(pluginOptions: PluginOptions) {
  return new crowdinAPIWrapper(pluginOptions);
}
