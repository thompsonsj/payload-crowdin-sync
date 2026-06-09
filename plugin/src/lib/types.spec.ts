import { describe, expect, it } from 'vitest'
import { isCrowdinArticleDirectory, isCrowdinCollectionDirectory } from './types'
import { isNotString } from './utilities/payload'

// These tests pin the shared behaviour of the three type guards. After the
// refactor isCrowdinArticleDirectory and isCrowdinCollectionDirectory delegate
// to isNotString; the tests ensure none of the three diverge.

const cases = [
  { input: undefined,             expected: false, label: 'undefined' },
  { input: null,                  expected: false, label: 'null' },
  { input: '',                    expected: false, label: 'empty string' },
  { input: 'some-id',             expected: false, label: 'non-empty string' },
  { input: { id: 'abc' },        expected: true,  label: 'object with id' },
  { input: { id: 'abc', name: 'x' }, expected: true, label: 'object with id and name' },
]

describe('isNotString', () => {
  for (const { input, expected, label } of cases) {
    it(`returns ${expected} for ${label}`, () => {
      expect(isNotString(input as any)).toBe(expected)
    })
  }
})

describe('isCrowdinArticleDirectory', () => {
  for (const { input, expected, label } of cases) {
    it(`returns ${expected} for ${label}`, () => {
      expect(isCrowdinArticleDirectory(input as any)).toBe(expected)
    })
  }

  it('matches isNotString for every test case', () => {
    for (const { input } of cases) {
      expect(isCrowdinArticleDirectory(input as any)).toBe(isNotString(input as any))
    }
  })
})

describe('isCrowdinCollectionDirectory', () => {
  for (const { input, expected, label } of cases) {
    it(`returns ${expected} for ${label}`, () => {
      expect(isCrowdinCollectionDirectory(input as any)).toBe(expected)
    })
  }

  it('matches isNotString for every test case', () => {
    for (const { input } of cases) {
      expect(isCrowdinCollectionDirectory(input as any)).toBe(isNotString(input as any))
    }
  })
})
