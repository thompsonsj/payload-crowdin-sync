# Broad refactoring plan

This document covers refactor opportunities across the plugin codebase outside of `plugin/src/lib/api/` (which is tracked separately in [refactoring.md](./refactoring.md)). The focus is DRY, single responsibility, separation of concerns, and small methods.

**Approach:** TDD throughout. Every item requires a failing test that demonstrates the problem (or the desired post-refactor behaviour) before any code changes are made. If something is broken today, the failing test comes first.

---

## Items

### 1. Extract field-traversal skeleton from `buildPayloadUpdateObject`, `buildCrowdinJsonObject`, `buildCrowdinHtmlObject`, and `restoreOrder`

**File:** `plugin/src/lib/utilities/index.ts:420–751`

**Problem:** All four functions contain nearly-identical `group / array / blocks` recursive dispatch:

```ts
if (field.type === 'group') {
  // recurse into field.fields
} else if (field.type === 'array') {
  // map over items, recurse into field.fields
} else if (field.type === 'blocks') {
  // map over items, look up block by slug, recurse
} else {
  // leaf
}
```

The traversal skeleton — including the block-slug lookup and the `filter(isEmpty)` cleanup — is copy-pasted across ~250 lines. The only variation is what each function *does* at the leaf and container level. Any bug in the traversal logic (e.g. a new field type) must be fixed in four places. There is even a `TODO` comment in the source acknowledging this (`"block, array and group logic is duplicated"`).

**Fix:** Extract a single `traverseFields` utility that accepts a visitor object:

```ts
interface FieldTraversalVisitor<T> {
  group(field: GroupField, recurse: () => T): T;
  array(field: ArrayField, items: unknown[], recurse: (item: unknown, subFields: Field[]) => T): T;
  blocks(field: BlocksField, items: unknown[], recurse: (item: unknown, subFields: Field[]) => T): T;
  leaf(field: Field, value: unknown): T;
}
```

`buildCrowdinJsonObject`, `buildCrowdinHtmlObject`, `buildPayloadUpdateObject`, and `restoreOrder` become thin visitors passed to `traverseFields`.

**TDD:** Write tests for `traverseFields` directly before extracting. Existing tests for the four builder functions become the regression suite.

---

### 2. Consolidate identical type guard bodies in `types.ts` and `utilities/payload.ts` ✅

**Files:** `plugin/src/lib/types.ts:73–83`, `plugin/src/lib/utilities/payload.ts:3–7`

**Problem:** Three exported functions share an identical body:

```ts
// types.ts
export const isCrowdinArticleDirectory = (val): val is CrowdinArticleDirectory =>
  val !== undefined && val !== null && typeof val !== 'string';

export const isCrowdinCollectionDirectory = (val): val is CrowdinCollectionDirectory =>
  val !== undefined && val !== null && typeof val !== 'string';

// utilities/payload.ts
export const isNotString = <T>(val): val is T =>
  val !== undefined && val !== null && typeof val !== 'string';
```

`isNotString` is a generic version of the same check. The two typed guards in `types.ts` could delegate to it, or all three could delegate to a single shared primitive.

**Fix:** Make `isCrowdinArticleDirectory` and `isCrowdinCollectionDirectory` delegate to `isNotString`:

```ts
export const isCrowdinArticleDirectory = (val): val is CrowdinArticleDirectory =>
  isNotString(val);
```

**TDD:** Unit tests already exist for the type guards. Add a test asserting the delegation relationship to prevent future divergence.

---

### 3. Replace duplicated hook logic in `syncTranslations` / `syncAllTranslations`

**File:** `plugin/src/lib/fields/pluginFields.ts:156–327`

**Problem:** The two checkbox fields `syncTranslations` and `syncAllTranslations` have structurally identical `beforeChange` and `afterChange` hooks (~70 lines each, ~140 lines total). Both hooks:

1. Guard on `context.triggerAfterChange === false`
2. Extract `draft` and `articleDirectoryId` from `siblingData`
3. Store state in `req.context`
4. In `afterChange`, type-check context then call either `payload.jobs.queue` or `updatePayloadTranslation`

The only differences are: `syncTranslations` computes `excludeLocales` (limiting to the current locale); `syncAllTranslations` enqueues one job per locale.

**Fix:** Extract `createSyncBeforeChangeHook` and `createSyncAfterChangeHook` factory functions parameterised by the sync mode:

