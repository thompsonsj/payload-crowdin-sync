import { crowdinAPIService } from '.'
import { toWords } from 'payload/dist/utilities/formatLabels'
import { htmlToSlate, payloadHtmlToSlateConfig } from 'slate-serializers'
import { Payload } from 'payload'
import { CollectionConfig, GlobalConfig } from 'payload/types'
import {
  getLocalizedFields,
  getFieldSlugs,
  buildCrowdinJsonObject,
  getLocalizedRequiredFields
} from '../utilities'
import deepEqual from 'deep-equal'
import { lowerCase, upperFirst } from "lodash"


/**
 * Need to find a way to pass this in through config
 * 
 * Locales should only be defined in one place and
 * need to be configurable.
 */
interface IlocaleMap {
  [key: string]: {
    crowdinId: string
    previewSlug: string
  }
}

const localeMap: IlocaleMap = {
  da_DK: {
    crowdinId: "da",
    previewSlug: "da",
  },
  de_DE: {
    crowdinId: "de",
    previewSlug: "de",
  },
  en_GB: { 
    crowdinId: "en-GB",
    previewSlug: "en",
  },
  en_US: {
    crowdinId: "en-US",
    previewSlug: "en",
  },
  es_ES: {
    crowdinId: "es-ES",
    previewSlug: "es",
  },
  et_EE: {
    crowdinId: "et",
    previewSlug: "en",
  },
  fi_FI: {
    crowdinId: "fi",
    previewSlug: "fi",
  },
  fr_FR: {
    crowdinId: "fr",
    previewSlug: "fr",
  },
  it_IT: {
    crowdinId: "it",
    previewSlug: "it",
  },
  lt_LT: {
    crowdinId: "lt",
    previewSlug: "en",
  },
  lv_LV: {
    crowdinId: "lv",
    previewSlug: "en",
  },
  nl_NL: {
    crowdinId: "nl",
    previewSlug: "nl",
  },
  no_NO: {
    crowdinId: "no",
    previewSlug: "no",
  },
  pl_PL: {
    crowdinId: "pl",
    previewSlug: "en",
  },
  pt_PT: {
    crowdinId: "pt-PT",
    previewSlug: "en",
  },
  sv_SE: {
    crowdinId: "sv-SE",
    previewSlug: "sv",
  }
}

interface ApiObjects {
  payload: Payload
  crowdin: crowdinAPIService
}

interface IpayloadUpdateCrowdInFile extends ApiObjects {
  id: string
  name: string
  value: any
  fileType: 'html' | 'json'
  projectId: number
  fileId: number
}

interface IgetLatestDocumentTranslation extends ApiObjects {
  projectId: number
  collection: string
  doc: any
  locale: string
  global?: boolean
}

interface IgetCurrentDocumentTranslation {
  doc: any
  collection: string
  locale: string
  payload: any
  global?: boolean
}

interface IfindOrCreateCollectionDirectory extends ApiObjects {
  projectId: number
  directoryId: number
  collectionSlug: string
}

interface IfindOrCreateArticleDirectory extends IfindOrCreateCollectionDirectory {
  document: any
  global?: boolean
}

interface IupdateOrCreateFile extends IfindOrCreateCollectionDirectory {
  name: string
  value: string | object
  fileType: 'html' | 'json'
  articleDirectory: any
}

interface IgetTranslation extends ApiObjects {
  projectId: number
  documentId: string
  fieldName: string
  locale: string
  global?: boolean
}

interface IupdateTranslation extends ApiObjects {
  projectId: number
  documentId: string
  collection: string
  dryRun?: boolean
  global? :boolean
}

export async function getCrowdinFiles(crowdinArticleDirectoryId: number, payload: Payload): Promise<any> {
  const result = await payload.find({
    collection: "crowdin-files",
    limit: 9999,
    where: {
      crowdinArticleDirectory: {
        equals: crowdinArticleDirectoryId,
      },
    },
  })
  return result.docs
}

export async function getCrowdinFile(name: string, crowdinArticleDirectoryId: number, payload: Payload): Promise<any> {
  const files = await getCrowdinFiles(crowdinArticleDirectoryId, payload)
  const file = files.find((file: any) => file.field === name)
  /*if (!file) {
    throw new Error(
      `Could not find an entry in crowdin-files for the ${name} field.`
    )
  }*/
  return file
}

