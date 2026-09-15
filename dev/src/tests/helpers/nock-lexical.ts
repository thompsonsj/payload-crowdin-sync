import nock from 'nock'
import { mockCrowdinClient } from 'payload-crowdin-sync'
import { CROWDIN_API_ORIGIN } from './crowdin-nock.js'
import { pluginConfig } from './plugin-config.js'

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

interface NockLexicalBuilder {
  directories(count: number): NockLexicalBuilder
  storages(count: number): NockLexicalBuilder
  files(count: number): NockLexicalBuilder
  fileWithId(fileId: number): NockLexicalBuilder
  translationBuild(
    fileId: number,
    targetLanguageId: string,
    responseBody: unknown,
  ): NockLexicalBuilder
  translationDownload(
    fileId: number,
    targetLanguageId: string,
    responseBody: unknown,
  ): NockLexicalBuilder
  build(): nock.Scope
}

/**
 * Chainable builder for Crowdin API mocks used in Lexical multi-block tests.
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
      const existing = translationMocks.find(
        (t) => t.fileId === fileId && t.targetLanguageId === targetLanguageId,
      )
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
      const existing = translationMocks.find(
        (t) => t.fileId === fileId && t.targetLanguageId === targetLanguageId,
      )
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

      scope = nock(CROWDIN_API_ORIGIN)

      if (directoryCount > 0) {
        scope
          .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
          .times(directoryCount)
          .reply(200, mockClient.createDirectory({}))
      }

      if (storageCount > 0) {
        scope
          .post(`/api/v2/storages`)
          .times(storageCount)
          .reply(200, mockClient.addStorage())
      }

      if (fileMocks.length > 0) {
        for (const fileMock of fileMocks) {
          scope
            .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
            .reply(
              200,
              mockClient.createFile(
                fileMock.fileId ? { fileId: fileMock.fileId } : {},
              ),
            )
        }
      } else if (fileCount > 0) {
        scope
          .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
          .times(fileCount)
          .reply(200, mockClient.createFile({}))
      }

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
