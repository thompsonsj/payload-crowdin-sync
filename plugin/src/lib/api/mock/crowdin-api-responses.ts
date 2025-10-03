import { PluginOptions } from '../../types';
import {
  SourceFilesModel,
  UploadStorageModel,
  TranslationsModel,
} from '@crowdin/crowdin-api-client';

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

  createDirectory({
    id,
    request = {
      directoryId: 1179,
      name: 'post id',
      title: 'undefined',
    },
  }: {
    /** Mock the id of the object returned in the response */
    id?: number;
    request?: SourceFilesModel.CreateDirectoryRequest;
  }): { data: SourceFilesModel.Directory } {
    const date = new Date().toISOString();
    return {
      data: {
        id: id || 1169,
        projectId: this.projectId,
        branchId: this.branchId,
        directoryId: request.directoryId || 1179,
        name: request.name,
        title: request.title || 'undefined',
        exportPattern: '**',
        priority: 'normal',
        path: '',
        createdAt: date,
        updatedAt: date,
      },
    };
  }

  /**
   * Add Storage
   *
   * No parameters are required for mocks. The plugin
   * uses a storage id returned by the API only.
   *
   * @see https://developer.crowdin.com/api/v2/#operation/api.storages.post
   */
  addStorage(): { data: UploadStorageModel.Storage } {
    const storage = {
      data: {
        id: 1788135621,
        fileName: `fields.json`,
      },
    };
    return storage;
  }

  /**
   * createFile
   *
   * No parameters required - plugin will prefer arguments
   * passed to the function that creates the Crowdin
   * file and Payload document freferencing that file.
   */
  createFile({
    fileId = 1079,
    request = {
      directoryId: 1172,
      name: 'fields',
      storageId: 5432,
      type: 'json',
    },
  }: {
    fileId?: number;
    request?: SourceFilesModel.CreateFileRequest;
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
        status: 'active',
        priority: 'normal' as SourceFilesModel.Priority,
        importOptions: {},
        exportOptions: {},
        excludedTargetLanguages: [],
        createdAt: date,
        updatedAt: date,
        id: fileId,
        projectId: this.projectId,
        branchId: this.branchId,
        directoryId: request.directoryId || 1172,
        name: request.name || 'fields',
        title: request.name || 'fields',
        type: request.type || 'json',
        path: `/policies/security-and-privacy/${request.name || 'fields'}`,
        parserVersion: 3,
        context: '',
        fields: []
      },
    };
    return file;
  }

  updateOrRestoreFile({
    fileId = 1079,
  }: {
    fileId: number;
    request?: SourceFilesModel.ReplaceFileFromStorageRequest;
  }): { data: SourceFilesModel.File } {
    const date = new Date().toISOString();
    const file = {
      data: {
        revisionId: 5,
        status: 'active',
        priority: 'normal' as SourceFilesModel.Priority,
        importOptions: {},
        exportOptions: {},
        excludedTargetLanguages: [],
        createdAt: date,
        updatedAt: date,
        id: fileId,
        projectId: this.projectId,
        branchId: this.branchId,
        directoryId: this.directoryId as number,
        name: 'file',
        title: 'file',
        type: 'html',
        path: `/policies/security-and-privacy/file.filetype`,
        parserVersion: 3,
        context: '',
        fields: []
      },
    };
    return file;
  }

  buildProjectFileTranslation({
    url,
    request,
  }: {
    url?: string;
    request?: TranslationsModel.BuildProjectFileTranslationRequest;
  }): { data: TranslationsModel.BuildProjectFileTranslationResponse } {
    const date = new Date().toISOString();
    return {
      data: {
        etag: 'string',
        url:
          url ||
          `https://api.crowdin.com/api/v2/projects/1/translations/builds/1/download?targetLanguageId=${request?.targetLanguageId || 'unknown'}`,
        expireIn: date,
      },
    };
  }
}

export function mockCrowdinClient(pluginOptions: PluginOptions) {
  return new crowdinAPIWrapper(pluginOptions);
}
