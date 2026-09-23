# Planned features

Features that are planned but not finished, collected from GitHub issues, the docs site, the READMEs, and a todo list that used to live in `plugin/docs/development.md` (last updated 21 Dec 2023, removed in Sep 2025).

Bugs are tracked in [GitHub issues](https://github.com/thompsonsj/payload-crowdin-sync/issues) and aren't listed here. Refactoring is tracked in [refactoring.md](./refactoring.md) and [refactoring-broad.md](./refactoring-broad.md).

Each entry records the goal, its current status, and where it came from.

---

## Plugin features

### Read-only localized fields in other locales

**Goal:** an option to make localized fields read-only in every locale except the source locale, because Crowdin manages those translations.

**Status:** not started. The plugin only sets `readOnly` on its own fields (for example in `pluginFields.ts` and the `crowdin-article-directories` collection), not on the user's localized fields.

**Source:** unticked item on the 2023 todo list ("Add option to make localized fields read-only in other locales").

**Note:** `plugin/README.md`, the root `README.md` and `docs-site/docs/repo/README.md` already describe this as a feature ("Keep translated locales read-only in Payload", "Make these fields read-only in other locales"). Either implement it or reword those lines until it exists.

**Things to decide:**

- How to apply it. Payload's `admin.readOnly` isn't locale-aware, so this likely needs a field `access.update` function or an `admin.condition`/custom component that checks the current locale.
- Whether it respects fields excluded from sync (`custom.crowdinSync.disable`), which should stay editable in every locale.
- Whether it's opt-in, given it changes editing behaviour for existing installs.

---

### Crowdin stats in the document UI

**Goal:** a component in the Crowdin tab (or fieldset, when `tabbedUI` is off) of each synced collection document and global that reports stats from this plugin for that document.

**Status:** started, not working. `plugin/src/lib/fields/documentUI.tsx` contains a first attempt, `DocumentCustomUIField`, which reads `crowdinArticleDirectory` from form state and shows its `updatedAt` as "Last sync". `pluginFields.ts` has a commented-out `lastCrowdinSync` field of `type: 'ui'` with `admin.components.Field` set to `''`, and a commented-out import of the component.

**Why it doesn't work yet:** likely causes, not yet confirmed:

- **Component registration in Payload 3.** Custom admin components are referenced by a path string resolved through the import map (for example `'payload-crowdin-sync/client#DocumentCustomUIField'`), not by importing the component. The plugin's `package.json` has no `exports` field or client entry point, so there is no path Payload can resolve.
- **Unpopulated relationship in form state.** `crowdinArticleDirectory` in form state is likely an id rather than a populated document, so `updatedAt` would be undefined. The component may need to fetch the directory, or use a server component.
- **Test coverage.** Vitest can't parse the `.tsx` file without extra JSX config, so it is excluded from coverage (see [#365](https://github.com/thompsonsj/payload-crowdin-sync/pull/365)).

**Possible stats:** from data the plugin already stores in Payload:

- last sync time (article directory or Crowdin file `updatedAt`)
- number of Crowdin source files for the document, and which fields they cover
- links to the article directory and its files in the admin UI, and to the directory in Crowdin

Per-locale translation progress would need a Crowdin API call, for example translation progress for each file.

**Next steps:**

1. Add a client entry point to the plugin package (for example `payload-crowdin-sync/client`) that exports the component, and check it resolves through `payload generate:importmap` in `dev/`.
2. Register the component with a path string on the `ui` field, and restore the field in `pluginFields.ts`.
3. Decide whether the stats come from form state, a client-side fetch, or a server component.
4. Add JSX support to the plugin's Vitest project so the component can be tested and included in coverage.

---

### Remove the `crowdinArticleDirectory` field from synced documents

**Goal:** stop adding a relationship field to every synced document. The plugin's own collections would hold the link instead, so the plugin makes no schema changes to user collections.

**Status:** groundwork done. `crowdin-article-directories` now stores polymorphic links back to the document (`collectionDocument`) or global (`globalSlug`), and `backfillArticleDirectoryPolymorphicLinks` fills them in for older directories. The `crowdinArticleDirectory` field is still added to documents.

**Source:** [#267](https://github.com/thompsonsj/payload-crowdin-sync/issues/267). Besides the schema change, the issue notes that writing the relationship back to the document can fail on validation errors after files have already been created on Crowdin.

**Remaining:** move every remaining read of the field to the polymorphic links, then remove the field. Removing it is a breaking change for anyone querying it, so it needs a migration note.

---

### Crowdin folder names from collection labels

**Goal:** use Payload's naming for Crowdin folders instead of deriving names from slugs.

**Status:** half done. Document folders use the collection's `admin.useAsTitle` ([#211](https://github.com/thompsonsj/payload-crowdin-sync/pull/211)). Collection folders still use `toWords(collectionSlug)` in `by-document.ts` rather than the collection's `labels`.

**Source:** [#142](https://github.com/thompsonsj/payload-crowdin-sync/issues/142).

---

### Clean up Crowdin files when a document's translation is reset

**Goal:** delete or reuse old Crowdin files when a document's link to its article directory is reset, for example after a collection slug change.

**Status:** not started for this case. `deleteCrowdinFiles` removes Crowdin source files when a document is deleted, and self-clean removes Payload records whose Crowdin files or directories no longer exist. Resetting the relationship still leaves the old files on Crowdin.

**Source:** `docs-site/docs/plugin/crowdin.md` ("Note that previous Crowdin files will not be deleted. Cleanup operations are considered for a future update.").

---

### Load Lexical translations directly

**Goal:** convert translated HTML from Crowdin straight to Lexical, without converting to Slate first.

**Status:** not started. Translations are loaded as Slate and converted with Payload's Slate-to-Lexical migration support. This works for basic content but limits what Lexical features can round-trip.

**Source:** [#237](https://github.com/thompsonsj/payload-crowdin-sync/issues/237), [#296](https://github.com/thompsonsj/payload-crowdin-sync/issues/296).

---

### Adapters for other translation services

**Goal:** support translation services other than Crowdin (for example Phrase or Lokalise) behind a shared interface.

**Status:** not started. Depends on API refactoring items 3 (done) and 4 (isolate Lexical block handling, pending).

**Source:** [refactoring.md](./refactoring.md#future-adapter-pattern).

---

### Better error handling and reporting

**Goal:** make failures in async Crowdin and Payload calls visible, rather than failing silently.

**Status:** partly done. Setting the `PAYLOAD_CROWDIN_SYNC_VERBOSE` environment variable turns on detailed console logging ([#251](https://github.com/thompsonsj/payload-crowdin-sync/pull/251), [#265](https://github.com/thompsonsj/payload-crowdin-sync/pull/265)). There's no structured error reporting to editors in the admin UI yet, which the stats component above could help with.

**Source:** [#90](https://github.com/thompsonsj/payload-crowdin-sync/issues/90).

---

## Repo and tooling

### Single test installation with per-test config

**Goal:** replace the separate `dev/` and `dev-alternative-config/` installations with one, switching plugin config per test. This would make it possible to test config shapes such as `collections: undefined`, the root cause of [#342](https://github.com/thompsonsj/payload-crowdin-sync/issues/342).

**Status:** not started.

**Source:** [#347](https://github.com/thompsonsj/payload-crowdin-sync/issues/347), related to test interdependency in [#316](https://github.com/thompsonsj/payload-crowdin-sync/issues/316).

---

## Done since it was planned

These were planned in the 2023 todo list or in issues, and have since been built:

- **UI for syncing translations:** the "Sync translations" and "Sync all translations" checkboxes on each document, plus the review and update endpoints.
- **Required field handling:** translation updates that are missing required fields aren't applied, and validation errors are returned instead.
- **Document folder names from `useAsTitle`:** [#211](https://github.com/thompsonsj/payload-crowdin-sync/pull/211).
- **Self-clean when Crowdin returns 404:** files in [#213](https://github.com/thompsonsj/payload-crowdin-sync/pull/213), directories in [#361](https://github.com/thompsonsj/payload-crowdin-sync/pull/361). This covers [#147](https://github.com/thompsonsj/payload-crowdin-sync/issues/147) and [#360](https://github.com/thompsonsj/payload-crowdin-sync/issues/360), which are both still open.

## Not planned

- **Syncing `lexicalHTMLField` output:** by design, the plugin sends the Lexical field itself as HTML, with its own markers for block placement, rather than the generated HTML field ([#266](https://github.com/thompsonsj/payload-crowdin-sync/issues/266)).
