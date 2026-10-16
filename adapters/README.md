# payload-localization-adapters

Writer and reader contracts for syncing a Payload json/html document slice with a translation service.

This package does not talk to Crowdin, Phrase, or Lokalise. A vendor plugin implements `SourceWriter` and `TranslationReader`, then calls `syncDocumentSource` / `applyDocumentSlice`. Field walking lives in [`payload-localized-fields`](https://www.npmjs.com/package/payload-localized-fields).

## Install

```bash
npm install payload-localization-adapters payload-localized-fields
```

Peer dependency: `payload` ^3.

## Contracts

- **`SourceWriter`** — write Payload-shaped json and rich-text values. The vendor converts them to files or keys.
- **`TranslationReader`** — read a translated `{ json, html }` slice for one locale.
- **`syncDocumentSource`** — afterChange orchestration: diff, skip empty json, optional `alwaysUpdate`.
- **`applyDocumentSlice`** — turn a slice into a Payload update.

Pass `isLocalized` when the vendor should skip fields the default Payload predicate would include. Crowdin’s `custom.crowdinSync.disable` belongs in the Crowdin plugin, not here.

Phrase and Lokalise plugins are planned in this monorepo and will depend on this package.
