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

  it('returns true for invalid directory id message', () => {
    expect(
      isCrowdinDirectoryNotFoundError(
        new Error("Invalid directory id given. Directory doesn't exists"),
      ),
    ).toBe(true);
  });

  it('returns false for name conflict errors', () => {
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
