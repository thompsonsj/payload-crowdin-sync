import { Payload } from 'payload';
import {
  CrowdinArticleDirectory,
  CrowdinCollectionDirectory,
  CrowdinFile,
} from '../payload-types';
import { payloadCrowdinSyncTranslationsApi } from './translations';
import {
  PluginOptions,
  isCollectionOrGlobalConfigObject,
  isCollectionOrGlobalConfigSlug,
  isCrowdinArticleDirectory,
} from '../types';
import type {
  CollectionConfig,
  GlobalConfig,
  PayloadRequest,
  SanitizedCollectionConfig,
  SanitizedGlobalConfig,
} from 'payload';

export const getCollectionConfig = (
  collection: string,
  global: boolean,
  payload: Payload,
): CollectionConfig | GlobalConfig => {
  let collectionConfig:
    | SanitizedGlobalConfig
    | SanitizedCollectionConfig
    | undefined;
  if (!collection && !global) {
    return undefined;
  }
  if (global) {
    collectionConfig = payload.config.globals.find(
      (col: GlobalConfig) => col.slug === collection,
    );
  } else {
    collectionConfig = payload.config.collections.find(
      (col: CollectionConfig) => col.slug === collection,
    );
  }
  if (!collectionConfig)
    throw new Error(`Collection ${collection} not found in payload config`);
  return collectionConfig;
};

/**
 * Retrieve the Crowdin article directory for a given document ID.
 *
 * If `parent` is provided, the lookup is restricted to directories with that parent.
 *
 * @param allowEmpty - If `true`, throws an `Error` when no matching directory is found; otherwise no directory found yields `undefined`.
 * @param parent - Parent directory (object) or parent ID (string) to limit the search.
 * @returns The matched Crowdin article directory, or `undefined` if none is found and `allowEmpty` is not `true`.
 * @throws Error when no matching directory exists and `allowEmpty` is `true`.
 */
export async function getArticleDirectory({
  documentId,
  payload,
  allowEmpty,
  parent,
  req,
}: {
  documentId: string;
  payload: Payload;
  allowEmpty?: boolean;
  parent?: CrowdinArticleDirectory | null | string;
  req?: PayloadRequest;
}) {
  const crowdinPayloadArticleDirectory = await payload.find({
    collection: 'crowdin-article-directories',
    where: {
      name: {
        equals: documentId,
      },
      ...(parent && {
        parent: {
          equals: isCrowdinArticleDirectory(parent) ? parent?.id : parent,
        },
      }),
    },
    req,
  });
  if (crowdinPayloadArticleDirectory.totalDocs === 0 && !allowEmpty) {
    // a thrown error won't be reported in an api call, so console.log it as well.
    console.log(`No article directory found for document ${documentId}`);
    throw new Error(
      'This article does not have a corresponding entry in the crowdin-article-directories collection.',
    );
  }
  return crowdinPayloadArticleDirectory
    ? crowdinPayloadArticleDirectory.docs[0]
    : undefined;
}

/**
 * Retrieve child Crowdin article directories for the given parent.
 *
 * @param parent - Parent directory to filter by; may be a CrowdinArticleDirectory object, its `id`, or `null`. If an object is provided, its `id` is used for the lookup.
 * @returns An array of matching Crowdin article directory documents.
 */
export async function getLexicalFieldArticleDirectories({
  payload,
  parent,
  req,
}: {
  payload: Payload;
  parent?: CrowdinArticleDirectory | null | string;
  req?: PayloadRequest;
}) {
  const query = await payload.find({
    collection: 'crowdin-article-directories',
    where: {
      parent: {
        equals: isCrowdinArticleDirectory(parent) ? parent?.id : parent,
      },
    },
    req,
  });
  return query.docs;
}

/**
 * Retrieve the Crowdin article directory for a lexical field by its field name within an optional parent directory.
 *
 * @param name - The lexical field's name (used as the documentId in dot notation).
 * @param parent - Parent directory id, directory object, or null to scope the lookup.
 * @returns The matching CrowdinArticleDirectory if found, otherwise `undefined`.
 */
export async function getLexicalFieldArticleDirectory({
  payload,
  parent,
  name,
  req,
}: {
  payload: Payload;
  parent?: CrowdinArticleDirectory | null | string;
  name: string;
  req?: PayloadRequest;
}): Promise<CrowdinArticleDirectory | undefined> {
  return (await getArticleDirectory({
    /** 'document id' is the field name in dot notation for lexical blocks */
    documentId: name,
    payload,
    allowEmpty: false,
    parent,
    req,
  })) as CrowdinArticleDirectory | undefined;
}

/**
 * Retrieves the first Crowdin file document with the given field name in the specified article directory.
 *
 * @param name - The field name of the file to find.
 * @param crowdinArticleDirectoryId - The ID of the Crowdin article directory to search within.
 * @returns The first matching Crowdin file document, or `undefined` if none is found.
 */
