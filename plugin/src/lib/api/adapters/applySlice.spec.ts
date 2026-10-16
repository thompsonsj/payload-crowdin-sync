import type { Field } from 'payload';
import { applyDocumentSlice } from 'payload-localization-adapters';
import { isLocalizedField } from '../../utilities';

const fieldsWithDisabled: Field[] = [
  { name: 'title', type: 'text', localized: true },
  {
    name: 'internal',
    type: 'text',
    localized: true,
    custom: { crowdinSync: { disable: true } },
  },
];

describe('applyDocumentSlice (Crowdin isLocalized)', () => {
  it('applies Crowdin-disabled fields unless a predicate is passed', () => {
    expect(
      applyDocumentSlice({
        slice: { json: { title: 'Accueil', internal: 'Non' } },
        fields: fieldsWithDisabled,
        document: { title: 'Home', internal: 'No' },
      }),
    ).toEqual({ title: 'Accueil', internal: 'Non' });
  });

  it('honours the Crowdin localized-field predicate when it is passed', () => {
    expect(
      applyDocumentSlice({
        slice: { json: { title: 'Accueil', internal: 'Non' } },
        fields: fieldsWithDisabled,
        document: { title: 'Home', internal: 'No' },
        isLocalized: isLocalizedField,
      }),
    ).toEqual({ title: 'Accueil' });
  });
});
