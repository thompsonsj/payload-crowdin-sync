import { CollectionAfterChangeHook, CollectionConfig, Field, GlobalConfig, GlobalAfterChangeHook, PayloadRequest } from 'payload/types';
import { CrowdinPluginRequest, FieldWithName } from '../../types'
import { findOrCreateArticleDirectory, payloadCreateCrowdInFile, payloadUpdateCrowdInFile, getCrowdinFile } from '../../api/payload'
import { buildCrowdinJsonObject, convertSlateToHtml, fieldChanged, fieldCrowdinFileType } from '../../utilities'
import deepEqual from 'deep-equal'

/**
 * Update CrowdIn collections and make updates in CrowdIn
 * 
 * This functionality used to be split into field hooks.
 * However, it is more reliable to loop through localized
 * fields and perform opeerations in one place. The
 * asynchronous nature of operations means that
 * we need to be careful updates are not made sooner than
 * expected.
 */

interface CommonArgs {
  projectId: number,
  directoryId: number
  localizedFields: Field[]
}

interface Args extends CommonArgs {
  collection: CollectionConfig
}

interface GlobalArgs extends CommonArgs {
  global: GlobalConfig
}

export const getGlobalAfterChangeHook = ({
  projectId,
  directoryId,
  global,
  localizedFields
}: GlobalArgs): GlobalAfterChangeHook => async ({
  doc, // full document data
  previousDoc, // document data before updating the collection
  req, // full express request
}) => {
  const operation = previousDoc ? 'update' : 'create'
  return performAfterChange({
    doc,
    req,
    previousDoc,
    operation,
    projectId,
    directoryId,
    collection: global,
    localizedFields,
    global: true,
  })
}

export const getAfterChangeHook = ({
  projectId,
  directoryId,
  collection,
  localizedFields
}: Args): CollectionAfterChangeHook=> async ({
  doc, // full document data
  req, // full express request
  previousDoc, // document data before updating the collection
  operation, // name of the operation ie. 'create', 'update'
}) => {
  return performAfterChange({
    doc,
    req,
    previousDoc,
    operation,
    projectId,
    directoryId,
    collection,
    localizedFields
  })
}

interface IPerformChange {
  doc: any,
  req: PayloadRequest
  previousDoc: any
  operation: string
  projectId: number
  directoryId: number
  collection: CollectionConfig | GlobalConfig
  localizedFields: Field[]
  global?: boolean
}

const performAfterChange = async ({
  doc, // full document data
  req, // full express request
  previousDoc,
  operation,
  projectId,
  directoryId,
  collection,
  localizedFields,
  global = false,
}: IPerformChange) => {
  const createFile = async ({
    name,
    value,
    type
  }: {name: string, value: string | object, type: 'html' | 'json'}) => {
    const file = await payloadCreateCrowdInFile({
      name: name,
      value: value,
      fileType: type,
      projectId: projectId,
      directoryId: directoryId,
      collectionSlug: collection.slug,
      articleDirectory: articleDirectory,
      payload: req.payload,
      crowdin: (req as CrowdinPluginRequest).crowdinClient,
    })
  }

  // do nothing if there are no fields to localize
  if (localizedFields.length === 0) {
    return doc
  }

  if (!req.locale || req.locale !== 'en') {
    return doc
  }

  // retrieve the CrowdIn Article Directory article
  const articleDirectory = await findOrCreateArticleDirectory({
    document: doc,
    projectId: projectId,
    directoryId: directoryId,
    collectionSlug: collection.slug,
    payload: req.payload,
    crowdin: (req as CrowdinPluginRequest).crowdinClient,
    global,
  })
 
  // build json object for CrowdIn
  // do this for current and previous to detect a change
  const crowdinJsonFileData = buildCrowdinJsonObject(doc, localizedFields as FieldWithName[])
  const prevCrowdinFileData = buildCrowdinJsonObject(previousDoc, localizedFields as FieldWithName[])

  const createJsonFile = async () => {
      await createFile({
        name: 'fields',
        value: crowdinJsonFileData,
        type: 'json'
      })
  }

  // the 'create' operation is run separately from 'update' - without
  // this separation, there is a risk of duplicated CrowdIn files
  // as the asynchronous operations will run twice almost instantaneously
  // on create.
  if (operation === 'create') {
    if (!deepEqual(crowdinJsonFileData, prevCrowdinFileData) && Object.keys(crowdinJsonFileData).length !== 0) {
      await createJsonFile()
    }
    localizedFields
      .filter(field => fieldCrowdinFileType(field as FieldWithName) === 'html')
      .forEach(async field => {
      if (typeof doc[(field as FieldWithName).name] !== 'undefined') {
        await createFile({
          name: (field as FieldWithName).name,
          value: convertSlateToHtml(doc[(field as FieldWithName).name]),
          type: 'html'
        })
      }
    })
  }

  // for all localized fields, ensure there is a CrowdIn file,
  // and update if necessary
  if (operation === 'update') {
    const crowdinJsonFile = await getCrowdinFile('fields', articleDirectory.id, req.payload)
    if (!deepEqual(crowdinJsonFileData, prevCrowdinFileData)) {
      if (typeof crowdinJsonFile === 'undefined') {
        await createJsonFile()
      } else {
        const file = await payloadUpdateCrowdInFile({
          id: crowdinJsonFile.id,
          fileId: crowdinJsonFile.originalId,
          name: 'fields',
          value: crowdinJsonFileData,
          fileType: 'json',
          projectId: projectId,
          payload: req.payload,
          crowdin: (req as CrowdinPluginRequest).crowdinClient
        })
      }
    }

    localizedFields
      .filter(field => fieldCrowdinFileType(field as FieldWithName) === 'html')
      .forEach(async field => {
      // do not do anything if there aren't any changes
      if (fieldChanged(previousDoc[(field as FieldWithName).name], doc[(field as FieldWithName).name], field.type)) {

        const crowdinFile = await getCrowdinFile((field as FieldWithName).name, articleDirectory.id, req.payload)

        if (typeof crowdinFile === 'undefined') {
          await createFile({
            name: (field as FieldWithName).name,
            value: convertSlateToHtml(doc[(field as FieldWithName).name]),
            type: 'html'
          })
        } else {
          const file = await payloadUpdateCrowdInFile({
            id: crowdinFile.id,
            fileId: crowdinFile.originalId,
            name: (field as FieldWithName).name,
            value: convertSlateToHtml(doc[(field as FieldWithName).name]),
            fileType: 'html',
            projectId: projectId,
            payload: req.payload,
            crowdin: (req as CrowdinPluginRequest).crowdinClient
          })
        }
      }
    })
  }

  return doc
}
