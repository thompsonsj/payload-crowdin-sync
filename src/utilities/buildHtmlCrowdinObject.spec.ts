import { CollectionConfig, Field, GlobalConfig } from "payload/types"
import { buildCrowdinHtmlObject, getLocalizedFields } from "."

describe("fn: buildCrowdinHtmlObject", () => {
  it ("does not include undefined localized fields", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const fields: Field[] = [
      {
        name: 'title',
        type: 'richText',
        localized: true,
      },
      {
        name: 'anotherString',
        type: 'text',
        localized: true,
      }
    ]
    const expected = {
      title: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
    }
    expect(buildCrowdinHtmlObject({doc, fields})).toEqual(expected)
  })

  it ("includes localized fields", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      content: [
        {
          "type": "p",
          "children": [
            {
                "text": "A simple paragraph."
            },
          ]
        }
      ],
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const fields: Field[] = [
      {
        name: 'title',
        type: 'richText',
        localized: true,
      },
      {
        name: 'content',
        type: 'richText',
        localized: true,
      }
    ]
    const expected = {
      title: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      content: [
        {
          "type": "p",
          "children": [
            {
                "text": "A simple paragraph."
            },
          ]
        }
      ],
    }
    expect(buildCrowdinHtmlObject({doc, fields})).toEqual(expected)
  })

  it ("includes localized fields nested in a group", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      groupField: {
        title: [
          {
            "type": "h1",
            "children": [
              {
                  "text": "A "
              },
              {
                  "text": "test",
                  "bold": true
              },
              {
                  "text": " rich text value"
              }
            ]
          }
        ],
        content: [
          {
            "type": "p",
            "children": [
              {
                  "text": "A simple paragraph."
              },
            ]
          }
        ],
        select: "one"
      },
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const fields: Field[] = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      // select not supported yet
      {
        name: 'select',
        type: 'select',
        localized: true,
        options: [
          'one',
          'two'
        ]
      },
      {
        name: 'groupField',
        type: 'group',
        fields: [
          {
            admin: {
             elements: [
               "link",
             ],
             leaves: [
               "bold",
               "italic",
               "underline",
             ],
            },
            name: 'title',
            type: 'richText',
            localized: true,
          },
          {
            name: 'content',
            type: 'richText',
            localized: true,
          },
          // select not supported yet
          {
            name: 'select',
            type: 'select',
            localized: true,
            options: [
              'one',
              'two'
            ]
          },
        ]
      },
    ]
    const expected = {
      ['groupField.title']: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      ['groupField.content']: [
        {
          "type": "p",
          "children": [
            {
                "text": "A simple paragraph."
            },
          ]
        }
      ],
    }
    expect(buildCrowdinHtmlObject({doc, fields})).toEqual(expected)
  })

  it ("includes localized fields nested in a group with a localization setting on the group field", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      groupField: {
        title: [
          {
            "type": "h1",
            "children": [
              {
                  "text": "A "
              },
              {
                  "text": "test",
                  "bold": true
              },
              {
                  "text": " rich text value"
              }
            ]
          }
        ],
        content: [
          {
            "type": "p",
            "children": [
              {
                  "text": "A simple paragraph."
              },
            ]
          }
        ],
        select: "one"
      },
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const fields: Field[] = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      // select not supported yet
      {
        name: 'select',
        type: 'select',
        localized: true,
        options: [
          'one',
          'two'
        ]
      },
      {
        name: 'groupField',
        type: 'group',
        localized: true,
        fields: [
          {
            admin: {
             elements: [
               "link",
             ],
             leaves: [
               "bold",
               "italic",
               "underline",
             ],
            },
            name: 'title',
            type: 'richText',
          },
          {
            name: 'content',
            type: 'richText',
          },
          // select not supported yet
          {
            name: 'select',
            type: 'select',
            options: [
              'one',
              'two'
            ]
          },
        ]
      },
    ]
    const expected = {
      ['groupField.title']: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      ['groupField.content']: [
        {
          "type": "p",
          "children": [
            {
                "text": "A simple paragraph."
            },
          ]
        }
      ],
    }
    expect(buildCrowdinHtmlObject({doc, fields})).toEqual(expected)
  })

  it ("includes localized fields nested in an array", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      arrayField: [
        {
          title: [
            {
              "type": "h1",
              "children": [
                {
                    "text": "A "
                },
                {
                    "text": "test",
                    "bold": true
                },
                {
                    "text": " rich text value"
                }
              ]
            }
          ],
          content: [
            {
              "type": "p",
              "children": [
                {
                    "text": "A simple paragraph in the first array item."
                },
              ]
            }
          ],
          select: "two",
          id: "64735620230d57bce946d370"
        },
        {
          title: [
            {
              "type": "h1",
              "children": [
                {
                    "text": "A "
                },
                {
                    "text": "test",
                    "bold": true
                },
                {
                    "text": " rich text value"
                }
              ]
            }
          ],
          content: [
            {
              "type": "p",
              "children": [
                {
                    "text": "A simple paragraph in the second array item."
                },
              ]
            }
          ],
          select: "two",
          id: "64735621230d57bce946d371"
        }
      ],
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const fields: Field[] = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      // select not supported yet
      {
        name: 'select',
        type: 'select',
        localized: true,
        options: [
          'one',
          'two'
        ]
      },
      {
        name: 'arrayField',
        type: 'array',
        fields: [
          {
            name: 'title',
            type: 'richText',
            localized: true,
          },
          {
            name: 'content',
            type: 'richText',
            localized: true,
          },
          {
            name: 'select',
            type: 'select',
            localized: true,
            options: [
              'one',
              'two'
            ]
          },
        ]
      },
    ]
    const expected = {
      ['arrayField[0].title']: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      ['arrayField[0].content']: [
        {
          "type": "p",
          "children": [
            {
                "text": "A simple paragraph in the first array item."
            },
          ]
        }
      ],
      ['arrayField[1].title']: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      ['arrayField[1].content']: [
        {
          "type": "p",
          "children": [
            {
                "text": "A simple paragraph in the second array item."
            },
          ]
        }
      ],
    }
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected)
  })

  it ("includes localized fields nested in an array with a localization setting on the array field", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      arrayField: [
        {
          title: [
            {
              "type": "h1",
              "children": [
                {
                    "text": "A "
                },
                {
                    "text": "test",
                    "bold": true
                },
                {
                    "text": " rich text value"
                }
              ]
            }
          ],
          content: [
            {
              "type": "p",
              "children": [
                {
                    "text": "A simple paragraph in the first array item."
                },
              ]
            }
          ],
          select: "two",
          id: "64735620230d57bce946d370"
        },
        {
          title: [
            {
              "type": "h1",
              "children": [
                {
                    "text": "A "
                },
                {
                    "text": "test",
                    "bold": true
                },
                {
                    "text": " rich text value"
                }
              ]
            }
          ],
          content: [
            {
              "type": "p",
              "children": [
                {
                    "text": "A simple paragraph in the second array item."
                },
              ]
            }
          ],
          select: "two",
          id: "64735621230d57bce946d371"
        }
      ],
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const fields: Field[] = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      // select not supported yet
      {
        name: 'select',
        type: 'select',
        localized: true,
        options: [
          'one',
          'two'
        ]
      },
      {
        name: 'arrayField',
        type: 'array',
        localized: true,
        fields: [
          {
            name: 'title',
            type: 'richText',
          },
          {
            name: 'content',
            type: 'richText',
          },
          {
            name: 'select',
            type: 'select',
            options: [
              'one',
              'two'
            ]
          },
        ]
      },
    ]
    const expected = {
      ['arrayField[0].title']: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      ['arrayField[0].content']: [
        {
          "type": "p",
          "children": [
            {
                "text": "A simple paragraph in the first array item."
            },
          ]
        }
      ],
      ['arrayField[1].title']: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      ['arrayField[1].content']: [
        {
          "type": "p",
          "children": [
            {
                "text": "A simple paragraph in the second array item."
            },
          ]
        }
      ],
    }
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected)
  })

  it ("includes localized fields within a collapsible field", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      arrayField: [
        {
          title: [
            {
              "type": "h1",
              "children": [
                {
                    "text": "A "
                },
                {
                    "text": "test",
                    "bold": true
                },
                {
                    "text": " rich text value"
                }
              ]
            }
          ],
          content: [
            {
              "type": "p",
              "children": [
                {
                    "text": "A simple paragraph in the first array item."
                },
              ]
            }
          ],
          select: "two",
          id: "64735620230d57bce946d370"
        },
        {
          title: [
            {
              "type": "h1",
              "children": [
                {
                    "text": "A "
                },
                {
                    "text": "test",
                    "bold": true
                },
                {
                    "text": " rich text value"
                }
              ]
            }
          ],
          content: [
            {
              "type": "p",
              "children": [
                {
                    "text": "A simple paragraph in the second array item."
                },
              ]
            }
          ],
          select: "two",
          id: "64735621230d57bce946d371"
        }
      ],
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const fields: Field[] = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      // select not supported yet
      {
        name: 'select',
        type: 'select',
        localized: true,
        options: [
          'one',
          'two'
        ]
      },
      {
        label: "Array fields",
        type: "collapsible",
        fields: [{
          name: 'arrayField',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'richText',
              localized: true,
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
            },
            {
              name: 'select',
              type: 'select',
              localized: true,
              options: [
                'one',
                'two'
              ]
            },
          ]
        }],
      },
    ]
    const expected = {
      ['arrayField[0].title']: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      ['arrayField[0].content']: [
        {
          "type": "p",
          "children": [
            {
                "text": "A simple paragraph in the first array item."
            },
          ]
        }
      ],
      ['arrayField[1].title']: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      ['arrayField[1].content']: [
        {
          "type": "p",
          "children": [
            {
                "text": "A simple paragraph in the second array item."
            },
          ]
        }
      ],
    }
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected)
  })

  it ("includes localized fields within a collapsible field with a localization setting on the array field", () => {
    const doc = {
      id: '638641358b1a140462752076',
      title: 'Test Policy created with title',
      arrayField: [
        {
          title: [
            {
              "type": "h1",
              "children": [
                {
                    "text": "A "
                },
                {
                    "text": "test",
                    "bold": true
                },
                {
                    "text": " rich text value"
                }
              ]
            }
          ],
          content: [
            {
              "type": "p",
              "children": [
                {
                    "text": "A simple paragraph in the first array item."
                },
              ]
            }
          ],
          select: "two",
          id: "64735620230d57bce946d370"
        },
        {
          title: [
            {
              "type": "h1",
              "children": [
                {
                    "text": "A "
                },
                {
                    "text": "test",
                    "bold": true
                },
                {
                    "text": " rich text value"
                }
              ]
            }
          ],
          content: [
            {
              "type": "p",
              "children": [
                {
                    "text": "A simple paragraph in the second array item."
                },
              ]
            }
          ],
          select: "two",
          id: "64735621230d57bce946d371"
        }
      ],
      status: 'draft',
      createdAt: '2022-11-29T17:28:21.644Z',
      updatedAt: '2022-11-29T17:28:21.644Z'
    }
    const fields: Field[] = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      // select not supported yet
      {
        name: 'select',
        type: 'select',
        localized: true,
        options: [
          'one',
          'two'
        ]
      },
      {
        label: "Array fields",
        type: "collapsible",
        fields: [{
          name: 'arrayField',
          type: 'array',
          localized: true,
          fields: [
            {
              name: 'title',
              type: 'richText',
            },
            {
              name: 'content',
              type: 'richText',
            },
            {
              name: 'select',
              type: 'select',
              options: [
                'one',
                'two'
              ]
            },
          ]
        }],
      },
    ]
    const expected = {
      ['arrayField[0].title']: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      ['arrayField[0].content']: [
        {
          "type": "p",
          "children": [
            {
                "text": "A simple paragraph in the first array item."
            },
          ]
        }
      ],
      ['arrayField[1].title']: [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
      ['arrayField[1].content']: [
        {
          "type": "p",
          "children": [
            {
                "text": "A simple paragraph in the second array item."
            },
          ]
        }
      ],
    }
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected)
  })
})

