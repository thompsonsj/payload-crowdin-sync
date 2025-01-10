import type { Field } from "payload";
import { getLocalizedFields } from "../..";
import { basicLocalizedFields } from "../fixtures/basic-localized-fields.fixture";

describe("presentation only tab fields", () => {
  it("returns an empty array if no localized fields in tabs", () => {
    // fixture from https://payloadcms.com/docs/fields/tabs
    const fields: Field[] = [
      {
        type: "tabs", // required
        tabs: [
          // required
          {
            label: "Tab One Label", // required
            description: "This will appear within the tab above the fields.",
            fields: [
              // required
              {
                name: "someTextField",
                type: "text",
                required: true,
              },
            ],
          },
          {
            name: "tabTwo",
            label: "Tab Two Label", // required
            interfaceName: "TabTwo", // optional (`name` must be present)
            fields: [
              // required
              {
                name: "numberField", // accessible via tabTwo.numberField
                type: "number",
                required: true,
              },
            ],
          },
        ],
      },
    ];

    expect(getLocalizedFields({ fields })).toEqual([]);
  });

  it("returns localized fields in tabs", () => {
    // fixture from https://payloadcms.com/docs/fields/tabs
    const fields: Field[] = [
      {
        type: "tabs", // required
        tabs: [
          // required
          {
            label: "Tab One Label", // required
            description: "This will appear within the tab above the fields.",
            fields: [
              // required
              {
                name: "someTextField",
                type: "text",
                required: true,
                localized: true,
              },
            ],
          },
          {
            name: "tabTwo",
            label: "Tab Two Label", // required
            interfaceName: "TabTwo", // optional (`name` must be present)
            fields: [
              // required
              {
                name: "numberField", // accessible via tabTwo.numberField
                type: "number",
                required: true,
                localized: true,
              },
            ],
          },
        ],
      },
    ];

    expect(getLocalizedFields({ fields })).toEqual([
      {
        localized: true,
        name: "someTextField",
        required: true,
        type: "text",
      },
    ]);
  });

  it("returns localized fields in tabs within an array", () => {
    // fixture from https://payloadcms.com/docs/fields/tabs
    const fields: Field[] = [
      {
        name: 'items',
        type: 'array',
        fields:[
          {
            type: "tabs",
            tabs: [
              {
                label: "Tab One Label",
                description: "This will appear within the tab above the fields.",
                fields: basicLocalizedFields,
              },
            ],
          },
        ]
      } 
    ];

    expect(getLocalizedFields({ fields })).toEqual([
      {
        name: 'items',
        type: 'array',
        fields: [
          {
            name: "textField",
            type: "text",
            localized: true,
          },
          {
            name: "textareaField",
            type: "textarea",
            localized: true,
          },
        ]
      }
    ]);
  });

  it("returns localized fields in tab respecting tab names", () => {
    // fixture from https://payloadcms.com/docs/fields/tabs
    const fields: Field[] = [
      {
        type: "tabs", // required
        tabs: [
          // required
          {
            label: "Tab One Label", // required
            description: "This will appear within the tab above the fields.",
            fields: basicLocalizedFields,
          },
          {
            name: "tabTwo",
            label: "Tab Two Label", // required
            interfaceName: "TabTwo", // optional (`name` must be present)
            fields: basicLocalizedFields,
          },
        ],
      },
    ];

    expect(getLocalizedFields({ fields })).toEqual([
      {
        fields: [
          {
            name: "textField",
            type: "text",
            localized: true,
          },
          {
            name: "textareaField",
            type: "textarea",
            localized: true,
          },
        ],
        name: "tabTwo",
        type: "group",
      },
      {
        name: "textField",
        type: "text",
        localized: true,
      },
      {
        name: "textareaField",
        type: "textarea",
        localized: true,
      },
    ]);
  });

  it("returns localized fields in tab respecting tab names with other fields", () => {
    // fixture from https://payloadcms.com/docs/fields/tabs
    const fields: Field[] = [
      {
        name: "textFieldExtra",
        type: "text",
        localized: true,
      },
      {
        name: "textareaFieldExtra",
        type: "textarea",
        localized: true,
      },
      {
        type: "tabs", // required
        tabs: [
          // required
          {
            label: "Tab One Label", // required
            description: "This will appear within the tab above the fields.",
            fields: basicLocalizedFields,
          },
          {
            name: "tabTwo",
            label: "Tab Two Label", // required
            interfaceName: "TabTwo", // optional (`name` must be present)
            fields: basicLocalizedFields,
          },
        ],
      },
    ];

    expect(getLocalizedFields({ fields })).toEqual([
      {
        name: "textFieldExtra",
        type: "text",
        localized: true,
      },
      {
        name: "textareaFieldExtra",
        type: "textarea",
        localized: true,
      },
      {
        fields: [
          {
            name: "textField",
            type: "text",
            localized: true,
          },
          {
            name: "textareaField",
            type: "textarea",
            localized: true,
          },
        ],
        name: "tabTwo",
        type: "group",
      },
      {
        name: "textField",
        type: "text",
        localized: true,
      },
      {
        name: "textareaField",
        type: "textarea",
        localized: true,
      },
    ]);
  });
});
