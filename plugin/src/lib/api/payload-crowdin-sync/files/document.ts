import { PluginOptions } from '../../../index';
import { payloadCrowdinSyncFilesApi } from ".";
import { Payload } from "payload";
import { CrowdinArticleDirectory, CrowdinFile } from './../../../payload-types';
import { CollectionConfig, Document, GlobalConfig, RichTextField } from 'payload/types';
import { Config } from 'payload/config';

import { isEmpty } from 'lodash';
import {
  getFile,
  getFiles
} from "../../helpers";
import { Descendant } from "slate";
import { buildCrowdinHtmlObject, buildCrowdinJsonObject, convertLexicalToHtml, convertSlateToHtml, findField, reLocalizeField } from '../../../utilities';
import { extractLexicalBlockContent, getLexicalBlockFields, getLexicalEditorConfig } from '../../../utilities/lexical';

type FileData = string | object;

interface IupdateOrCreateFile {
  name: string;
  fileData: FileData;
  fileType: "html" | "json";
}

export class payloadCrowdinSyncDocumentFilesApi extends payloadCrowdinSyncFilesApi {
  document: Document
  articleDirectory: CrowdinArticleDirectory
  collectionSlug: keyof Config['collections'] | "globals";
  global?: boolean;

  constructor({
    document,
    articleDirectory,
    collectionSlug,
    global
  }: {
    document: Document,
    articleDirectory: CrowdinArticleDirectory,
    collectionSlug:  keyof Config['collections'] | "globals",
    global: boolean,
  }, pluginOptions: PluginOptions, payload: Payload) {
    super(pluginOptions, payload);
    this.document = document
    this.articleDirectory = articleDirectory
    this.collectionSlug = collectionSlug
    this.global = global
  }

  /**
   * getFile
   * 
   * Retrieve a CrowdinFile associated with this document by name. 
   * 
   * @param name file name
   * @returns CrowdinFile
   */
  async getFile(name: string): Promise<CrowdinFile> {
    return getFile(name, this.articleDirectory.id, this.payload);
  }

  /**
   * getFiles
   * 
   * Retrieve all CrowdinFile types associated with this document. 
   * 
   * @returns CrowdinFile[]
   */
  async getFiles(): Promise<CrowdinFile[]> {
    return getFiles(this.articleDirectory.id, this.payload);
  }

  /**
   * Create/Update/Delete a file on Crowdin
   *
   * Records the file in Payload CMS under the `crowdin-files` collection.
   *
   * - Create a file if it doesn't exist on Crowdin and the supplied content is not empty
   * - Update a file if it exists on Crowdin and the supplied content is not empty
   * - Delete a file if it exists on Crowdin and the supplied file content is empty
   */
  async createOrUpdateFile({
    name,
    fileData,
    fileType,
  }: IupdateOrCreateFile) {
    const empty = isEmpty(fileData);
    // Check whether file exists on Crowdin
    const crowdinFile = await this.getFile(name);
    let updatedCrowdinFile;
    if (!empty) {
      if (!crowdinFile) {
        updatedCrowdinFile = await this.createFile({
          name,
          fileData,
          fileType,
        });
      } else {
        updatedCrowdinFile = await this.updateFile({
          crowdinFile,
          name: name,
          fileData,
          fileType,
        });
      }
    } else {
      if (crowdinFile) {
        updatedCrowdinFile = await this.deleteFile(crowdinFile);
      }
    }
    return updatedCrowdinFile;
  }

  private async updateFile({
    crowdinFile,
    name,
    fileData,
    fileType,
  }: {crowdinFile: CrowdinFile} & IupdateOrCreateFile) {
    // Update file on Crowdin
    const updatedCrowdinFile = await this.crowdinUpdateFile({
      fileId: crowdinFile.originalId as number,
      name,
      fileData,
      fileType,
    });

    await this.payload.update({
      collection: "crowdin-files", // required
      id: crowdinFile.id,
      data: {
        // required
        updatedAt: updatedCrowdinFile.data.updatedAt,
        revisionId: updatedCrowdinFile.data.revisionId,
        ...(fileType === "json" && { fileData: { json: (fileData as {
          [k: string]: Partial<unknown>;
        }) }}),
        ...(fileType === "html" && { fileData: { html: typeof fileData === 'string' ? fileData : JSON.stringify(fileData) } }),
      },
    });
  }

