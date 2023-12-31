import { devAlternativeConfig } from './dev-alternative-config';

describe('devAlternativeConfig', () => {
  it('should work', () => {
    expect(devAlternativeConfig()).toEqual('dev-alternative-config');
  });
});
