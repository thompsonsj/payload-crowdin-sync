import type { ArrayField, BlocksField, Field, GroupField } from 'payload';
import { describe, expect, it } from 'vitest';
import type { FieldTraversalVisitor } from './traverseFields';
import { getBlockFields, traverseFields } from './traverseFields';

const text = (name: string): Field => ({
  name,
  type: 'text',
  localized: true,
});

const group = (name: string, fields: Field[]): GroupField => ({
  name,
  type: 'group',
  fields,
});

const array = (name: string, fields: Field[]): ArrayField => ({
  name,
  type: 'array',
  fields,
});

const blocks = (name: string, blockFields: Field[]): BlocksField => ({
  name,
  type: 'blocks',
  blocks: [
    {
      slug: 'hero',
      fields: blockFields,
    },
  ],
});

const recordingVisitor = (): {
  log: string[];
  visitor: FieldTraversalVisitor<{ log: string[] }>;
} => {
  const log: string[] = [];
  return {
    log,
    visitor: {
      skip: (field) => field.name.startsWith('skip'),
      group: (field, ctx) => {
        ctx.log.push(`group:${field.name}`);
      },
      array: (field, ctx) => {
        ctx.log.push(`array:${field.name}`);
      },
      blocks: (field, ctx) => {
        ctx.log.push(`blocks:${field.name}`);
      },
      leaf: (field, ctx) => {
        ctx.log.push(`leaf:${field.name}`);
      },
    },
  };
};

describe('fn: traverseFields', () => {
  it('dispatches named fields in order: leaf, group, array, blocks', () => {
    const { log, visitor } = recordingVisitor();
    traverseFields(
      [
        text('title'),
        group('meta', [text('og')]),
        array('items', [text('label')]),
        blocks('layout', [text('heading')]),
      ],
      { log },
      visitor,
    );
    expect(log).toEqual([
      'leaf:title',
      'group:meta',
      'array:items',
      'blocks:layout',
    ]);
  });

  it('does not visit fields skipped by the visitor', () => {
    const { log, visitor } = recordingVisitor();
    traverseFields(
      [text('title'), text('skipMe'), group('skipGroup', [text('og')])],
      { log },
      visitor,
    );
    expect(log).toEqual(['leaf:title']);
  });

  it('ignores layout fields that have no name', () => {
    const { log, visitor } = recordingVisitor();
    traverseFields(
      [
        { type: 'row', fields: [text('inRow')] },
        { type: 'collapsible', label: 'c', fields: [text('inCollapsible')] },
        { type: 'tabs', tabs: [{ label: 'Tab', fields: [text('inTab')] }] },
        text('title'),
      ],
      { log },
      visitor,
    );
    expect(log).toEqual(['leaf:title']);
  });
});

describe('fn: getBlockFields', () => {
  const field = blocks('layout', [text('heading'), text('body')]);

  it('returns the fields for a known block slug', () => {
    expect(
      getBlockFields(field, 'hero').map((item) => ('name' in item ? item.name : undefined)),
    ).toEqual(['heading', 'body']);
  });

  it('returns an empty array for an unknown block slug', () => {
    expect(getBlockFields(field, 'missing')).toEqual([]);
  });
});
