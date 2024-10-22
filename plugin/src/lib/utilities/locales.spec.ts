import { getOtherLocales } from './locales'

const localeMap = {
  da_DK: {
    crowdinId: "da",
  },
  de_DE: {
    crowdinId: "de",
  },
  fr_FR: {
    crowdinId: "fr",
  },
};

describe('fn: getOtherLocales', () => {
  const fixtures = [
    [
      'da_DK',
      ['de_DE', 'fr_FR']
    ],
    [
      'de_DE',
      ['da_DK', 'fr_FR']
    ],
    [
      'fr_FR',
      ['da_DK', 'de_DE']
    ],
    [
      '',
      ['da_DK', 'de_DE', 'fr_FR']
    ],
  ]
  describe.each(fixtures)(`%s`, (string, result) => {
    it(`${string} is excluded in returned locales`, () => {
        expect(getOtherLocales({
          locale: string as string,
          localeMap
      })).toEqual(result)
    });
  });
});
