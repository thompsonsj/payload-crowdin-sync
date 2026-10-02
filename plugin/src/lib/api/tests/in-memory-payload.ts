import { NotFound } from 'payload';
import type { Payload, Where } from 'payload';
import { vi } from 'vitest';

/**
 * In-memory stand-in for the Payload methods used by the Crowdin directory
 * code. `find` evaluates `where` clauses (`equals`, `and`, `or`) against the
 * seeded rows, so tests can assert which row is found rather than the order
 * of queries.
 */

export type Row = Record<string, unknown> & { id: string };

const valueAt = (row: Row, path: string): unknown =>
  path.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object') {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, row);

const idOf = (value: unknown) =>
  value && typeof value === 'object' ? (value as Row).id : value;

const matches = (row: Row, where?: Where): boolean => {
  if (!where) return true;
  return Object.entries(where).every(([key, condition]) => {
    if (key === 'and') {
      return (condition as Where[]).every((w) => matches(row, w));
    }
    if (key === 'or') {
      return (condition as Where[]).some((w) => matches(row, w));
    }
    const { equals } = condition as { equals: unknown };
    return idOf(valueAt(row, key)) === equals;
  });
};

/** Supports exclusion only (`{ field: false }`), as used by the plugin. */
const applySelect = (row: Row, select?: Record<string, boolean>): Row => {
  if (!select) return row;
  const copy = { ...row };
  for (const [key, include] of Object.entries(select)) {
    if (include === false) delete copy[key];
  }
  return copy;
};

/**
 * Seeded with rows per collection slug. Each method is a `vi.fn`, so tests can
 * assert calls. `findByID` and `delete` throw `NotFound` for a missing id,
 * like Payload.
 */
export function createInMemoryPayload(collections: Record<string, Row[]>) {
  const rows = (collection: string) => collections[collection] ?? [];
  const payload = {
    find: vi.fn(async ({ collection, where, limit, select }) => {
      const docs = rows(collection).filter((row) => matches(row, where));
      const limited = limit ? docs.slice(0, limit) : docs;
      return {
        docs: limited.map((row) => applySelect(row, select)),
        totalDocs: docs.length,
      };
    }),
    findByID: vi.fn(async ({ collection, id, select }) => {
      const doc = rows(collection).find((row) => row.id === id);
      if (!doc) throw new NotFound();
      return applySelect(doc, select);
    }),
    delete: vi.fn(async ({ collection, id }) => {
      if (!rows(collection).some((row) => row.id === id)) throw new NotFound();
      collections[collection] = rows(collection).filter(
        (row) => row.id !== id,
      );
    }),
  };
  return payload as typeof payload & Payload;
}

export type InMemoryPayload = ReturnType<typeof createInMemoryPayload>;