describe("fn: buildCrowdinHtmlObject - group nested in array", () => {
  const doc = {
    "id": "6474a81bef389b66642035ff",
    "title": [
      {
        "type": "h1",
        "children": [
          {
              "text": "A "
          },
          {
              "text": "test",
              "bold": true
          },
          {
              "text": " rich text value"
          }
        ]
      }
    ],
    "ctas": [
        {
          "link": {
              "text": [
                {
                  "type": "p",
                  "children": [
                    {
                        "text": "Link rich text."
                    },
                  ]
                }
              ],
              "href": "#",
              "type": "ctaPrimary"
          },
          "id": "6474a80221baea4f5f169757"
        },
        {
            "link": {
                "text": [
                  {
                    "type": "p",
                    "children": [
                      {
                          "text": "Second link rich text."
                      },
                    ]
                  }
                ],
                "href": "#",
                "type": "ctaSecondary"
            },
            "id": "6474a81021baea4f5f169758"
        }
    ],
    "createdAt": "2023-05-29T13:26:51.734Z",
    "updatedAt": "2023-05-29T14:47:45.957Z",
    "crowdinArticleDirectory": {
        "id": "6474baaf73b854f4d464e38f",
        "updatedAt": "2023-05-29T14:46:07.000Z",
        "createdAt": "2023-05-29T14:46:07.000Z",
        "name": "6474a81bef389b66642035ff",
        "crowdinCollectionDirectory": {
            "id": "6474baaf73b854f4d464e38d",
            "updatedAt": "2023-05-29T14:46:07.000Z",
            "createdAt": "2023-05-29T14:46:07.000Z",
            "name": "promos",
            "title": "Promos",
            "collectionSlug": "promos",
            "originalId": 1633,
            "projectId": 323731,
            "directoryId": 1169
        },
        "originalId": 1635,
        "projectId": 323731,
        "directoryId": 1633
    }
  }
  const linkField: Field = {
    name: 'link',
    type: 'group',
    fields: [
      {
        name: 'text',
        type: 'richText',
        localized: true,
      },
      {
        name: 'href',
        type: 'text'
      },
      {
        name: 'type',
        type: 'select',
        options: [
          'ctaPrimary',
          'ctaSecondary'
        ]
      }
    ]
  }
  const Promos: CollectionConfig = {
    slug: 'promos',
    admin: {
      defaultColumns: ['title', 'updatedAt'],
      useAsTitle: 'title',
      group: "Shared",
    },
    access: {
      read: () => true,
    },
    fields: [
      {
        name: 'title',
        type: 'richText',
        localized: true,
      },
      {
        name: 'text',
        type: 'text',
        localized: true,
      },
      {
        name: 'ctas',
        type: 'array',
        minRows: 1,
        maxRows: 2,
        fields: [
          linkField,
        ]
      }
    ]
  }

  const expected: any = {
    ['ctas[0].link.text']: [
      {
        "type": "p",
        "children": [
          {
              "text": "Link rich text."
          },
        ]
      }
    ],
    ['ctas[1].link.text']: [
      {
        "type": "p",
        "children": [
          {
              "text": "Second link rich text."
          },
        ]
      }
    ],
    "title": [
      {
        "type": "h1",
        "children": [
          {
              "text": "A "
          },
          {
              "text": "test",
              "bold": true
          },
          {
              "text": " rich text value"
          }
        ]
      }
    ],
  }

  it('includes group json fields nested inside of array field items', () => {
    expect(buildCrowdinHtmlObject({doc, fields: Promos.fields})).toEqual(expected)
  })

  it('can work with an empty group field in an array', () => {
    expect(buildCrowdinHtmlObject({
      doc: {
        ...doc,
        ctas: [
          {},
          {}
        ],
      },
      fields: Promos.fields
    })).toEqual({
      "title": [
        {
          "type": "h1",
          "children": [
            {
                "text": "A "
            },
            {
                "text": "test",
                "bold": true
            },
            {
                "text": " rich text value"
            }
          ]
        }
      ],
    })
  })
})
