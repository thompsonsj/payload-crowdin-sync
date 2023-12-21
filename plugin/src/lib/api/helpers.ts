import payload, { Payload } from "payload";
import { CrowdinArticleDirectory, CrowdinCollectionDirectory, CrowdinFile } from "../payload-types";
import { payloadCrowdinSyncTranslationsApi } from "./payload-crowdin-sync/translations";
import { PluginOptions } from "../types";
import { ReadableStreamDefaultController } from "stream/web";

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
): Promise<CrowdinFile> {
  const articleDirectory = await getArticleDirectory(documentId, payload);
  return getFile(name, `${articleDirectory?.id}`, payload);
}

export async function getFilesByDocumentID(
  documentId: string,
  payload: Payload
): Promise<CrowdinFile[]> {
  const articleDirectory = await getArticleDirectory(documentId, payload);
  if (!articleDirectory) {
    // tests call this function to make sure files are deleted
    return [];
  }
  const files = await getFiles(`${articleDirectory.id}`, payload);
  return files;
}

interface IupdatePayloadTranslation {
  articleDirectoryId: string
  pluginOptions: PluginOptions,
  payload: Payload
  /** store translations into a draft */
  draft?: boolean
  /** prevent database changes */
  dryRun?: boolean
  /** override article directory exclude locales */
  excludeLocales?: string[]
}

export async function updatePayloadTranslation({
  articleDirectoryId,
  pluginOptions,
  payload,
  draft,
  dryRun,
  excludeLocales,
}: IupdatePayloadTranslation) {
  // get article directory
  const articleDirectory = await payload.findByID({
    id: articleDirectoryId,
    collection: "crowdin-article-directories",
  });
  // is this a global or a collection?
  const global =
    (articleDirectory['crowdinCollectionDirectory'] as CrowdinCollectionDirectory)?.collectionSlug as string === "globals";
  // get an instance of our translations api
  const translationsApi = new payloadCrowdinSyncTranslationsApi(
    pluginOptions,
    payload
  );
  try {
    const translations = await translationsApi.updateTranslation({
      documentId: !global ? articleDirectory["name"] as string : ``,
      collection: global
        ? articleDirectory['name'] as string
        : (articleDirectory["crowdinCollectionDirectory"] as CrowdinCollectionDirectory)?.collectionSlug as string,
      global,
      draft,
      dryRun,
      excludeLocales: excludeLocales || articleDirectory["excludeLocales"] as string[] || [],
    });
    return {
      status: 200,
      ...translations
    };
  } catch (error) {
    return {
      status: 400,
      error,
    }
  }
}

export const getCollectionDirectorySlug = async ({
  crowdinCollectionDirectory
}: {
  crowdinCollectionDirectory: CrowdinCollectionDirectory
}) => {
  if (!crowdinCollectionDirectory) {
    return
  }

  const collectionDirectory = typeof crowdinCollectionDirectory === 'string' ? await payload.findByID({
    id: crowdinCollectionDirectory,
    collection: "crowdin-collection-directories"
  }) : crowdinCollectionDirectory

  if (!collectionDirectory) {
    return
  }

  const global = collectionDirectory.collectionSlug === "globals"

  return {
    global,
    slug: global ? collectionDirectory.name as string : collectionDirectory.collectionSlug as string,
  }
}
