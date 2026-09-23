# Payload Crowdin Sync

Translate [Payload CMS](https://payloadcms.com) content in [Crowdin](https://crowdin.com) without copying and pasting.

**Documentation: [thompsonsj.github.io/payload-crowdin-sync](https://thompsonsj.github.io/payload-crowdin-sync/)**

Payload stores documents as nested JSON, and rich text as editor state. That's hard to translate directly. This plugin extracts the localized fields from every document and uploads them to Crowdin as clean files: HTML for rich text and JSON for everything else. It then writes the translations back into the right fields, however deeply nested.

## Features

- **Uploads on save.** Localized fields in collections and globals are sent to Crowdin when you save a draft or publish. Only fields that changed are uploaded again.
- **Rich text as HTML.** Slate and Lexical fields become HTML files that translators can edit in Crowdin's editor. Lexical blocks, uploads, relationships and tables are all converted back into Lexical when translations come in.
- **Nested fields.** Localized fields inside groups, arrays, blocks, tabs, collapsibles and rows are collected into a single `fields.json` per document.
- **Tidy Crowdin projects.** Each collection gets a folder, and each document gets a subfolder. Blocks inside a Lexical field get their own nested folders.
- **Translations back in one click.** Tick a checkbox in the admin panel to load translations for one locale or all of them, as a draft or published. You can also review changes first over REST, or run the sync as a Payload job.
- **Safe updates.** A translation that is missing a required field isn't applied, and validation errors are reported.
- **Self-healing.** If files or folders are deleted in Crowdin, the plugin removes its stale records and creates them again on the next save.
- **Fine-grained control.** Enable collections conditionally based on document data, and exclude individual fields from Crowdin.

## Quick start

```bash
npm install payload-crowdin-sync
```

```ts
import { buildConfig } from 'payload';
import { crowdinSync } from 'payload-crowdin-sync';

export default buildConfig({
  plugins: [
    crowdinSync({
      projectId: 323731,
      token: process.env.CROWDIN_TOKEN,
      sourceLocale: 'en',
      localeMap: {
        de_DE: { crowdinId: 'de' },
        fr_FR: { crowdinId: 'fr' },
      },
    }),
  ],
  // The rest of your config goes here
});
```

Save a document with localized fields, and its content appears in your Crowdin project:

<img width="1000" alt="Payload documents organised into folders and files in a Crowdin project" src="https://github.com/thompsonsj/payload-crowdin-sync/assets/44806974/2c31050d-fee4-4275-bca2-7e4b48743999">

When translations are ready, tick **Sync all translations** on the document and save:

<img width="766" alt="The Sync all translations checkbox in the Payload admin panel" src="https://github.com/thompsonsj/payload-crowdin-sync/assets/44806974/2aa9c493-7792-422f-bf8d-a91c23893682">

**Next: [read the documentation](https://thompsonsj.github.io/payload-crowdin-sync/)** for all options, supported fields and API endpoints.

[npm](https://www.npmjs.com/package/payload-crowdin-sync) · [Changelog](plugin/CHANGELOG.md)

## Repository

This monorepo contains:

- [`plugin/`](plugin): the `payload-crowdin-sync` package published to npm
- [`dev/`](dev) and [`dev-alternative-config/`](dev-alternative-config): Payload installs used for integration tests
- [`docs-site/`](docs-site): the documentation site

```bash
npm install
npm run test
npm run docs:serve
```

See [development](https://thompsonsj.github.io/payload-crowdin-sync/plugin/development) and [repository notes](https://thompsonsj.github.io/payload-crowdin-sync/repo) for testing, coverage, import maps and releases.