  private async createFile({
    name,
    fileData,
    fileType,
  }: IupdateOrCreateFile) {
    // Create file on Crowdin
    const originalId = this.articleDirectory.originalId
    if (originalId) {
      const crowdinFile = await this.crowdinCreateFile({
        directoryId: originalId,
        name,
        fileData,
        fileType,
      });
      // Store result on Payload CMS
      if (crowdinFile) {
        const payloadCrowdinFile = await this.payload.create({
          collection: "crowdin-files", // required
          data: {
            // required
            title: name,
            field: name,
            crowdinArticleDirectory: this.articleDirectory.id,
            reference: {
              createdAt: crowdinFile.data.createdAt,
              updatedAt: crowdinFile.data.updatedAt,
              projectId: crowdinFile.data.projectId,
            },
            originalId: crowdinFile.data.id,
            directoryId: crowdinFile.data.directoryId,
            revisionId: crowdinFile.data.revisionId,
            name: `${name}.${fileType}`,
            type: fileType,
            path: crowdinFile.data.path,
            ...(fileType === "json" && { fileData: { json: (fileData as {
              [k: string]: Partial<unknown>;
            }) } }),
            ...(fileType === "html" && { fileData: { html: typeof fileData === 'string' ? fileData : JSON.stringify(fileData) } }),
          },
        });
        return payloadCrowdinFile;
      }
    }
    return
  }

  async deleteFile(crowdinFile: CrowdinFile) {
    await this.sourceFilesApi.deleteFile(
      this.projectId,
      crowdinFile.originalId as number
    );
    const payloadFile = await this.payload.delete({
      collection: "crowdin-files", // required
      id: crowdinFile.id, // required
    });
    return payloadFile;
  }

  async createOrUpdateJsonFile(fileData: FileData, fileName = "fields") {
    await this.createOrUpdateFile({
      name: fileName,
      fileData,
      fileType: "json",
    });
  }

  async createOrUpdateHtmlFile({
    name,
    value,
    collection,
  }: {
    name: string;
    value: Descendant[] | any;
    collection: CollectionConfig | GlobalConfig;
  }) {
    // brittle check for Lexical value - improve this detection. Type check? Anything from Payload to indicate the type?
    let html
    if (Object.prototype.hasOwnProperty.call(value, "root")) {
      const field = findField({
        dotNotation: name,
        fields: collection.fields
      }) as RichTextField
      const editorConfig = getLexicalEditorConfig(field)

      if (editorConfig) {
        html = await convertLexicalToHtml(value, editorConfig)
        // no need to detect change - this has already been done on the field's JSON object
        const blockContent = value && extractLexicalBlockContent(value.root)
        const blockConfig = getLexicalBlockFields(editorConfig)
        const fieldName = `${name}${this.pluginOptions.richTextBlockFieldNameSeparator}blocks`
        const currentCrowdinJsonData = buildCrowdinJsonObject({
          doc: {
            [fieldName]: blockContent,
          },
          fields: [
            {
              name: fieldName,
              type: 'blocks',
              blocks: blockConfig.blocks,
            }
          ],
          isLocalized: reLocalizeField, // ignore localized attribute
        });
        const currentCrowdinHtmlData = buildCrowdinHtmlObject({
          doc: {
            [fieldName]: blockContent,
          },
          fields: [
            {
              name: fieldName,
              type: 'blocks',
              blocks: blockConfig.blocks,
            }
          ],
          isLocalized: reLocalizeField, // ignore localized attribute
        });
        await this.createOrUpdateJsonFile(currentCrowdinJsonData, fieldName);
        await Promise.all(Object.keys(currentCrowdinHtmlData).map(async (name) => {
          await this.createOrUpdateHtmlFile({
            name,
            value: currentCrowdinHtmlData[name] as Descendant[],
            collection,
          });
        }));
      } else {
        html = "<span>lexical configuration not found</span>"
      }
    } else {
      html = convertSlateToHtml(value, this.pluginOptions.slateToHtmlConfig)
    }
    await this.createOrUpdateFile({
      name: name,
      fileData: html,
      fileType: "html",
    });
  }

  async deleteFilesAndDirectory() {
    const files = await this.getFiles();

    for (const file of files) {
      await this.deleteFile(file);
    }

    await this.deleteArticleDirectory(this.document.id);
  }
}