export async function payloadUpdateCrowdInFile({
  id,
  name,
  value,
  fileType,
  projectId,
  fileId,
  payload,
  crowdin,
}: IpayloadUpdateCrowdInFile) {
  // Update file on CrowdIn
  const crowdInFile = await crowdin.updateFile({
    projectId: projectId,
    fileId: fileId,
    name: name,
    fileData: value,
    fileType: fileType,
  })

  const payloadCrowdInFile = await payload.update({
    collection: 'crowdin-files', // required
    id: id,
    data: { // required
      updatedAt: crowdInFile.data.updatedAt,
      revisionId: crowdInFile.data.revisionId,
    },
  })
}

export async function payloadCreateCrowdInFile({
  name,
  value,
  fileType,
  projectId,
  articleDirectory,
  payload,
  crowdin,
}: IupdateOrCreateFile) {
  // Create file on CrowdIn
  const crowdInFile = await crowdin.createFile({
    projectId: projectId,
    directoryId: articleDirectory.originalId,
    name: name,
    fileData: value,
    fileType: fileType,
  })

  // createFile has been intermittent in not being available
  // perhaps logic goes wrong somewhere and express middleware
  // is hard to debug?
  /*const crowdInFile =  {data: {
    revisionId: 5,
    status: 'active',
    priority: 'normal',
    importOptions: { contentSegmentation: true, customSegmentation: false },
    exportOptions: null,
    excludedTargetLanguages: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    id: 1079,
    projectId: 323731,
    branchId: null,
    directoryId: 1077,
    name: name,
    title: null,
    type: fileType,
    path: `/policies/security-and-privacy/${name}.${fileType}`
  }}*/

  // Store result on Payload CMS
  if (crowdInFile) {
    const payloadCrowdInFile = await payload.create({
      collection: 'crowdin-files', // required
      data: { // required
        title: crowdInFile.data.name,
        field: name,
        crowdinArticleDirectory: articleDirectory.id,
        createdAt: crowdInFile.data.createdAt,
        updatedAt: crowdInFile.data.updatedAt,
        originalId: crowdInFile.data.id,
        projectId: crowdInFile.data.projectId,
        directoryId: crowdInFile.data.directoryId,
        revisionId: crowdInFile.data.revisionId,
        name: crowdInFile.data.name,
        type: crowdInFile.data.type,
        path: crowdInFile.data.path,
      },
    })

    return payloadCrowdInFile
  }
}

export async function findOrCreateArticleDirectory({
  document,
  projectId,
  directoryId,
  collectionSlug,
  payload,
  crowdin,
  global = false
}: IfindOrCreateArticleDirectory) {
  let crowdInPayloadArticleDirectory

  if (document.crowdinArticleDirectory) {
    // Update not possible. Article name needs to be updated manually on CrowdIn.
    // The name of the directory is CrowdIn specific helper text to give
    // context to translators.
    // See https://developer.crowdin.com/api/v2/#operation/api.projects.directories.getMany
    crowdInPayloadArticleDirectory = await payload.findByID({
      collection: 'crowdin-article-directories',
      'id': document.crowdinArticleDirectory.id || document.crowdinArticleDirectory
    })
  } else {
    const crowdInPayloadCollectionDirectory = await findOrCreateCollectionDirectory({
      projectId: projectId,
      directoryId: directoryId,
      collectionSlug: global ? 'globals' : collectionSlug,
      payload: payload,
      crowdin: crowdin
    })

    // Create article directory on CrowdIn
    const crowdInDirectory = await crowdin.createDirectory({
      projectId: projectId,
      directoryId: crowdInPayloadCollectionDirectory.originalId,
      name: global ? collectionSlug : document.id,
      title: global ? upperFirst(lowerCase(collectionSlug)) : document.title || document.name, // no tests for this CrowdIn metadata, but makes it easier for translators
    })

    // Store result in Payload CMS
    crowdInPayloadArticleDirectory = await payload.create({
      collection: 'crowdin-article-directories',
      data: {
        crowdinCollectionDirectory: crowdInPayloadCollectionDirectory.id,
        originalId: crowdInDirectory.data.id,
        projectId: projectId,
        directoryId: crowdInDirectory.data.directoryId,
        name: crowdInDirectory.data.name,
        createdAt: crowdInDirectory.data.createdAt,
        updatedAt: crowdInDirectory.data.updatedAt,
      }
    })

    // Associate result with document
    if (global) {
      const update = await payload.updateGlobal({
        slug: collectionSlug,
        data: {
          crowdinArticleDirectory: crowdInPayloadArticleDirectory.id
        }
      })
    } else {
      const update = await payload.update({
        collection: collectionSlug,
        id: document.id,
        data: {
          crowdinArticleDirectory: crowdInPayloadArticleDirectory.id
        }
      })
    }
  }
  
  return crowdInPayloadArticleDirectory
}

