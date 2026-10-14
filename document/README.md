# payload-localized-fields

Walk a Payload CMS field schema, pick the fields that should be imported or exported, and put a partial update back into document order.

This is the vendor-neutral field walk used by [`payload-crowdin-sync`](https://www.npmjs.com/package/payload-crowdin-sync). It does not know about Crowdin, Phrase, or any other translation service.

## Install

```bash
npm install payload-localized-fields
```

Peer dependency: `payload` ^3.

## What it is for

Other plugins that import or export Payload documents can reuse this instead of reimplementing group / array / blocks / tabs traversal.

## What it is not

- Not a Crowdin (or other vendor) file format. This package returns Payload-shaped trees: arrays stay arrays, blocks keep `id` and `blockType`.
- Not a rich-text converter. Lexical / Slate HTML lives in the consumer.
- Default `isLocalizedField` only treats `text`, `textarea`, and `richText` as leaves. Pass `isLocalized` to include other types.

Children of a localized group, array, or blocks field are treated as localized. That matches export-style walks; it is the opposite of Payload's database locale inheritance.

## Use case: pick localized fields for export

A collection mixes copy with fields that should not leave the CMS (`slug`, uploads). `getLocalizedFields` returns the schema of what to export.

```ts
import type { CollectionConfig } from 'payload';
import { getLocalizedFields, restoreOrder } from 'payload-localized-fields';

const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    { name: 'title', type: 'text', localized: true },
    { name: 'slug', type: 'text' },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
};

const fields = getLocalizedFields({ fields: Pages.fields });
// [
//   { name: 'title', type: 'text', localized: true },
//   { name: 'hero', type: 'group', fields: [{ name: 'heading', ... }] },
// ]

// Incoming translations often arrive in a different array order than the CMS.
const data = restoreOrder({
  updateDocument: { title: 'Accueil', hero: { heading: 'Bienvenue' } },
  document: { title: 'Home', hero: { heading: 'Welcome' } },
  fields,
});
```

`getLocalizedFields` options:

| Option | Role |
| --- | --- |
| `include` | Keep a leaf. Nested group / array / blocks fields always pass, then drop if empty. |
| `isLocalized` | Defaults to `isLocalizedField`. Pass your own to change which fields count. |
| `localizedParent` | Treat nested fields as localized when the parent is. |

Plugin-specific exclude rules (for example `custom.crowdinSync.disable`) belong in the consumer's `isLocalized` wrapper, not here.

## More use cases

Runnable examples live in [`src/use-cases.spec.ts`](./src/use-cases.spec.ts):

| Use case | What it shows |
| --- | --- |
| Export a nested document | `getLocalizedFields` then `traverseFields` to copy groups, arrays, and blocks, keeping `id` / `blockType` |
| Apply an update and restore editor order | `restoreOrder` when translations arrive shuffled |
| Split rich text from strings | `include` so a consumer can write HTML and JSON files from the same schema |
| Skip fields the consumer does not export | wrap `isLocalizedField` instead of forking the walk |
| Fields inside Lexical blocks | `reLocalizeField` when nested fields have no `localized` flag |
| Look up a field by path | `findField` for a nested file name such as `items.<id>.label` |

## License

MIT
