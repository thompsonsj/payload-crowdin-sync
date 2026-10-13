# payload-document

Walk a Payload CMS field schema, pick the fields that should be imported or exported, and put a partial update back into document order.

This is the vendor-neutral field walk used by [`payload-crowdin-sync`](https://www.npmjs.com/package/payload-crowdin-sync). It does not know about Crowdin, Phrase, or any other translation service.

## Install

```bash
npm install payload-document
```

Peer dependency: `payload` ^3.

## What it is for

Other plugins that import or export Payload documents can reuse this instead of reimplementing group / array / blocks / tabs traversal.

Typical uses:

- Collect localized (or otherwise filtered) fields from a collection or global
- Walk a document with a visitor (`group` / `array` / `blocks` / `leaf`)
- Rebuild an update object and restore array / blocks order from the source document
- Look up a field by dot-notation path (`meta.description`, `items.<id>.title`)

## What it is not

- Not a Crowdin (or other vendor) file format. This package returns Payload-shaped trees: arrays stay arrays, blocks keep `id` and `blockType`.
- Not a rich-text converter. Lexical / Slate HTML lives in the consumer.
- Default `isLocalizedField` only treats `text`, `textarea`, and `richText` as leaves. Pass `isLocalized` to include other types.

Children of a localized group, array, or blocks field are treated as localized. That matches export-style walks; it is the opposite of Payload's database locale inheritance.

## Usage

```ts
import {
  getLocalizedFields,
  restoreOrder,
  traverseFields,
  isLocalizedField,
} from 'payload-document';

const fields = getLocalizedFields({
  fields: collection.fields,
  include: (field) => field.type === 'richText',
});

const next = restoreOrder({
  updateDocument: incoming,
  document: current,
  fields: collection.fields,
});
```

`getLocalizedFields` options:

| Option | Role |
| --- | --- |
| `include` | Keep a leaf. Nested group / array / blocks fields always pass, then drop if empty. |
| `isLocalized` | Defaults to `isLocalizedField`. Pass your own to change which fields count. |
| `localizedParent` | Treat nested fields as localized when the parent is. |

Plugin-specific exclude rules (for example `custom.crowdinSync.disable`) belong in the consumer's `isLocalized` wrapper, not here.

## License

MIT