export async function findOrCreateCollectionDirectory({
  projectId,
  directoryId,
  collectionSlug,
  payload,
  crowdin
}: IfindOrCreateCollectionDirectory) {
  let crowdInPayloadCollectionDirectory
  // Check whether collection directory exists on CrowdIn
  const query = await payload.find({
    collection: 'crowdin-collection-directories',
    where: {
      collectionSlug: {
        equals: collectionSlug,
      },
    },
  })

  if (query.totalDocs === 0) {
    // Create collection directory on CrowdIn
    const crowdInDirectory = await crowdin.createDirectory({
      projectId: projectId,
      directoryId: directoryId,
      name: collectionSlug,
      title: toWords(collectionSlug) // is this transformed value available on the collection object?
    })

    // Store result in Payload CMS
    crowdInPayloadCollectionDirectory = await payload.create({
      collection: 'crowdin-collection-directories',
      data: {
        collectionSlug: collectionSlug,
        originalId: crowdInDirectory.data.id,
        projectId: projectId,
        directoryId: crowdInDirectory.data.directoryId,
        name: crowdInDirectory.data.name,
        title: crowdInDirectory.data.title,
        createdAt: crowdInDirectory.data.createdAt,
        updatedAt: crowdInDirectory.data.updatedAt,
      }
    })
  } else {
    crowdInPayloadCollectionDirectory = query.docs[0]
  }

  return crowdInPayloadCollectionDirectory
}

export async function updateTranslation({
  projectId,
  documentId,
  collection,
  payload,
  crowdin,
  dryRun = true,
  global = false,
}: IupdateTranslation) {
  /**
   * Get existing document
   * 
   * * check document exists
   * * check for `meta` field (which can be added by @payloadcms/seo) 
   * 
   */
  let doc
  if (global) {
    doc = await payload.findGlobal({
      slug: collection,
      locale: "en"
    })
  } else {
    doc = await payload.findByID({
      collection: collection,
      id: documentId,
      locale: "en"
    })
  }
  const report: {[key: string]: any} = {}
  for (const locale of Object.keys(localeMap)) {
    report[locale] = {}
    report[locale].currentTranslations = await getCurrentDocumentTranslation({
      doc: doc,
      collection: collection,
      locale: locale,
      payload: payload,
      global
    })
    report[locale].latestTranslations = await getLatestDocumentTranslation({
      projectId: projectId,
      collection: collection,
      doc: doc,
      locale: locale,
      payload: payload,
      crowdin: crowdin,
      global,
    })
    report[locale].changed = !deepEqual(report[locale].currentTranslations, report[locale].latestTranslations)
    if (report[locale].changed && !dryRun) {
      if (global) {
        await payload.updateGlobal({
          slug: collection,
          locale: locale,
          data: {
            ...report[locale].latestTranslations,
            // error on update without the following line.
            // see https://github.com/thompsonsj/payload-crowdin-sync/pull/13/files#r1209271660
            crowdinArticleDirectory: doc.crowdinArticleDirectory.id,
          },
        })
      } else {
        await payload.update({
          collection: collection,
          locale: locale,
          id: documentId,
          data: report[locale].latestTranslations,
        })
      }
    }
  }
  return {
    source: doc,
    translations: { ...report }
  }
}

