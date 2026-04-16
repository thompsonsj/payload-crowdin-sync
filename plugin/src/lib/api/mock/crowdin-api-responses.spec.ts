/**
 * Tests for changes to crowdin-api-responses.ts mock wrapper (PR scope):
 *  - createFile now accepts an optional `revisionId` param (default: 1)
 *  - updateOrRestoreFile now accepts an optional `revisionId` param (default: 2)
 */
import { mockCrowdinClient } from './crowdin-api-responses';
import { pluginOptions } from './plugin-options';

describe('mockCrowdinClient', () => {
  const client = mockCrowdinClient(pluginOptions);

  describe('createFile', () => {
    it('returns revisionId of 1 by default', () => {
      const result = client.createFile({});
      expect(result.data.revisionId).toBe(1);
    });

    it('returns a custom revisionId when provided', () => {
      const result = client.createFile({ revisionId: 5 });
      expect(result.data.revisionId).toBe(5);
    });

    it('returns a custom fileId when provided', () => {
      const result = client.createFile({ fileId: 9999 });
      expect(result.data.id).toBe(9999);
    });

    it('returns default fileId 1079 when not specified', () => {
      const result = client.createFile({});
      expect(result.data.id).toBe(1079);
    });

    it('returns a well-formed file data object', () => {
      const result = client.createFile({});
      expect(result.data).toMatchObject({
        status: 'active',
        priority: 'normal',
        projectId: pluginOptions.projectId,
        parserVersion: 3,
      });
    });

    it('respects custom revisionId=0 (boundary value)', () => {
      const result = client.createFile({ revisionId: 0 });
      expect(result.data.revisionId).toBe(0);
    });

    it('respects custom revisionId=100', () => {
      const result = client.createFile({ revisionId: 100 });
      expect(result.data.revisionId).toBe(100);
    });
  });

  describe('updateOrRestoreFile', () => {
    it('returns revisionId of 2 by default', () => {
      const result = client.updateOrRestoreFile({ fileId: 1079 });
      expect(result.data.revisionId).toBe(2);
    });

    it('returns a custom revisionId when provided', () => {
      const result = client.updateOrRestoreFile({
        fileId: 1079,
        revisionId: 10,
      });
      expect(result.data.revisionId).toBe(10);
    });

    it('returns the provided fileId', () => {
      const result = client.updateOrRestoreFile({ fileId: 5678 });
      expect(result.data.id).toBe(5678);
    });

    it('returns a well-formed file data object', () => {
      const result = client.updateOrRestoreFile({ fileId: 1079 });
      expect(result.data).toMatchObject({
        status: 'active',
        priority: 'normal',
        projectId: pluginOptions.projectId,
        parserVersion: 3,
      });
    });

    it('default revisionId for update (2) is greater than default for create (1)', () => {
      const created = client.createFile({});
      const updated = client.updateOrRestoreFile({ fileId: created.data.id });
      expect(updated.data.revisionId).toBeGreaterThan(created.data.revisionId);
    });
  });
});