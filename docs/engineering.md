# Engineering decisions

## Lexical block fields

The `createOrUpdateHtmlFile` method of the [`payloadCrowdinSyncDocumentFilesApi`](plugin/src/lib/api/payload-crowdin-sync/files/document.ts) reads the collection config to determine whether the underlying field uses the [Slate editor](https://payloadcms.com/docs/rich-text/slate) or the [Lexical editor](https://payloadcms.com/docs/rich-text/lexical).

If Lexical, blocks embedded within the editor are supported.

For a given Lexical field, all embedded blocks are extracted and another instance of `payloadCrowdinSyncDocumentFilesApi` is used to process these blocks as if they were the fields in a document.

Rationale:

- Reuse logic (e.g. preparing JSON/HTML for Crowdin)
- Organise Lexical block fields into a folder (easier to review)
- Remove the need for richTextBlockFieldNameSeparator. the use of this led to field names that don't exist.
- Logical - fields in blocks are easier to treat as a new 'document' rather than continuing to name them with increasing long field names to describe where they are nested.