```ts
type SyncMode = 'current-locale' | 'all-locales';

const createSyncBeforeChangeHook = (mode: SyncMode, fieldName: string) => ...
const createSyncAfterChangeHook = (mode: SyncMode, pluginOptions: PluginOptions) => ...
```

**TDD:** Add unit tests for each hook factory (both modes) before extracting. The existing `pluginFields.afterRead.spec.ts` covers the `afterRead` hook; the `beforeChange`/`afterChange` hooks currently have no unit tests.

---

### 4. Remove unused `initFunctions` in `plugin.ts` ✅

**File:** `plugin/src/lib/plugin.ts:68` and `plugin/src/lib/plugin.ts:331`

**Problem:** `initFunctions` is declared as `(() => void)[]`, nothing is ever pushed into it, and the `forEach` call at line 331 is a no-op. It's dead code that misleads readers into thinking initialisation side-effects are registered there.

**Fix:** Delete both the declaration and the `forEach` call.

**TDD:** The existing `plugin.spec.ts` unit tests provide regression coverage. Verify they still pass after removal.

---

### 5. Extract `documentTabFields` builder from `plugin.ts` ✅

**File:** `plugin/src/lib/plugin.ts:96–118`

**Problem:** The inline `documentTabFields` construction uses `any[]` and lives inside the plugin closure where it is hard to test independently. The logic that decides which fields to register — based on `syncedCollectionSlugs` and `syncedGlobalSlugs` — is already tested in `plugin.spec.ts` but only via the full plugin output, not the field builder itself.

**Fix:** Extract to `plugin/src/lib/fields/documentTabFields.ts`:

```ts
export function buildDocumentTabFields(
  syncedCollectionSlugs: string[],
  syncedGlobalSlugs: string[],
): Field[]
```

Type the return as `Field[]` (not `any[]`).

**TDD:** Write focused unit tests for `buildDocumentTabFields` directly. The existing `plugin.spec.ts` tests become higher-level regression coverage.

---

### 6. Split `getLocalizedFields` (119 lines, five concerns)

**File:** `plugin/src/lib/utilities/index.ts:93–212`

**Problem:** `getLocalizedFields` handles five distinct concerns in a single 119-line function:

1. Filtering fields by localization status
2. Filtering fields by type (`json` / `html`)
3. Recursing into nested fields (group, array, blocks)
4. Flattening container fields (tabs via `convertTabs`, collapsible via `getCollapsibleLocalizedFields`, row via `getRowLocalizedFields`)
5. Applying a caller-supplied `isLocalized` predicate

A comment in the source already flags this: `"find a better way to do this - block, array and group logic is duplicated"`.

**Fix:** Extract named private helpers, keeping `getLocalizedFields` as a thin orchestrator:

- `filterByType(fields, type)` — `json` / `html` / undefined filter
- `flattenContainerFields(fields)` — tabs / collapsible / row flattening
- `recurseNestedFields(field, options)` — group / array / blocks recursion

**TDD:** Extensive tests already exist in `utilities/getLocalizedFields.spec.ts`. Add tests for each extracted helper before splitting.

---

## Completed work

### Items 2, 4, 5 — type guard consolidation, `initFunctions` removal, `buildDocumentTabFields` extraction

**Item 5 — `buildDocumentTabFields`:**
- New file `plugin/src/lib/fields/documentTabFields.ts` exports `buildDocumentTabFields(syncedCollectionSlugs, syncedGlobalSlugs): Field[]`
- Return type is `Field[]` (was `any[]`)
- 15 unit tests in `fields/documentTabFields.spec.ts` covering empty inputs, each field's type/properties, and combined behaviour
- `plugin.ts` now imports and calls the function instead of inlining the conditional array spread

**Item 4 — `initFunctions` removed:**
- Deleted declaration (`const initFunctions: (() => void)[] = []`) and the no-op `initFunctions.forEach` call in `onInit`
- Existing `plugin.spec.ts` suite confirms no regression

**Item 2 — type guard consolidation:**
- `isCrowdinArticleDirectory` and `isCrowdinCollectionDirectory` in `types.ts` now delegate to `isNotString` from `utilities/payload.ts`
- 20 unit tests in `types.spec.ts` pin the shared behaviour and include an explicit parity assertion against `isNotString` to prevent future divergence

---

## Notes on approach

- Each item must have a failing (or green-baseline) test committed before any implementation changes.
- Items 1 and 3 carry the highest risk (core translation pipeline and UI field hooks respectively) — take extra care with regression coverage before touching them.
- Items 4 and 5 are safe to tackle first: item 4 is pure deletion, item 5 is a pure extraction with no behaviour change.
