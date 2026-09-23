import { describe, expect, it } from 'vitest'
import { isCrowdinArticleDirectory, isCrowdinCollectionDirectory } from './types'
import { isNotString } from './utilities/payload'
import type { CrowdinArticleDirectory, CrowdinCollectionDirectory } from './payload-types'

const articleDirectory = { id: 'abc' } as CrowdinArticleDirectory
const collectionDirectory = { id: 'def' } as CrowdinCollectionDirectory

const cases = [
  ['a populated relationship', articleDirectory],
  ['an id string', 'abc'],
  ['an empty string', ''],
  ['undefined', undefined],
  ['null', null],
] as const

describe('isCrowdinArticleDirectory', () => {
  it('returns true for a populated relationship', () => {
    expect(isCrowdinArticleDirectory(articleDirectory)).toBe(true)
  })

  it.each([['an id string', 'abc'], ['undefined', undefined], ['null', null]] as const)(
    'returns false for %s',
    (_label, val) => {
      expect(isCrowdinArticleDirectory(val)).toBe(false)
    },
  )

  it.each(cases)('agrees with isNotString for %s', (_label, val) => {
    expect(isCrowdinArticleDirectory(val as CrowdinArticleDirectory)).toBe(isNotString(val))
  })
})

describe('isCrowdinCollectionDirectory', () => {
  it('returns true for a populated relationship', () => {
    expect(isCrowdinCollectionDirectory(collectionDirectory)).toBe(true)
  })

  it.each([['an id string', 'def'], ['undefined', undefined], ['null', null]] as const)(
    'returns false for %s',
    (_label, val) => {
      expect(isCrowdinCollectionDirectory(val)).toBe(false)
    },
  )

  it.each(cases)('agrees with isNotString for %s', (_label, val) => {
    expect(isCrowdinCollectionDirectory(val as CrowdinCollectionDirectory)).toBe(
      isNotString(val),
    )
  })
})
