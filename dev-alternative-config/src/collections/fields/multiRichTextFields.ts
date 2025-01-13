import type { RichTextField } from "payload";

export const multiRichTextFields: RichTextField[] = Array(11).fill({}).map((item, index) => ({
  name: `field_${index}`,
  type: 'richText',
  localized: true,
}))
