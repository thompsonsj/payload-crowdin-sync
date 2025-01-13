import { Payload } from "payload";
import { CrowdinArticleDirectory, CrowdinCollectionDirectory, CrowdinFile } from "../payload-types";
import { payloadCrowdinSyncTranslationsApi } from "./translations";
import { PluginOptions, isCollectionOrGlobalConfigObject, isCollectionOrGlobalConfigSlug, isCrowdinArticleDirectory } from "../types";
import type { CollectionConfig, GlobalConfig, PayloadRequest, SanitizedCollectionConfig, SanitizedGlobalConfig } from "payload";

export const getCollectionConfig = (
  collection: string,
  global: boolean,
  payload: Payload,
): CollectionConfig | GlobalConfig => {
  let collectionConfig:
    | SanitizedGlobalConfig
    | SanitizedCollectionConfig
    | undefined;
  if (global) {
    collectionConfig = payload.config.globals.find(
      (col: GlobalConfig) => col.slug === collection
    );
  } else {
    collectionConfig = payload.config.collections.find(
      (col: CollectionConfig) => col.slug === collection
    );
  }
  if (!collectionConfig)
    throw new Error(`Collection ${collection} not found in payload config`);
  return collectionConfig;
}

/**
 * get Crowdin Article Directory for a given documentId
 *
 * The Crowdin Article Directory is associated with a document,
 * so is easy to retrieve. Use this function when you only have
 * a document id.
 */
export async function getArticleDirectory(
  {
    documentId,
    payload,
    allowEmpty,
    parent,
    req,
  }: {
    documentId: string,
    payload: Payload,
    allowEmpty?: boolean,
    parent?: CrowdinArticleDirectory | null | string,
    req?: PayloadRequest,
  }
) {
  const crowdinPayloadArticleDirectory = await payload.find({
    collection: "crowdin-article-directories",
    where: {
      name: {
        equals: documentId,
      },
      ...(parent && {
        parent: {
          equals: isCrowdinArticleDirectory(parent) ? parent?.id : parent,
        }
      })
    },
    req,
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

export async function getLexicalFieldArticleDirectory({
  payload,
  parent,
  name,
  req,
}: {
  payload: Payload,
  parent?: CrowdinArticleDirectory | null | string,
  name: string,
  req?: PayloadRequest,
}) {
  const dir = await getArticleDirectory({
    /** 'document id' is the field name in dot notation for lexical blocks */
    documentId: name,
    payload,
    allowEmpty: false,
    parent,
    req,
  }) as any
  return dir as CrowdinArticleDirectory
}

export async function getFile(
  name: string,
  crowdinArticleDirectoryId: string,
  payload: Payload,
  req?: PayloadRequest
): Promise<any> {
  const result = await payload.find({
    collection: "crowdin-files",
    where: {
      field: { equals: name },
      crowdinArticleDirectory: {
        equals: crowdinArticleDirectoryId,
      },
    },
    req,
  });
  return result.docs[0];
}

export async function getFiles(
  crowdinArticleDirectoryId: string,
  payload: Payload,
  req?: PayloadRequest
): Promise<CrowdinFile[]> {
  const result = await payload.find({
    collection: "crowdin-files",
    limit: 10000,
    where: {
      crowdinArticleDirectory: {
        equals: crowdinArticleDirectoryId,
      },
    },
    req,
  });
  return result.docs as any;
}

export async function getFileByDocumentID(
  name: string,
  documentId: string,
  payload: Payload,
  req?: PayloadRequest,
): Promise<CrowdinFile> {
  const articleDirectory = await getArticleDirectory({
    documentId, payload, req,
  });
  return getFile(name, `${articleDirectory?.id}`, payload, req);
}

export async function getFilesByDocumentID({
  documentId,
  payload,
  parent,
  req,
} : {
  documentId: string,
  payload: Payload,
  parent?: CrowdinArticleDirectory,
  req?: PayloadRequest
}): Promise<CrowdinFile[]> {
  const articleDirectory = await getArticleDirectory({
    documentId: `${documentId}`,
    payload,
    allowEmpty: false,
    parent,
    req,
  });
  if (!articleDirectory) {
    // tests call this function to make sure files are deleted
    return [];
  }
  const files = await getFiles(`${articleDirectory.id}`, payload, req);
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
  req?: PayloadRequest
}

export async function updatePayloadTranslation({
  articleDirectoryId,
  pluginOptions,
  payload,
  draft,
  dryRun,
  excludeLocales,
  req,
}: IupdatePayloadTranslation) {
  // get article directory
  const articleDirectory = await payload.findByID({
    id: articleDirectoryId,
    collection: "crowdin-article-directories",
    req,
  });
  // is this a global or a collection?
  const global =
    (articleDirectory['crowdinCollectionDirectory'] as CrowdinCollectionDirectory)?.collectionSlug as string === "globals";
  // get an instance of our translations api
  const translationsApi = new payloadCrowdinSyncTranslationsApi(
    pluginOptions,
    payload,
    req,
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
    console.log(
      'updatePayloadTranslation',
      {
        articleDirectoryId,
        pluginOptions,
        draft,
        dryRun,
        excludeLocales,
      },
      'error',
      error
    )
    return {
      status: 400,
      error,
    }
  }
}

export const isCrowdinActive = ({
  doc,
  slug,
  global,
  pluginOptions
}: {
  doc: any,
  slug: string
  global: boolean
  pluginOptions: PluginOptions
}) => {
  if (!slug) {
    return false
  }

  if (global) {
    if (!pluginOptions.globals) {
      return true
    }

    const matchingGlobalConfig = pluginOptions.globals.find(config => {
      if (isCollectionOrGlobalConfigObject(config) && config.slug === slug) {
        if (typeof config.condition !== 'undefined') {
          return config.condition({ doc })
        }
        return true
      }
      if (isCollectionOrGlobalConfigSlug(config)) {
        return config === slug
      }
      return false
    })

    if (typeof matchingGlobalConfig !== 'undefined') {
      return true
    }
  }

  if (!pluginOptions.collections) {
    return true
  }

  const matchingCollectionConfig = pluginOptions.collections.find(config => {
    if (isCollectionOrGlobalConfigObject(config) && config.slug === slug) {
      if (typeof config.condition !== 'undefined') {
        return config.condition({ doc })
      }
      return true
    }
    if (isCollectionOrGlobalConfigSlug(config)) {
      return config === slug
    }
    return false
  })

  if (typeof matchingCollectionConfig !== 'undefined') {
    return true
  }

  return false
}
