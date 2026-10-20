---
sidebar_position: 3
description: Why the plugin batches a document into json/html files, and how Lexical blocks are stored on Crowdin.
---

# Engineering decisions

## Why a document slice, not field hooks

Payload already stores locales. A field `afterChange` hook that uploads one string (with a unique Crowdin file or key name) would work. The plugin used field hooks early on and moved to a collection/global `afterChange` that walks the whole document.

The slice is the cheaper and clearer mapping onto Crowdin, not a claim that per-field uploads are impossible.

**Fewer API calls.** A page with many strings and several rich-text fields would otherwise hit Crowdin once per field (create or update file, plus directory checks). One walk produces `fields.json` for every localized string and one HTML file per rich-text path. Unchanged files are skipped. On a complex document that is the difference between a handful of requests and a storm of them.

**Rich text and nested blocks.** Lexical and Slate values are editor JSON, not something a translator should edit. Each rich-text field becomes HTML and comes back through the serializer. Lexical blocks are treated as nested documents with their own `fields.json` and HTML files. That needs the parent field's editor config and a recursive sync, which is awkward to hang off a single nested field hook.

**Folders on Crowdin.** Collection → document → files is how translators find a page. Lexical blocks sit in a `lex.<field>` subfolder. Building that tree once per save is straightforward. Per-field uploads can still name files uniquely; they do not give you that folder layout unless you recreate the same orchestration around every hook.

`select`, `number`, `relationship`, uploads, and fields marked `custom.crowdinSync.disable` stay in Payload. Editors still set those per locale in the admin panel.

A Phrase or Lokalise plugin should keep the same grain: walk once, emit a slice, let the vendor turn json/html paths into its keys or files. That is how you keep the API-call and folder advantages when the TMS is not Crowdin.

## Whitespace

This section documents how the plugin handles whitespace normalization when converting between Slate/Lexical structures and HTML.

## Lexical block fields

The `createOrUpdateHtmlFile` method of the [`payloadCrowdinSyncDocumentFilesApi`](https://github.com/thompsonsj/payload-crowdin-sync/blob/main/plugin/src/lib/api/files/document.ts) reads the collection config to determine whether the underlying field uses the [Slate editor](https://payloadcms.com/docs/rich-text/slate) or the [Lexical editor](https://payloadcms.com/docs/rich-text/lexical).

If Lexical, blocks embedded within the editor are supported.

For a given Lexical field, all embedded blocks are extracted and another instance of `payloadCrowdinSyncDocumentFilesApi` is used to process these blocks as if they were the fields in a document.

Rationale:

- Reuse logic (e.g. preparing JSON/HTML for Crowdin)
- Organise Lexical block fields into a folder (easier to review)
- Remove the need for richTextBlockFieldNameSeparator. the use of this led to field names that don't exist.
- Logical - fields in blocks are easier to treat as a new 'document' rather than continuing to name them with increasing long field names to describe where they are nested.

### Lexical blocks article directory

Within an article directory (represented by a document in the `CrowdinArticleDirectories` collection), a folder is created for blocks within a Lexical field. This folder is named by combining the `lexicalBlockFolderPrefix` plugin option and the Lexical field name.

e.g. `lex.content`.

These block collections are treated as 'sub-articles', meaning that plugin logic is reused to parse Lexical field blocks as if they were top-level articles (documents in a Payload collection).

Such folders on Crowdin are also referenced using documents in the `CrowdinArticleDirectories` collection. Lexical blocks article directories will have an id that corresponds to the Crowdin folder name (e.g. `lex.content`) and a parent relationship to another document in the `CrowdinArticleDirectories` collection.

### Source Lexical block content

Lexical block content from the source locale (e.g. `en`) is merged back into Lexical block translations.

#### Source content

Consider the following source content taken from a Lexical field block.

```json
{
  "id": "668579b65fbcb419a79ccb4c",
  "blockName": "",
  "blockType": "highlight",
  "color": "yellow",
  "title": "Highlight block title",
  "content": {
    "root": {
      "children": [
        {
          "children": [
            {
              "detail": 0,
              "format": 0,
              "mode": "normal",
              "style": "",
              "text": "Highlight block rich text content.",
              "type": "text",
              "version": 1
            }
          ]
        }
      ]
    }
  }
}
```

Note: Whether or not Lexical block fields are localized is ignored - the Lexical field itself is localized making localization status for block fields redundant.

#### Send to Crowdin

The following is sent for translation (the plugin treats Lexical field blocks as an imaginary collection containing a single `blocks` field):

`blocks.json`

```json
{
  "blocks": {
    "668579b65fbcb419a79ccb4c": {
      "title": "Highlight block title",
    }
  }
}
```

`blocks.668579b65fbcb419a79ccb4c.content.html`

```html
<p>Highlight block rich text content.</p>
```

#### Receive from Crowdin

`blocks.json`

```json
{
  "blocks": {
    "668579b65fbcb419a79ccb4c": {
      "title": "Titre du bloc « Surligner »",
    }
  }
}
```

`blocks.668579b65fbcb419a79ccb4c.content.html`

```html
<p>« Surligner » bloque le contenu en texte enrichi.</p>
```

#### Build blocks for Payload update

Note that **non-rich text** fields are restored from the source content when translated Lexical blocks are added.

This is because a given block configuration likely contains fields that are not sent to Crowdin such as `select` fields which may be important for block field values. Lexical blocks are 'isolated', so these fields should be merged into translations based on source values.

Note that source block values are stored in a `sourceBlocks` field on the `CrowdinFiles` collection for convenient access.

```json
{
  "id": "668579b65fbcb419a79ccb4c",
  "blockType": "highlight",
  "color": "yellow",
  "title": "Titre du bloc « Surligner »",
  "content": {
    "root": {
      "children": [
        {
          "children": [
            {
              "detail": 0,
              "format": 0,
              "mode": "normal",
              "style": "",
              "text": "« Surligner » bloque le contenu en texte enrichi.",
              "type": "text",
              "version": 1
            }
          ]
        }
      ]
    }
  }
}
```