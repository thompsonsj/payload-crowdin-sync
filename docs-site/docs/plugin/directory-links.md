---
sidebar_position: 3.5
description: How the plugin's Crowdin collections link back to your localized collection documents and globals, and how older versions linked them.
---

# How documents link to Crowdin directories

The plugin keeps a record of every folder and file it creates on Crowdin, in three collections of its own. This page explains how those records link back to your collection documents and globals, how the plugin finds the right record for a document, and how earlier versions did it.

## The collections

Each record matches something on Crowdin:

| Collection                       | Represents on Crowdin                                                     | Key fields                                                                         |
| -------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `crowdin-collection-directories` | One folder per collection, plus a `globals` folder for all globals        | `collectionSlug`                                                                   |
| `crowdin-article-directories`    | One folder per document or global                                         | `name`, `crowdinCollectionDirectory`, `collectionDocument`, `globalSlug`, `parent` |
| `crowdin-files`                  | One file per document: `fields.json`, or an HTML file per rich text field | `crowdinArticleDirectory`                                                          |

A `crowdin-article-directories` record without a `parent` is a document's **root directory**. Records with a `parent` hold Lexical blocks and sit inside a root directory (see [Lexical blocks](#lexical-blocks)).

```mermaid
flowchart LR
  subgraph yours["Your collections and globals"]
    doc["Collection document<br/>e.g. localized-posts / 5"]
    global["Global<br/>e.g. nav"]
  end

  subgraph plugin["Plugin collections"]
    cd["crowdin-collection-directories<br/>collectionSlug: localized-posts"]
    cdg["crowdin-collection-directories<br/>collectionSlug: globals"]
    ad["crowdin-article-directories<br/>name: 5"]
    adg["crowdin-article-directories<br/>name: nav"]
    files["crowdin-files<br/>fields.json, content.html"]
  end

  ad -- crowdinCollectionDirectory --> cd
  adg -- crowdinCollectionDirectory --> cdg
  ad -- collectionDocument --> doc
  adg -- globalSlug --> global
  files -- crowdinArticleDirectory --> ad
```

## How a root directory links to its document

A root directory records which document it belongs to in two ways:

- **A direct link.**
  - For a collection document: `collectionDocument`, a polymorphic relationship such as `{ relationTo: 'localized-posts', value: '5' }`.
  - For a global: `globalSlug`, such as `nav`.
- **Its name and collection folder.** `name` is the document id (or the global slug), and `crowdinCollectionDirectory` points at its collection's folder (or the `globals` folder).

The direct link is the reliable one. Names repeat across collections: on SQL databases, post `5` and page `5` both have a directory named `5`. So a name only identifies a document together with its collection folder.

Your documents never store anything. Enabled collections and globals get a `crowdinArticleDirectory` relationship field, but it is virtual: the plugin removes it before saving and looks the directory up whenever the document is read.

### Creating the directory

The first time a document is saved with localized content, the plugin creates its folders on Crowdin and records them:

```mermaid
sequenceDiagram
  participant Doc as localized-posts / 5
  participant Plugin
  participant Crowdin
  participant DB as Plugin collections

  Doc->>Plugin: afterChange (first save)
  Plugin->>DB: Find crowdin-collection-directories for localized-posts
  alt No collection folder yet
    Plugin->>Crowdin: Create folder "localized-posts"
    Plugin->>DB: Create crowdin-collection-directories record
  end
  Plugin->>Crowdin: Create folder "5" inside it
  Plugin->>DB: Create crowdin-article-directories record<br/>name: 5, crowdinCollectionDirectory,<br/>collectionDocument: localized-posts / 5
  Plugin->>Crowdin: Upload fields.json and HTML files
  Plugin->>DB: Create crowdin-files records
```

Globals work the same way, inside the `globals` folder, with `globalSlug` instead of `collectionDocument`.

### Finding a document's directory

