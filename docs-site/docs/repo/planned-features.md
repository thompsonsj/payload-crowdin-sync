# Planned features

Features that are planned but not yet working. Each entry records the goal, what exists today, and what is known about why it isn't finished.

---

## Crowdin stats in the document UI

**Goal:** a component in the Crowdin tab (or fieldset, when `tabbedUI` is off) of each synced collection document and global that reports stats from this plugin for that document.

**What exists today:**

- `plugin/src/lib/fields/documentUI.tsx` contains a first attempt, `DocumentCustomUIField`. It reads the `crowdinArticleDirectory` field from form state and shows its `updatedAt` as "Last sync".
- `plugin/src/lib/fields/pluginFields.ts` has a commented-out `lastCrowdinSync` field of `type: 'ui'` with `admin.components.Field` set to `''`. The import of `DocumentCustomUIField` in the same file is also commented out.

**Why it doesn't work yet:** attempts to wire the component in have failed. Likely causes, not yet confirmed:

- **Component registration in Payload 3.** Custom admin components are referenced by a path string resolved through the import map (for example `'payload-crowdin-sync/client#DocumentCustomUIField'`), not by importing the component. The plugin's `package.json` has no `exports` field or client entry point, so there is no path Payload can resolve.
- **Unpopulated relationship in form state.** `crowdinArticleDirectory` in form state is likely an id rather than a populated document, so `updatedAt` would be undefined. The component may need to fetch the directory, or use a server component.
- **Test coverage.** Vitest can't parse the `.tsx` file without extra JSX config, so it is excluded from coverage (see #365).

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
