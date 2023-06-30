# WIP 8 June 2023

This plugin is currently being refactored. Although the logic works, it was extracted from a Payload CMS install and needs work to decouple logic from that installation.

Features:

- [x] Support localized `text` and `textarea` fields. Combine text and textarea fields into a single json file on CrowdIn called `fields.json`.
- [x] Support localized `richText` fields. Store each `richText` field as HTML (converted from Slate JSON) on CrowdIn with a filename corresponding to the field name.
- [x] Store CrowdIn files in an appropriate data structure.
- [ ] Support **sending localized fields to CrowdIn** for the following Payload fields (recursive - can go as deep as necessary):
  - [x] `group`
  - [x] `array`
  - [x] `collapsible`
  - [ ] `blocks`
- Improve testing so that it does not require a local server. See [Notes on the current test suite](#notes-on-the-current-test-suite).
- [ ] Support **updating localized fields from CrowdIn** for the following Payload fields. Note that this will require effective required field detection to avoid update errors. See `getLocalizedRequiredFields`.
  - [ ] `group`
  - [ ] `array`
  - [ ] `collapsible`
  - [ ] `blocks`
- [ ] Add UI for syncing translations (currently done with URLs added to `server.ts` on the Payload installation).
- [ ] Add option to make localized fields read-only in other locales (CrowdIn mangaes these fields).

# Payload CrowdIn Sync Plugin

Automatically upload/sync localized fields from the default locale to CrowdIn. Make these fields read-only in other locales and update them using CrowdIn translations.

#### Requirements

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
import { buildConfig } from 'payload/config';
import path from 'path';
import { crowdInSync, crowdinClient } from 'payload-crowdin-sync';

export default buildConfig({
  plugins: [
    crowdInSync({
      projectId: 323731,
      directoryId: 1169,
      client: crowdinClient({ token: `<your-token>`})
    }),
  ],
  // The rest of your config goes here
});
```

Plugin options:

- `projectId` (required): the id of the project in CrowdIn.
- `directoryId` (optional): define a parent directory in your CrowdIn project to sync translations.

### Environment variables

Set `PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE=true` to update all localized fields in CrowdIn when an article is created/updated.

By default, updates will only be sent to CrowdIn in the following scenarios.

- At least one of the localized text fields has changed: any change to a localized `text` field updates the compiled `fields.json` that is sent to CrowdIn.
- A `richText` field is changed. Individual `richText` fields will only be updated on CrowdIn if the content has changed - each field has its own file on CrowdIn.

It is useful to have a convenient way of forcing all localized fields to update at once. For example, if the plugin is activated on an existing install, it is convenient to trigger all updates on CrowdIn for a given article without having to change every `richText` field or one of the `text` fields.

## Details

### CrowdIn collections

By default, files are uploaded to CrowdIn using the following folder/file structure.

```
"Payload CMS" > [collectionSlug] > [articleSlug] > [fieldSlug]
```

- Rich text fields are stored as HTML files.
- All other fields are stored as JSON files.

For each entry in a collection that contains localized fields, an additonal field is added: `crowdinArticleDirectory`. This is a one-to-one relationship with an article created in the `crowdin-article-directories` collection.

When a localized field is changed, a file is created/updated in the `crowdin-files` collection for that field. Details of the file are stored in Payload so that this file can be updated or deleted in the future. Each entry in the `crowdin-files` collection has a one-to-one relationship with the appropriate entry in the `crowdin-article-directories` collection.

- `richText` fields have their own CrowdIn file. e.g. `content.html`. For ease-of-editing in CrowdIn, Slate JSON is converted to HTML. When translated HTML is synced back into Payload, it is converted back to Slate JSON.
- All other fields are compiled into a single `fields.json` file for ease-of-editing in CrowdIn.

Each entry in the `crowdin-article-directories` collection has a one-to-one relationship with an entry in the `crowdin-collection-directories` collection.

One-to-one relationships help preserve database integrity and simplify the operations needed to perform CRUD operations on all related entries.

All of the collections created by this plugin are designed to emulate the structure of API calls needed to communicate with crowdIn. Each directory/file is created in a single API operation on cRowdIn, and it is necessary to keep track of the details of each directory and file for future interactions.

### Sync translations

Translation synchronisation refers to the process of loading translations from CrowdIn into Payload CMS. If [drafts](https://payloadcms.com/docs/versions/drafts) are enabled, this will create a new version in Payload CMS for each locale. The source locale (e.g. `en`) is not affected.

**A UI has not been developed for this feature yet**. To perform updates now, add the following routes to `server.ts` in your Payload installation:

```ts
import {
  updateTranslation
} from 'payload-crowdin-sync'

app.get('/translations/global/:global', async (_, res) => {
  const collection = _.params.global
  const client = (_ as any).crowdinClient

  const report = await updateTranslation({
    projectId: 323731,
    documentId: null,
    collection: collection,
    payload: payload,
    crowdin: client,
    global: true,
  })

  res.setHeader('content-type', 'application/json')
  res.send(report)
})

app.get('/translations/global/:global/update', async (_, res) => {
  const collection = _.params.global
  const client = (_ as any).crowdinClient

  const report = await updateTranslation({
    projectId: 323731,
    documentId: null,
    collection: collection,
    payload: payload,
    crowdin: client,
    global: true,
    dryRun: false,
  })

  res.setHeader('content-type', 'application/json')
  res.send(report)
})

app.get('/translations/:collection/:id', async (_, res) => {
  const collection = _.params.collection
  const id = _.params.id
  const client = (_ as any).crowdinClient

  const report = await updateTranslation({
    projectId: 323731,
    documentId: id,
    collection: collection,
    payload: payload,
    crowdin: client
  })

  res.setHeader('content-type', 'application/json')
  res.send(report)
})

app.get('/translations/:collection/:id/update', async (_, res) => {
  const collection = _.params.collection
  const id = _.params.id
  const client = (_ as any).crowdinClient

  const report = await updateTranslation({
    projectId: 323731,
    documentId: id,
    collection: collection,
    payload: payload,
    crowdin: client,
    dryRun: false
  })

  res.setHeader('content-type', 'application/json')
  res.send(report)
})
```

#### Dry run

To review translations, visit:

`<payload-base-url>/translations/<collection-slug>/<article-id>`

e.g. `https://my-payload-app.com/translations/policies/635fe6227589577f859835d4`

A JSON object is returned that allows you to review what will be updated in the database. The JSON object will contain the following keys:

- `source` review the source document. e.g. for the `en` locale.
- `translations`
  - `<locale>` e.g. `es_ES`
    - `currentTranslations` all current localized fields and values.
    - `currentTranslations` localized fields populated with values from CrowdIn.
    - `changed` boolean to indicate whether any changes have been made in CrowdIn.

#### Update

To update translations, visit:

`<payload-base-url>/translations/<collection-slug>/<article-id>/update`

e.g. `https://my-payload-app.com/translations/policies/635fe6227589577f859835d4/update`

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
