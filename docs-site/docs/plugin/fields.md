---
sidebar_position: 2
description: Which Payload field types are sent to Crowdin, how nested fields and rich text are handled, and how to exclude fields.
---

# Supported fields

## Field types

These localized field types are sent to Crowdin:

| Field type | Crowdin file |
| --- | --- |
| `text` | `fields.json` |
| `textarea` | `fields.json` |
| `richText` (Slate or Lexical) | one HTML file per field, e.g. `content.html` |

Other localized field types, such as `number`, `select`, `date`, `json`, `code`, `relationship` and `upload`, stay in Payload. Localize them in the admin panel.

## Nested fields

Supported fields are found wherever they are nested:

- **`group`, `array` and `blocks`:** children are included. If the parent is localized, all supported children are sent, even if they aren't marked `localized` themselves.
- **`tabs`:** named tabs behave like a group, and unnamed tabs behave like a collapsible.
- **`collapsible` and `row`:** children are treated as if they were at the parent level.

In `fields.json`, groups become nested objects. Array and block items are keyed by their Payload ID, and block items also by block type, so reordering items in Payload doesn't break their translations:

```json
{
  "title": "Welcome",
  "hero": { "heading": "Hello" },
  "features": {
    "64a880bb87ef685285a4d9e1": { "label": "Fast" }
  },
  "layout": {
    "64a880bb87ef685285a4d9e2": { "cta": { "text": "Sign up" } }
  }
}
```

Rich text fields inside groups, arrays and blocks get their own HTML file, named in dot notation using the same IDs. For example, `layout.64a880bb87ef685285a4d9e2.cta.body.html`.

## Rich text

Rich text is converted to HTML so translators can use Crowdin's editor, then converted back when translations are loaded.

### Slate

Slate fields are converted with [`@slate-serializers/html`](https://www.npmjs.com/package/@slate-serializers/html). If your Slate editor has custom elements or marks, customise the conversion with [`slateToHtmlConfig` and `htmlToSlateConfig`](./serializer.md).

### Lexical

Lexical fields are converted with Payload's Lexical HTML converters. The plugin extends them so that these round-trip correctly:

- **Formatting:** headings, lists, links, bold, italic, underline, strikethrough, subscript and superscript.
- **Tables.**
- **Uploads and relationships:** kept as placeholders in the HTML, so translators can't break them, and restored when translations are loaded.
- **Blocks:** each block's content is extracted from the HTML and handled as its own small document. It gets a subfolder in Crowdin (prefixed `lex.` by default, see [`lexicalBlockFolderPrefix`](./README.md#lexicalblockfolderprefix)) with its own `fields.json` and HTML files. Blocks can contain Lexical fields that have blocks of their own.

Fields inside Lexical blocks are sent if they are a supported type, whether or not they are marked `localized`. The Lexical field itself is localized, so each locale already has its own copy of the blocks. See [blocks are not localized](./crowdin.md#blocks-are-not-localized).

## Exclude fields

To keep a localized field out of Crowdin, for example a slug generated from the title, add `custom.crowdinSync.disable`:

```ts
import type { Field } from 'payload';

const field: Field = {
  name: 'slug',
  type: 'text',
  localized: true,
  custom: {
    crowdinSync: {
      disable: true,
    },
  },
};
```

The plugin also skips fields whose `admin.description` contains `Not sent to Crowdin. Localize in the CMS.` This older method may be removed in a future version.

Payload's own `id` and `blockName` fields are never sent.

## Required fields

If a translation from Crowdin would leave a required localized field empty, the translation update isn't applied. The [review and update endpoints](./README.md#endpoints) return the validation errors.
