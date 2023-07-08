import crowdin, { Credentials, SourceFiles, UploadStorage } from '@crowdin/crowdin-api-client';
import { mockCrowdinClient } from '../mock/crowdin-client';
import { Payload } from 'payload';
import { PluginOptions } from '../../types';
import { toWords } from 'payload/dist/utilities/formatLabels'
import { getArticleDirectory, getFile, getFiles, getFileByDocumentID, getFilesByDocumentID } from '../helpers';
import { isEmpty } from 'lodash';

interface IcrowdinFile {
  id: string
  originalId: number
}

interface IfindOrCreateCollectionDirectory {
  collectionSlug: string
}

interface IfindOrCreateArticleDirectory extends IfindOrCreateCollectionDirectory {
  document: any
  global?: boolean
}

interface IupdateOrCreateFile {
  name: string
  value: string | object
  fileType: 'html' | 'json'
  articleDirectory: any
}

interface IcreateOrUpdateFile {
  name: string
  fileData: string | object
  fileType: 'html' | 'json'
}

interface IcreateFile extends IcreateOrUpdateFile {
  directoryId: number
}

interface IupdateFile extends IcreateOrUpdateFile {
  crowdInFile: IcrowdinFile
}

interface IupdateCrowdInFile extends IcreateOrUpdateFile {
  fileId: number
}

interface IgetTranslation {
  documentId: string
  fieldName: string
  locale: string
  global?: boolean
}

