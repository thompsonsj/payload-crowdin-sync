# Engineering decisions

## Lexical block fields

The `createOrUpdateHtmlFile` method of the [`payloadCrowdinSyncDocumentFilesApi`](plugin/src/lib/api/files/document.ts) reads the collection config to determine whether the underlying field uses the [Slate editor](https://payloadcms.com/docs/rich-text/slate) or the [Lexical editor](https://payloadcms.com/docs/rich-text/lexical).

If Lexical, blocks embedded within the editor are supported.

For a given Lexical field, all embedded blocks are extracted and another instance of `payloadCrowdinSyncDocumentFilesApi` is used to process these blocks as if they were the fields in a document.

Rationale:

- Reuse logic (e.g. preparing JSON/HTML for Crowdin)
- Organise Lexical block fields into a folder (easier to review)
- Remove the need for richTextBlockFieldNameSeparator. the use of this led to field names that don't exist.
- Logical - fields in blocks are easier to treat as a new 'document' rather than continuing to name them with increasing long field names to describe where they are nested.

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