export async function getCurrentDocumentTranslation({
  doc,
  collection,
  locale,
  payload,
  global = false,
}: IgetCurrentDocumentTranslation) {
  let document: any
  if (global) {
    document = await payload.findGlobal({
      slug: collection,
      locale: locale
    })
  } else {
    document = await payload.findByID({
      collection: collection,
      id: doc.id,
      locale: locale
    })
  }
  let collectionConfig
  if (global) {
    collectionConfig = payload.config.globals.find((col: GlobalConfig) => col.slug === collection)
  } else {
    collectionConfig = payload.config.collections.find((col: CollectionConfig) => col.slug === collection)
  }
  const localizedFields = getLocalizedFields({fields: collectionConfig.fields})
  // does not support nested html fields yet
  const htmlFields: {[key: string]: any} = {}
  getLocalizedFields({fields: collectionConfig.fields, type: 'html'}).forEach(field => (
    htmlFields[field.name] = document[field.name]
  ))
  return {
    ...buildCrowdinJsonObject({
      doc: document,
      fields: localizedFields
    }),
    ...htmlFields
  }
}

/**
 * Retrieve translations from CrowdIn for a document in a given locale
 */
export async function getLatestDocumentTranslation({
  projectId,
  collection,
  doc,
  locale,
  payload,
  crowdin,
  global = false,
}: IgetLatestDocumentTranslation) {
  let collectionConfig: any
  if (global) {
    collectionConfig = payload.config.globals.find((col: GlobalConfig) => col.slug === collection)
  } else {
    collectionConfig = payload.config.collections.find((col: CollectionConfig) => col.slug === collection)
  }
  const localizedFields = getLocalizedFields({ fields: collectionConfig.fields })
  const localizedJsonFields = getFieldSlugs(getLocalizedFields({fields: collectionConfig.fields, type: 'json'}))
  const localizedHtmlFields = getFieldSlugs(getLocalizedFields({fields: collectionConfig.fields, type: 'html'}))
  if (!localizedFields) {
    return {message: "no localized fields"}
  }
  // Support @payloadcms/seo
  if (doc.meta?.title) {
    localizedJsonFields.push('meta.title')
  }
  if (doc.meta?.description) {
    localizedJsonFields.push('meta.description')
  }

  // add json fields
  const docTranslations = await getTranslation({
    projectId: projectId,
    documentId: global ? collectionConfig.slug : doc.id,
    fieldName: 'fields',
    locale: locale,
    payload: payload,
    crowdin: crowdin,
  })
  // add html fields
  for (const field of localizedHtmlFields) {
    docTranslations[field] = await getTranslation({
      projectId: projectId,
      documentId: global ? collectionConfig.slug : doc.id,
      fieldName: field,
      locale: locale,
      payload: payload,
      crowdin: crowdin,
    })
  }
  // Add required fields if not present
  const requiredFieldSlugs = getFieldSlugs(getLocalizedRequiredFields(collectionConfig))
  if (requiredFieldSlugs.length > 0) {
    const currentTranslations = await getCurrentDocumentTranslation({
      doc: doc,
      collection: collection,
      locale: locale,
      payload: payload,
      global,
    })
    requiredFieldSlugs.forEach(slug => {
      if (!docTranslations.hasOwnProperty(slug)) {
        docTranslations[slug] = currentTranslations[slug]
      }
    })
  }
  return docTranslations
}

/**
 * Retrieve translations for a document field name
 * 
 * * returns Slate object for html fields
 * * returns all json fields if fieldName is 'fields'
 */
export async function getTranslation({
  projectId,
  documentId,
  fieldName,
  locale,
  payload,
  crowdin,
}: IgetTranslation) {
  const articleDirectory = await getCrowdinArticleDirectory(documentId, payload)
  const file = await getCrowdinFile(fieldName, articleDirectory.id, payload)
  const response = await crowdin.getTranslation({
    projectId: projectId,
    fileId: file.originalId,
    targetLanguageId: localeMap[locale].crowdinId
  })
  const data = await getFileDataFromUrl(response.data.url)
  return (file.type === 'html') ? htmlToSlate(data, payloadHtmlToSlateConfig) : JSON.parse(data)
}

export async function getCrowdinArticleDirectory(documentId: string, payload: Payload) {
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

async function getFileDataFromUrl(url: string) {
  const response = await fetch(url)
  const body = await response.text()
  return body
}
