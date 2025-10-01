import nock from 'nock'
import { mockCrowdinClient } from 'payload-crowdin-sync'
import { pluginConfig } from './plugin-config'

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

/**
 * Sets up a nock scope that mocks Crowdin API requests for creating directories, storages, and files.
 *
 * @param createProjectDirectory - If true, mock two directory creation requests (project root and subdirectory); otherwise mock a single directory creation.
 * @param fileCount - Number of storage and file creation request pairs to mock.
 * @returns The configured nock scope that intercepts POST requests to Crowdin's directories, storages, and files endpoints.
 */
export function nockCreateSourceTranslationFiles({
  createProjectDirectory = false,
  fileCount = 1,
}) {
  const directoryCount = createProjectDirectory ? 2 : 1

  return nock('https://api.crowdin.com')
    .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
    .times(directoryCount)
    .reply(200, mockClient.createDirectory({}))
    .post(`/api/v2/storages`)
    .times(fileCount)
    .reply(200, mockClient.addStorage())
    .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
    .times(fileCount)
    .reply(200, mockClient.createFile({}))
}