export class payloadCrowdInSyncFilesApi {
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
    const {
      sourceFilesApi,
      uploadStorageApi
    } = new crowdin(credentials);
    this.projectId = pluginOptions.projectId;
    this.directoryId = pluginOptions.directoryId;
    this.sourceFilesApi = process.env.NODE_ENV === 'test' ? mockCrowdinClient(pluginOptions) as any : sourceFilesApi;
    this.uploadStorageApi = process.env.NODE_ENV === 'test' ? mockCrowdinClient(pluginOptions) as any : uploadStorageApi;
    this.payload = payload;
  }

  async findOrCreateArticleDirectory({
    document,
    collectionSlug,
    global = false
  }: IfindOrCreateArticleDirectory) {
    let crowdInPayloadArticleDirectory
  
    if (document.crowdinArticleDirectory) {
      // Update not possible. Article name needs to be updated manually on CrowdIn.
      // The name of the directory is CrowdIn specific helper text to give
      // context to translators.
      // See https://developer.crowdin.com/api/v2/#operation/api.projects.directories.getMany
      crowdInPayloadArticleDirectory = await this.payload.findByID({
        collection: 'crowdin-article-directories',
        'id': document.crowdinArticleDirectory.id || document.crowdinArticleDirectory
      })
    } else {
      const crowdInPayloadCollectionDirectory = await this.findOrCreateCollectionDirectory({
        collectionSlug: global ? 'globals' : collectionSlug,
      })
  
      // Create article directory on CrowdIn
      const crowdInDirectory = await this.sourceFilesApi.createDirectory(this.projectId, {
        directoryId: crowdInPayloadCollectionDirectory.originalId,
        name: global ? collectionSlug : document.id,
        title: global ? toWords(collectionSlug) : document.title || document.name, // no tests for this CrowdIn metadata, but makes it easier for translators
      })
  
      // Store result in Payload CMS
      crowdInPayloadArticleDirectory = await this.payload.create({
        collection: 'crowdin-article-directories',
        data: {
          crowdinCollectionDirectory: crowdInPayloadCollectionDirectory.id,
          originalId: crowdInDirectory.data.id,
          projectId: this.projectId,
          directoryId: crowdInDirectory.data.directoryId,
          name: crowdInDirectory.data.name,
          createdAt: crowdInDirectory.data.createdAt,
          updatedAt: crowdInDirectory.data.updatedAt,
        }
      })
  
      // Associate result with document
      if (global) {
        const update = await this.payload.updateGlobal({
          slug: collectionSlug,
          data: {
            crowdinArticleDirectory: crowdInPayloadArticleDirectory.id
          }
        })
      } else {
        const update = await this.payload.update({
          collection: collectionSlug,
          id: document.id,
          data: {
            crowdinArticleDirectory: crowdInPayloadArticleDirectory.id
          }
        })
      }
    }
    
    return crowdInPayloadArticleDirectory
  }

  private async findOrCreateCollectionDirectory({
    collectionSlug,
  }: IfindOrCreateCollectionDirectory) {
    let crowdInPayloadCollectionDirectory
    // Check whether collection directory exists on CrowdIn
    const query = await this.payload.find({
      collection: 'crowdin-collection-directories',
      where: {
        collectionSlug: {
          equals: collectionSlug,
        },
      },
    })
  
    if (query.totalDocs === 0) {
      // Create collection directory on CrowdIn
      const crowdInDirectory = await this.sourceFilesApi.createDirectory(this.projectId, {
        directoryId: this.directoryId,
        name: collectionSlug,
        title: toWords(collectionSlug) // is this transformed value available on the collection object?
      })
  
      // Store result in Payload CMS
      crowdInPayloadCollectionDirectory = await this.payload.create({
        collection: 'crowdin-collection-directories',
        data: {
          collectionSlug: collectionSlug,
          originalId: crowdInDirectory.data.id,
          projectId: this.projectId,
          directoryId: crowdInDirectory.data.directoryId,
          name: crowdInDirectory.data.name,
          title: crowdInDirectory.data.title,
          createdAt: crowdInDirectory.data.createdAt,
          updatedAt: crowdInDirectory.data.updatedAt,
        }
      })
    } else {
      crowdInPayloadCollectionDirectory = query.docs[0]
    }
  
    return crowdInPayloadCollectionDirectory
  }

  async getFile(name: string, crowdinArticleDirectoryId: string): Promise<any> {
    return getFile(name, crowdinArticleDirectoryId, this.payload)
  }

  async getFiles(crowdinArticleDirectoryId: string): Promise<any> {
    return getFiles(crowdinArticleDirectoryId, this.payload)
  }

  /**
   * Create/Update/Delete a file on CrowdIn
   * 
   * Records the file in Payload CMS under the `crowdin-files` collection.
   * 
   * - Create a file if it doesn't exist on CrowdIn and the supplied content is not empty
   * - Update a file if it exists on CrowdIn and the supplied content is not empty
   * - Delete a file if it exists on CrowdIn and the supplied file content is empty
   */
  async createOrUpdateFile({
    name,
    value,
    fileType,
    articleDirectory,
  }: IupdateOrCreateFile) {
    const empty = isEmpty(value)
    // Check whether file exists on CrowdIn
    let crowdInFile = await this.getFile(name, articleDirectory.id)
    let updatedCrowdInFile
    if (!empty) {
      if (!crowdInFile) {
        updatedCrowdInFile = await this.createFile({
          name,
          value,
          fileType,
          articleDirectory,
        })
      } 
      else {
        updatedCrowdInFile = await this.updateFile({
          crowdInFile,
          name: name,
          fileData: value,
          fileType: fileType,
        })
      }
    } else {
      if (crowdInFile) {
        updatedCrowdInFile = await this.deleteFile(crowdInFile)
      }
    }
    return updatedCrowdInFile
  }

  private async updateFile({
    crowdInFile,
    name,
    fileData,
    fileType
  }: IupdateFile) {
    // Update file on CrowdIn
    const updatedCrowdInFile = await this.crowdInUpdateFile({
      fileId: crowdInFile.originalId,
      name,
      fileData,
      fileType,
    })
  
    const payloadCrowdInFile = await this.payload.update({
      collection: 'crowdin-files', // required
      id: crowdInFile.id,
      data: { // required
        updatedAt: updatedCrowdInFile.data.updatedAt,
        revisionId: updatedCrowdInFile.data.revisionId,
        ...(fileType === 'json' && { fileData: { json: fileData } }),
        ...(fileType === 'html' && { fileData: { html: fileData } }),
      },
    })
  }

  private async createFile({
    name,
    value,
    fileType,
    articleDirectory,
  }: IupdateOrCreateFile) {

    // Create file on CrowdIn
    const crowdInFile = await this.crowdInCreateFile({
      directoryId: articleDirectory.originalId,
      name: name,
      fileData: value,
      fileType: fileType,
    })
  
    // createFile has been intermittent in not being available
    // perhaps logic goes wrong somewhere and express middleware
    // is hard to debug?
    /*const crowdInFile =  {data: {
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
    if (crowdInFile) {
      const payloadCrowdInFile = await this.payload.create({
        collection: 'crowdin-files', // required
        data: { // required
          title: crowdInFile.data.name,
          field: name,
          crowdinArticleDirectory: articleDirectory.id,
          createdAt: crowdInFile.data.createdAt,
          updatedAt: crowdInFile.data.updatedAt,
          originalId: crowdInFile.data.id,
          projectId: crowdInFile.data.projectId,
          directoryId: crowdInFile.data.directoryId,
          revisionId: crowdInFile.data.revisionId,
          name: crowdInFile.data.name,
          type: crowdInFile.data.type,
          path: crowdInFile.data.path,
          ...(fileType === 'json' && { fileData: { json: value } }),
          ...(fileType === 'html' && { fileData: { html: value } }),
        },
      })
  
      return payloadCrowdInFile
    }
  }

  private async deleteFile(crowdInFile: IcrowdinFile) {
    const file = await this.sourceFilesApi.deleteFile(this.projectId, crowdInFile.originalId)
    const payloadFile = await this.payload.delete({
      collection: 'crowdin-files', // required
      id: crowdInFile.id, // required
    })
    return payloadFile
  }

  private async crowdInUpdateFile({
    fileId,
    name,
    fileData,
    fileType
  }: IupdateCrowdInFile ) {
    const storage = await this.uploadStorageApi.addStorage(
      name,
      fileData,
      fileType,
    )
      //const file = await sourceFilesApi.deleteFile(projectId, 1161)
    const file = await this.sourceFilesApi.updateOrRestoreFile(
      this.projectId,
      fileId,
      {
        storageId: storage.data.id,
      }
    )
    return file
  }

  private async crowdInCreateFile({
    name,
    fileData,
    fileType,
    directoryId,
  }: IcreateFile ) {
    const storage = await this.uploadStorageApi.addStorage(name, fileData, fileType)
    const options = {
      name: `${name}.${fileType}`,
      title: name,
      storageId: storage.data.id,
      directoryId,
      type: fileType
    }
    try {
      const file = await this.sourceFilesApi.createFile(this.projectId, options)
      return file
    } catch (error) {
      console.error(error, options)
    }
  }

  async getArticleDirectory(documentId: string) {
    const result = await getArticleDirectory(documentId, this.payload)
    return result
  }

  async getFileByDocumentID(name: string, documentId: string) {
    const result = await getFileByDocumentID(name, documentId, this.payload)
    return result
  }

  async getFilesByDocumentID(documentId: string) {
    const result = await getFilesByDocumentID(documentId, this.payload)
    return result
  }
}