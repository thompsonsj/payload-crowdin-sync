import { CrowdinError } from '@crowdin/crowdin-api-client';
import {
  isCrowdinDirectoryNotFoundError,
  isCrowdinNameConflictError,
} from './index';

describe('isCrowdinDirectoryNotFoundError', () => {
  it('returns true for CrowdinError with code 404', () => {
    expect(
      isCrowdinDirectoryNotFoundError(new CrowdinError('Not found', 404, {})),
    ).toBe(true);
  });

  it.each([
    "Invalid directory id given. Directory doesn't exists",
    "Invalid directory id given. Directory doesn't exist",
  ])('returns true for Crowdin invalid-parent message: %s', (message) => {
    expect(isCrowdinDirectoryNotFoundError(new Error(message))).toBe(true);
  });

  it('returns false for name conflict errors (handled separately)', () => {
    const conflict = {
      error: {
        errors: [{ error: { key: 'directory.name.is_already_exists' } }],
      },
    };
    expect(isCrowdinDirectoryNotFoundError(conflict)).toBe(false);
    expect(isCrowdinNameConflictError(conflict)).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isCrowdinDirectoryNotFoundError(new Error('Network timeout'))).toBe(
      false,
    );
  });
});
