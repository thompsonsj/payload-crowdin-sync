import nock from 'nock'
import { mockCrowdinClient } from 'payload-crowdin-sync'
import { pluginConfig } from './plugin-config'

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

interface NockLexicalBuilder {
  directories(count: number): NockLexicalBuilder
  storages(count: number): NockLexicalBuilder
  files(count: number): NockLexicalBuilder
  fileWithId(fileId: number): NockLexicalBuilder
  translationBuild(fileId: number, targetLanguageId: string, responseBody: unknown): NockLexicalBuilder
  translationDownload(fileId: number, targetLanguageId: string, responseBody: unknown): NockLexicalBuilder
  build(): nock.Scope
}

/**
 * Chainable builder for creating nock interceptors for Lexical editor tests.
 * 
 * @example
 * ```ts
 * nockLexical()
 *   .directories(2)
 *   .storages(4)
 *   .files(4)
 *   .build()
 * ```
 */
export function nockLexical(): NockLexicalBuilder {
  let scope: nock.Scope | null = null
  let directoryCount = 0
  let storageCount = 0
  let fileCount = 0
  const fileMocks: Array<{ fileId?: number }> = []
  const translationMocks: Array<{
    fileId: number
    targetLanguageId: string
    buildResponse: unknown
    downloadResponse: unknown
  }> = []

  const builder: NockLexicalBuilder = {
    directories(count: number) {
      directoryCount = count
      return builder
    },

    storages(count: number) {
      storageCount = count
      return builder
    },

    files(count: number) {
      fileCount = count
      return builder
    },

    fileWithId(fileId: number) {
      fileMocks.push({ fileId })
      return builder
    },

    translationBuild(
      fileId: number,
      targetLanguageId: string,
      responseBody: unknown,
    ) {
      const existing = translationMocks.find((t) => t.fileId === fileId && t.targetLanguageId === targetLanguageId)
      if (existing) {
        existing.buildResponse = responseBody
      } else {
        translationMocks.push({
          fileId,
          targetLanguageId,
          buildResponse: responseBody,
          downloadResponse: {},
        })
      }
      return builder
    },

    translationDownload(
      fileId: number,
      targetLanguageId: string,
      responseBody: unknown,
    ) {
      const existing = translationMocks.find((t) => t.fileId === fileId && t.targetLanguageId === targetLanguageId)
      if (existing) {
        existing.downloadResponse = responseBody
      } else {
        translationMocks.push({
          fileId,
          targetLanguageId,
          buildResponse: mockClient.buildProjectFileTranslation({
            url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${fileId}/download?targetLanguageId=${targetLanguageId}`,
          }),
          downloadResponse: responseBody,
        })
      }
      return builder
    },

    build() {
      if (scope) {
        return scope
      }

      scope = nock('https://api.crowdin.com')

      // Directories
      if (directoryCount > 0) {
        scope
          .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
          .times(directoryCount)
          .reply(200, mockClient.createDirectory({}))
      }

      // Storages
      if (storageCount > 0) {
        scope
          .post(`/api/v2/storages`)
          .times(storageCount)
          .reply(200, mockClient.addStorage())
      }

      // Files - either generic count or specific file IDs
      if (fileMocks.length > 0) {
        for (const fileMock of fileMocks) {
          if (fileMock.fileId) {
            scope
              .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
              .reply(200, mockClient.createFile({ fileId: fileMock.fileId }))
          } else {
            scope
              .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
              .reply(200, mockClient.createFile({}))
          }
        }
      } else if (fileCount > 0) {
        scope
          .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
          .times(fileCount)
          .reply(200, mockClient.createFile({}))
      }

      // Translation builds and downloads
      for (const translation of translationMocks) {
        scope
          .post(
            `/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${translation.fileId}`,
            { targetLanguageId: translation.targetLanguageId },
          )
          .reply(200, translation.buildResponse)
          .get(
            `/api/v2/projects/${pluginOptions.projectId}/translations/builds/${translation.fileId}/download`,
          )
          .query({ targetLanguageId: translation.targetLanguageId })
          .reply(200, translation.downloadResponse)
      }

      return scope
    },
  }

  return builder
}
