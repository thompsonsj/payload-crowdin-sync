/**
 * Home global
 *
 * Test nested fields with nested localized props.
 */

import type { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Navigation Cards 1',
          description: 'Product feature navigation cards.',
          fields: [
            {
              label: 'Collapsible',
              type: 'collapsible',
              fields: [
                {
                  name: 'parentGroup',
                  type: 'group',
                  localized: true,
                  fields: [
                    {
                      name: 'preTitle',
                      type: 'text',
                    },
                    {
                      name: 'title',
                      type: 'text',
                    },
                    {
                      name: 'subGroupOne',
                      type: 'group',
                      fields: [
                        {
                          name: 'title',
                          type: 'text',
                        },
                        {
                          name: 'text',
                          type: 'text',
                        },
                        {
                          name: 'ctaText',
                          type: 'text',
                        },
                        {
                          name: 'image',
                          type: 'upload',
                          relationTo: 'media',
                        },
                      ],
                    },
                    {
                      name: 'subGroupTwo',
                      type: 'group',
                      localized: true,
                      fields: [
                        {
                          name: 'title',
                          type: 'text',
                        },
                        {
                          name: 'text',
                          type: 'text',
                        },
                        {
                          name: 'ctaText',
                          type: 'text',
                        },
                        {
                          name: 'image',
                          type: 'upload',
                          relationTo: 'media',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
