import Policies from '../../collections/Policies';
import { Field } from 'payload/types';
import { getLocalizedFields } from 'plugin/src/lib/utilities';
import {
  getLexicalBlockFields,
  getLexicalEditorConfig,
  isLexical,
} from 'plugin/src/lib/utilities/lexical';
import { isRichTextField } from '../../../type-checkers';

const fields: Field[] = Policies.fields;

describe('payload-crowdin-sync: isLexical', () => {
  it('detects a lexical field', () => {
    const contentField = (fields || [])
      .filter(isRichTextField)
      .find((field) => field.name === 'content');

    expect(contentField && isLexical(contentField)).toBeTruthy();
  });
});

describe('payload-crowdin-sync: getLexicalBlockFields', () => {
  it('detects a lexical field', () => {
    const contentField = (fields || [])
      .filter(isRichTextField)
      .find((field) => field.name === 'content');

    const editorConfig = contentField && getLexicalEditorConfig(contentField);

    expect(editorConfig && getLexicalBlockFields(editorConfig))
      .toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "fields": [
              {
                "fields": [
                  {
                    "localized": true,
                    "name": "title",
                    "type": "text",
                  },
                  {
                    "localized": true,
                    "name": "preTitle",
                    "type": "text",
                  },
                ],
                "name": "heading",
                "type": "group",
              },
              {
                "admin": {
                  "isClearable": true,
                },
                "name": "color",
                "options": [
                  "gray",
                  "yellow",
                  "green",
                ],
                "type": "select",
              },
              {
                "editor": {
                  "LazyCellComponent": [Function],
                  "LazyFieldComponent": [Function],
                  "afterReadPromise": [Function],
                  "editorConfig": {
                    "features": {
                      "converters": {
                        "html": [
                          {
                            "converter": [Function],
                            "nodeTypes": [
                              "link",
                            ],
                          },
                          {
                            "converter": [Function],
                            "nodeTypes": [
                              "autolink",
                            ],
                          },
                        ],
                      },
                      "enabledFeatures": [
                        "link",
                        "bold",
                      ],
                      "floatingSelectToolbar": {
                        "sections": [
                          {
                            "entries": [
                              {
                                "ChildComponent": [Function],
                                "isActive": [Function],
                                "key": "bold",
                                "onClick": [Function],
                                "order": 1,
                              },
                            ],
                            "key": "format",
                            "order": 4,
                            "type": "buttons",
                          },
                          {
                            "entries": [
                              {
                                "ChildComponent": [Function],
                                "isActive": [Function],
                                "key": "link",
                                "label": "Link",
                                "onClick": [Function],
                                "order": 1,
                              },
                            ],
                            "key": "features",
                            "order": 5,
                            "type": "buttons",
                          },
                        ],
                      },
                      "hooks": {
                        "afterReadPromises": [],
                        "load": [],
                        "save": [],
                      },
                      "markdownTransformers": [
                        {
                          "format": [
                            "bold",
                          ],
                          "tag": "**",
                          "type": "text-format",
                        },
                        {
                          "format": [
                            "bold",
                          ],
                          "intraword": false,
                          "tag": "__",
                          "type": "text-format",
                        },
                      ],
                      "nodes": [
                        {
                          "converters": {
                            "html": {
                              "converter": [Function],
                              "nodeTypes": [
                                "link",
                              ],
                            },
                          },
                          "node": [Function],
                          "populationPromises": [
                            [Function],
                          ],
                          "type": "link",
                        },
                        {
                          "converters": {
                            "html": {
                              "converter": [Function],
                              "nodeTypes": [
                                "autolink",
                              ],
                            },
                          },
                          "node": [Function],
                          "populationPromises": [
                            [Function],
                          ],
                          "type": "autolink",
                        },
                      ],
                      "plugins": [
                        {
                          "Component": [Function],
                          "key": "link0",
                          "position": "normal",
                        },
                        {
                          "Component": [Function],
                          "key": "link1",
                          "position": "normal",
                        },
                        {
                          "Component": [Function],
                          "key": "link2",
                          "position": "normal",
                        },
                        {
                          "Component": [Function],
                          "key": "link3",
                          "position": "floatingAnchorElem",
                        },
                      ],
                      "populationPromises": Map {
                        "link" => [
                          [Function],
                        ],
                        "autolink" => [
                          [Function],
                        ],
                      },
                      "slashMenu": {
                        "dynamicOptions": [],
                        "groupsWithOptions": [],
                      },
                      "validations": Map {},
                    },
                    "lexical": [Function],
                    "resolvedFeatureMap": Map {
                      "link" => {
                        "dependencies": undefined,
                        "dependenciesPriority": undefined,
                        "dependenciesSoft": undefined,
                        "floatingSelectToolbar": {
                          "sections": [
                            {
                              "entries": [
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "link",
                                  "label": "Link",
                                  "onClick": [Function],
                                  "order": 1,
                                },
                              ],
                              "key": "features",
                              "order": 5,
                              "type": "buttons",
                            },
                          ],
                        },
                        "key": "link",
                        "nodes": [
                          {
                            "converters": {
                              "html": {
                                "converter": [Function],
                                "nodeTypes": [
                                  "link",
                                ],
                              },
                            },
                            "node": [Function],
                            "populationPromises": [
                              [Function],
                            ],
                            "type": "link",
                          },
                          {
                            "converters": {
                              "html": {
                                "converter": [Function],
                                "nodeTypes": [
                                  "autolink",
                                ],
                              },
                            },
                            "node": [Function],
                            "populationPromises": [
                              [Function],
                            ],
                            "type": "autolink",
                          },
                        ],
                        "plugins": [
                          {
                            "Component": [Function],
                            "position": "normal",
                          },
                          {
                            "Component": [Function],
                            "position": "normal",
                          },
                          {
                            "Component": [Function],
                            "position": "normal",
                          },
                          {
                            "Component": [Function],
                            "position": "floatingAnchorElem",
                          },
                        ],
                        "props": {},
                      },
                      "bold" => {
                        "dependencies": undefined,
                        "dependenciesPriority": undefined,
                        "dependenciesSoft": [
                          "italic",
                        ],
                        "floatingSelectToolbar": {
                          "sections": [
                            {
                              "entries": [
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "bold",
                                  "onClick": [Function],
                                  "order": 1,
                                },
                              ],
                              "key": "format",
                              "order": 4,
                              "type": "buttons",
                            },
                          ],
                        },
                        "key": "bold",
                        "markdownTransformers": [
                          {
                            "format": [
                              "bold",
                            ],
                            "tag": "**",
                            "type": "text-format",
                          },
                          {
                            "format": [
                              "bold",
                            ],
                            "intraword": false,
                            "tag": "__",
                            "type": "text-format",
                          },
                        ],
                        "props": null,
                      },
                    },
                  },
                  "outputSchema": [Function],
                  "populationPromise": [Function],
                  "validate": [Function],
                },
                "localized": false,
                "name": "content",
                "type": "richText",
              },
              {
                "admin": {
                  "disabled": true,
                },
                "hooks": {
                  "beforeChange": [
                    [Function],
                  ],
                },
                "label": "ID",
                "name": "id",
                "type": "text",
              },
              {
                "admin": {
                  "disabled": true,
                },
                "label": "Block Name",
                "name": "blockName",
                "required": false,
                "type": "text",
              },
            ],
            "imageAltText": "Text",
            "labels": {
              "plural": "Highlights",
              "singular": "Highlight",
            },
            "slug": "highlight",
          },
        ],
      }
    `);
  });
});

describe('payload-crowdin-sync: getLocalizedFields', () => {
  it('returns policies collection result as expected', () => {
    expect(getLocalizedFields({ fields })).toMatchInlineSnapshot(`
      [
        {
          "localized": true,
          "name": "title",
          "type": "text",
        },
        {
          "editor": {
            "LazyCellComponent": [Function],
            "LazyFieldComponent": [Function],
            "afterReadPromise": [Function],
            "editorConfig": {
              "features": {
                "converters": {
                  "html": [
                    {
                      "converter": [Function],
                      "nodeTypes": [
                        "heading",
                      ],
                    },
                    {
                      "converter": [Function],
                      "nodeTypes": [
                        "list",
                      ],
                    },
                    {
                      "converter": [Function],
                      "nodeTypes": [
                        "listitem",
                      ],
                    },
                    {
                      "converter": [Function],
                      "nodeTypes": [
                        "link",
                      ],
                    },
                    {
                      "converter": [Function],
                      "nodeTypes": [
                        "autolink",
                      ],
                    },
                    {
                      "converter": [Function],
                      "nodeTypes": [
                        "quote",
                      ],
                    },
                    {
                      "converter": [Function],
                      "nodeTypes": [
                        "upload",
                      ],
                    },
                  ],
                },
                "enabledFeatures": [
                  "blocks",
                  "slateToLexical",
                  "bold",
                  "italic",
                  "underline",
                  "strikethrough",
                  "subscript",
                  "superscript",
                  "inlineCode",
                  "paragraph",
                  "heading",
                  "align",
                  "indent",
                  "unorderedList",
                  "orderedList",
                  "checkList",
                  "link",
                  "relationship",
                  "blockquote",
                  "upload",
                ],
                "floatingSelectToolbar": {
                  "sections": [
                    {
                      "ChildComponent": [Function],
                      "entries": [
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "normal-text",
                          "label": "Normal Text",
                          "onClick": [Function],
                          "order": 1,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "h1",
                          "label": "Heading 1",
                          "onClick": [Function],
                          "order": 2,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "h2",
                          "label": "Heading 2",
                          "onClick": [Function],
                          "order": 3,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "h3",
                          "label": "Heading 3",
                          "onClick": [Function],
                          "order": 4,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "h4",
                          "label": "Heading 4",
                          "onClick": [Function],
                          "order": 5,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "h5",
                          "label": "Heading 5",
                          "onClick": [Function],
                          "order": 6,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "h6",
                          "label": "Heading 6",
                          "onClick": [Function],
                          "order": 7,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "orderedList",
                          "label": "Ordered List",
                          "onClick": [Function],
                          "order": 10,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "unorderedList",
                          "label": "Unordered List",
                          "onClick": [Function],
                          "order": 11,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "checkList",
                          "label": "Check List",
                          "onClick": [Function],
                          "order": 12,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "blockquote",
                          "label": "Blockquote",
                          "onClick": [Function],
                          "order": 20,
                        },
                      ],
                      "key": "dropdown-text",
                      "order": 1,
                      "type": "dropdown",
                    },
                    {
                      "ChildComponent": [Function],
                      "entries": [
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "align-left",
                          "label": "Align Left",
                          "onClick": [Function],
                          "order": 1,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "align-center",
                          "label": "Align Center",
                          "onClick": [Function],
                          "order": 2,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "align-right",
                          "label": "Align Right",
                          "onClick": [Function],
                          "order": 3,
                        },
                      ],
                      "key": "dropdown-align",
                      "order": 2,
                      "type": "dropdown",
                    },
                    {
                      "entries": [
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "isEnabled": [Function],
                          "key": "indent-decrease",
                          "label": "Decrease Indent",
                          "onClick": [Function],
                          "order": 1,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "indent-increase",
                          "label": "Increase Indent",
                          "onClick": [Function],
                          "order": 2,
                        },
                      ],
                      "key": "indent",
                      "order": 3,
                      "type": "buttons",
                    },
                    {
                      "entries": [
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "bold",
                          "onClick": [Function],
                          "order": 1,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "italic",
                          "onClick": [Function],
                          "order": 2,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "underline",
                          "onClick": [Function],
                          "order": 3,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "strikethrough",
                          "onClick": [Function],
                          "order": 4,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "subscript",
                          "onClick": [Function],
                          "order": 5,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "superscript",
                          "onClick": [Function],
                          "order": 6,
                        },
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "code",
                          "onClick": [Function],
                          "order": 7,
                        },
                      ],
                      "key": "format",
                      "order": 4,
                      "type": "buttons",
                    },
                    {
                      "entries": [
                        {
                          "ChildComponent": [Function],
                          "isActive": [Function],
                          "key": "link",
                          "label": "Link",
                          "onClick": [Function],
                          "order": 1,
                        },
                      ],
                      "key": "features",
                      "order": 5,
                      "type": "buttons",
                    },
                  ],
                },
                "hooks": {
                  "afterReadPromises": [],
                  "load": [
                    [Function],
                  ],
                  "save": [],
                },
                "markdownTransformers": [
                  {
                    "format": [
                      "bold",
                    ],
                    "tag": "**",
                    "type": "text-format",
                  },
                  {
                    "format": [
                      "bold",
                    ],
                    "intraword": false,
                    "tag": "__",
                    "type": "text-format",
                  },
                  {
                    "format": [
                      "bold",
                      "italic",
                    ],
                    "intraword": false,
                    "tag": "___",
                    "type": "text-format",
                  },
                  {
                    "format": [
                      "bold",
                      "italic",
                    ],
                    "tag": "***",
                    "type": "text-format",
                  },
                  {
                    "format": [
                      "italic",
                    ],
                    "tag": "*",
                    "type": "text-format",
                  },
                  {
                    "format": [
                      "italic",
                    ],
                    "intraword": false,
                    "tag": "_",
                    "type": "text-format",
                  },
                  {
                    "format": [
                      "strikethrough",
                    ],
                    "tag": "~~",
                    "type": "text-format",
                  },
                  {
                    "format": [
                      "code",
                    ],
                    "tag": "\`",
                    "type": "text-format",
                  },
                  {
                    "dependencies": [
                      [Function],
                    ],
                    "export": [Function],
                    "regExp": /\\^\\(#\\{1\\}\\|#\\{2\\}\\|#\\{3\\}\\|#\\{4\\}\\|#\\{5\\}\\|#\\{6\\}\\)\\\\s/,
                    "replace": [Function],
                    "type": "element",
                  },
                  {
                    "dependencies": [
                      [Function],
                      [Function],
                    ],
                    "export": [Function],
                    "regExp": /\\^\\(\\\\s\\*\\)\\[-\\*\\+\\]\\\\s/,
                    "replace": [Function],
                    "type": "element",
                  },
                  {
                    "dependencies": [
                      [Function],
                      [Function],
                    ],
                    "export": [Function],
                    "regExp": /\\^\\(\\\\s\\*\\)\\(\\\\d\\+\\)\\\\\\.\\\\s/,
                    "replace": [Function],
                    "type": "element",
                  },
                  {
                    "dependencies": [
                      [Function],
                      [Function],
                    ],
                    "export": [Function],
                    "regExp": /\\^\\(\\\\s\\*\\)\\(\\?:-\\\\s\\)\\?\\\\s\\?\\(\\\\\\[\\(\\\\s\\|x\\)\\?\\\\\\]\\)\\\\s/i,
                    "replace": [Function],
                    "type": "element",
                  },
                  {
                    "dependencies": [
                      [Function],
                    ],
                    "export": [Function],
                    "regExp": /\\^>\\\\s/,
                    "replace": [Function],
                    "type": "element",
                  },
                ],
                "nodes": [
                  {
                    "node": [Function],
                    "populationPromises": [
                      [Function],
                    ],
                    "type": "block",
                    "validations": [
                      [Function],
                    ],
                  },
                  {
                    "node": [Function],
                    "type": "unknownConverted",
                  },
                  {
                    "converters": {
                      "html": {
                        "converter": [Function],
                        "nodeTypes": [
                          "heading",
                        ],
                      },
                    },
                    "node": [Function],
                    "type": "heading",
                  },
                  {
                    "converters": {
                      "html": {
                        "converter": [Function],
                        "nodeTypes": [
                          "list",
                        ],
                      },
                    },
                    "node": [Function],
                    "type": "list",
                  },
                  {
                    "converters": {
                      "html": {
                        "converter": [Function],
                        "nodeTypes": [
                          "listitem",
                        ],
                      },
                    },
                    "node": [Function],
                    "type": "listitem",
                  },
                  {
                    "converters": {
                      "html": {
                        "converter": [Function],
                        "nodeTypes": [
                          "link",
                        ],
                      },
                    },
                    "node": [Function],
                    "populationPromises": [
                      [Function],
                    ],
                    "type": "link",
                  },
                  {
                    "converters": {
                      "html": {
                        "converter": [Function],
                        "nodeTypes": [
                          "autolink",
                        ],
                      },
                    },
                    "node": [Function],
                    "populationPromises": [
                      [Function],
                    ],
                    "type": "autolink",
                  },
                  {
                    "node": [Function],
                    "populationPromises": [
                      [Function],
                    ],
                    "type": "relationship",
                  },
                  {
                    "converters": {
                      "html": {
                        "converter": [Function],
                        "nodeTypes": [
                          "quote",
                        ],
                      },
                    },
                    "node": [Function],
                    "type": "quote",
                  },
                  {
                    "converters": {
                      "html": {
                        "converter": [Function],
                        "nodeTypes": [
                          "upload",
                        ],
                      },
                    },
                    "node": [Function],
                    "populationPromises": [
                      [Function],
                    ],
                    "type": "upload",
                    "validations": [
                      [Function],
                    ],
                  },
                ],
                "plugins": [
                  {
                    "Component": [Function],
                    "key": "blocks0",
                    "position": "normal",
                  },
                  {
                    "Component": [Function],
                    "key": "indent0",
                    "position": "normal",
                  },
                  {
                    "Component": [Function],
                    "key": "unorderedList0",
                    "position": "normal",
                  },
                  {
                    "Component": [Function],
                    "key": "checkList0",
                    "position": "normal",
                  },
                  {
                    "Component": [Function],
                    "key": "link0",
                    "position": "normal",
                  },
                  {
                    "Component": [Function],
                    "key": "link1",
                    "position": "normal",
                  },
                  {
                    "Component": [Function],
                    "key": "link2",
                    "position": "normal",
                  },
                  {
                    "Component": [Function],
                    "key": "link3",
                    "position": "floatingAnchorElem",
                  },
                  {
                    "Component": [Function],
                    "key": "relationship0",
                    "position": "normal",
                  },
                  {
                    "Component": [Function],
                    "key": "upload0",
                    "position": "normal",
                  },
                ],
                "populationPromises": Map {
                  "block" => [
                    [Function],
                  ],
                  "link" => [
                    [Function],
                  ],
                  "autolink" => [
                    [Function],
                  ],
                  "relationship" => [
                    [Function],
                  ],
                  "upload" => [
                    [Function],
                  ],
                },
                "slashMenu": {
                  "dynamicOptions": [],
                  "groupsWithOptions": [
                    {
                      "displayName": "Blocks",
                      "key": "blocks",
                      "options": [
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": [Function],
                          "key": "block-highlight",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "block",
                            "blocks",
                            "highlight",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                      ],
                    },
                    {
                      "displayName": "Lists",
                      "key": "lists",
                      "options": [
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Unordered List",
                          "key": "unorderedlist",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "unordered list",
                            "ul",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Ordered List",
                          "key": "orderedlist",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "ordered list",
                            "ol",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Check List",
                          "key": "checklist",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "check list",
                            "check",
                            "checklist",
                            "cl",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                      ],
                    },
                    {
                      "displayName": "Basic",
                      "key": "basic",
                      "options": [
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Paragraph",
                          "key": "paragraph",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "normal",
                            "paragraph",
                            "p",
                            "text",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Heading 1",
                          "key": "heading-1",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "heading",
                            "h1",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Heading 2",
                          "key": "heading-2",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "heading",
                            "h2",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Heading 3",
                          "key": "heading-3",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "heading",
                            "h3",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Heading 4",
                          "key": "heading-4",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "heading",
                            "h4",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Heading 5",
                          "key": "heading-5",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "heading",
                            "h5",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Heading 6",
                          "key": "heading-6",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "heading",
                            "h6",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Relationship",
                          "key": "relationship",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "relationship",
                            "relation",
                            "rel",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Blockquote",
                          "key": "blockquote",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "quote",
                            "blockquote",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                        SlashMenuOption {
                          "Icon": [Function],
                          "displayName": "Upload",
                          "key": "upload",
                          "keyboardShortcut": undefined,
                          "keywords": [
                            "upload",
                            "image",
                            "file",
                            "img",
                            "picture",
                            "photo",
                            "media",
                          ],
                          "onSelect": [Function],
                          "ref": {
                            "current": null,
                          },
                          "setRefElement": [Function],
                        },
                      ],
                    },
                  ],
                },
                "validations": Map {
                  "block" => [
                    [Function],
                  ],
                  "upload" => [
                    [Function],
                  ],
                },
              },
              "lexical": [Function],
              "resolvedFeatureMap": Map {
                "blocks" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "key": "blocks",
                  "nodes": [
                    {
                      "node": [Function],
                      "populationPromises": [
                        [Function],
                      ],
                      "type": "block",
                      "validations": [
                        [Function],
                      ],
                    },
                  ],
                  "plugins": [
                    {
                      "Component": [Function],
                      "position": "normal",
                    },
                  ],
                  "props": {
                    "blocks": [
                      {
                        "fields": [
                          {
                            "fields": [
                              {
                                "localized": true,
                                "name": "title",
                                "type": "text",
                              },
                              {
                                "localized": true,
                                "name": "preTitle",
                                "type": "text",
                              },
                            ],
                            "name": "heading",
                            "type": "group",
                          },
                          {
                            "admin": {
                              "isClearable": true,
                            },
                            "name": "color",
                            "options": [
                              "gray",
                              "yellow",
                              "green",
                            ],
                            "type": "select",
                          },
                          {
                            "editor": {
                              "LazyCellComponent": [Function],
                              "LazyFieldComponent": [Function],
                              "afterReadPromise": [Function],
                              "editorConfig": {
                                "features": {
                                  "converters": {
                                    "html": [
                                      {
                                        "converter": [Function],
                                        "nodeTypes": [
                                          "link",
                                        ],
                                      },
                                      {
                                        "converter": [Function],
                                        "nodeTypes": [
                                          "autolink",
                                        ],
                                      },
                                    ],
                                  },
                                  "enabledFeatures": [
                                    "link",
                                    "bold",
                                  ],
                                  "floatingSelectToolbar": {
                                    "sections": [
                                      {
                                        "entries": [
                                          {
                                            "ChildComponent": [Function],
                                            "isActive": [Function],
                                            "key": "bold",
                                            "onClick": [Function],
                                            "order": 1,
                                          },
                                        ],
                                        "key": "format",
                                        "order": 4,
                                        "type": "buttons",
                                      },
                                      {
                                        "entries": [
                                          {
                                            "ChildComponent": [Function],
                                            "isActive": [Function],
                                            "key": "link",
                                            "label": "Link",
                                            "onClick": [Function],
                                            "order": 1,
                                          },
                                        ],
                                        "key": "features",
                                        "order": 5,
                                        "type": "buttons",
                                      },
                                    ],
                                  },
                                  "hooks": {
                                    "afterReadPromises": [],
                                    "load": [],
                                    "save": [],
                                  },
                                  "markdownTransformers": [
                                    {
                                      "format": [
                                        "bold",
                                      ],
                                      "tag": "**",
                                      "type": "text-format",
                                    },
                                    {
                                      "format": [
                                        "bold",
                                      ],
                                      "intraword": false,
                                      "tag": "__",
                                      "type": "text-format",
                                    },
                                  ],
                                  "nodes": [
                                    {
                                      "converters": {
                                        "html": {
                                          "converter": [Function],
                                          "nodeTypes": [
                                            "link",
                                          ],
                                        },
                                      },
                                      "node": [Function],
                                      "populationPromises": [
                                        [Function],
                                      ],
                                      "type": "link",
                                    },
                                    {
                                      "converters": {
                                        "html": {
                                          "converter": [Function],
                                          "nodeTypes": [
                                            "autolink",
                                          ],
                                        },
                                      },
                                      "node": [Function],
                                      "populationPromises": [
                                        [Function],
                                      ],
                                      "type": "autolink",
                                    },
                                  ],
                                  "plugins": [
                                    {
                                      "Component": [Function],
                                      "key": "link0",
                                      "position": "normal",
                                    },
                                    {
                                      "Component": [Function],
                                      "key": "link1",
                                      "position": "normal",
                                    },
                                    {
                                      "Component": [Function],
                                      "key": "link2",
                                      "position": "normal",
                                    },
                                    {
                                      "Component": [Function],
                                      "key": "link3",
                                      "position": "floatingAnchorElem",
                                    },
                                  ],
                                  "populationPromises": Map {
                                    "link" => [
                                      [Function],
                                    ],
                                    "autolink" => [
                                      [Function],
                                    ],
                                  },
                                  "slashMenu": {
                                    "dynamicOptions": [],
                                    "groupsWithOptions": [],
                                  },
                                  "validations": Map {},
                                },
                                "lexical": [Function],
                                "resolvedFeatureMap": Map {
                                  "link" => {
                                    "dependencies": undefined,
                                    "dependenciesPriority": undefined,
                                    "dependenciesSoft": undefined,
                                    "floatingSelectToolbar": {
                                      "sections": [
                                        {
                                          "entries": [
                                            {
                                              "ChildComponent": [Function],
                                              "isActive": [Function],
                                              "key": "link",
                                              "label": "Link",
                                              "onClick": [Function],
                                              "order": 1,
                                            },
                                          ],
                                          "key": "features",
                                          "order": 5,
                                          "type": "buttons",
                                        },
                                      ],
                                    },
                                    "key": "link",
                                    "nodes": [
                                      {
                                        "converters": {
                                          "html": {
                                            "converter": [Function],
                                            "nodeTypes": [
                                              "link",
                                            ],
                                          },
                                        },
                                        "node": [Function],
                                        "populationPromises": [
                                          [Function],
                                        ],
                                        "type": "link",
                                      },
                                      {
                                        "converters": {
                                          "html": {
                                            "converter": [Function],
                                            "nodeTypes": [
                                              "autolink",
                                            ],
                                          },
                                        },
                                        "node": [Function],
                                        "populationPromises": [
                                          [Function],
                                        ],
                                        "type": "autolink",
                                      },
                                    ],
                                    "plugins": [
                                      {
                                        "Component": [Function],
                                        "position": "normal",
                                      },
                                      {
                                        "Component": [Function],
                                        "position": "normal",
                                      },
                                      {
                                        "Component": [Function],
                                        "position": "normal",
                                      },
                                      {
                                        "Component": [Function],
                                        "position": "floatingAnchorElem",
                                      },
                                    ],
                                    "props": {},
                                  },
                                  "bold" => {
                                    "dependencies": undefined,
                                    "dependenciesPriority": undefined,
                                    "dependenciesSoft": [
                                      "italic",
                                    ],
                                    "floatingSelectToolbar": {
                                      "sections": [
                                        {
                                          "entries": [
                                            {
                                              "ChildComponent": [Function],
                                              "isActive": [Function],
                                              "key": "bold",
                                              "onClick": [Function],
                                              "order": 1,
                                            },
                                          ],
                                          "key": "format",
                                          "order": 4,
                                          "type": "buttons",
                                        },
                                      ],
                                    },
                                    "key": "bold",
                                    "markdownTransformers": [
                                      {
                                        "format": [
                                          "bold",
                                        ],
                                        "tag": "**",
                                        "type": "text-format",
                                      },
                                      {
                                        "format": [
                                          "bold",
                                        ],
                                        "intraword": false,
                                        "tag": "__",
                                        "type": "text-format",
                                      },
                                    ],
                                    "props": null,
                                  },
                                },
                              },
                              "outputSchema": [Function],
                              "populationPromise": [Function],
                              "validate": [Function],
                            },
                            "localized": false,
                            "name": "content",
                            "type": "richText",
                          },
                          {
                            "admin": {
                              "disabled": true,
                            },
                            "hooks": {
                              "beforeChange": [
                                [Function],
                              ],
                            },
                            "label": "ID",
                            "name": "id",
                            "type": "text",
                          },
                          {
                            "admin": {
                              "disabled": true,
                            },
                            "label": "Block Name",
                            "name": "blockName",
                            "required": false,
                            "type": "text",
                          },
                        ],
                        "imageAltText": "Text",
                        "labels": {
                          "plural": "Highlights",
                          "singular": "Highlight",
                        },
                        "slug": "highlight",
                      },
                    ],
                  },
                  "slashMenu": {
                    "options": [
                      {
                        "displayName": "Blocks",
                        "key": "blocks",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": [Function],
                            "key": "block-highlight",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "block",
                              "blocks",
                              "highlight",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                    ],
                  },
                },
                "slateToLexical" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "hooks": {
                    "load": [Function],
                  },
                  "key": "slateToLexical",
                  "nodes": [
                    {
                      "node": [Function],
                      "type": "unknownConverted",
                    },
                  ],
                  "props": {
                    "converters": [
                      {
                        "converter": [Function],
                        "nodeTypes": [
                          "unknown",
                        ],
                      },
                      {
                        "converter": [Function],
                        "nodeTypes": [
                          "upload",
                        ],
                      },
                      {
                        "converter": [Function],
                        "nodeTypes": [
                          "ul",
                        ],
                      },
                      {
                        "converter": [Function],
                        "nodeTypes": [
                          "ol",
                        ],
                      },
                      {
                        "converter": [Function],
                        "nodeTypes": [
                          "relationship",
                        ],
                      },
                      {
                        "converter": [Function],
                        "nodeTypes": [
                          "li",
                        ],
                      },
                      {
                        "converter": [Function],
                        "nodeTypes": [
                          "link",
                        ],
                      },
                      {
                        "converter": [Function],
                        "nodeTypes": [
                          "blockquote",
                        ],
                      },
                      {
                        "converter": [Function],
                        "nodeTypes": [
                          "h1",
                          "h2",
                          "h3",
                          "h4",
                          "h5",
                          "h6",
                        ],
                      },
                      {
                        "converter": [Function],
                        "nodeTypes": [
                          "indent",
                        ],
                      },
                    ],
                  },
                },
                "bold" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": [
                    "italic",
                  ],
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "bold",
                            "onClick": [Function],
                            "order": 1,
                          },
                        ],
                        "key": "format",
                        "order": 4,
                        "type": "buttons",
                      },
                    ],
                  },
                  "key": "bold",
                  "markdownTransformers": [
                    {
                      "format": [
                        "bold",
                      ],
                      "tag": "**",
                      "type": "text-format",
                    },
                    {
                      "format": [
                        "bold",
                      ],
                      "intraword": false,
                      "tag": "__",
                      "type": "text-format",
                    },
                    {
                      "format": [
                        "bold",
                        "italic",
                      ],
                      "intraword": false,
                      "tag": "___",
                      "type": "text-format",
                    },
                    {
                      "format": [
                        "bold",
                        "italic",
                      ],
                      "tag": "***",
                      "type": "text-format",
                    },
                  ],
                  "props": null,
                },
                "italic" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "italic",
                            "onClick": [Function],
                            "order": 2,
                          },
                        ],
                        "key": "format",
                        "order": 4,
                        "type": "buttons",
                      },
                    ],
                  },
                  "key": "italic",
                  "markdownTransformers": [
                    {
                      "format": [
                        "italic",
                      ],
                      "tag": "*",
                      "type": "text-format",
                    },
                    {
                      "format": [
                        "italic",
                      ],
                      "intraword": false,
                      "tag": "_",
                      "type": "text-format",
                    },
                  ],
                  "props": null,
                },
                "underline" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "underline",
                            "onClick": [Function],
                            "order": 3,
                          },
                        ],
                        "key": "format",
                        "order": 4,
                        "type": "buttons",
                      },
                    ],
                  },
                  "key": "underline",
                  "props": null,
                },
                "strikethrough" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "strikethrough",
                            "onClick": [Function],
                            "order": 4,
                          },
                        ],
                        "key": "format",
                        "order": 4,
                        "type": "buttons",
                      },
                    ],
                  },
                  "key": "strikethrough",
                  "markdownTransformers": [
                    {
                      "format": [
                        "strikethrough",
                      ],
                      "tag": "~~",
                      "type": "text-format",
                    },
                  ],
                  "props": null,
                },
                "subscript" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "subscript",
                            "onClick": [Function],
                            "order": 5,
                          },
                        ],
                        "key": "format",
                        "order": 4,
                        "type": "buttons",
                      },
                    ],
                  },
                  "key": "subscript",
                  "props": null,
                },
                "superscript" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "superscript",
                            "onClick": [Function],
                            "order": 6,
                          },
                        ],
                        "key": "format",
                        "order": 4,
                        "type": "buttons",
                      },
                    ],
                  },
                  "key": "superscript",
                  "props": null,
                },
                "inlineCode" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "code",
                            "onClick": [Function],
                            "order": 7,
                          },
                        ],
                        "key": "format",
                        "order": 4,
                        "type": "buttons",
                      },
                    ],
                  },
                  "key": "inlineCode",
                  "markdownTransformers": [
                    {
                      "format": [
                        "code",
                      ],
                      "tag": "\`",
                      "type": "text-format",
                    },
                  ],
                  "props": null,
                },
                "paragraph" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "normal-text",
                            "label": "Normal Text",
                            "onClick": [Function],
                            "order": 1,
                          },
                        ],
                        "key": "dropdown-text",
                        "order": 1,
                        "type": "dropdown",
                      },
                    ],
                  },
                  "key": "paragraph",
                  "props": null,
                  "slashMenu": {
                    "options": [
                      {
                        "displayName": "Basic",
                        "key": "basic",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Paragraph",
                            "key": "paragraph",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "normal",
                              "paragraph",
                              "p",
                              "text",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                    ],
                  },
                },
                "heading" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "h1",
                            "label": "Heading 1",
                            "onClick": [Function],
                            "order": 2,
                          },
                        ],
                        "key": "dropdown-text",
                        "order": 1,
                        "type": "dropdown",
                      },
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "h2",
                            "label": "Heading 2",
                            "onClick": [Function],
                            "order": 3,
                          },
                        ],
                        "key": "dropdown-text",
                        "order": 1,
                        "type": "dropdown",
                      },
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "h3",
                            "label": "Heading 3",
                            "onClick": [Function],
                            "order": 4,
                          },
                        ],
                        "key": "dropdown-text",
                        "order": 1,
                        "type": "dropdown",
                      },
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "h4",
                            "label": "Heading 4",
                            "onClick": [Function],
                            "order": 5,
                          },
                        ],
                        "key": "dropdown-text",
                        "order": 1,
                        "type": "dropdown",
                      },
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "h5",
                            "label": "Heading 5",
                            "onClick": [Function],
                            "order": 6,
                          },
                        ],
                        "key": "dropdown-text",
                        "order": 1,
                        "type": "dropdown",
                      },
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "h6",
                            "label": "Heading 6",
                            "onClick": [Function],
                            "order": 7,
                          },
                        ],
                        "key": "dropdown-text",
                        "order": 1,
                        "type": "dropdown",
                      },
                    ],
                  },
                  "key": "heading",
                  "markdownTransformers": [
                    {
                      "dependencies": [
                        [Function],
                      ],
                      "export": [Function],
                      "regExp": /\\^\\(#\\{1\\}\\|#\\{2\\}\\|#\\{3\\}\\|#\\{4\\}\\|#\\{5\\}\\|#\\{6\\}\\)\\\\s/,
                      "replace": [Function],
                      "type": "element",
                    },
                  ],
                  "nodes": [
                    {
                      "converters": {
                        "html": {
                          "converter": [Function],
                          "nodeTypes": [
                            "heading",
                          ],
                        },
                      },
                      "node": [Function],
                      "type": "heading",
                    },
                  ],
                  "props": {},
                  "slashMenu": {
                    "options": [
                      {
                        "displayName": "Basic",
                        "key": "basic",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Heading 1",
                            "key": "heading-1",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "heading",
                              "h1",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                      {
                        "displayName": "Basic",
                        "key": "basic",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Heading 2",
                            "key": "heading-2",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "heading",
                              "h2",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                      {
                        "displayName": "Basic",
                        "key": "basic",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Heading 3",
                            "key": "heading-3",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "heading",
                              "h3",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                      {
                        "displayName": "Basic",
                        "key": "basic",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Heading 4",
                            "key": "heading-4",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "heading",
                              "h4",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                      {
                        "displayName": "Basic",
                        "key": "basic",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Heading 5",
                            "key": "heading-5",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "heading",
                              "h5",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                      {
                        "displayName": "Basic",
                        "key": "basic",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Heading 6",
                            "key": "heading-6",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "heading",
                              "h6",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                    ],
                  },
                },
                "align" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "align-left",
                            "label": "Align Left",
                            "onClick": [Function],
                            "order": 1,
                          },
                        ],
                        "key": "dropdown-align",
                        "order": 2,
                        "type": "dropdown",
                      },
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "align-center",
                            "label": "Align Center",
                            "onClick": [Function],
                            "order": 2,
                          },
                        ],
                        "key": "dropdown-align",
                        "order": 2,
                        "type": "dropdown",
                      },
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "align-right",
                            "label": "Align Right",
                            "onClick": [Function],
                            "order": 3,
                          },
                        ],
                        "key": "dropdown-align",
                        "order": 2,
                        "type": "dropdown",
                      },
                    ],
                  },
                  "key": "align",
                  "props": null,
                },
                "indent" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "isEnabled": [Function],
                            "key": "indent-decrease",
                            "label": "Decrease Indent",
                            "onClick": [Function],
                            "order": 1,
                          },
                        ],
                        "key": "indent",
                        "order": 3,
                        "type": "buttons",
                      },
                      {
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "indent-increase",
                            "label": "Increase Indent",
                            "onClick": [Function],
                            "order": 2,
                          },
                        ],
                        "key": "indent",
                        "order": 3,
                        "type": "buttons",
                      },
                    ],
                  },
                  "key": "indent",
                  "plugins": [
                    {
                      "Component": [Function],
                      "position": "normal",
                    },
                  ],
                  "props": null,
                },
                "unorderedList" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "unorderedList",
                            "label": "Unordered List",
                            "onClick": [Function],
                            "order": 11,
                          },
                        ],
                        "key": "dropdown-text",
                        "order": 1,
                        "type": "dropdown",
                      },
                    ],
                  },
                  "key": "unorderedList",
                  "markdownTransformers": [
                    {
                      "dependencies": [
                        [Function],
                        [Function],
                      ],
                      "export": [Function],
                      "regExp": /\\^\\(\\\\s\\*\\)\\[-\\*\\+\\]\\\\s/,
                      "replace": [Function],
                      "type": "element",
                    },
                  ],
                  "nodes": [
                    {
                      "converters": {
                        "html": {
                          "converter": [Function],
                          "nodeTypes": [
                            "list",
                          ],
                        },
                      },
                      "node": [Function],
                      "type": "list",
                    },
                    {
                      "converters": {
                        "html": {
                          "converter": [Function],
                          "nodeTypes": [
                            "listitem",
                          ],
                        },
                      },
                      "node": [Function],
                      "type": "listitem",
                    },
                  ],
                  "plugins": [
                    {
                      "Component": [Function],
                      "position": "normal",
                    },
                  ],
                  "props": null,
                  "slashMenu": {
                    "options": [
                      {
                        "displayName": "Lists",
                        "key": "lists",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Unordered List",
                            "key": "unorderedlist",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "unordered list",
                              "ul",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                    ],
                  },
                },
                "orderedList" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "orderedList",
                            "label": "Ordered List",
                            "onClick": [Function],
                            "order": 10,
                          },
                        ],
                        "key": "dropdown-text",
                        "order": 1,
                        "type": "dropdown",
                      },
                    ],
                  },
                  "key": "orderedList",
                  "markdownTransformers": [
                    {
                      "dependencies": [
                        [Function],
                        [Function],
                      ],
                      "export": [Function],
                      "regExp": /\\^\\(\\\\s\\*\\)\\(\\\\d\\+\\)\\\\\\.\\\\s/,
                      "replace": [Function],
                      "type": "element",
                    },
                  ],
                  "nodes": [],
                  "plugins": [],
                  "props": null,
                  "slashMenu": {
                    "options": [
                      {
                        "displayName": "Lists",
                        "key": "lists",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Ordered List",
                            "key": "orderedlist",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "ordered list",
                              "ol",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                    ],
                  },
                },
                "checkList" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "checkList",
                            "label": "Check List",
                            "onClick": [Function],
                            "order": 12,
                          },
                        ],
                        "key": "dropdown-text",
                        "order": 1,
                        "type": "dropdown",
                      },
                    ],
                  },
                  "key": "checkList",
                  "markdownTransformers": [
                    {
                      "dependencies": [
                        [Function],
                        [Function],
                      ],
                      "export": [Function],
                      "regExp": /\\^\\(\\\\s\\*\\)\\(\\?:-\\\\s\\)\\?\\\\s\\?\\(\\\\\\[\\(\\\\s\\|x\\)\\?\\\\\\]\\)\\\\s/i,
                      "replace": [Function],
                      "type": "element",
                    },
                  ],
                  "nodes": [],
                  "plugins": [
                    {
                      "Component": [Function],
                      "position": "normal",
                    },
                  ],
                  "props": null,
                  "slashMenu": {
                    "options": [
                      {
                        "displayName": "Lists",
                        "key": "lists",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Check List",
                            "key": "checklist",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "check list",
                              "check",
                              "checklist",
                              "cl",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                    ],
                  },
                },
                "link" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "link",
                            "label": "Link",
                            "onClick": [Function],
                            "order": 1,
                          },
                        ],
                        "key": "features",
                        "order": 5,
                        "type": "buttons",
                      },
                    ],
                  },
                  "key": "link",
                  "nodes": [
                    {
                      "converters": {
                        "html": {
                          "converter": [Function],
                          "nodeTypes": [
                            "link",
                          ],
                        },
                      },
                      "node": [Function],
                      "populationPromises": [
                        [Function],
                      ],
                      "type": "link",
                    },
                    {
                      "converters": {
                        "html": {
                          "converter": [Function],
                          "nodeTypes": [
                            "autolink",
                          ],
                        },
                      },
                      "node": [Function],
                      "populationPromises": [
                        [Function],
                      ],
                      "type": "autolink",
                    },
                  ],
                  "plugins": [
                    {
                      "Component": [Function],
                      "position": "normal",
                    },
                    {
                      "Component": [Function],
                      "position": "normal",
                    },
                    {
                      "Component": [Function],
                      "position": "normal",
                    },
                    {
                      "Component": [Function],
                      "position": "floatingAnchorElem",
                    },
                  ],
                  "props": {},
                },
                "relationship" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "key": "relationship",
                  "nodes": [
                    {
                      "node": [Function],
                      "populationPromises": [
                        [Function],
                      ],
                      "type": "relationship",
                    },
                  ],
                  "plugins": [
                    {
                      "Component": [Function],
                      "position": "normal",
                    },
                  ],
                  "props": undefined,
                  "slashMenu": {
                    "options": [
                      {
                        "displayName": "Basic",
                        "key": "basic",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Relationship",
                            "key": "relationship",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "relationship",
                              "relation",
                              "rel",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                    ],
                  },
                },
                "blockquote" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "floatingSelectToolbar": {
                    "sections": [
                      {
                        "ChildComponent": [Function],
                        "entries": [
                          {
                            "ChildComponent": [Function],
                            "isActive": [Function],
                            "key": "blockquote",
                            "label": "Blockquote",
                            "onClick": [Function],
                            "order": 20,
                          },
                        ],
                        "key": "dropdown-text",
                        "order": 1,
                        "type": "dropdown",
                      },
                    ],
                  },
                  "key": "blockquote",
                  "markdownTransformers": [
                    {
                      "dependencies": [
                        [Function],
                      ],
                      "export": [Function],
                      "regExp": /\\^>\\\\s/,
                      "replace": [Function],
                      "type": "element",
                    },
                  ],
                  "nodes": [
                    {
                      "converters": {
                        "html": {
                          "converter": [Function],
                          "nodeTypes": [
                            "quote",
                          ],
                        },
                      },
                      "node": [Function],
                      "type": "quote",
                    },
                  ],
                  "props": null,
                  "slashMenu": {
                    "options": [
                      {
                        "displayName": "Basic",
                        "key": "basic",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Blockquote",
                            "key": "blockquote",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "quote",
                              "blockquote",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                    ],
                  },
                },
                "upload" => {
                  "dependencies": undefined,
                  "dependenciesPriority": undefined,
                  "dependenciesSoft": undefined,
                  "key": "upload",
                  "nodes": [
                    {
                      "converters": {
                        "html": {
                          "converter": [Function],
                          "nodeTypes": [
                            "upload",
                          ],
                        },
                      },
                      "node": [Function],
                      "populationPromises": [
                        [Function],
                      ],
                      "type": "upload",
                      "validations": [
                        [Function],
                      ],
                    },
                  ],
                  "plugins": [
                    {
                      "Component": [Function],
                      "position": "normal",
                    },
                  ],
                  "props": undefined,
                  "slashMenu": {
                    "options": [
                      {
                        "displayName": "Basic",
                        "key": "basic",
                        "options": [
                          SlashMenuOption {
                            "Icon": [Function],
                            "displayName": "Upload",
                            "key": "upload",
                            "keyboardShortcut": undefined,
                            "keywords": [
                              "upload",
                              "image",
                              "file",
                              "img",
                              "picture",
                              "photo",
                              "media",
                            ],
                            "onSelect": [Function],
                            "ref": {
                              "current": null,
                            },
                            "setRefElement": [Function],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            },
            "outputSchema": [Function],
            "populationPromise": [Function],
            "validate": [Function],
          },
          "localized": true,
          "name": "content",
          "type": "richText",
        },
        {
          "fields": [
            {
              "fields": [
                {
                  "localized": true,
                  "name": "title",
                  "type": "text",
                },
                {
                  "editor": {
                    "LazyCellComponent": [Function],
                    "LazyFieldComponent": [Function],
                    "afterReadPromise": [Function],
                    "editorConfig": {
                      "features": {
                        "converters": {
                          "html": [
                            {
                              "converter": [Function],
                              "nodeTypes": [
                                "heading",
                              ],
                            },
                            {
                              "converter": [Function],
                              "nodeTypes": [
                                "list",
                              ],
                            },
                            {
                              "converter": [Function],
                              "nodeTypes": [
                                "listitem",
                              ],
                            },
                            {
                              "converter": [Function],
                              "nodeTypes": [
                                "link",
                              ],
                            },
                            {
                              "converter": [Function],
                              "nodeTypes": [
                                "autolink",
                              ],
                            },
                            {
                              "converter": [Function],
                              "nodeTypes": [
                                "quote",
                              ],
                            },
                            {
                              "converter": [Function],
                              "nodeTypes": [
                                "upload",
                              ],
                            },
                          ],
                        },
                        "enabledFeatures": [
                          "blocks",
                          "slateToLexical",
                          "bold",
                          "italic",
                          "underline",
                          "strikethrough",
                          "subscript",
                          "superscript",
                          "inlineCode",
                          "paragraph",
                          "heading",
                          "align",
                          "indent",
                          "unorderedList",
                          "orderedList",
                          "checkList",
                          "link",
                          "relationship",
                          "blockquote",
                          "upload",
                        ],
                        "floatingSelectToolbar": {
                          "sections": [
                            {
                              "ChildComponent": [Function],
                              "entries": [
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "normal-text",
                                  "label": "Normal Text",
                                  "onClick": [Function],
                                  "order": 1,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "h1",
                                  "label": "Heading 1",
                                  "onClick": [Function],
                                  "order": 2,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "h2",
                                  "label": "Heading 2",
                                  "onClick": [Function],
                                  "order": 3,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "h3",
                                  "label": "Heading 3",
                                  "onClick": [Function],
                                  "order": 4,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "h4",
                                  "label": "Heading 4",
                                  "onClick": [Function],
                                  "order": 5,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "h5",
                                  "label": "Heading 5",
                                  "onClick": [Function],
                                  "order": 6,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "h6",
                                  "label": "Heading 6",
                                  "onClick": [Function],
                                  "order": 7,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "orderedList",
                                  "label": "Ordered List",
                                  "onClick": [Function],
                                  "order": 10,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "unorderedList",
                                  "label": "Unordered List",
                                  "onClick": [Function],
                                  "order": 11,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "checkList",
                                  "label": "Check List",
                                  "onClick": [Function],
                                  "order": 12,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "blockquote",
                                  "label": "Blockquote",
                                  "onClick": [Function],
                                  "order": 20,
                                },
                              ],
                              "key": "dropdown-text",
                              "order": 1,
                              "type": "dropdown",
                            },
                            {
                              "ChildComponent": [Function],
                              "entries": [
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "align-left",
                                  "label": "Align Left",
                                  "onClick": [Function],
                                  "order": 1,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "align-center",
                                  "label": "Align Center",
                                  "onClick": [Function],
                                  "order": 2,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "align-right",
                                  "label": "Align Right",
                                  "onClick": [Function],
                                  "order": 3,
                                },
                              ],
                              "key": "dropdown-align",
                              "order": 2,
                              "type": "dropdown",
                            },
                            {
                              "entries": [
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "isEnabled": [Function],
                                  "key": "indent-decrease",
                                  "label": "Decrease Indent",
                                  "onClick": [Function],
                                  "order": 1,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "indent-increase",
                                  "label": "Increase Indent",
                                  "onClick": [Function],
                                  "order": 2,
                                },
                              ],
                              "key": "indent",
                              "order": 3,
                              "type": "buttons",
                            },
                            {
                              "entries": [
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "bold",
                                  "onClick": [Function],
                                  "order": 1,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "italic",
                                  "onClick": [Function],
                                  "order": 2,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "underline",
                                  "onClick": [Function],
                                  "order": 3,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "strikethrough",
                                  "onClick": [Function],
                                  "order": 4,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "subscript",
                                  "onClick": [Function],
                                  "order": 5,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "superscript",
                                  "onClick": [Function],
                                  "order": 6,
                                },
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "code",
                                  "onClick": [Function],
                                  "order": 7,
                                },
                              ],
                              "key": "format",
                              "order": 4,
                              "type": "buttons",
                            },
                            {
                              "entries": [
                                {
                                  "ChildComponent": [Function],
                                  "isActive": [Function],
                                  "key": "link",
                                  "label": "Link",
                                  "onClick": [Function],
                                  "order": 1,
                                },
                              ],
                              "key": "features",
                              "order": 5,
                              "type": "buttons",
                            },
                          ],
                        },
                        "hooks": {
                          "afterReadPromises": [],
                          "load": [
                            [Function],
                          ],
                          "save": [],
                        },
                        "markdownTransformers": [
                          {
                            "format": [
                              "bold",
                            ],
                            "tag": "**",
                            "type": "text-format",
                          },
                          {
                            "format": [
                              "bold",
                            ],
                            "intraword": false,
                            "tag": "__",
                            "type": "text-format",
                          },
                          {
                            "format": [
                              "bold",
                              "italic",
                            ],
                            "intraword": false,
                            "tag": "___",
                            "type": "text-format",
                          },
                          {
                            "format": [
                              "bold",
                              "italic",
                            ],
                            "tag": "***",
                            "type": "text-format",
                          },
                          {
                            "format": [
                              "italic",
                            ],
                            "tag": "*",
                            "type": "text-format",
                          },
                          {
                            "format": [
                              "italic",
                            ],
                            "intraword": false,
                            "tag": "_",
                            "type": "text-format",
                          },
                          {
                            "format": [
                              "strikethrough",
                            ],
                            "tag": "~~",
                            "type": "text-format",
                          },
                          {
                            "format": [
                              "code",
                            ],
                            "tag": "\`",
                            "type": "text-format",
                          },
                          {
                            "dependencies": [
                              [Function],
                            ],
                            "export": [Function],
                            "regExp": /\\^\\(#\\{1\\}\\|#\\{2\\}\\|#\\{3\\}\\|#\\{4\\}\\|#\\{5\\}\\|#\\{6\\}\\)\\\\s/,
                            "replace": [Function],
                            "type": "element",
                          },
                          {
                            "dependencies": [
                              [Function],
                              [Function],
                            ],
                            "export": [Function],
                            "regExp": /\\^\\(\\\\s\\*\\)\\[-\\*\\+\\]\\\\s/,
                            "replace": [Function],
                            "type": "element",
                          },
                          {
                            "dependencies": [
                              [Function],
                              [Function],
                            ],
                            "export": [Function],
                            "regExp": /\\^\\(\\\\s\\*\\)\\(\\\\d\\+\\)\\\\\\.\\\\s/,
                            "replace": [Function],
                            "type": "element",
                          },
                          {
                            "dependencies": [
                              [Function],
                              [Function],
                            ],
                            "export": [Function],
                            "regExp": /\\^\\(\\\\s\\*\\)\\(\\?:-\\\\s\\)\\?\\\\s\\?\\(\\\\\\[\\(\\\\s\\|x\\)\\?\\\\\\]\\)\\\\s/i,
                            "replace": [Function],
                            "type": "element",
                          },
                          {
                            "dependencies": [
                              [Function],
                            ],
                            "export": [Function],
                            "regExp": /\\^>\\\\s/,
                            "replace": [Function],
                            "type": "element",
                          },
                        ],
                        "nodes": [
                          {
                            "node": [Function],
                            "populationPromises": [
                              [Function],
                            ],
                            "type": "block",
                            "validations": [
                              [Function],
                            ],
                          },
                          {
                            "node": [Function],
                            "type": "unknownConverted",
                          },
                          {
                            "converters": {
                              "html": {
                                "converter": [Function],
                                "nodeTypes": [
                                  "heading",
                                ],
                              },
                            },
                            "node": [Function],
                            "type": "heading",
                          },
                          {
                            "converters": {
                              "html": {
                                "converter": [Function],
                                "nodeTypes": [
                                  "list",
                                ],
                              },
                            },
                            "node": [Function],
                            "type": "list",
                          },
                          {
                            "converters": {
                              "html": {
                                "converter": [Function],
                                "nodeTypes": [
                                  "listitem",
                                ],
                              },
                            },
                            "node": [Function],
                            "type": "listitem",
                          },
                          {
                            "converters": {
                              "html": {
                                "converter": [Function],
                                "nodeTypes": [
                                  "link",
                                ],
                              },
                            },
                            "node": [Function],
                            "populationPromises": [
                              [Function],
                            ],
                            "type": "link",
                          },
                          {
                            "converters": {
                              "html": {
                                "converter": [Function],
                                "nodeTypes": [
                                  "autolink",
                                ],
                              },
                            },
                            "node": [Function],
                            "populationPromises": [
                              [Function],
                            ],
                            "type": "autolink",
                          },
                          {
                            "node": [Function],
                            "populationPromises": [
                              [Function],
                            ],
                            "type": "relationship",
                          },
                          {
                            "converters": {
                              "html": {
                                "converter": [Function],
                                "nodeTypes": [
                                  "quote",
                                ],
                              },
                            },
                            "node": [Function],
                            "type": "quote",
                          },
                          {
                            "converters": {
                              "html": {
                                "converter": [Function],
                                "nodeTypes": [
                                  "upload",
                                ],
                              },
                            },
                            "node": [Function],
                            "populationPromises": [
                              [Function],
                            ],
                            "type": "upload",
                            "validations": [
                              [Function],
                            ],
                          },
                        ],
                        "plugins": [
                          {
                            "Component": [Function],
                            "key": "blocks0",
                            "position": "normal",
                          },
                          {
                            "Component": [Function],
                            "key": "indent0",
                            "position": "normal",
                          },
                          {
                            "Component": [Function],
                            "key": "unorderedList0",
                            "position": "normal",
                          },
                          {
                            "Component": [Function],
                            "key": "checkList0",
                            "position": "normal",
                          },
                          {
                            "Component": [Function],
                            "key": "link0",
                            "position": "normal",
                          },
                          {
                            "Component": [Function],
                            "key": "link1",
                            "position": "normal",
                          },
                          {
                            "Component": [Function],
                            "key": "link2",
                            "position": "normal",
                          },
                          {
                            "Component": [Function],
                            "key": "link3",
                            "position": "floatingAnchorElem",
                          },
                          {
                            "Component": [Function],
                            "key": "relationship0",
                            "position": "normal",
                          },
                          {
                            "Component": [Function],
                            "key": "upload0",
                            "position": "normal",
                          },
                        ],
                        "populationPromises": Map {
                          "block" => [
                            [Function],
                          ],
                          "link" => [
                            [Function],
                          ],
                          "autolink" => [
                            [Function],
                          ],
                          "relationship" => [
                            [Function],
                          ],
                          "upload" => [
                            [Function],
                          ],
                        },
                        "slashMenu": {
                          "dynamicOptions": [],
                          "groupsWithOptions": [
                            {
                              "displayName": "Blocks",
                              "key": "blocks",
                              "options": [
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": [Function],
                                  "key": "block-highlight",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "block",
                                    "blocks",
                                    "highlight",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                              ],
                            },
                            {
                              "displayName": "Lists",
                              "key": "lists",
                              "options": [
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Unordered List",
                                  "key": "unorderedlist",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "unordered list",
                                    "ul",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Ordered List",
                                  "key": "orderedlist",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "ordered list",
                                    "ol",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Check List",
                                  "key": "checklist",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "check list",
                                    "check",
                                    "checklist",
                                    "cl",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                              ],
                            },
                            {
                              "displayName": "Basic",
                              "key": "basic",
                              "options": [
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Paragraph",
                                  "key": "paragraph",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "normal",
                                    "paragraph",
                                    "p",
                                    "text",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Heading 1",
                                  "key": "heading-1",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "heading",
                                    "h1",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Heading 2",
                                  "key": "heading-2",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "heading",
                                    "h2",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Heading 3",
                                  "key": "heading-3",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "heading",
                                    "h3",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Heading 4",
                                  "key": "heading-4",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "heading",
                                    "h4",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Heading 5",
                                  "key": "heading-5",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "heading",
                                    "h5",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Heading 6",
                                  "key": "heading-6",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "heading",
                                    "h6",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Relationship",
                                  "key": "relationship",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "relationship",
                                    "relation",
                                    "rel",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Blockquote",
                                  "key": "blockquote",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "quote",
                                    "blockquote",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                                SlashMenuOption {
                                  "Icon": [Function],
                                  "displayName": "Upload",
                                  "key": "upload",
                                  "keyboardShortcut": undefined,
                                  "keywords": [
                                    "upload",
                                    "image",
                                    "file",
                                    "img",
                                    "picture",
                                    "photo",
                                    "media",
                                  ],
                                  "onSelect": [Function],
                                  "ref": {
                                    "current": null,
                                  },
                                  "setRefElement": [Function],
                                },
                              ],
                            },
                          ],
                        },
                        "validations": Map {
                          "block" => [
                            [Function],
                          ],
                          "upload" => [
                            [Function],
                          ],
                        },
                      },
                      "lexical": [Function],
                      "resolvedFeatureMap": Map {
                        "blocks" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "key": "blocks",
                          "nodes": [
                            {
                              "node": [Function],
                              "populationPromises": [
                                [Function],
                              ],
                              "type": "block",
                              "validations": [
                                [Function],
                              ],
                            },
                          ],
                          "plugins": [
                            {
                              "Component": [Function],
                              "position": "normal",
                            },
                          ],
                          "props": {
                            "blocks": [
                              {
                                "fields": [
                                  {
                                    "fields": [
                                      {
                                        "localized": true,
                                        "name": "title",
                                        "type": "text",
                                      },
                                      {
                                        "localized": true,
                                        "name": "preTitle",
                                        "type": "text",
                                      },
                                    ],
                                    "name": "heading",
                                    "type": "group",
                                  },
                                  {
                                    "admin": {
                                      "isClearable": true,
                                    },
                                    "name": "color",
                                    "options": [
                                      "gray",
                                      "yellow",
                                      "green",
                                    ],
                                    "type": "select",
                                  },
                                  {
                                    "editor": {
                                      "LazyCellComponent": [Function],
                                      "LazyFieldComponent": [Function],
                                      "afterReadPromise": [Function],
                                      "editorConfig": {
                                        "features": {
                                          "converters": {
                                            "html": [
                                              {
                                                "converter": [Function],
                                                "nodeTypes": [
                                                  "link",
                                                ],
                                              },
                                              {
                                                "converter": [Function],
                                                "nodeTypes": [
                                                  "autolink",
                                                ],
                                              },
                                            ],
                                          },
                                          "enabledFeatures": [
                                            "link",
                                            "bold",
                                          ],
                                          "floatingSelectToolbar": {
                                            "sections": [
                                              {
                                                "entries": [
                                                  {
                                                    "ChildComponent": [Function],
                                                    "isActive": [Function],
                                                    "key": "bold",
                                                    "onClick": [Function],
                                                    "order": 1,
                                                  },
                                                ],
                                                "key": "format",
                                                "order": 4,
                                                "type": "buttons",
                                              },
                                              {
                                                "entries": [
                                                  {
                                                    "ChildComponent": [Function],
                                                    "isActive": [Function],
                                                    "key": "link",
                                                    "label": "Link",
                                                    "onClick": [Function],
                                                    "order": 1,
                                                  },
                                                ],
                                                "key": "features",
                                                "order": 5,
                                                "type": "buttons",
                                              },
                                            ],
                                          },
                                          "hooks": {
                                            "afterReadPromises": [],
                                            "load": [],
                                            "save": [],
                                          },
                                          "markdownTransformers": [
                                            {
                                              "format": [
                                                "bold",
                                              ],
                                              "tag": "**",
                                              "type": "text-format",
                                            },
                                            {
                                              "format": [
                                                "bold",
                                              ],
                                              "intraword": false,
                                              "tag": "__",
                                              "type": "text-format",
                                            },
                                          ],
                                          "nodes": [
                                            {
                                              "converters": {
                                                "html": {
                                                  "converter": [Function],
                                                  "nodeTypes": [
                                                    "link",
                                                  ],
                                                },
                                              },
                                              "node": [Function],
                                              "populationPromises": [
                                                [Function],
                                              ],
                                              "type": "link",
                                            },
                                            {
                                              "converters": {
                                                "html": {
                                                  "converter": [Function],
                                                  "nodeTypes": [
                                                    "autolink",
                                                  ],
                                                },
                                              },
                                              "node": [Function],
                                              "populationPromises": [
                                                [Function],
                                              ],
                                              "type": "autolink",
                                            },
                                          ],
                                          "plugins": [
                                            {
                                              "Component": [Function],
                                              "key": "link0",
                                              "position": "normal",
                                            },
                                            {
                                              "Component": [Function],
                                              "key": "link1",
                                              "position": "normal",
                                            },
                                            {
                                              "Component": [Function],
                                              "key": "link2",
                                              "position": "normal",
                                            },
                                            {
                                              "Component": [Function],
                                              "key": "link3",
                                              "position": "floatingAnchorElem",
                                            },
                                          ],
                                          "populationPromises": Map {
                                            "link" => [
                                              [Function],
                                            ],
                                            "autolink" => [
                                              [Function],
                                            ],
                                          },
                                          "slashMenu": {
                                            "dynamicOptions": [],
                                            "groupsWithOptions": [],
                                          },
                                          "validations": Map {},
                                        },
                                        "lexical": [Function],
                                        "resolvedFeatureMap": Map {
                                          "link" => {
                                            "dependencies": undefined,
                                            "dependenciesPriority": undefined,
                                            "dependenciesSoft": undefined,
                                            "floatingSelectToolbar": {
                                              "sections": [
                                                {
                                                  "entries": [
                                                    {
                                                      "ChildComponent": [Function],
                                                      "isActive": [Function],
                                                      "key": "link",
                                                      "label": "Link",
                                                      "onClick": [Function],
                                                      "order": 1,
                                                    },
                                                  ],
                                                  "key": "features",
                                                  "order": 5,
                                                  "type": "buttons",
                                                },
                                              ],
                                            },
                                            "key": "link",
                                            "nodes": [
                                              {
                                                "converters": {
                                                  "html": {
                                                    "converter": [Function],
                                                    "nodeTypes": [
                                                      "link",
                                                    ],
                                                  },
                                                },
                                                "node": [Function],
                                                "populationPromises": [
                                                  [Function],
                                                ],
                                                "type": "link",
                                              },
                                              {
                                                "converters": {
                                                  "html": {
                                                    "converter": [Function],
                                                    "nodeTypes": [
                                                      "autolink",
                                                    ],
                                                  },
                                                },
                                                "node": [Function],
                                                "populationPromises": [
                                                  [Function],
                                                ],
                                                "type": "autolink",
                                              },
                                            ],
                                            "plugins": [
                                              {
                                                "Component": [Function],
                                                "position": "normal",
                                              },
                                              {
                                                "Component": [Function],
                                                "position": "normal",
                                              },
                                              {
                                                "Component": [Function],
                                                "position": "normal",
                                              },
                                              {
                                                "Component": [Function],
                                                "position": "floatingAnchorElem",
                                              },
                                            ],
                                            "props": {},
                                          },
                                          "bold" => {
                                            "dependencies": undefined,
                                            "dependenciesPriority": undefined,
                                            "dependenciesSoft": [
                                              "italic",
                                            ],
                                            "floatingSelectToolbar": {
                                              "sections": [
                                                {
                                                  "entries": [
                                                    {
                                                      "ChildComponent": [Function],
                                                      "isActive": [Function],
                                                      "key": "bold",
                                                      "onClick": [Function],
                                                      "order": 1,
                                                    },
                                                  ],
                                                  "key": "format",
                                                  "order": 4,
                                                  "type": "buttons",
                                                },
                                              ],
                                            },
                                            "key": "bold",
                                            "markdownTransformers": [
                                              {
                                                "format": [
                                                  "bold",
                                                ],
                                                "tag": "**",
                                                "type": "text-format",
                                              },
                                              {
                                                "format": [
                                                  "bold",
                                                ],
                                                "intraword": false,
                                                "tag": "__",
                                                "type": "text-format",
                                              },
                                            ],
                                            "props": null,
                                          },
                                        },
                                      },
                                      "outputSchema": [Function],
                                      "populationPromise": [Function],
                                      "validate": [Function],
                                    },
                                    "localized": false,
                                    "name": "content",
                                    "type": "richText",
                                  },
                                  {
                                    "admin": {
                                      "disabled": true,
                                    },
                                    "hooks": {
                                      "beforeChange": [
                                        [Function],
                                      ],
                                    },
                                    "label": "ID",
                                    "name": "id",
                                    "type": "text",
                                  },
                                  {
                                    "admin": {
                                      "disabled": true,
                                    },
                                    "label": "Block Name",
                                    "name": "blockName",
                                    "required": false,
                                    "type": "text",
                                  },
                                ],
                                "imageAltText": "Text",
                                "labels": {
                                  "plural": "Highlights",
                                  "singular": "Highlight",
                                },
                                "slug": "highlight",
                              },
                            ],
                          },
                          "slashMenu": {
                            "options": [
                              {
                                "displayName": "Blocks",
                                "key": "blocks",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": [Function],
                                    "key": "block-highlight",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "block",
                                      "blocks",
                                      "highlight",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        "slateToLexical" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "hooks": {
                            "load": [Function],
                          },
                          "key": "slateToLexical",
                          "nodes": [
                            {
                              "node": [Function],
                              "type": "unknownConverted",
                            },
                          ],
                          "props": {
                            "converters": [
                              {
                                "converter": [Function],
                                "nodeTypes": [
                                  "unknown",
                                ],
                              },
                              {
                                "converter": [Function],
                                "nodeTypes": [
                                  "upload",
                                ],
                              },
                              {
                                "converter": [Function],
                                "nodeTypes": [
                                  "ul",
                                ],
                              },
                              {
                                "converter": [Function],
                                "nodeTypes": [
                                  "ol",
                                ],
                              },
                              {
                                "converter": [Function],
                                "nodeTypes": [
                                  "relationship",
                                ],
                              },
                              {
                                "converter": [Function],
                                "nodeTypes": [
                                  "li",
                                ],
                              },
                              {
                                "converter": [Function],
                                "nodeTypes": [
                                  "link",
                                ],
                              },
                              {
                                "converter": [Function],
                                "nodeTypes": [
                                  "blockquote",
                                ],
                              },
                              {
                                "converter": [Function],
                                "nodeTypes": [
                                  "h1",
                                  "h2",
                                  "h3",
                                  "h4",
                                  "h5",
                                  "h6",
                                ],
                              },
                              {
                                "converter": [Function],
                                "nodeTypes": [
                                  "indent",
                                ],
                              },
                            ],
                          },
                        },
                        "bold" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": [
                            "italic",
                          ],
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "bold",
                                    "onClick": [Function],
                                    "order": 1,
                                  },
                                ],
                                "key": "format",
                                "order": 4,
                                "type": "buttons",
                              },
                            ],
                          },
                          "key": "bold",
                          "markdownTransformers": [
                            {
                              "format": [
                                "bold",
                              ],
                              "tag": "**",
                              "type": "text-format",
                            },
                            {
                              "format": [
                                "bold",
                              ],
                              "intraword": false,
                              "tag": "__",
                              "type": "text-format",
                            },
                            {
                              "format": [
                                "bold",
                                "italic",
                              ],
                              "intraword": false,
                              "tag": "___",
                              "type": "text-format",
                            },
                            {
                              "format": [
                                "bold",
                                "italic",
                              ],
                              "tag": "***",
                              "type": "text-format",
                            },
                          ],
                          "props": null,
                        },
                        "italic" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "italic",
                                    "onClick": [Function],
                                    "order": 2,
                                  },
                                ],
                                "key": "format",
                                "order": 4,
                                "type": "buttons",
                              },
                            ],
                          },
                          "key": "italic",
                          "markdownTransformers": [
                            {
                              "format": [
                                "italic",
                              ],
                              "tag": "*",
                              "type": "text-format",
                            },
                            {
                              "format": [
                                "italic",
                              ],
                              "intraword": false,
                              "tag": "_",
                              "type": "text-format",
                            },
                          ],
                          "props": null,
                        },
                        "underline" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "underline",
                                    "onClick": [Function],
                                    "order": 3,
                                  },
                                ],
                                "key": "format",
                                "order": 4,
                                "type": "buttons",
                              },
                            ],
                          },
                          "key": "underline",
                          "props": null,
                        },
                        "strikethrough" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "strikethrough",
                                    "onClick": [Function],
                                    "order": 4,
                                  },
                                ],
                                "key": "format",
                                "order": 4,
                                "type": "buttons",
                              },
                            ],
                          },
                          "key": "strikethrough",
                          "markdownTransformers": [
                            {
                              "format": [
                                "strikethrough",
                              ],
                              "tag": "~~",
                              "type": "text-format",
                            },
                          ],
                          "props": null,
                        },
                        "subscript" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "subscript",
                                    "onClick": [Function],
                                    "order": 5,
                                  },
                                ],
                                "key": "format",
                                "order": 4,
                                "type": "buttons",
                              },
                            ],
                          },
                          "key": "subscript",
                          "props": null,
                        },
                        "superscript" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "superscript",
                                    "onClick": [Function],
                                    "order": 6,
                                  },
                                ],
                                "key": "format",
                                "order": 4,
                                "type": "buttons",
                              },
                            ],
                          },
                          "key": "superscript",
                          "props": null,
                        },
                        "inlineCode" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "code",
                                    "onClick": [Function],
                                    "order": 7,
                                  },
                                ],
                                "key": "format",
                                "order": 4,
                                "type": "buttons",
                              },
                            ],
                          },
                          "key": "inlineCode",
                          "markdownTransformers": [
                            {
                              "format": [
                                "code",
                              ],
                              "tag": "\`",
                              "type": "text-format",
                            },
                          ],
                          "props": null,
                        },
                        "paragraph" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "normal-text",
                                    "label": "Normal Text",
                                    "onClick": [Function],
                                    "order": 1,
                                  },
                                ],
                                "key": "dropdown-text",
                                "order": 1,
                                "type": "dropdown",
                              },
                            ],
                          },
                          "key": "paragraph",
                          "props": null,
                          "slashMenu": {
                            "options": [
                              {
                                "displayName": "Basic",
                                "key": "basic",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Paragraph",
                                    "key": "paragraph",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "normal",
                                      "paragraph",
                                      "p",
                                      "text",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        "heading" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "h1",
                                    "label": "Heading 1",
                                    "onClick": [Function],
                                    "order": 2,
                                  },
                                ],
                                "key": "dropdown-text",
                                "order": 1,
                                "type": "dropdown",
                              },
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "h2",
                                    "label": "Heading 2",
                                    "onClick": [Function],
                                    "order": 3,
                                  },
                                ],
                                "key": "dropdown-text",
                                "order": 1,
                                "type": "dropdown",
                              },
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "h3",
                                    "label": "Heading 3",
                                    "onClick": [Function],
                                    "order": 4,
                                  },
                                ],
                                "key": "dropdown-text",
                                "order": 1,
                                "type": "dropdown",
                              },
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "h4",
                                    "label": "Heading 4",
                                    "onClick": [Function],
                                    "order": 5,
                                  },
                                ],
                                "key": "dropdown-text",
                                "order": 1,
                                "type": "dropdown",
                              },
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "h5",
                                    "label": "Heading 5",
                                    "onClick": [Function],
                                    "order": 6,
                                  },
                                ],
                                "key": "dropdown-text",
                                "order": 1,
                                "type": "dropdown",
                              },
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "h6",
                                    "label": "Heading 6",
                                    "onClick": [Function],
                                    "order": 7,
                                  },
                                ],
                                "key": "dropdown-text",
                                "order": 1,
                                "type": "dropdown",
                              },
                            ],
                          },
                          "key": "heading",
                          "markdownTransformers": [
                            {
                              "dependencies": [
                                [Function],
                              ],
                              "export": [Function],
                              "regExp": /\\^\\(#\\{1\\}\\|#\\{2\\}\\|#\\{3\\}\\|#\\{4\\}\\|#\\{5\\}\\|#\\{6\\}\\)\\\\s/,
                              "replace": [Function],
                              "type": "element",
                            },
                          ],
                          "nodes": [
                            {
                              "converters": {
                                "html": {
                                  "converter": [Function],
                                  "nodeTypes": [
                                    "heading",
                                  ],
                                },
                              },
                              "node": [Function],
                              "type": "heading",
                            },
                          ],
                          "props": {},
                          "slashMenu": {
                            "options": [
                              {
                                "displayName": "Basic",
                                "key": "basic",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Heading 1",
                                    "key": "heading-1",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "heading",
                                      "h1",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                              {
                                "displayName": "Basic",
                                "key": "basic",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Heading 2",
                                    "key": "heading-2",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "heading",
                                      "h2",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                              {
                                "displayName": "Basic",
                                "key": "basic",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Heading 3",
                                    "key": "heading-3",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "heading",
                                      "h3",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                              {
                                "displayName": "Basic",
                                "key": "basic",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Heading 4",
                                    "key": "heading-4",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "heading",
                                      "h4",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                              {
                                "displayName": "Basic",
                                "key": "basic",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Heading 5",
                                    "key": "heading-5",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "heading",
                                      "h5",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                              {
                                "displayName": "Basic",
                                "key": "basic",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Heading 6",
                                    "key": "heading-6",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "heading",
                                      "h6",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        "align" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "align-left",
                                    "label": "Align Left",
                                    "onClick": [Function],
                                    "order": 1,
                                  },
                                ],
                                "key": "dropdown-align",
                                "order": 2,
                                "type": "dropdown",
                              },
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "align-center",
                                    "label": "Align Center",
                                    "onClick": [Function],
                                    "order": 2,
                                  },
                                ],
                                "key": "dropdown-align",
                                "order": 2,
                                "type": "dropdown",
                              },
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "align-right",
                                    "label": "Align Right",
                                    "onClick": [Function],
                                    "order": 3,
                                  },
                                ],
                                "key": "dropdown-align",
                                "order": 2,
                                "type": "dropdown",
                              },
                            ],
                          },
                          "key": "align",
                          "props": null,
                        },
                        "indent" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "isEnabled": [Function],
                                    "key": "indent-decrease",
                                    "label": "Decrease Indent",
                                    "onClick": [Function],
                                    "order": 1,
                                  },
                                ],
                                "key": "indent",
                                "order": 3,
                                "type": "buttons",
                              },
                              {
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "indent-increase",
                                    "label": "Increase Indent",
                                    "onClick": [Function],
                                    "order": 2,
                                  },
                                ],
                                "key": "indent",
                                "order": 3,
                                "type": "buttons",
                              },
                            ],
                          },
                          "key": "indent",
                          "plugins": [
                            {
                              "Component": [Function],
                              "position": "normal",
                            },
                          ],
                          "props": null,
                        },
                        "unorderedList" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "unorderedList",
                                    "label": "Unordered List",
                                    "onClick": [Function],
                                    "order": 11,
                                  },
                                ],
                                "key": "dropdown-text",
                                "order": 1,
                                "type": "dropdown",
                              },
                            ],
                          },
                          "key": "unorderedList",
                          "markdownTransformers": [
                            {
                              "dependencies": [
                                [Function],
                                [Function],
                              ],
                              "export": [Function],
                              "regExp": /\\^\\(\\\\s\\*\\)\\[-\\*\\+\\]\\\\s/,
                              "replace": [Function],
                              "type": "element",
                            },
                          ],
                          "nodes": [
                            {
                              "converters": {
                                "html": {
                                  "converter": [Function],
                                  "nodeTypes": [
                                    "list",
                                  ],
                                },
                              },
                              "node": [Function],
                              "type": "list",
                            },
                            {
                              "converters": {
                                "html": {
                                  "converter": [Function],
                                  "nodeTypes": [
                                    "listitem",
                                  ],
                                },
                              },
                              "node": [Function],
                              "type": "listitem",
                            },
                          ],
                          "plugins": [
                            {
                              "Component": [Function],
                              "position": "normal",
                            },
                          ],
                          "props": null,
                          "slashMenu": {
                            "options": [
                              {
                                "displayName": "Lists",
                                "key": "lists",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Unordered List",
                                    "key": "unorderedlist",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "unordered list",
                                      "ul",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        "orderedList" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "orderedList",
                                    "label": "Ordered List",
                                    "onClick": [Function],
                                    "order": 10,
                                  },
                                ],
                                "key": "dropdown-text",
                                "order": 1,
                                "type": "dropdown",
                              },
                            ],
                          },
                          "key": "orderedList",
                          "markdownTransformers": [
                            {
                              "dependencies": [
                                [Function],
                                [Function],
                              ],
                              "export": [Function],
                              "regExp": /\\^\\(\\\\s\\*\\)\\(\\\\d\\+\\)\\\\\\.\\\\s/,
                              "replace": [Function],
                              "type": "element",
                            },
                          ],
                          "nodes": [],
                          "plugins": [],
                          "props": null,
                          "slashMenu": {
                            "options": [
                              {
                                "displayName": "Lists",
                                "key": "lists",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Ordered List",
                                    "key": "orderedlist",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "ordered list",
                                      "ol",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        "checkList" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "checkList",
                                    "label": "Check List",
                                    "onClick": [Function],
                                    "order": 12,
                                  },
                                ],
                                "key": "dropdown-text",
                                "order": 1,
                                "type": "dropdown",
                              },
                            ],
                          },
                          "key": "checkList",
                          "markdownTransformers": [
                            {
                              "dependencies": [
                                [Function],
                                [Function],
                              ],
                              "export": [Function],
                              "regExp": /\\^\\(\\\\s\\*\\)\\(\\?:-\\\\s\\)\\?\\\\s\\?\\(\\\\\\[\\(\\\\s\\|x\\)\\?\\\\\\]\\)\\\\s/i,
                              "replace": [Function],
                              "type": "element",
                            },
                          ],
                          "nodes": [],
                          "plugins": [
                            {
                              "Component": [Function],
                              "position": "normal",
                            },
                          ],
                          "props": null,
                          "slashMenu": {
                            "options": [
                              {
                                "displayName": "Lists",
                                "key": "lists",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Check List",
                                    "key": "checklist",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "check list",
                                      "check",
                                      "checklist",
                                      "cl",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        "link" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "link",
                                    "label": "Link",
                                    "onClick": [Function],
                                    "order": 1,
                                  },
                                ],
                                "key": "features",
                                "order": 5,
                                "type": "buttons",
                              },
                            ],
                          },
                          "key": "link",
                          "nodes": [
                            {
                              "converters": {
                                "html": {
                                  "converter": [Function],
                                  "nodeTypes": [
                                    "link",
                                  ],
                                },
                              },
                              "node": [Function],
                              "populationPromises": [
                                [Function],
                              ],
                              "type": "link",
                            },
                            {
                              "converters": {
                                "html": {
                                  "converter": [Function],
                                  "nodeTypes": [
                                    "autolink",
                                  ],
                                },
                              },
                              "node": [Function],
                              "populationPromises": [
                                [Function],
                              ],
                              "type": "autolink",
                            },
                          ],
                          "plugins": [
                            {
                              "Component": [Function],
                              "position": "normal",
                            },
                            {
                              "Component": [Function],
                              "position": "normal",
                            },
                            {
                              "Component": [Function],
                              "position": "normal",
                            },
                            {
                              "Component": [Function],
                              "position": "floatingAnchorElem",
                            },
                          ],
                          "props": {},
                        },
                        "relationship" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "key": "relationship",
                          "nodes": [
                            {
                              "node": [Function],
                              "populationPromises": [
                                [Function],
                              ],
                              "type": "relationship",
                            },
                          ],
                          "plugins": [
                            {
                              "Component": [Function],
                              "position": "normal",
                            },
                          ],
                          "props": undefined,
                          "slashMenu": {
                            "options": [
                              {
                                "displayName": "Basic",
                                "key": "basic",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Relationship",
                                    "key": "relationship",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "relationship",
                                      "relation",
                                      "rel",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        "blockquote" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "floatingSelectToolbar": {
                            "sections": [
                              {
                                "ChildComponent": [Function],
                                "entries": [
                                  {
                                    "ChildComponent": [Function],
                                    "isActive": [Function],
                                    "key": "blockquote",
                                    "label": "Blockquote",
                                    "onClick": [Function],
                                    "order": 20,
                                  },
                                ],
                                "key": "dropdown-text",
                                "order": 1,
                                "type": "dropdown",
                              },
                            ],
                          },
                          "key": "blockquote",
                          "markdownTransformers": [
                            {
                              "dependencies": [
                                [Function],
                              ],
                              "export": [Function],
                              "regExp": /\\^>\\\\s/,
                              "replace": [Function],
                              "type": "element",
                            },
                          ],
                          "nodes": [
                            {
                              "converters": {
                                "html": {
                                  "converter": [Function],
                                  "nodeTypes": [
                                    "quote",
                                  ],
                                },
                              },
                              "node": [Function],
                              "type": "quote",
                            },
                          ],
                          "props": null,
                          "slashMenu": {
                            "options": [
                              {
                                "displayName": "Basic",
                                "key": "basic",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Blockquote",
                                    "key": "blockquote",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "quote",
                                      "blockquote",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        "upload" => {
                          "dependencies": undefined,
                          "dependenciesPriority": undefined,
                          "dependenciesSoft": undefined,
                          "key": "upload",
                          "nodes": [
                            {
                              "converters": {
                                "html": {
                                  "converter": [Function],
                                  "nodeTypes": [
                                    "upload",
                                  ],
                                },
                              },
                              "node": [Function],
                              "populationPromises": [
                                [Function],
                              ],
                              "type": "upload",
                              "validations": [
                                [Function],
                              ],
                            },
                          ],
                          "plugins": [
                            {
                              "Component": [Function],
                              "position": "normal",
                            },
                          ],
                          "props": undefined,
                          "slashMenu": {
                            "options": [
                              {
                                "displayName": "Basic",
                                "key": "basic",
                                "options": [
                                  SlashMenuOption {
                                    "Icon": [Function],
                                    "displayName": "Upload",
                                    "key": "upload",
                                    "keyboardShortcut": undefined,
                                    "keywords": [
                                      "upload",
                                      "image",
                                      "file",
                                      "img",
                                      "picture",
                                      "photo",
                                      "media",
                                    ],
                                    "onSelect": [Function],
                                    "ref": {
                                      "current": null,
                                    },
                                    "setRefElement": [Function],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                      },
                    },
                    "outputSchema": [Function],
                    "populationPromise": [Function],
                    "validate": [Function],
                  },
                  "localized": true,
                  "name": "content",
                  "type": "richText",
                },
              ],
              "name": "array",
              "type": "array",
            },
          ],
          "name": "group",
          "type": "group",
        },
      ]
    `);
  });
});