Syncing, reading and deleting a document all use the same lookup. By default it only uses the direct link. If [`legacyArticleDirectoryLookup`](./README.md#legacyarticledirectorylookup) is on, it also tries the two older paths:

```mermaid
flowchart TD
  start(["Find the directory for<br/>localized-posts / 5"]) --> linked{"A record linked to it?<br/>collectionDocument = localized-posts / 5<br/>(globals: globalSlug)"}
  linked -- yes --> found(["Use that record"])
  linked -- no --> field{"A directory id on the document?<br/>(older versions stored one)"}
  field -- "yes, named 5 and<br/>not linked elsewhere" --> found
  field -- "no, or it belongs<br/>to another document" --> name{"A record named 5 in the<br/>localized-posts folder?"}
  name -- yes --> found
  name -- no --> none{"Why are we looking?"}
  none -- "saving" --> create(["Create the folders and record"])
  none -- "reading or deleting" --> nothing(["No directory"])
```

When saving, each record found is first checked on Crowdin. If its folder was deleted on Crowdin, the record is deleted and the next one is tried. See [`disableSelfClean`](./README.md#disableselfclean).

The second and third steps are off unless `legacyArticleDirectoryLookup` is set. Running the [backfill](#linking-older-directories) adds the link, after which the first step finds them. If you save a document whose directory is still unlinked while the option is off, the plugin throws and names the backfill rather than creating a second Crowdin folder.

### Lexical blocks

Blocks inside a Lexical rich text field get their own folder inside the document's folder. Its record has a `parent` (the document's root directory) and a `name` made from the field name, prefixed with `lexicalBlockFolderPrefix`. These records have no `collectionDocument` or `globalSlug`: they are found through their parent.

```mermaid
flowchart LR
  root["crowdin-article-directories<br/>name: 5<br/>collectionDocument: localized-posts / 5"]
  block["crowdin-article-directories<br/>name: lex.content<br/>parent: root"]
  rootFiles["crowdin-files<br/>fields.json"]
  blockFiles["crowdin-files<br/>fields.json"]
  rootFiles --> root
  block -- parent --> root
  blockFiles --> block
```

## How earlier versions linked documents

The way documents are linked has changed twice. Directories created by each version are still in your database until the backfill links them.

```mermaid
timeline
  title Linking documents to their directories
  Before #270 : The document stores the directory id in crowdinArticleDirectory
              : Directory records have no link back
  #270 : crowdinArticleDirectory becomes virtual
       : collectionDocument and globalSlug fields added
       : Only globals get their link on creation
       : Collection documents found by name
  #372 : The name match is limited to the collection's folder
  Current : Collection directories get collectionDocument on creation
          : The backfill links older directories by name
```

### Before #270: the id stored on the document

After creating a document's directory, the plugin wrote the directory's id into the document's `crowdinArticleDirectory` field. That stored value was the only link: the directory record didn't point back at the document.

```mermaid
flowchart LR
  doc["localized-posts / 5<br/>crowdinArticleDirectory: ad-1 (stored)"]
  ad["crowdin-article-directories / ad-1<br/>name: 5"]
  cd["crowdin-collection-directories<br/>localized-posts"]
  doc -- stored id --> ad
  ad -- crowdinCollectionDirectory --> cd
```

This had two problems:

- **Writing to your documents.** Saving the id back to the document could fail on validation errors after the files were already on Crowdin ([#267](https://github.com/thompsonsj/payload-crowdin-sync/issues/267)).
- **Duplicates shared a directory.** Until [#294](https://github.com/thompsonsj/payload-crowdin-sync/pull/294), duplicating a document copied the stored id, so the copy pointed at the original's directory. The plugin now only uses a stored id if the record is named for that document and isn't linked to another one.

### From #270: links on the directory, found by name

[#270](https://github.com/thompsonsj/payload-crowdin-sync/pull/270) made `crowdinArticleDirectory` virtual and moved the link onto the directory record, with `collectionDocument` and `globalSlug`. New global directories got `globalSlug`, but new collection directories were created without `collectionDocument`. So collection documents were found by `name`:

```mermaid
flowchart LR
  doc["localized-posts / 5<br/>(nothing stored)"]
  ad["crowdin-article-directories<br/>name: 5<br/>collectionDocument: not set"]
  cd["crowdin-collection-directories<br/>localized-posts"]
  doc -. "found by name 5<br/>in the localized-posts folder" .-> ad
  ad -- crowdinCollectionDirectory --> cd
```

Until [#372](https://github.com/thompsonsj/payload-crowdin-sync/pull/372), some lookups matched `name` without checking the collection folder. On SQL databases, deleting post `5` could delete page `5`'s directory:

```mermaid
flowchart LR
  post["localized-posts / 5"]
  page["pages / 5"]
  adPost["crowdin-article-directories<br/>name: 5<br/>in localized-posts folder"]
  adPage["crowdin-article-directories<br/>name: 5<br/>in pages folder"]
  post -. "name 5, no folder check" .-> adPage
  post -. "intended" .-> adPost
  page -.-> adPage
```

### Linking older directories

Directories from either earlier version can be linked with the backfill. Call it once, for example from `onInit` or a one-off script. It is safe to run again.

```ts
import { backfillArticleDirectoryPolymorphicLinks } from 'payload-crowdin-sync';

const result = await backfillArticleDirectoryPolymorphicLinks(payload);
// { collectionDocumentsUpdated: number, globalsUpdated: number }
```

```mermaid
flowchart TD
  start(["backfillArticleDirectoryPolymorphicLinks"]) --> stored["1. Documents that still store a<br/>crowdinArticleDirectory id"]
  stored --> linkStored["Link that directory to the document"]
  linkStored --> byName["2. Root directories with no link,<br/>in each collection folder"]
  byName --> checks{"Is the directory's<br/>document still there?"}
  checks -- "collection or global not in config,<br/>document deleted, or the document<br/>already has a linked directory" --> skip(["Leave it"])
  checks -- yes --> linkName["Link it by name:<br/>collectionDocument or globalSlug"]
```

Once every directory is linked, leave `legacyArticleDirectoryLookup` off. A future major version will remove that option, then remove the `crowdinArticleDirectory` field from your documents. See [planned features](../repo/planned-features.md#remove-the-crowdinarticledirectory-field-from-synced-documents).
