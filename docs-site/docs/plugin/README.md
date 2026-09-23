---
sidebar_position: 1
description: Install and configure payload-crowdin-sync, upload content to Crowdin, and load translations back into Payload.
---

# Getting started

Install the plugin, configure it, and sync content between Payload and Crowdin.

Table of contents:

- [Install](#install)
- [Database changes](#database-changes)
- [Options](#options)
- [Environment variables](#environment-variables)
- [Sync translations](#sync-translations)
- [Delete documents](#delete-documents)
- [Further documentation](#further-documentation)

## Install

Requirements:

- Payload 3
- A Crowdin project and a [personal access token](https://support.crowdin.com/account-settings/#personal-access-tokens) with access to it

```bash
# npm
npm install payload-crowdin-sync

# yarn
yarn add payload-crowdin-sync
```

Add the plugin to your Payload configuration.

```ts
import { crowdinSync } from 'payload-crowdin-sync';

export default buildConfig({
  plugins: [
    crowdinSync({
      projectId: 323731,
      token: process.env.CROWDIN_TOKEN,
      localeMap: {
        de_DE: {
          crowdinId: 'de',
        },
        fr_FR: {
          crowdinId: 'fr',
        },
      },
      sourceLocale: 'en',
    }),
  ],
  // The rest of your config goes here
});
```

## Database changes

This plugin adds three collections to your database:

- `crowdin-files`
- `crowdin-article-directories`
- `crowdin-collection-directories`

Enabled documents also get these fields, which aren't stored in your database:

- `syncTranslations` and `syncAllTranslations` checkboxes, which load translations on save (see [virtual fields](#virtual-fields)).
- `crowdinArticleDirectory`, a relationship to the document's Crowdin folder, looked up when the document is read.

For details, see [how documents map to Crowdin](./crowdin.md).

## Options

### `projectId` (required)

Your [Crowdin project ID](https://support.crowdin.com/enterprise/project-settings/#details).

```js
{
  projectId: 323731,
}
```

### `localeMap` (required)

Map your Payload locales to Crowdin locale ids.

```js
{
  localeMap: {
    de_DE: {
      crowdinId: 'de',
    }
  }
}
```

### `sourceLocale` (required)

The Payload locale that syncs to source translations (files) on Crowdin.

```js
{
  sourceLocale: 'en',
}
```

### `token`

Your Crowdin API token: a [personal access token](https://support.crowdin.com/account-settings/#personal-access-tokens) on crowdin.com, or an [Enterprise token](https://support.crowdin.com/enterprise/personal-access-tokens/). If empty, the plugin doesn't upload or delete anything in Crowdin.

```js
{
  token: process.env.CROWDIN_TOKEN,
}
```

### `organization`

Your Crowdin Enterprise organization domain, for example `acme` for `acme.crowdin.com`. Leave it empty if you use crowdin.com.

```js
{
  organization: process.env.CROWDIN_ORGANIZATION,
}
```

### `directoryId`

Crowdin directory ID to store translations. To get the directory ID without making an API call, inspect the page source of your folder in [Sources > Files](https://support.crowdin.com/file-management/#branches-and-folders).

```js
{
  directoryId: 1169,
}
```

### `collections`

Define an array of collection slugs for which the plugin is active.

```js
{
  collections: ['posts', 'categories'],
}
```

If undefined, the plugin will detect localized fields on all collections.

```js
{
  collections: undefined,
}
```

Use an empty array to disable all collections.

```js
{
  collections: [],
}
```

Use an object to define a condition that activates Crowdin based on the document data.

```js
{
  collections: [
    'posts',
    {
      slug: 'categories',
      condition: ({ doc }) => doc.translateWithCrowdin,
    },
  ];
}
```

### `globals`

Define an array of global slugs for which the plugin is active.

```js
{
  globals: ['nav'],
}
```

If undefined, the plugin will detect localized fields on all globals.

```js
{
  globals: undefined,
}
```

Use an empty array to disable all globals.

```js
{
  globals: [],
}
```

Use an object to define a condition that activates Crowdin based on the document data.

```js
{
  globals: [
    {
      slug: 'nav',
      condition: ({ doc }) => doc.translateWithCrowdin,
    },
  ],
}
```

### `slateToHtmlConfig`

Controls how **Payload Slate richText** values are converted to HTML before being uploaded to Crowdin.

- **Default behavior**: if you do not provide this option, the plugin uses `payloadSlateToHtmlConfig` from `@slate-serializers/html` (a Payload-oriented preset).
- **When to customize**: if you have custom Slate node types/marks (or want to tweak table/link/image output).
- **More docs & examples**: see [slate-serializers — docs & demos](https://thompsonsj.github.io/slate-serializers-demo/).

If you provide `slateToHtmlConfig`, it fully replaces the default preset (so you’ll typically want to start from the Payload preset and extend it).

```js
{
  slateToHtmlConfig: undefined,
}
```

Example: extend the default Payload preset to add/override element mappings.

```ts
import { payloadSlateToHtmlConfig } from '@slate-serializers/html'

crowdinSync({
  // ...
  slateToHtmlConfig: {
    ...payloadSlateToHtmlConfig,
    elementMap: {
      ...payloadSlateToHtmlConfig.elementMap,
      // example customization:
      ['table-row']: 'tr',
    },
  },
})
```

### `htmlToSlateConfig`

Controls how translated HTML downloaded from Crowdin is converted back into **Payload Slate richText** JSON.

- **Default behavior**: if you do not provide this option, the plugin uses `payloadHtmlToSlateConfig` from `@slate-serializers/html`.
- **When to customize**: if you emit custom HTML from your `slateToHtmlConfig` (or need custom parsing for attributes/styles).
- **More docs & examples**: see [slate-serializers — docs & demos](https://thompsonsj.github.io/slate-serializers-demo/).

```js
{
  htmlToSlateConfig: undefined,
}
```

Example: extend the default Payload preset to add/override tag handling.

```ts
import { payloadHtmlToSlateConfig } from '@slate-serializers/html'

crowdinSync({
  // ...
  htmlToSlateConfig: {
    ...payloadHtmlToSlateConfig,
    elementTags: {
      ...payloadHtmlToSlateConfig.elementTags,
      // example customization:
      h1: () => ({ type: 'heading-one' }),
    },
  },
})
```

### Serializer config reference (condensed)

The plugin config surface is intentionally small: you can override `slateToHtmlConfig` and `htmlToSlateConfig`, but the underlying serializer libraries have many knobs.

If you need to go deeper (custom tags/attributes/styles, whitespace filtering, DOM transforms), start here:

- **Full docs & runnable examples**: [slate-serializers — docs & demos](https://thompsonsj.github.io/slate-serializers-demo/)

Common places to look in the `slate-serializers` docs:

- **`slateToDom`** (used under the hood by `slateToHtml`): `elementMap`, `elementTransforms`, `markMap`, `markTransforms`
- **`htmlToSlate`**: `elementTags`, `elementStyleMap`, `htmlPreProcessString`, `filterWhitespaceNodes`

These options only affect Slate fields. See [serializer configuration](./serializer.md) for a worked example.

### `pluginCollectionAccess`

`access` collection config to pass to all the Crowdin collections created by this plugin.

```js
{
  pluginCollectionAccess: undefined,
}
```

### `pluginCollectionAdmin`

`admin` collection config to pass to all the Crowdin collections created by this plugin.

```js
{
  pluginCollectionAdmin: {
    hidden: ({ user }) => !userIsAdmin({ user });
  }
}
```

### `tabbedUI`

Appends `Crowdin` tab onto your config using Payload's [Tabs Field](https://payloadcms.com/docs/fields/tabs). If your collection is not already tab-enabled, meaning the first field in your config is not of type `tabs`, then one will be created for you called `Content`.

```js
{
  tabbedUI: true,
}
```

### `lexicalBlockFolderPrefix`

Default `lex.`. Used as a prefix when constructing directory names for Lexical block fields in Crowdin.

```js
{
  lexicalBlockFolderPrefix: `blocks-`,
}
```

### `disableSelfClean`

Default `false`. The plugin keeps records of the files and folders it creates in Crowdin. If someone deletes one of them in Crowdin, the plugin notices and repairs its records:

- When loading translations, a file that returns 404 has its `crowdin-files` record deleted. The file is uploaded again on the next save.
- When saving, the plugin checks that the collection and document folders still exist in Crowdin. If a folder is missing, the stale record is deleted and the folder is created again.

The folder check costs one extra Crowdin API call per folder on each save. Set `disableSelfClean: true` to skip the checks and keep all records as they are.

```js
{
  disableSelfClean: true,
}
```

### `deleteCrowdinFiles`

Default `false`. When a document is deleted, or a localized field is emptied, the plugin always deletes its own records for the affected files and folders. Set `deleteCrowdinFiles: true` to delete the source files and folders in Crowdin as well.

This is off by default because deleting a source file in Crowdin also deletes its translations.

```js
{
  deleteCrowdinFiles: true,
}
```

## Environment variables

| Variable | Effect |
| --- | --- |
| `PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE=true` | Upload all localized fields on every save, not only the ones that changed. |
| `PAYLOAD_CROWDIN_SYNC_USE_JOBS` | Any non-empty value queues translation syncs as Payload jobs instead of running them during save. See [virtual fields](#virtual-fields). |
| `PAYLOAD_CROWDIN_SYNC_VERBOSE` | Any non-empty value logs details of translation syncs to the console, for debugging. |

By default, the plugin only uploads what changed:

- Any change to a localized `text` or `textarea` field uploads the document's `fields.json` again.
- A `richText` field is uploaded only if its content changed. Each one has its own file in Crowdin.

`PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE` is useful when you add the plugin to an existing site: saving a document uploads all of its content without you having to edit every field.

## Sync translations

### Upload source translations

On save draft or publish, content from [localized fields](https://payloadcms.com/docs/configuration/localization) in [Collections](https://payloadcms.com/docs/configuration/collections) and/or [globals](https://payloadcms.com/docs/configuration/globals) is organised into directories and files in your Crowdin project as configured in [options](#options).

<img width="1000" alt="Screenshot 2024-02-06 at 22 02 38" src="https://github.com/thompsonsj/payload-crowdin-sync/assets/44806974/2c31050d-fee4-4275-bca2-7e4b48743999" />

See [supported fields](./fields.md) for which fields are sent, how nested fields are handled, and how to [exclude fields](./fields.md#exclude-fields).

### Download translations

To load translations into Payload CMS, use either:

- virtual fields added to each localized document (convenient); or
- endpoints added to the API (can do a dry run of changes).

#### Virtual fields

When in a locale other than the source locale:

- Check the `Sync all translations` checkbox on a given collection document/global and save draft (loads translations as draft) or publish.
- Check the `Sync translations` checkbox to synchronise for the current locale only.

<img width="766" alt="Screenshot 2024-02-06 at 22 08 48" src="https://github.com/thompsonsj/payload-crowdin-sync/assets/44806974/2aa9c493-7792-422f-bf8d-a91c23893682" />

The checkboxes appear once the document has been uploaded to Crowdin.

Loading translations for many locales can make saving slow. Set `PAYLOAD_CROWDIN_SYNC_USE_JOBS` to a non-empty value (for example `true`) to queue the work as Payload jobs instead. The plugin registers a `crowdinSyncTranslations` task and queues one job per locale. You need to run the job queue yourself; see [Queues](https://payloadcms.com/docs/jobs-queue/queues) in the Payload docs.

#### Endpoints

API endpoints are added to the `crowdin-article-directories` collection.

##### Review (dry run)

To review translations, visit:

`<payload-base-url>/api/crowdin-article-directories/<article-id>/review`

e.g. `https://my-payload-app.com/api/crowdin-article-directories/64a880bb87ef685285a4d9dc/review`

A JSON object is returned that allows you to review what will be updated in the database. The JSON object will contain the following keys:

- `draft` indicates that on update, a draft will be created rather than a published version. See [Drafts | Payload CMS](https://payloadcms.com/docs/versions/drafts).
- `source` review the source document. e.g. for the `en` locale.
- `translations`
  - `<locale>` e.g. `es_ES`
    - `currentTranslations` all current localized fields and values.
    - `latestTranslations` localized fields populated with values from Crowdin.
    - `changed` boolean to indicate whether any changes have been made in Crowdin.

##### Update

To update translations, visit:

`<payload-base-url>/api/crowdin-article-directories/<article-id>/update`

e.g. `https://my-payload-app.com/api/crowdin-article-directories/64a880bb87ef685285a4d9dc/update`

The document will be updated and the same report will be generated as for a review.

##### Notes

- Pass the `draft=true` query parameter to update as a draft rather than a published version.
- Pass a `locale` parameter to perform a review/update for one locale only. e.g. `locale=fr_FR`.
- The source locale (e.g. `en`) is not affected.
- Use the `excludeLocales` field on documents in the `crowdin-article-directories` collection to prevent some locales from being included in the review/update operation.
- If supplied translations do not contain required fields, translation updates will not be applied and validation errors will be returned in the API response.

## Delete documents

When you delete a document, the plugin deletes its `crowdin-files` records and its `crowdin-article-directories` record. Files in Crowdin are kept unless you set [`deleteCrowdinFiles`](#deletecrowdinfiles).

If the document was never uploaded, or its Crowdin records are already gone, there is nothing to clean up and the delete goes ahead. An error deleting one file is logged and doesn't stop the rest.

## Further documentation

- [Supported fields](./fields.md)
- [How documents map to Crowdin](./crowdin.md)
- [Serializer configuration](./serializer.md)
- [Development](./development.md)
- [Engineering decisions](../repo/engineering.md)

Note: This plugin is still in development. Planned features are listed in [`repo/planned-features.md`](../repo/planned-features.md).
