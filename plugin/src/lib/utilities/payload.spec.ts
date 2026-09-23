import { describe, expect, it } from 'vitest'
import { getRelationshipId, isPopulatedRelationship } from './payload'
import type { CrowdinArticleDirectory } from '../payload-types'

const doc = { id: 'abc' } as CrowdinArticleDirectory

describe('isPopulatedRelationship', () => {
  it('returns true for a populated document with a string id', () => {
    expect(isPopulatedRelationship(doc)).toBe(true)
  })

  it('returns true for a populated document with a numeric id (SQL adapters)', () => {
    expect(isPopulatedRelationship({ id: 42 })).toBe(true)
  })

  it.each([
    ['a string id (MongoDB)', 'abc'],
    ['an empty string', ''],
    ['a numeric id (SQL adapters)', 42],
    ['zero', 0],
    ['undefined', undefined],
    ['null', null],
  ] as const)('returns false for %s', (_label, val) => {
    expect(isPopulatedRelationship(val)).toBe(false)
  })
})

describe('getRelationshipId', () => {
  it('returns the id of a populated document', () => {
    expect(getRelationshipId(doc)).toBe('abc')
  })

  it('returns an unpopulated id as-is', () => {
    expect(getRelationshipId('abc')).toBe('abc')
  })

  it.each([
    ['undefined', undefined],
    ['null', null],
  ] as const)('returns undefined for %s', (_label, val) => {
    expect(getRelationshipId(val)).toBeUndefined()
  })
})
