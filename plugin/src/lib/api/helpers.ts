import { Payload } from "payload";
import { IcrowdinFile } from "./payload-crowdin-sync/files";

/**
 * get Crowdin Article Directory for a given documentId
 *
 * The Crowdin Article Directory is associated with a document,
 * so is easy to retrieve. Use this function when you only have
 * a document id.
 */
export async function getArticleDirectory(
  documentId: string,
  payload: Payload,
  allowEmpty?: boolean
) {
  // Get directory
  const crowdinPayloadArticleDirectory = await payload.find({
    collection: "crowdin-article-directories",
    where: {
      name: {
        equals: documentId,
      },
    },
  });
  if (crowdinPayloadArticleDirectory.totalDocs === 0 && allowEmpty) {
    // a thrown error won't be reported in an api call, so console.log it as well.
    console.log(`No article directory found for document ${documentId}`);
    throw new Error(
      "This article does not have a corresponding entry in the  crowdin-article-directories collection."
    );
  }
  return crowdinPayloadArticleDirectory
    ? crowdinPayloadArticleDirectory.docs[0]
    : undefined;
}

export async function getFile(
  name: string,
  crowdinArticleDirectoryId: string,
  payload: Payload
): Promise<any> {
  const result = await payload.find({
    collection: "crowdin-files",
    where: {
      field: { equals: name },
      crowdinArticleDirectory: {
        equals: crowdinArticleDirectoryId,
      },
    },
  });
  return result.docs[0];
}

export async function getFiles(
  crowdinArticleDirectoryId: string,
  payload: Payload
): Promise<any> {
  const result = await payload.find({
    collection: "crowdin-files",
    limit: 10000,
    where: {
      crowdinArticleDirectory: {
        equals: crowdinArticleDirectoryId,
      },
    },
  });
  return result.docs;
}

export async function getFileByDocumentID(
  name: string,
  documentId: string,
  payload: Payload
): Promise<IcrowdinFile> {
  const articleDirectory = await getArticleDirectory(documentId, payload);
  return getFile(name, `${articleDirectory?.id}`, payload);
}

export async function getFilesByDocumentID(
  documentId: string,
  payload: Payload
): Promise<IcrowdinFile[]> {
  const articleDirectory = await getArticleDirectory(documentId, payload);
  if (!articleDirectory) {
    // tests call this function to make sure files are deleted
    return [];
  }
  const files = await getFiles(`${articleDirectory.id}`, payload);
  return files;
}
