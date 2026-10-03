import type { Payload } from 'payload'
import { getFileByDocumentID, mockCrowdinClient } from 'payload-crowdin-sync'
import type { CrowdinArticleDirectory } from '../../payload-types'
import { pluginConfig } from './plugin-config'
import { nockLocalizedPostsDocumentCreate } from './crowdin-nock'

export const findArticleDirectory = async (payload: Payload, documentId: string) => {
  const result = await payload.find({
    collection: 'crowdin-article-directories',
    where: { name: { equals: documentId } },
    depth: 0,
  })
  return result.docs[0] as CrowdinArticleDirectory | undefined
}

const expectDocumentLink = (
  directory: CrowdinArticleDirectory | undefined,
  documentId: string,
) => {
  expect(directory?.name).toBe(documentId)
  expect(directory?.collectionDocument).toEqual({
    relationTo: 'localized-posts',
    value: documentId,
  })
}

/**
 * Create a localized post, duplicate it, then save the copy. Asserts the copy
 * gets its own Crowdin article directory and that the update writes there.
 */
export const assertDuplicateGetsOwnCrowdinDirectory = async ({
  payload,
  pluginOptions,
  mockClient,
  fileIds,
  directoryPostsOnCreate,
}: {
  payload: Payload
  pluginOptions: ReturnType<typeof pluginConfig>
  mockClient: ReturnType<typeof mockCrowdinClient>
  fileIds: { original: number; copy: number }
  directoryPostsOnCreate: 1 | 2
}) => {
  nockLocalizedPostsDocumentCreate(pluginOptions, mockClient, {
    directoryPosts: directoryPostsOnCreate,
    includeContentHtml: false,
    fieldsFileId: fileIds.original,
  })
  nockLocalizedPostsDocumentCreate(pluginOptions, mockClient, {
    directoryPosts: 1,
    includeContentHtml: false,
    fieldsFileId: fileIds.copy,
  })
    .post(`/api/v2/storages`)
    .reply(200, mockClient.addStorage())
    .put(`/api/v2/projects/${pluginOptions.projectId}/files/${fileIds.copy}`)
    .reply(200, mockClient.updateOrRestoreFile({ fileId: fileIds.copy }))

  const original = await payload.create({
    collection: 'localized-posts',
    data: { title: 'Shared title that a duplicate would keep' },
  })
  const originalDirectory = await findArticleDirectory(payload, `${original.id}`)
  expectDocumentLink(originalDirectory, `${original.id}`)

  const copy = await payload.duplicate({
    collection: 'localized-posts',
    id: original.id,
  })
  expect(copy.id).not.toBe(original.id)

  const copyDirectory = await findArticleDirectory(payload, `${copy.id}`)
  expect(copyDirectory?.id).toBeDefined()
  expect(copyDirectory?.id).not.toBe(originalDirectory?.id)
  expectDocumentLink(copyDirectory, `${copy.id}`)

  const originalAfterDuplicate = await findArticleDirectory(payload, `${original.id}`)
  expect(originalAfterDuplicate?.id).toBe(originalDirectory?.id)
  expectDocumentLink(originalAfterDuplicate, `${original.id}`)

  const originalRead = await payload.findByID({
    collection: 'localized-posts',
    id: original.id,
  })
  const copyRead = await payload.findByID({
    collection: 'localized-posts',
    id: copy.id,
  })
  expect((originalRead['crowdinArticleDirectory'] as CrowdinArticleDirectory).id).toBe(
    originalDirectory?.id,
  )
  expect((copyRead['crowdinArticleDirectory'] as CrowdinArticleDirectory).id).toBe(
    copyDirectory?.id,
  )

  await payload.update({
    collection: 'localized-posts',
    id: copy.id,
    data: { title: 'Copy updated independently' },
  })

  const copyFile = await getFileByDocumentID('fields', `${copy.id}`, payload)
  const originalFile = await getFileByDocumentID('fields', `${original.id}`, payload)
  expect(copyFile.fileData?.json).toEqual({ title: 'Copy updated independently' })
  expect(originalFile.fileData?.json).toEqual({
    title: 'Shared title that a duplicate would keep',
  })
}
