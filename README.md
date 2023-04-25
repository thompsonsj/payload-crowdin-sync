# WIP 23 Apr 2023

This plugin is currently being refactored. Although the logic works, it was extracted from a Payload CMS install and needs work to decouple logic from that installation.

# Payload CrowdIn Sync Plugin

Automatically upload/sync localized fields from the default locale to CrowdIn. Make these fields read-only in other locales and update them using CrowdIn translations.

#### Requirements

- Payload version `1.0.19` or higher is required

## Usage

Install this plugin within your Payload as follows:

Add the CrowdIn service as middleware to `server.ts`.

```ts
import { crowdinClient } from './plugins/crowdin-sync/api'

app.use(crowdinClient())
```

Add the plugin to your Payload configuration.

```ts
import { buildConfig } from 'payload/config';
import path from 'path';
import { crowdInSync } from '@thompsonsj/payload-plugin-crowdin';

export default buildConfig({
  plugins: [
    crowdInSync({
      projectId: 323731,
      directoryId: 1169,
    }),
  ],
  // The rest of your config goes here
});
```

Plugin options:

- `projectId` (required): the id of the project in CrowdIn.
- `directoryId` (optional): define a parent directory in your CrowdIn project to sync translations. 

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

Translation synchronisation refers to the process of loading translations from CrowdIn into Payload CMS. If [drafts](https://payloadcms.com/docs/versions/drafts) are enabled, this will create a new version for each locale. The source locale (e.g. `en`) is not affected.

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
- integrations tests (`*.int.ts`) in the `test` folder.

Integration tests use Payload's REST API to perform a series of API calls in a synchronous manner.

### Integration tests

Run a test server using `yarn test:server`.

This uses a MongoDB database on your local machine called `test` which can be inspected through an explorer such as MongoDB Compass.

Run tests with `yarn test`. This runs all the integration and unit tests.

### Notes on the current test suite

Integration tests are not ideal: they break a lot of best practice when writing tests. However, they are effective, and this is the reason they are included.

They use the Payload CMS REST API to perform operations on the test server.

The advantages of this approach are that the setup is as similar as possible to production. The test server runs with almost exactly the same configuration as production.

However, there are many disadvantages. Tests should be refactored. The reason for not doing this so far is that it has been difficult to set up preferred alternatives - I experienced a lot of complaints from Babel, Payload, TypeScript, Jest. In particular, the `get-port` dependency from Payload CMS caused a lot of issues because it uses a `require` import. This occured when trying to initiate Payload for tests directly. Having said that, Payload CMS tests run fine so maybe further work is needed to emulate that test setup.

**Integration tests do not tear down data**. This is an unfortunate side effect of running a seperate test server. However, the benefit is that the databse can be inspected after the test is run. Manually deleting the `policies`, `crowdin-files`, `crowdin-article-directories` and `crowdin-collection-directories` folders is possible, and Payload CMS will recreate those collections once the tests are re-run.

**CrowdIn API responses are mocked**. Configuration in `server.ts` detects when this `test` database is running and provides a mock CrowdIn API service that returns sample data. This is another unfortunate side effect of the test setup - best practice dictates that API responses should never be mocked. See notes on this approach below.

Preferred alternatives:

- Set up integration tasks in a similar way to [payloadcms/payload | GitHub](https://github.com/payloadcms/payload), which uses specific configs and `init` functions to start Payload within tests and be able to access the `payload` object within them.
- Use services/dependency injection in a similar way to how its achieved in [finkinfridom/payload-cloudinary-plugin | GitHub](https://github.com/finkinfridom/payload-cloudinary-plugin) in order to write tests on hooks/functions directly and mock any API calls/libraries as needed.


