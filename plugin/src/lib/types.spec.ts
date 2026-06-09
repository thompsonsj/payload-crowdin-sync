import { describe, expect, it } from 'vitest'
import { isCrowdinArticleDirectory, isCrowdinCollectionDirectory } from './types'
import { isNotString } from './utilities/payload'

// These tests pin the shared behaviour of the three type guards. After the
// refactor isCrowdinArticleDirectory and isCrowdinCollectionDirectory delegate
// to isNotString; the tests ensure none of the three diverge.

// Cases shared by all three guards — primitives and null-ish values.
const primitiveCases = [
  { input: undefined,  expected: false, label: 'undefined' },
  { input: null,       expected: false, label: 'null' },
  { input: '',         expected: false, label: 'empty string' },
  { input: 'some-id',  expected: false, label: 'non-empty string' },
]

// isNotString accepts any object — it has no structural requirements.
const isNotStringObjectCases = [
  { input: { id: 'abc' },              expected: true,  label: 'object with string id' },
  { input: { id: 'abc', name: 'x' },  expected: true,  label: 'object with string id and name' },
  { input: {},                         expected: true,  label: 'empty object' },
  { input: { id: 42 },                 expected: true,  label: 'object with numeric id' },
]

// isCrowdinArticleDirectory and isCrowdinCollectionDirectory require a string id.
const crowdinDirectoryCases = [
  { input: { id: 'abc' },              expected: true,  label: 'object with string id' },
  { input: { id: 'abc', name: 'x' },  expected: true,  label: 'object with string id and name' },
  { input: {},                         expected: false, label: 'empty object (no id)' },
  { input: { id: 42 },                 expected: false, label: 'object with numeric id' },
  { input: { name: 'x' },             expected: false, label: 'object with no id field' },
]

describe('isNotString', () => {
  for (const { input, expected, label } of [...primitiveCases, ...isNotStringObjectCases]) {
    it(`returns ${expected} for ${label}`, () => {
      expect(isNotString(input as any)).toBe(expected)
    })
  }
})

describe('isCrowdinArticleDirectory', () => {
  for (const { input, expected, label } of [...primitiveCases, ...crowdinDirectoryCases]) {
    it(`returns ${expected} for ${label}`, () => {
      expect(isCrowdinArticleDirectory(input as any)).toBe(expected)
    })
  }
})

describe('isCrowdinCollectionDirectory', () => {
  for (const { input, expected, label } of [...primitiveCases, ...crowdinDirectoryCases]) {
    it(`returns ${expected} for ${label}`, () => {
      expect(isCrowdinCollectionDirectory(input as any)).toBe(expected)
    })
  }
})
