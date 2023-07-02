import { Payload } from "payload";

export async function getArticleDirectory(documentId: string, payload: Payload) {
  // Get directory
  const crowdInPayloadArticleDirectory = await payload.find({
    collection: 'crowdin-article-directories',
    where: {
      name: {
        equals: documentId,
      },
    },
  })
  if (crowdInPayloadArticleDirectory.totalDocs === 0) {
    throw new Error(
      'This article does not have a corresponding entry in the  crowdin-article-directories collection.'
    )
  }
  return crowdInPayloadArticleDirectory.docs[0]
}

export async function getFile(name: string, crowdinArticleDirectoryId: number, payload: Payload): Promise<any> {
  const result = await payload.find({
    collection: "crowdin-files",
    where: {
      field: { equals: name },
      crowdinArticleDirectory: {
        equals: crowdinArticleDirectoryId,
      },
    },
  })
  return result.docs[0]
}

export async function getFiles(crowdinArticleDirectoryId: number, payload: Payload): Promise<any> {
  const result = await payload.find({
    collection: "crowdin-files",
    where: {
      crowdinArticleDirectory: {
        equals: crowdinArticleDirectoryId,
      },
    },
  })
  return result.docs
}

export async function getFilesByDocumentID(documentId: string, payload: Payload): Promise<any> {
  const articleDirectory = await getArticleDirectory(documentId, payload)
  return getFiles(articleDirectory.id, payload)
}
