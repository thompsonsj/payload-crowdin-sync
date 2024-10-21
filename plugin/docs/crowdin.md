# Crowdin collections

Rather than uploading a document json object directly into Crowdin, this plugin transforms a Payload document into multiple `html` and `json` files that contain localized field values only. This greatly enhances the localization experience in Crowdin.

Following are details of the transformation process, how documents are modified and how the plugin keeps in sync with Crowdin.

## Crowdin folder structure

By default, files are uploaded to Crowdin using the following folder/file structure.

```
[collectionSlug] > [articleSlug] > [fieldSlug]
```

Files can be uploaded to a specific directory by setting the `directoryId` option.

```
"My Directory" > [collectionSlug] > [articleSlug] > [fieldSlug]
```

- Rich text fields are stored as HTML files.
- All other fields are compiled into JSON files.

## Rich text fields

For ease-of-editing in Crowdin, the underlying editor object is converted to HTML. When translated HTML is synced back into Payload, it is converted back to an apporpriate object.

Each `richText` field has its own Crowdin file. e.g. `content.html`.

The object conversion depends on the rich text editor used in that field. See [Rich Text Field | Payload](https://payloadcms.com/docs/fields/rich-text).

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

Cureently, this approach only supports non-localized fields. This is because these blocks live within a Lexical field that may or may not localized, and therefore it doesn't make sense for blocks within a localized field to also be localized - there will be an entirely different field with different block instances in different locales.

## Text fields

All other fields are compiled into a single `fields.json` file for ease-of-editing in Crowdin.

## How the database is modified

Three new collections are created.

- `crowdin-collection-directories`
- `crowdin-article-directories`
- `crowdin-files`

For each document in a collection that contains localized fields, an additonal field is added: `crowdinArticleDirectory`. This is a one-to-one relationship with an article created in the `crowdin-article-directories` collection.

To completely uninstall the plugin, delete the three collections and delete the `crowdinArticleDirectory` field from any of your localized documents as appropriate.

### `crowdin-collection-directories`

Each entry in the `crowdin-article-directories` collection has a one-to-one relationship with an entry in the `crowdin-collection-directories` collection.

### `crowdin-article-directories`

A `crowdin-article-directories` document represents a folder created on Crowdin containing files for a given Payload document.

#### `crowdin-article-directories` children

`crowdin-article-directories` can also have a one-to-one relationship with each other through the `parent` field. These directories are created within parent diretories to contain translations for blocks within a Lexical `richText` field.

`crowdin-article-directories` documents created for Lexical blocks have the following differences:

- The `name` field is set to the Lexical field name in dot notation prefixed with `pluginOptions.lexicalBlockFolderPrefix`. Normal `crowdin-article-directories` documents set the `name` field as the `id` of the corresponding document.
- The `parent` field is defined. Normal `crowdin-article-directories` documents have an `parent` of `undefined`.

### `crowdin-files`

Each entry in the `crowdin-files` collection has a one-to-one relationship with an entry in the `crowdin-article-directories` collection.

When a localized field is changed, a file is created/updated in the `crowdin-files` collection for that field. Details of the file are stored in Payload so that this file can be updated or deleted in the future. Each entry in the `crowdin-files` collection has a one-to-one relationship with the appropriate entry in the `crowdin-article-directories` collection.

#### `crowdin-files` children

- A new `crowdin-article-directories` document is created for each block and is stored within the parent folder on Crowdin. See [`crowdin-article-directories` children](#crowdin-article-directories-children).
- The `documentId` of the `crowdin-files` document is a string containing dot notation pointing to the `richText` field.


## Payload collection slug change

If you change the slug of a Payload CMS collection, translations will no longer work. This is to be expected - the underlying config of Payload CMS has changed such that the plugin no longer has the correct reference to the collection.

**Change the collection slug in the corresponding `crowdin-collection-directories` collection document**

Update the `collectionSlug` field in the appropriate `crowdin-collection-directories` collection document to correspond with the new slug name.

Note that the folder structure on Crowdin will not change. Translations will still be managed in a folder name corresponding to the previous collection slug.

**Delete the `crowdin-article-directories` collection document relationship**

Deleting the `crowdin-article-directories` collection document relationship on a document resets the translation. New translation files will be created on Crowdin on the next save.

Note that previous Crowdin files will not be deleted. Cleanup operations are considered for a future update.
