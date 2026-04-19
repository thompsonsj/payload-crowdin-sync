import nock from 'nock'
import type { PluginOptions } from 'payload-crowdin-sync'
import { mockCrowdinClient } from 'payload-crowdin-sync'

/** Crowdin API origin used by `@crowdin/crowdin-api-client` when `organization` is unset. */
export const CROWDIN_API_ORIGIN = 'https://api.crowdin.com'

export type CrowdinMockClient = ReturnType<typeof mockCrowdinClient>

/**
 * Remove all nock interceptors. Call at the start of each test so a failed
 * `isDone()` assertion in the previous test cannot leave stale mocks that
 * break matching for the next test.
 */
export function cleanCrowdinNocks(): void {
  nock.cleanAll()
}

/**
 * Fail if any interceptors were not consumed, after cleaning up so the next
 * test starts fresh.
 */
export function assertCrowdinNocksDone(): void {
  const done = nock.isDone()
  const pending = nock.pendingMocks()
  nock.cleanAll()
  if (!done) {
    throw new Error(`Not all nock interceptors were used: ${JSON.stringify(pending)}`)
  }
}

/**
 * `localized-posts` creates a Crowdin `fields.json` file. When the localized
 * Slate `content` field is present on the document (including default `[]`),
 * the plugin also uploads `content.html`.
 */
export function nockLocalizedPostsDocumentCreate(
  pluginOptions: PluginOptions,
  mockClient: CrowdinMockClient,
  opts: {
    /** First document in the suite needs collection + article dirs (2). Later creates only need the article dir (1). */
    directoryPosts: 1 | 2
    /** When true, include storage + createFile for `content` after `fields`. */
    includeContentHtml: boolean
    fieldsFileId?: number
    contentFileId?: number
  },
): nock.Scope {
  const { projectId } = pluginOptions
  const fieldsFileId = opts.fieldsFileId ?? 1079
  const contentFileId = opts.contentFileId ?? 1080
  const base = nock(CROWDIN_API_ORIGIN)
  let scope: nock.Scope
  if (opts.directoryPosts === 2) {
    scope = base
      .post(`/api/v2/projects/${projectId}/directories`)
      .reply(200, mockClient.createDirectory({ id: 1170 }))
      .post(`/api/v2/projects/${projectId}/directories`)
      .reply(200, mockClient.createDirectory({ id: 1169 }))
  } else {
    scope = base
      .post(`/api/v2/projects/${projectId}/directories`)
      .reply(200, mockClient.createDirectory({ id: 1169 }))
  }

  scope = scope
    .post(`/api/v2/storages`)
    .reply(200, mockClient.addStorage())
    .post(`/api/v2/projects/${projectId}/files`)
    .reply(
      200,
      mockClient.createFile({
        fileId: fieldsFileId,
        request: {
          name: 'fields',
          storageId: 5678,
          type: 'json',
        },
      }),
    )

  if (opts.includeContentHtml) {
    scope = scope
      .post(`/api/v2/storages`)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: contentFileId,
          request: {
            name: 'content',
            storageId: 5678,
            type: 'html',
          },
        }),
      )
  }

  return scope
}
