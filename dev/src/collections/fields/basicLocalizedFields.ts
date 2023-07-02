import { Field } from "payload/types"

export const basicLocalizedFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    localized: true,
  },
  {
    name: 'content',
    type: 'richText',
    localized: true,
  },
  {
    name: 'metaDescription',
    type: 'textarea',
  }
]