export async function getFile(
  name: string,
  crowdinArticleDirectoryId: string,
  payload: Payload,
  req?: PayloadRequest,
): Promise<any> {
  const result = await payload.find({
    collection: 'crowdin-files',
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

/**
 * Retrieve all Crowdin files belonging to a specific article directory.
 *
 * @param crowdinArticleDirectoryId - ID of the Crowdin article directory to fetch files for
 * @param payload - Payload CMS instance used to query the collection
 * @param req - Optional request context forwarded to the query
 * @returns An array of `CrowdinFile` documents associated with the specified article directory
 */
export async function getFiles(
  crowdinArticleDirectoryId: string,
  payload: Payload,
  req?: PayloadRequest,
): Promise<CrowdinFile[]> {
  const result = await payload.find({
    collection: 'crowdin-files',
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

/**
 * Retrieve the Crowdin file with the given field name for the article directory associated with a document ID.
 *
 * @param name - The file field name to look up within the article directory
 * @param documentId - The document identifier used to locate the corresponding article directory
 * @param req - Optional request context used for payload operations
 * @returns The matching Crowdin file document
 */
export async function getFileByDocumentID(
  name: string,
  documentId: string,
  payload: Payload,
  req?: PayloadRequest,
): Promise<CrowdinFile> {
  let articleDirectory = undefined;
  try {
    articleDirectory = await getArticleDirectory({
      documentId,
      payload,
      req,
    });
  } catch (error) {
    console.log(error);
  }
  return getFile(name, `${articleDirectory?.id}`, payload, req);
}

/**
 * Retrieve all Crowdin files for the article directory associated with a document ID.
 *
 * @param documentId - The document identifier used to resolve the Crowdin article directory
 * @param parent - Optional parent article directory to scope the lookup
 * @returns An array of `CrowdinFile` objects for the resolved article directory, or an empty array if no directory is found
 */
export async function getFilesByDocumentID({
  documentId,
  payload,
  parent,
  req,
}: {
  documentId: string;
  payload: Payload;
  parent?: CrowdinArticleDirectory;
  req?: PayloadRequest;
}): Promise<CrowdinFile[]> {
  let articleDirectory = undefined;
  try {
    articleDirectory = await getArticleDirectory({
      documentId: `${documentId}`,
      payload,
      allowEmpty: false,
      parent,
      req,
    });
  } catch (error) {
    console.log(error);
  }
  if (!articleDirectory) {
    // tests call this function to make sure files are deleted
    return [];
  }
  const files = await getFiles(`${articleDirectory.id}`, payload, req);
  return files;
}

interface IupdatePayloadTranslation {
  articleDirectoryId: string;
  pluginOptions: PluginOptions;
  payload: Payload;
  /** store translations into a draft */
  draft?: boolean;
  /** prevent database changes */
  dryRun?: boolean;
  /** override article directory exclude locales */
  excludeLocales?: string[];
  req?: PayloadRequest;
}

/**
 * Trigger an update of translations for the specified Crowdin article directory.
 *
 * @param articleDirectoryId - ID of the Crowdin article directory to update
 * @param pluginOptions - Plugin configuration used to initialize the Crowdin translations API
 * @param draft - When true, update translations as drafts
 * @param dryRun - When true, perform a dry run without persisting changes
 * @param excludeLocales - Locales to exclude from the update; if omitted, directory-specific excludes are used
 * @returns An object with `status: 200` and translation result fields on success; on failure returns `status: 400` and an `error` field
 */
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
    collection: 'crowdin-article-directories',
    req,
  });
  // is this a global or a collection?
  const global =
    ((
      articleDirectory[
        'crowdinCollectionDirectory'
      ] as CrowdinCollectionDirectory
    )?.collectionSlug as string) === 'globals';
  // get an instance of our translations api
  const translationsApi = new payloadCrowdinSyncTranslationsApi(
    pluginOptions,
    payload,
    req,
  );
  try {
    const translations = await translationsApi.updateTranslation({
      documentId: !global ? (articleDirectory['name'] as string) : ``,
      collection: global
        ? (articleDirectory['name'] as string)
        : ((
            articleDirectory[
              'crowdinCollectionDirectory'
            ] as CrowdinCollectionDirectory
          )?.collectionSlug as string),
      global,
      draft,
      dryRun,
      excludeLocales:
        excludeLocales ||
        (articleDirectory['excludeLocales'] as string[]) ||
        [],
    });
    return {
      status: 200,
      ...translations,
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
      error,
    );
    return {
      status: 400,
      error,
    };
  }
}

export const isCrowdinActive = ({
  doc,
  slug,
  global,
  pluginOptions,
}: {
  doc: any;
  slug: string;
  global: boolean;
  pluginOptions: PluginOptions;
}) => {
  if (!slug) {
    return false;
  }

  if (global) {
    if (!pluginOptions.globals) {
      return true;
    }

    const matchingGlobalConfig = pluginOptions.globals.find((config) => {
      if (isCollectionOrGlobalConfigObject(config) && config.slug === slug) {
        if (typeof config.condition !== 'undefined') {
          return config.condition({ doc });
        }
        return true;
      }
      if (isCollectionOrGlobalConfigSlug(config)) {
        return config === slug;
      }
      return false;
    });

    if (typeof matchingGlobalConfig !== 'undefined') {
      return true;
    }
  }

  if (!pluginOptions.collections) {
    return true;
  }

  const matchingCollectionConfig = pluginOptions.collections.find((config) => {
    if (isCollectionOrGlobalConfigObject(config) && config.slug === slug) {
      if (typeof config.condition !== 'undefined') {
        return config.condition({ doc });
      }
      return true;
    }
    if (isCollectionOrGlobalConfigSlug(config)) {
      return config === slug;
    }
    return false;
  });

  if (typeof matchingCollectionConfig !== 'undefined') {
    return true;
  }

  return false;
};
