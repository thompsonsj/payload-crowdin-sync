import { describe, expect, it } from 'vitest'
import { buildDocumentTabFields } from './documentTabFields'

describe('buildDocumentTabFields', () => {
  it('returns no fields when there are no synced collections or globals', () => {
    expect(buildDocumentTabFields([], [])).toEqual([])
  })

  it('returns a collectionDocument relationship to the synced collections', () => {
    expect(buildDocumentTabFields(['posts', 'policies'], [])).toEqual([
      {
        name: 'collectionDocument',
        type: 'relationship',
        relationTo: ['posts', 'policies'],
        hasMany: false,
      },
    ])
  })

  it('returns a globalSlug select for the synced globals', () => {
    expect(buildDocumentTabFields([], ['nav', 'footer'])).toEqual([
      {
        name: 'globalSlug',
        type: 'select',
        options: ['nav', 'footer'],
        hasMany: false,
      },
    ])
  })

  it('returns collectionDocument before globalSlug when both are synced', () => {
    const fields = buildDocumentTabFields(['posts'], ['nav'])

    expect(fields.map((field) => ('name' in field ? field.name : undefined))).toEqual([
      'collectionDocument',
      'globalSlug',
    ])
  })
})
