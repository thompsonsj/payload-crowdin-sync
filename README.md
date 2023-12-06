# Payload Crowdin Sync Plugin

Automatically upload/sync localized fields from the default locale to Crowdin. Make these fields read-only in other locales and update them using Crowdin translations.

Note: This plugin is still in development. A todo list is maintained at [/docs/development.md](/docs/development.md).

## Requirements

- Payload version `1.0.19` or higher is required

## Usage

```
#npm
npm install payload-crowdin-sync

# yarn
yarn add payload-crowdin-sync
```

Add the plugin to your Payload configuration.

```ts
import { crowdinSync, crowdinClient } from "payload-crowdin-sync";

export default buildConfig({
  plugins: [
    crowdinSync({
      projectId: 323731,
      token: process.env.CROWDIN_TOKEN,
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

### Options

#### Required

| Option | Example | Description |
| ------ | ------- | ----------- |
| `projectId` | `323731` | Required: Your Crowdin project ID. |
| `localeMap` | `{ de_DE: { crowdinId: "de" } }` | Required: Map your Payload locales to Crowdin locale ids. |
| ` sourceLocale` | `en` | Required: The Payload locale that syncs to source translations (files) on Crowdin. |

#### Optional

| Option | Example | Description |
| ------ | ------- | ----------- |
| `token` | `xxxxxxx` | Optional: Your Crowdin API token. If empty, changes to files are disabled. |
| `directoryId` | `1169` | Optional: Crowdin directory ID to store translations. |
| `collections` | `undefined` or `[]` or `['posts', 'categories']` | Define an array of collection slugs for which the plugin is active. If undefined, the plugin will detect localized fields on all collections. Use an empty array to disable all collections. |
| `globals` | `undefined` or `[]` or `['nav']` | Define an array of global slugs for which the plugin is active. If undefined, the plugin will detect localized fields on all globals. Use an empty array to disable all globals. |
| `slateToHtmlConfig` | `undefined` | Pass a custom config for the `slateToHtml` serializer used to convert Payload CMS Slate JSON to HTML for Crowdin translation. See [Serializer configuration](/docs/serializer.md). |
| `htmlToSlateConfig` | `undefined` | Pass a custom config for the `htmlToSlate` serializer used to conver HTML to Payload CMS Slate JSON when retrieving Crowdin translation. See [Serializer configuration](/docs/serializer.md). |
| `pluginCollectionAccess` | `undefined` | `access` collection config to pass to all the Crowdin collections created by this plugin. |
| `pluginCollectionAdmin` | `undefined` | `admin` collection config to pass to all the Crowdin collections created by this plugin. |

### Environment variables

Set `PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE=true` to update all localized fields in Crowdin when an article is created/updated.

By default, updates will only be sent to Crowdin in the following scenarios.

- At least one of the localized text fields has changed: any change to a localized `text` field updates the compiled `fields.json` that is sent to Crowdin.
- A `richText` field is changed. Individual `richText` fields will only be updated on Crowdin if the content has changed - each field has its own file on Crowdin.

It is useful to have a convenient way of forcing all localized fields to update at once. For example, if the plugin is activated on an existing install, it is convenient to trigger all updates on Crowdin for a given article without having to change every `richText` field or one of the `text` fields.

## Details

### Crowdin collections

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

All of the collections created by this plugin are designed to emulate the structure of API calls needed to communicate with crowdin. Each directory/file is created in a single API operation on cRowdIn, and it is necessary to keep track of the details of each directory and file for future interactions.

### Sync translations

Translation synchronisation refers to the process of loading translations from Crowdin into Payload CMS. If [drafts](https://payloadcms.com/docs/versions/drafts) are enabled, this will create a new version in Payload CMS for each locale. The source locale (e.g. `en`) is not affected.

**A UI has not been developed for this feature yet**. To perform updates now, use custom REST API endpoints that are made available by this plugin.

If supplied translations do not contain required fields, translation updates will not be applied and validation errors will be returned in the API response.

#### Sync global translations

To sync global translations, add a new article in **Crowdin Translations** that contains the global `slug`. Each article contains an `excludeLocales` field that can be used to prevent some locales from being included in the update operation.

##### Dry run

To review translations, visit:

`<payload-base-url>/api/crowdin-article-directories/<article-id>/review`

e.g. `https://my-payload-app.com/api/crowdin-article-directories/64a880bb87ef685285a4d9dc/update`

A JSON object is returned that allows you to review what will be updated in the database. The JSON object will contain the following keys:

- `draft` indicates that on update, a draft will be created rather than a published version. See [Drafts | Payload CMS](https://payloadcms.com/docs/versions/drafts).
- `source` review the source document. e.g. for the `en` locale.
- `translations`
  - `<locale>` e.g. `es_ES`
    - `currentTranslations` all current localized fields and values.
    - `currentTranslations` localized fields populated with values from Crowdin.
    - `changed` boolean to indicate whether any changes have been made in Crowdin.

#### Update

To update translations, visit:

`<payload-base-url>/api/crowdin-article-directories/<article-id>/review`

e.g. `https://my-payload-app.com/api/crowdin-article-directories/64a880bb87ef685285a4d9dc/update`

Pass the `draft=true` query parameter to update as a draft rather than a published version.

The document will be updated and the same report will be generated as for a review.

## Testing

A Jest test suite is included comprising of:

- unit tests (`*.spec.ts`) within the `src` folder adjacent to files/functions that they are testing; and
- integrations tests (`*.test.ts`) in the `dev/tests` folder.

Integration tests use Payload's [Local API](https://payloadcms.com/docs/local-api/overview) to run tests against a configured Payload installation in the `dev` folder. Tests use [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) to connect to for all tests, so it is not necessary to add test documents to a development database.

### References

- Useful tips on using the local API in tests: https://github.com/payloadcms/payload/discussions/985.
- Review other Payload CMS plugins to see how test environments are configured there. e.g. https://github.com/payloadcms/plugin-cloud-storage and https://github.com/payloadcms/plugin-seo.
- Although the tutorial at https://payloadcms.com/blog/typescript-jest-vscode-debugger-tutorial works, I couldn't get it to work in the latest version of Payload CMS. Regardless, it makes more sense not to test the REST API as done in the tutorial, and to only work with the local API.
