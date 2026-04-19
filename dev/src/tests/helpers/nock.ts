import nock from 'nock'
import { mockCrowdinClient } from 'payload-crowdin-sync'
import { pluginConfig } from './plugin-config'

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

/**
 * Creates a nock scope that mocks Crowdin endpoints for creating project directories, storages, and files.
 *
 * @param createProjectDirectory - If `true`, the directories endpoint is mocked twice to simulate creating a project directory then a nested directory; otherwise it is mocked once.
 * @param fileCount - Number of file-related interactions to mock (controls how many times the storages and files endpoints are mocked).
 * @returns A configured nock scope that simulates directory creation, storage upload, and file creation on the Crowdin API.
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
