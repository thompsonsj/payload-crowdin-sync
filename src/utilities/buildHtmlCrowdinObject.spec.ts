import { Field } from "payload/types"
import { buildCrowdinHtmlObject } from "."

describe("Function: buildCrowdinHtmlObject", () => {
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
      },
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
        }
      ],
    }
    expect(buildCrowdinHtmlObject({ doc, fields })).toEqual(expected)
  })
})
