import type { Field } from 'payload';
import { isLocalizedField } from './isLocalizedField';

describe('fn: isLocalizedField (document)', () => {
  it('includes a localized text field that Crowdin would skip', () => {
    const field: Field = {
      name: 'internalTitle',
      type: 'text',
      localized: true,
      admin: {
        description: 'Not sent to Crowdin. Localize in the CMS.',
      },
      custom: {
        crowdinSync: {
          disable: true,
        },
      },
    };
    expect(isLocalizedField(field)).toBe(true);
  });

  it('excludes a select field even when localized', () => {
    const field: Field = {
      name: 'select',
      type: 'select',
      localized: true,
      options: ['one', 'two'],
    };
    expect(isLocalizedField(field)).toBe(false);
  });
});
