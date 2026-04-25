# `payload-crowdin-sync`

Sync localized fields from **Payload CMS** to **Crowdin** and back.

- Upload source content from your **source locale** to Crowdin whenever you save/publish.
- Keep translated locales **read-only** in Payload.
- Pull translations back from Crowdin into Payload via UI actions (or endpoints/jobs).

## Requirements

- **Payload**: v3+
- **Crowdin**: project + API token
- **Node**: see `engines` in `plugin/package.json`

## Install

```bash
npm install payload-crowdin-sync
```

## Quick start

```ts
import { buildConfig } from 'payload'
import { crowdinSync } from 'payload-crowdin-sync'

export default buildConfig({
  plugins: [
    crowdinSync({
      projectId: 323731,
      directoryId: 1169, // optional: Crowdin folder to store sources
      token: process.env.CROWDIN_TOKEN ?? '',
      organization: process.env.CROWDIN_ORGANIZATION ?? '',
      sourceLocale: 'en',
      localeMap: {
        de_DE: { crowdinId: 'de' },
        fr_FR: { crowdinId: 'fr' },
      },
      // collections/globals are optional:
      // - undefined => auto-detect localized fields and activate where applicable
      // - [] => disable
      // - ['posts', ...] or { slug, condition } => enable selectively / conditionally
    }),
  ],
})
```

## Documentation

- **Full docs (recommended)**: `https://thompsonsj.github.io/payload-crowdin-sync/`
- **Slate serializer reference & demos**: [slate-serializers — docs & demos](https://thompsonsj.github.io/slate-serializers-demo/)

## What this plugin adds

- **Collections**:
  - `crowdin-files`
  - `crowdin-article-directories`
  - `crowdin-collection-directories`
- **Virtual field** on localized docs/globals:
  - `crowdinArticleDirectory` (computed)

