import { describe, expect, it } from 'vitest'
import { isCrowdinArticleDirectory, isCrowdinCollectionDirectory } from './types'
import { isPopulatedRelationship } from './utilities/payload'
import type { CrowdinArticleDirectory, CrowdinCollectionDirectory } from './payload-types'

const articleDirectory = { id: 'abc' } as CrowdinArticleDirectory
const collectionDirectory = { id: 'def' } as CrowdinCollectionDirectory

const cases = [
  ['a populated relationship', articleDirectory],
  ['a string id', 'abc'],
  ['an empty string', ''],
  ['a numeric id', 42],
  ['undefined', undefined],
  ['null', null],
] as const

describe('isCrowdinArticleDirectory', () => {
  it('returns true for a populated relationship', () => {
    expect(isCrowdinArticleDirectory(articleDirectory)).toBe(true)
  })

  it.each([
    ['a string id', 'abc'],
    ['a numeric id', 42],
    ['undefined', undefined],
    ['null', null],
  ] as const)('returns false for %s', (_label, val) => {
    expect(isCrowdinArticleDirectory(val)).toBe(false)
  })

  it.each(cases)('agrees with isPopulatedRelationship for %s', (_label, val) => {
    expect(isCrowdinArticleDirectory(val)).toBe(isPopulatedRelationship(val))
  })
})

describe('isCrowdinCollectionDirectory', () => {
  it('returns true for a populated relationship', () => {
    expect(isCrowdinCollectionDirectory(collectionDirectory)).toBe(true)
  })

  it.each([
    ['a string id', 'def'],
    ['a numeric id', 42],
    ['undefined', undefined],
    ['null', null],
  ] as const)('returns false for %s', (_label, val) => {
    expect(isCrowdinCollectionDirectory(val)).toBe(false)
  })

  it.each(cases)('agrees with isPopulatedRelationship for %s', (_label, val) => {
    expect(isCrowdinCollectionDirectory(val as CrowdinCollectionDirectory)).toBe(
      isPopulatedRelationship(val),
    )
  })
})
