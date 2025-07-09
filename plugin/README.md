# Payload Crowdin Sync Plugin

Automatically upload/sync localized fields from the default locale to Crowdin. Load translations from Crowdin into Payload CMS.

Table of contents:

- [Install](#install)
- [Database changes](#database-changes)
- [Options](#options)
- [Sync translations](#sync-translations)
- [Further documentation](#further-documentation)

## Install

- Payload version `3.0` or higher is required

```
#npm
npm install payload-crowdin-sync

# yarn
yarn add payload-crowdin-sync
```

Add the plugin to your Payload configuration.

```ts
import { crowdinSync } from "payload-crowdin-sync";

export default buildConfig({
  plugins: [
    crowdinSync({
      projectId: 323731,
      token: process.env.CROWDIN_TOKEN,
      organization: process.env.CROWDIN_ORGANIZATION,
      localeMap: {
        de_DE: {
          crowdinId: "de",
        },
        fr_FR: {
          crowdinId: "fr",
        },
      },
      sourceLocale: "en",
    }),
  ],
  // The rest of your config goes here
});
```

## Database changes

This plugin add three collections to your database:

- `crowdin-files`
- `crowdin-article-directories`
- `crowdin-collection-directories`

Localized documents have an extra field added to them - `crowdinArticleDirectory`.

For details, see [docs/crowdin.md](docs/crowdin.md).

## Options

### `projectId` (required)

Your [Crowdin project ID](https://support.crowdin.com/enterprise/project-settings/#details).

```js
{
  projectId: 323731
}
```

### `localeMap` (required)

Map your Payload locales to Crowdin locale ids.

```js
{
  localeMap: {
    de_DE: {
      crowdinId: "de"
    }
  }
}
```

### `sourceLocale` (required)

The Payload locale that syncs to source translations (files) on Crowdin.

```js
{
  sourceLocale: "en"
}
```

### `token`

Your [Crowdin API token](https://support.crowdin.com/enterprise/personal-access-tokens/). If empty, changes to files are disabled.

```js
{
  token: "xxxxxxx"
}
```

### `organizationId` (required)

Your [Crowdin organization ID](https://support.crowdin.com/enterprise/organization/).

```js
{
  organizationId: 200000000
}
```

### `directoryId`

Crowdin directory ID to store translations. To get the directory ID without making an API call, inspect the page source of your folder in [Sources > Files](https://support.crowdin.com/file-management/#branches-and-folders).

```js
{
  directoryId: 1169
}
```

### `collections`

Define an array of collection slugs for which the plugin is active.

```js
{
  collections: ['posts', 'categories']
}
```

If undefined, the plugin will detect localized fields on all collections.

```js
{
  collections: undefined
}
```

Use an empty array to disable all collections.

```js
{
  collections: []
}
```

Use an object to define a condition that activates Crowdin based on the document data.

```js
{
  collections: [
    'posts',
    {
      slug: 'categories',
      condition: ({doc}) => doc.translateWithCrowdin
    }
  ]
}
```

### `globals`

Define an array of global slugs for which the plugin is active.

```js
{
  globals: ['nav']
}
```

If undefined, the plugin will detect localized fields on all globals.

```js
{
  globals: undefined
}
```

Use an empty array to disable all globals.

```js
{
  globals: []
}
```

Use an object to define a condition that activates Crowdin based on the document data.

```js
{
  globals: [
    {
      slug: 'nav',
      condition: ({doc}) => doc.translateWithCrowdin
    }
  ]
}
```

### `slateToHtmlConfig`

Pass a custom config for the `slateToHtml` serializer used to convert Payload CMS Slate JSON to HTML for Crowdin translation. See [Serializer configuration](docs/serializer.md).

```js
{
  slateToHtmlConfig: undefined
}
```

### `htmlToSlateConfig`

Pass a custom config for the `htmlToSlate` serializer used to conver HTML to Payload CMS Slate JSON when retrieving Crowdin translation. See [Serializer configuration](docs/serializer.md).

```js
{
  htmlToSlateConfig: undefined
}
```

### `pluginCollectionAccess`

`access` collection config to pass to all the Crowdin collections created by this plugin.

```js
{
  pluginCollectionAccess: undefined
}
```

### `pluginCollectionAdmin`

`admin` collection config to pass to all the Crowdin collections created by this plugin.

```js
{
  pluginCollectionAdmin: {
    hidden: ({ user }) => !userIsAdmin({ user })
  }
}
```

### `tabbedUI`

Appends `Crowdin` tab onto your config using Payload's [Tabs Field](https://payloadcms.com/docs/fields/tabs). If your collection is not already tab-enabled, meaning the first field in your config is not of type `tabs`, then one will be created for you called `Content`.

```js
{
  tabbedUI: true
}
```

### `lexicalBlockFolderPrefix`

Default `lex.`. Used as a prefix when constructing directory names for Lexical block fields in Crowdin.

```js
{
  lexicalBlockFolderPrefix: `blocks-`
}
```

### Environment variables

Set `PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE=true` to update all localized fields in Crowdin when an article is created/updated.

By default, updates will only be sent to Crowdin in the following scenarios.

- At least one of the localized text fields has changed: any change to a localized `text` field updates the compiled `fields.json` that is sent to Crowdin.
- A `richText` field is changed. Individual `richText` fields will only be updated on Crowdin if the content has changed - each field has its own file on Crowdin.

It is useful to have a convenient way of forcing all localized fields to update at once. For example, if the plugin is activated on an existing install, it is convenient to trigger all updates on Crowdin for a given article without having to change every `richText` field or one of the `text` fields.

## Sync translations

### Upload source translations

On save draft or publish, content from [localized fields](https://payloadcms.com/docs/configuration/localization) in [Collections](https://payloadcms.com/docs/configuration/collections) and/or [globals](https://payloadcms.com/docs/configuration/globals) is organised into directories and files in your Crowdin project as configured in [options](#options).

<img width="1000" alt="Screenshot 2024-02-06 at 22 02 38" src="https://github.com/thompsonsj/payload-crowdin-sync/assets/44806974/2c31050d-fee4-4275-bca2-7e4b48743999">

#### Exclude fields

In some cases, you may wish to localize fields but prevent them being synced to Crowdin. e.g. a slug field that autogenerates based on title.

There are two ways to indicate to the plugin that a field should be ignored. In your field config:

- add `{ custom: { crowdinSync: { disable: true } }}` (preferred); or
- include the string `Not sent to Crowdin. Localize in the CMS.` in `admin.description` (may be removed in a future version).

Example:

```ts
import type { Field } from 'payload';

const field: Field = {
  name: 'textLocalizedField',
  type: 'text',
  localized: true,
  custom: {
    crowdinSync: {
      disable: true,
    }
  }
}
```

### Download translations

To load translations into Payload CMS, use either: 

- virtual fields added to each localized document (convenient); or
- endpoints added to the API (can do a dry run of changes).

#### Virtual fields

When in a locale other than the source locale:

- Check the `Sync all translations` checkbox on a given collection document/global and save draft (loads translations as draft) or publish.
- Check the `Sync translations` checkbox to synchronise for the current locale only.

<img width="766" alt="Screenshot 2024-02-06 at 22 08 48" src="https://github.com/thompsonsj/payload-crowdin-sync/assets/44806974/2aa9c493-7792-422f-bf8d-a91c23893682">

Set a `PAYLOAD_CROWDIN_SYNC_USE_JOBS` environment variable to a non-empty value (e.g. `true`) to add translation sync operations as jobs. This is a useful way to prevent hooks from running slowly. You'll need to execute the job queue seperately. See [
Queues | Docs | Payload CMS](https://payloadcms.com/docs/jobs-queue/queues).

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
    - `currentTranslations` localized fields populated with values from Crowdin.
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

## Further documentation

- Development guidance: [docs/development.md](docs/development.md)
- Engineering decisions: [docs/enginering.md](../docs/engineering.md)
- Crowdin collections: [docs/crowdin.md](docs/crowdin.md)
- NX generated docs: [docs/nx.md](docs/nx.md)

Note: This plugin is still in development. A todo list is maintained at [docs/development.md](docs/development.md).
