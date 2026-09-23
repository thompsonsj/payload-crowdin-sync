---
sidebar_position: 3
description: How Payload documents become folders and files in Crowdin, and the collections the plugin uses to keep track of them.
---

# How documents map to Crowdin

Rather than uploading a document's JSON to Crowdin, the plugin turns each Payload document into HTML and JSON files that contain only localized field values. Translators see just the text they need to translate.

This page covers how documents are transformed, what the plugin stores in your database, and how it stays in sync with Crowdin.

## Crowdin folder structure

Files are uploaded to Crowdin with this structure:

```
[collection] > [document] > [files]
```

- **Collection folders** are named after the collection slug, and titled in words (for example `localized-posts` is titled "Localized Posts"). Globals share a `globals` folder, with a folder for each global inside it.
- **Document folders** are named after the document ID, and titled with the document's [`useAsTitle`](https://payloadcms.com/docs/configuration/collections#admin-options) field, falling back to `title` or `name`.
- **Files** are `fields.json` for text fields, and one HTML file per rich text field, for example `content.html`.

Set the [`directoryId`](./README.md#directoryid) option to put everything inside an existing Crowdin folder:

```
"My Directory" > [collection] > [document] > [files]
```

## Rich text fields

Each `richText` field is converted to HTML for Crowdin and converted back when translations are loaded. The conversion depends on the editor: Slate or Lexical. See [supported fields](./fields.md#rich-text) for what each editor supports.

### Blocks

Translation of blocks within Lexical editor fields is supported.

For each Lexical field with blocks, blocks are extracted and 'treated as an imaginary localized document' in order to re-use as much plugin logic as possible:

- a new `crowdin-article-directories` document is created with a parent of the localized document, or a parent Lexical field.
- blocks are compiled into an imaginary [blocks field](https://payloadcms.com/docs/fields/blocks) with a field name of `blocks`.

```
const fields: Field[] = [
  {
    name: 'blocks',
    type: 'blocks',
    blocks: blockConfig.blocks,
  }
]
```

...where `blockConfig` is extracted from the Lexical field editor config.

#### Blocks are not localized

One key difference between regular localized documents and the imaginary localized documents created for Lexical field blocks is that there is no way to identify which fields are localized and which fields are not.
Currently, this approach only supports non-localized fields. This is because these blocks live within a Lexical field that may or may not be localized, and therefore it doesn't make sense for blocks within a localized field to also be localized - there will be an entirely different field with different block instances in different locales.

## Text fields

All other supported fields are compiled into a single `fields.json` file per document. See [nested fields](./fields.md#nested-fields) for its structure.

## How the database is modified

Three new collections are created.

- `crowdin-collection-directories`
- `crowdin-article-directories`
- `crowdin-files`

Each root `crowdin-article-directories` document links back to its Payload document, with the polymorphic `collectionDocument` field for collections or the `globalSlug` field for globals.

Enabled documents get a `crowdinArticleDirectory` relationship field. It isn't stored: the plugin looks up the matching `crowdin-article-directories` document when your document is read.

### Upgrading from older versions

Older versions stored `crowdinArticleDirectory` on your documents, and may not have set `collectionDocument` or `globalSlug`. To copy the old links across, import `backfillArticleDirectoryPolymorphicLinks` from `payload-crowdin-sync` and call it once with your Payload instance, for example from `onInit` or a one-off script:

```ts
import { backfillArticleDirectoryPolymorphicLinks } from 'payload-crowdin-sync';

const result = await backfillArticleDirectoryPolymorphicLinks(payload);
```

After the backfill, the stored `crowdinArticleDirectory` values are no longer needed.

### Uninstall

To uninstall the plugin, remove it from your config and drop the three collections. On older installs, also remove any stored `crowdinArticleDirectory` values from your documents.

### `crowdin-collection-directories`

Each entry in the `crowdin-article-directories` collection has a one-to-one relationship with an entry in the `crowdin-collection-directories` collection.

### `crowdin-article-directories`

A `crowdin-article-directories` document represents a folder created on Crowdin containing files for a given Payload document.

#### `crowdin-article-directories` children

`crowdin-article-directories` can also have a one-to-one relationship with each other through the `parent` field. These directories are created within parent directories to contain translations for blocks within a Lexical `richText` field.

`crowdin-article-directories` documents created for Lexical blocks have the following differences:

- The `name` field is set to the Lexical field name in dot notation prefixed with `pluginOptions.lexicalBlockFolderPrefix`. Normal `crowdin-article-directories` documents set the `name` field as the `id` of the corresponding document.
- The `parent` field is defined. Normal `crowdin-article-directories` documents have an `parent` of `undefined`.

### `crowdin-files`

Each entry in the `crowdin-files` collection has a one-to-one relationship with an entry in the `crowdin-article-directories` collection.

When a localized field is changed, a file is created/updated in the `crowdin-files` collection for that field. Details of the file are stored in Payload so that this file can be updated or deleted in the future.

If a file is deleted in Crowdin, its `crowdin-files` entry is removed the next time translations are loaded, and the file is uploaded again on the next save. See [`disableSelfClean`](./README.md#disableselfclean).

#### `crowdin-files` children

- A new `crowdin-article-directories` document is created for each block and is stored within the parent folder on Crowdin. See [`crowdin-article-directories` children](#crowdin-article-directories-children).
- The `documentId` of the `crowdin-files` document is a string containing dot notation pointing to the `richText` field.

## Payload collection slug change

If you change the slug of a Payload CMS collection, translations will no longer work. This is to be expected - the underlying config of Payload CMS has changed such that the plugin no longer has the correct reference to the collection.

**Change the collection slug in the corresponding `crowdin-collection-directories` collection document**

Update the `collectionSlug` field in the appropriate `crowdin-collection-directories` collection document to correspond with the new slug name.

Note that the folder structure on Crowdin will not change. Translations will still be managed in a folder name corresponding to the previous collection slug.

## Reset a document's translations

Delete the document's entry in `crowdin-article-directories`. A new folder and new files are created in Crowdin on the next save.

The old files in Crowdin aren't deleted. Cleaning them up is a [planned feature](../repo/planned-features.md).
