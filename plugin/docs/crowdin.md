# Crowdin collections

By default, files are uploaded to Crowdin using the following folder/file structure.

```
"Payload CMS" > [collectionSlug] > [articleSlug] > [fieldSlug]
```

- Rich text fields are stored as HTML files.
- All other fields are stored as JSON files.

For each entry in a collection that contains localized fields, an additonal field is added: `crowdinArticleDirectory`. This is a one-to-one relationship with an article created in the `crowdin-article-directories` collection.

When a localized field is changed, a file is created/updated in the `crowdin-files` collection for that field. Details of the file are stored in Payload so that this file can be updated or deleted in the future. Each entry in the `crowdin-files` collection has a one-to-one relationship with the appropriate entry in the `crowdin-article-directories` collection.

- `richText` fields have their own Crowdin file. e.g. `content.html`. For ease-of-editing in Crowdin, Slate JSON is converted to HTML. When translated HTML is synced back into Payload, it is converted back to Slate JSON.
- All other fields are compiled into a single `fields.json` file for ease-of-editing in Crowdin.

Each entry in the `crowdin-article-directories` collection has a one-to-one relationship with an entry in the `crowdin-collection-directories` collection.

One-to-one relationships help preserve database integrity and simplify the operations needed to perform CRUD operations on all related entries.

All of the collections created by this plugin are designed to emulate the structure of API calls needed to communicate with crowdin. Each directory/file is created in a single API operation on Crowdin, and it is necessary to keep track of the details of each directory and file for future interactions.

## Payload collection slug change

If you change the slug of a Payload CMS collection, translations will no longer work. This is to be expected - the underlying config of Payload CMS has changed such that the plugin no longer has the correct reference to the collection.

**Change the collection slug in the corresponding `crowdin-collection-directories` collection document**

Update the `collectionSlug` field in the appropriate `crowdin-collection-directories` collection document to correspond with the new slug name.

Note that the folder structure on Crowdin will not change. Translations will still be managed in a folder name corresponding to the previous collection slug.

**Delete the `crowdin-article-directories` collection document relationship**

Deleting the `crowdin-article-directories` collection document relationship on a document resets the translation. New translation files will be created on Crowdin on the next save.

Note that previous Crowdin files will not be deleted. Cleanup operations are considered for a future update.
