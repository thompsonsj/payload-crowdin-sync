import { CrowdinPluginRequest } from "../types"
import { Response, NextFunction } from "express"
import crowdin from '@crowdin/crowdin-api-client'

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

interface IgetTranslation {
  projectId: number
  fileId: number
  targetLanguageId: string
}

export class crowdinAPIService {
  crowdin: crowdin
  constructor({token}: {token: string}) {
    this.crowdin = new crowdin({
      token: token,
    })
  }

  async listFileRevisions(projectId: number, fileId: number) {
    return await this.crowdin.sourceFilesApi.listFileRevisions(projectId, fileId)
  }

  async createDirectory({
    projectId,
    directoryId,
    name,
    title
  }: IaddDirectory) {
    return await this.crowdin.sourceFilesApi.createDirectory(projectId, {
      name: name,
      title: title,
      directoryId: directoryId,
    })
  }

  async addStorage({
    name,
    fileData,
    fileType
  }: IaddStorage) {
    const storage = await this.crowdin.uploadStorageApi.addStorage(`${name}.${fileType}`, fileData);
      return storage.data.id
  }

  async createFile({
    projectId,
    directoryId,
    name,
    fileData,
    fileType
  }: IcreateFile ) {
    const storageId = await this.addStorage({
      name,
      fileData,
      fileType,
    })
    const file = await this.crowdin.sourceFilesApi.createFile(projectId, {
      name: `${name}.${fileType}`,
      title: name,
      storageId: storageId,
      directoryId: directoryId,
      type: fileType
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
    const file = await this.crowdin.sourceFilesApi.updateOrRestoreFile(
      projectId,
      fileId,
      {
        storageId: storageId
      }
    )
    return file
  }

  async getTranslation({
    projectId,
    fileId,
    targetLanguageId
  }: IgetTranslation) {
    return await this.crowdin.translationsApi.buildProjectFileTranslation(
      projectId,
      fileId,
      {
        targetLanguageId: targetLanguageId
      }
    )
  }
}

export function crowdinClient({token}: {token: string}) {
  const service = new crowdinAPIService({token})

  return (req: CrowdinPluginRequest, _: Response, next: NextFunction) => {
    req.crowdinClient = service
    next()
  }
}
