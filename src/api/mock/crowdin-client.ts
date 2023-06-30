import { CrowdinPluginRequest } from "../../types"
import { Response, NextFunction } from "express"

/*
  CrowdIn Service mock

  Although it is against best practice to mock an API
  response, CrowdIn and Payload CMS need to perform
  multiple interdependent operations.

  As a result, for effective testing, mocks are required
  to provide Payload with expected data for subsequent
  operations.
*/

interface IaddDirectory {
  projectId: number
  directoryId: number,
  name: string
  title: string
}

interface IaddStorage {
  name: string
  fileData: string | object
  fileType: 'html' | 'json'
}

interface IcreateFile extends IaddStorage {
  projectId: number
  directoryId: number
}

interface IupdateFile extends IaddStorage {
  projectId: number
  fileId: number
}

class crowdinAPIWrapper {
  async listFileRevisions(projectId: number, fileId: number) {
    return await Promise.resolve(1).then(() => undefined)
  }

  async createDirectory({
    projectId,
    directoryId,
    name,
    title
  }: IaddDirectory) {
    return await Promise.resolve(1).then(() => {
      const date = new Date().toISOString()
      return {
        data: {
          id: 1169,
          projectId: projectId,
          branchId: null,
          directoryId: null,
          name: name,
          title: title,
          exportPattern: null,
          priority: 'normal',
          createdAt: date,
          updatedAt: date
        }
      }
    })
  }

  async addStorage({
    name,
    fileData,
    fileType
  }: IaddStorage) {
    const storage = await Promise.resolve(1).then(() => {
      return {
        data: {
          id: 1788135621,
          fileName: name
        }
      }
    })
    return storage.data.id
  }

  async createFile({
    projectId,
    directoryId,
    name,
    fileData,
    fileType
  }: IcreateFile ) {
    /*const storageId = await this.addStorage({
      name,
      fileData,
      fileType,
    })*/
    const file = await Promise.resolve(1).then(() => {
      const date = new Date().toISOString()
      return {
        data: {
          revisionId: 5,
          status: 'active',
          priority: 'normal',
          importOptions: { contentSegmentation: true, customSegmentation: false },
          exportOptions: null,
          excludedTargetLanguages: null,
          createdAt: date,
          updatedAt: date,
          id: 1079,
          projectId: 323731,
          branchId: null,
          directoryId: 1077,
          name: name,
          title: null,
          type: fileType,
          path: `/policies/security-and-privacy/${name}.${fileType}`
        }
      }
    })
    return file
  }

  async updateFile({
    projectId,
    fileId,
    name,
    fileData,
    fileType
  }: IupdateFile ) {
    const storageId = await this.addStorage({
      name,
      fileData,
      fileType,
    })
      //const file = await sourceFilesApi.deleteFile(projectId, 1161)
    const file = await Promise.resolve(1).then(() => {
      const date = new Date().toISOString()
      return {
          data: {
          revisionId: 5,
          status: 'active',
          priority: 'normal',
          importOptions: { contentSegmentation: true, customSegmentation: false },
          exportOptions: null,
          excludedTargetLanguages: null,
          createdAt: date,
          updatedAt: date,
          id: fileId,
          projectId: projectId,
          branchId: null,
          directoryId: 1077,
          name: name,
          title: null,
          type: 'html',
          path: '/policies/security-and-privacy/en.html'
        }
      }
    })
    return file
  }
}

export function mockCrowdinClient() {
  return new crowdinAPIWrapper()
}
