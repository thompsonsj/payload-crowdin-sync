# `payload-crowdin-sync`

Translate [Payload CMS](https://payloadcms.com) content in [Crowdin](https://crowdin.com).

**Documentation: [thompsonsj.github.io/payload-crowdin-sync](https://thompsonsj.github.io/payload-crowdin-sync/)**

The plugin extracts localized fields from your Payload documents and uploads them to Crowdin as clean files: HTML for rich text and JSON for everything else. It then writes translations back into the right fields, however deeply nested.

## Features

- Uploads localized fields from collections and globals on save, sending only the fields that changed.
- Converts Slate and Lexical rich text to HTML and back, including Lexical blocks, uploads, relationships and tables.
- Handles localized fields nested in groups, arrays, blocks, tabs, collapsibles and rows.
- Loads translations from a checkbox in the admin panel, from REST endpoints with a dry-run review, or from Payload jobs.
- Skips translations that are missing required fields, and reports the validation errors.
- Recreates files and folders that were deleted in Crowdin.

## Requirements

- Payload 3
- A Crowdin project and a [personal access token](https://support.crowdin.com/account-settings/#personal-access-tokens)

## Install

```bash
npm install payload-crowdin-sync
```

## Quick start

```ts
import { buildConfig } from 'payload';
import { crowdinSync } from 'payload-crowdin-sync';

export default buildConfig({
  plugins: [
    crowdinSync({
      projectId: 323731,
      token: process.env.CROWDIN_TOKEN ?? '',
      sourceLocale: 'en',
      localeMap: {
        de_DE: { crowdinId: 'de' },
        fr_FR: { crowdinId: 'fr' },
      },
      // Optional: limit the plugin to some collections and globals.
      // Leave undefined to enable it wherever there are localized fields.
      // collections: ['posts'],
      // globals: ['nav'],
    }),
  ],
});
```

The plugin adds three collections to your database (`crowdin-files`, `crowdin-article-directories` and `crowdin-collection-directories`) It also adds **Sync translations** and **Sync all translations** checkboxes to each enabled document, which appear after its first upload to Crowdin.

## Documentation

- [Options, syncing and endpoints](https://thompsonsj.github.io/payload-crowdin-sync/plugin)
- [Supported fields](https://thompsonsj.github.io/payload-crowdin-sync/plugin/fields)
- [How documents map to Crowdin](https://thompsonsj.github.io/payload-crowdin-sync/plugin/crowdin)
- [Slate serializer reference and demos](https://thompsonsj.github.io/slate-serializers-demo/)
