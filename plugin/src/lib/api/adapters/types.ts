import type { CollectionConfig, GlobalConfig } from 'payload';
import type { HtmlObject } from 'payload-localized-fields';

/**
 * Payload-shaped localized content for one document.
 *
 * `json` is nested strings (arrays/blocks keyed by id).
 * `html` is rich-text values keyed by dotted path.
 * A vendor adapter converts these to its own files or keys.
 */
export type DocumentSlice = {
  json: { [key: string]: any };
  html?: HtmlObject;
};

/**
 * Writes source content for one document.
 *
 * Values are still Payload-shaped. The adapter converts rich text to HTML
 * (or another vendor format) internally.
 */
export interface SourceWriter {
  writeJson: (args: {
    fileData: string | object;
    fileName?: string;
  }) => Promise<unknown>;
  writeHtml: (args: {
    name: string;
    value: unknown;
    collection: CollectionConfig | GlobalConfig;
  }) => Promise<unknown>;
}

/**
 * Reads a translated document slice for one locale.
 */
export interface TranslationReader {
  readSlice: (args: {
    documentId: string;
    locale: string;
    collection: CollectionConfig | GlobalConfig;
    global?: boolean;
    doc?: any;
  }) => Promise<DocumentSlice>;
}
