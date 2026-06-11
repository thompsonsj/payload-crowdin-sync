import { describe, expect, it } from 'vitest'
import { buildDocumentTabFields } from './documentTabFields'

describe('buildDocumentTabFields', () => {
  describe('empty inputs', () => {
    it('returns an empty array when both slug lists are empty', () => {
      expect(buildDocumentTabFields([], [])).toEqual([])
    })

    it('returns an empty array when both slug lists are undefined-coerced empty', () => {
      expect(buildDocumentTabFields([], [])).toHaveLength(0)
    })
  })

  describe('collectionDocument field', () => {
    it('is included when syncedCollectionSlugs is non-empty', () => {
      const fields = buildDocumentTabFields(['posts'], [])
      const field = fields.find((f: any) => f.name === 'collectionDocument')
      expect(field).toBeDefined()
    })

    it('is absent when syncedCollectionSlugs is empty', () => {
      const fields = buildDocumentTabFields([], ['nav'])
      const field = fields.find((f: any) => f.name === 'collectionDocument')
      expect(field).toBeUndefined()
    })

    it('has type "relationship"', () => {
      const fields = buildDocumentTabFields(['posts'], [])
      const field = fields.find((f: any) => f.name === 'collectionDocument') as any
      expect(field.type).toBe('relationship')
    })

    it('sets relationTo to the provided slugs', () => {
      const fields = buildDocumentTabFields(['posts', 'pages'], [])
      const field = fields.find((f: any) => f.name === 'collectionDocument') as any
      expect(field.relationTo).toEqual(['posts', 'pages'])
    })

    it('has hasMany: false', () => {
      const fields = buildDocumentTabFields(['posts'], [])
      const field = fields.find((f: any) => f.name === 'collectionDocument') as any
      expect(field.hasMany).toBe(false)
    })
  })

  describe('globalSlug field', () => {
    it('is included when syncedGlobalSlugs is non-empty', () => {
      const fields = buildDocumentTabFields([], ['nav'])
      const field = fields.find((f: any) => f.name === 'globalSlug')
      expect(field).toBeDefined()
    })

    it('is absent when syncedGlobalSlugs is empty', () => {
      const fields = buildDocumentTabFields(['posts'], [])
      const field = fields.find((f: any) => f.name === 'globalSlug')
      expect(field).toBeUndefined()
    })

    it('has type "select"', () => {
      const fields = buildDocumentTabFields([], ['nav'])
      const field = fields.find((f: any) => f.name === 'globalSlug') as any
      expect(field.type).toBe('select')
    })

    it('sets options to the provided slugs', () => {
      const fields = buildDocumentTabFields([], ['nav', 'footer'])
      const field = fields.find((f: any) => f.name === 'globalSlug') as any
      expect(field.options).toEqual(['nav', 'footer'])
    })

    it('has hasMany: false', () => {
      const fields = buildDocumentTabFields([], ['nav'])
      const field = fields.find((f: any) => f.name === 'globalSlug') as any
      expect(field.hasMany).toBe(false)
    })
  })

  describe('combined', () => {
    it('returns both fields when both slug lists are non-empty', () => {
      const fields = buildDocumentTabFields(['posts'], ['nav'])
      const names = fields.map((f: any) => f.name)
      expect(names).toContain('collectionDocument')
      expect(names).toContain('globalSlug')
    })

    it('collectionDocument appears before globalSlug', () => {
      const fields = buildDocumentTabFields(['posts'], ['nav'])
      const names = fields.map((f: any) => f.name)
      expect(names.indexOf('collectionDocument')).toBeLessThan(names.indexOf('globalSlug'))
    })

    it('returns exactly two fields when both are present', () => {
      const fields = buildDocumentTabFields(['posts'], ['nav'])
      expect(fields).toHaveLength(2)
    })
  })
})
