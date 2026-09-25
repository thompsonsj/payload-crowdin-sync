# API layer refactoring plan

This document describes the planned refactoring of `plugin/src/lib/api`. The goal is cleaner method boundaries, strong interfaces backing class properties, and a module layout that makes it straightforward to add adapters for other translation APIs (Phrase, Lokalise, etc.).

## Context

The `api/` directory has five main areas:

| File | Role |
|------|------|
| `helpers.ts` | Payload CMS query utilities |
| `translations.ts` | Fetch translations from Crowdin and write to Payload |
| `files/index.ts` | Base Crowdin file CRUD |
| `files/document.ts` | Document-scoped file operations (extends index) |
| `files/by-document.ts` | Directory orchestration and find-or-create logic |

---

## Items

### 1. Extract name conflict resolution utility ✅

**Problem:** The same Crowdin "name already exists" error detection and recovery pattern is duplicated in three places:
- `files/index.ts` — `crowdinCreateFile()` (checks `file.name.is_already_exists`)
- `files/by-document.ts` — `findOrCreateCollectionDirectory()` (checks `directory.name.is_already_exists`)
- `files/by-document.ts` — `crowdinFindOrCreateDirectory()` (same as above)

Each copy has slightly different string checks, meaning fixes diverge over time.

**Fix:** Export `isCrowdinNameConflictError(error: unknown): boolean` from `files/index.ts`. Covers both `file.name.*` and `directory.name.*` error keys plus the plain-string `'Name must be unique'` fallback. All three call sites use this instead of inline detection.

---

### 2. Named constructor parameter interfaces ✅

**Problem:** `filesApiByDocument` and `payloadCrowdinSyncDocumentFilesApi` both define their constructor argument as an anonymous inline type. Class properties and constructor params describe the same shape twice with no shared contract.

**Fix:** Extract named interfaces for constructor options:
- `IfilesApiByDocumentOptions` in `files/by-document.ts`
- `IpayloadCrowdinSyncDocumentFilesApiOptions` in `files/document.ts`

Constructor signatures reference the interface. This gives a single place to update when fields change and makes it explicit what `get()` and similar factory methods need.

---

### 3. Split `getTranslation()` into strategy methods ✅

**Problem:** `translations.ts:getTranslation()` is 154 lines handling four distinct cases in one method:
1. JSON fields via Crowdin API
2. HTML → Slate conversion
3. HTML → Lexical conversion (including nested block lookup)
4. Error/fallback return

**Fix:** Introduce private methods:
- `getJsonTranslation()` — parse JSON, return object
- `getSlateTranslation()` — fetch HTML, convert to Slate
- `getLexicalTranslation()` — fetch HTML, resolve lexical blocks, convert

`getTranslation()` becomes a thin dispatcher that calls the right method based on `file.type` and editor config. These are the natural seam points for a future adapter pattern.

---

### 4. Isolate Lexical block handling

**Problem:** Lexical-specific logic is spread across `document.ts`, `translations.ts`, and `by-document.ts`:
- Hardcoded `'mock-collection-for-lexical-blocks'` slug in `document.ts:512`
- `fieldName = 'blocks'` override in `document.ts:472`
- `lexicalBlockFolderPrefix` threaded through both files and translations
- `createLexicalBlocks()` recursively instantiates a new `filesApiByDocument`, creating a fragile cycle

**Fix:** Extract to `files/lexical-blocks.ts` with a clean interface. This module owns the folder naming, the mock collection config, the block content extraction, and the recursive sync. Both `document.ts` and `translations.ts` delegate to it.

---

### 5. Decompose `findOrCreateArticleDirectory()` and `createFile()` ✅

**Problem:**
- `by-document.ts:findOrCreateArticleDirectory()` — 128 lines, four nested lookup strategies
- `document.ts:createFile()` — 137 lines, five possible database writes, two duplicate-detection paths

**Fix:**
- `findOrCreateArticleDirectory()` → extract each lookup strategy to a named private method (`findByPolymorphicLink`, `findByLegacyField`, `findInPayload`, `createNew`), making the orchestration readable at a glance
- `createFile()` → separate `syncExistingPayloadFile()` (handles found-in-payload case) and `syncExistingCrowdinFile()` (handles `revisionId > 1` case) from the main happy path

---

### 6. Unified polymorphic resolver ✅

**Problem:** Three separate locations implement article directory lookup with different fallback orderings:
- `helpers.ts:findRootArticleDirectoryPolymorphic()`
- `by-document.ts:resolveExistingArticleDirectory()` (four fallbacks)
- `by-document.ts:findOrCreateArticleDirectory()` (inline strategies)

**Fix:** Single resolver in `helpers.ts` with a consistent strategy ordering (polymorphic → legacy field → Payload query → optional create). All callers use it.

**Done:** `resolveRootArticleDirectory` in `helpers.ts` tries the polymorphic link, then the legacy `crowdinArticleDirectory` reference, then a `name` match within the document's collection directory (`globals` for globals), passing each candidate through an optional `validate` step. Creation stays in `findOrCreateArticleDirectory`, which runs the resolver with self-clean as `validate`. `resolveExistingArticleDirectory` (delete) and `getArticleDirectory` with `rootLookup` use the same resolver.

Unifying the paths fixed two bugs:

- **Lookups matched other collections.** The delete path and `getArticleDirectory` fell back to a `name` match without a collection filter, and `deleteFilesAndDirectory` looked the directory up by `name` again before deleting it. On SQL adapters, where ids repeat across collections, deleting post `5` could delete page `5`'s directory. The `name` match is now limited to the collection directory, and `deleteFilesAndDirectory` deletes the directory it already resolved.
- **An orphaned legacy reference blocked sync.** If `crowdinArticleDirectory` pointed at a deleted row, sync threw until the field was cleared. It is now skipped on both paths (only on a 404; other errors still throw).

`getArticleDirectory`, `getFileByDocumentID` and `getFilesByDocumentID` are exported, so without `rootLookup` they keep the `name`-only lookup; callers that know the collection should pass it.

**Tests:** `articleDirectoryResolution.spec.ts` was committed first, failing for each bug. It and the rewritten self-clean tests in `by-document.spec.ts` use `api/tests/in-memory-payload.ts`, which evaluates `where` clauses, so they assert which directory is found rather than the order of queries.

---

## Future: adapter pattern

Once items 3 and 4 are complete, the translation strategies (`getJsonTranslation`, `getSlateTranslation`, `getLexicalTranslation`) and the files layer (`createOrUpdateFile`, etc.) can be extracted behind interfaces, making it possible to implement a Phrase or Lokalise adapter that satisfies the same contracts without touching the orchestration layer.
