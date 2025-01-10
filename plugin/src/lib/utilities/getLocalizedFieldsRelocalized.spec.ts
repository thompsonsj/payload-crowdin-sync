import type { Field} from 'payload';
import { getLocalizedFields } from '.';
import { reLocalizeField } from '.';

describe('fn: getLocalizedFields using reLocalizeField', () => {
  describe('basic field types', () => {
    it('includes a text field', () => {
      const fields: Field[] = [
        {
          name: 'textLocalizedField',
          type: 'text',
        },
      ];
      expect(getLocalizedFields({ fields, isLocalized: reLocalizeField })).toEqual(fields);
    });

    it('excludes a localized text field based on the admin description', () => {
      const fields: Field[] = [
        {
          name: 'textLocalizedField',
          type: 'text',
        },
        {
          name: 'textLocalizedFieldWithExcludeDescription',
          type: 'text',
          admin: {
            description: 'Not sent to Crowdin. Localize in the CMS.',
          },
        },
      ];
      expect(getLocalizedFields({ fields, isLocalized: reLocalizeField })).toEqual([
        {
          name: 'textLocalizedField',
          type: 'text',
        },
      ]);
    });

    it('includes a richText field', () => {
      const fields: Field[] = [
        {
          name: 'richTextLocalizedField',
          type: 'richText',
        },
      ];
      expect(getLocalizedFields({ fields, isLocalized: reLocalizeField })).toEqual(fields);
    });

    it('includes a textarea field', () => {
      const fields: Field[] = [
        {
          name: 'textareaLocalizedField',
          type: 'textarea',
        },
      ];
      expect(getLocalizedFields({ fields, isLocalized: reLocalizeField })).toEqual(fields);
    });

    it("returns relocalized fields in tabs within an array", () => {
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
                  fields: [
                    {
                      name: "textField",
                      type: "text",
                    },
                    {
                      name: "textareaField",
                      type: "textarea",
                    },
                    // select not supported: included to ensure it does not send to Crowdin
                    {
                      name: "select",
                      type: "select",
                      options: ["one", "two"],
                    },
                    // image not supported: included to ensure it does send to Crowdin
                    {
                      name: "image",
                      type: "upload",
                      relationTo: "media",
                    },
                  ],
                },
              ],
            },
          ]
        } 
      ];
  
      expect(getLocalizedFields({ fields, isLocalized: reLocalizeField })).toEqual([
        {
          name: 'items',
          type: 'array',
          fields: [
            {
              name: "textField",
              type: "text",
            },
            {
              name: "textareaField",
              type: "textarea",
            },
          ]
        }
      ]);
    });
  });
});
