# Engineering decisions

## CrowdIn file types

For each article/global:

- The collection/global `fields` configuration is parsed to retrieve supported localized fields: `text`, `textarea` and `richText`.
- `richText` fields have their own CrowdIn file. e.g. `content.html`. For ease-of-editing in CrowdIn, Slate JSON is converted to HTML. When translated HTML is synced back into Payload, it is converted back to Slate JSON.
- All other fields are compiled into a single `fields.json` file for ease-of-editing in CrowdIn.

## `blocks` and `array` field types

The `fields.json` file contents and HTML file names include the following non-localized fields: 

- `id` and `blockType` for `blocks` fields; and
- `id` for `array` fields.

This is because the `blockType` and `id` fields are required for the update to be successful.

These fields are not intended for translators. MEasures are taken to ensure they do not appear as translatable values in CrowdIn.

- In `fields.json`, these values are incorporated as object keys. This changes the data structure, and translations retrieved from CrowdIn need to be converted back to an appropriate structure before updating documents in CrowdIn.
- In HTML file names, these values are incorporated into the file name as dot notation representing the position of the data in the Payload document.

Let's take the following example of a Payload document:

```ts
{
  title: "Test Policy created with title",
  blocksField: [
    {
      textField: "Text field content in basicBlock at layout index 0",
      textareaField: "Textarea field content in basicBlock at layout index 0",
      id: "63ea42b06ff825cddad3c133",
      blockType: "basicBlock",
    },
    {
      richTextField: [
        {
          type: "h1",
          children: [
            {
              text: "Rich text content in ",
            },
            {
              text: "basicBlockRichText",
              bold: true,
            },
            {
              text: " layout at index 1.",
            },
          ],
        },
        {
          children: [
            {
              text: "An extra paragraph for good measure.",
            },
          ],
        },
      ],
      id: "63d169d3d9dfd46d37c649e4",
      blockType: "basicBlockRichText",
    },
    {
      textField: "Text field content in basicBlock at layout index 2",
      textareaField: "Textarea field content in basicBlock at layout index 2",
      id: "63ea373fb725d8a50646952e",
      blockType: "basicBlock",
    },
    {
      richTextField: [
        {
          children: [
            {
              text: "Rich text content in basicBlockRichText layout at index 3.",
            },
          ],
        },
      ],
      id: "63ea3e7fb725d8a50646956a",
      blockType: "basicBlockRichText",
    },
    {
      textField: "Text field content in basicBlockMixed at layout index 4",
      textareaField: "Textarea field content in basicBlockMixed at layout index 4",
      richTextField: [
        {
          children: [
            {
              text: "Rich text content in basicBlockMixed layout at index 4.",
            },
          ],
        },
      ],
      id: "63ea40106ff825cddad3c10b",
      blockType: "basicBlockMixed",
    },
  ],
}
```

For this example, the following JSON structure is sent to CrowdIn:

```ts
{ 
    blocksField:
      {
        "63ea42b06ff825cddad3c133": {
          "basicBlock" : {
              textField: "Text field content in basicBlock at layout index 0",
              textareaField: "Textarea field content in basicBlock at layout index 0",
            },
          },
        "63ea373fb725d8a50646952e": {
          "basicBlock" : {
            textField: "Text field content in basicBlock at layout index 2",
            textareaField: "Textarea field content in basicBlock at layout index 2",
          },
      },
      
        "63ea40106ff825cddad3c10b": {
          "basicBlockMixed" : {

            textField: "Text field content in basicBlockMixed at layout index 4",
            textareaField: "Textarea field content in basicBlockMixed at layout index 4",
          },
        },
      },
  }
```

Individual HTML files are created for `richText` fields. For example:

```
blocksField.63d169d3d9dfd46d37c649e4.basicBlockRichText.richTextField.html
```

```html
<h1>Rich text content in <strong>basicBlockRichText</strong> layout at index 1.</h1><p>An extra paragraph for good measure.</p>
```

The `buildPayloadUpdateObject` transforms this data to a structure acceptable for Payload update operations by:

- taking the `fields.json` data and restoring `id` and `blockType` to the Payload CMS data structure;
- take an object containing HTML file names as keys with serialized Slate JSON values, and use the dot notation in the keys to merge `richText` values; and
- use the `restoreOrder` function together with the original document to ensure the order of array items and blocks is restored.
