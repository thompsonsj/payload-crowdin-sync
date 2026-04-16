import { mockCrowdinClient } from './crowdin-api-responses';
import { pluginOptions } from './plugin-options';

describe('crowdinAPIWrapper', () => {
  const mockClient = mockCrowdinClient(pluginOptions);

  describe('createFile', () => {
    it('returns a file with default revisionId of 1', () => {
      const result = mockClient.createFile({});
      expect(result.data.revisionId).toBe(1);
    });

    it('returns a file with a custom revisionId when specified', () => {
      const result = mockClient.createFile({ revisionId: 5 });
      expect(result.data.revisionId).toBe(5);
    });

    it('returns a file with default fileId of 1079', () => {
      const result = mockClient.createFile({});
      expect(result.data.id).toBe(1079);
    });

    it('returns a file with a custom fileId when specified', () => {
      const result = mockClient.createFile({ fileId: 9999 });
      expect(result.data.id).toBe(9999);
    });

    it('includes expected fields in the response', () => {
      const result = mockClient.createFile({});
      expect(result.data).toMatchObject({
        status: 'active',
        priority: 'normal',
        projectId: pluginOptions.projectId,
      });
    });

    it('uses request directoryId when provided', () => {
      const result = mockClient.createFile({
        request: {
          directoryId: 5555,
          name: 'my-file',
          storageId: 100,
          type: 'json',
        },
      });
      expect(result.data.directoryId).toBe(5555);
    });
  });

  describe('updateOrRestoreFile', () => {
    it('returns a file with default revisionId of 2', () => {
      const result = mockClient.updateOrRestoreFile({ fileId: 1079 });
      expect(result.data.revisionId).toBe(2);
    });

    it('returns a file with a custom revisionId when specified', () => {
      const result = mockClient.updateOrRestoreFile({
        fileId: 1079,
        revisionId: 10,
      });
      expect(result.data.revisionId).toBe(10);
    });

    it('returns a file with the provided fileId', () => {
      const result = mockClient.updateOrRestoreFile({ fileId: 4242 });
      expect(result.data.id).toBe(4242);
    });

    it('includes expected fields in the response', () => {
      const result = mockClient.updateOrRestoreFile({ fileId: 1079 });
      expect(result.data).toMatchObject({
        status: 'active',
        priority: 'normal',
        projectId: pluginOptions.projectId,
      });
    });
  });

  describe('createDirectory', () => {
    it('returns a directory with the default id', () => {
      const result = mockClient.createDirectory({});
      expect(result.data.id).toBe(1169);
    });

    it('returns a directory with a custom id when specified', () => {
      const result = mockClient.createDirectory({ id: 7777 });
      expect(result.data.id).toBe(7777);
    });
  });

  describe('buildProjectFileTranslation', () => {
    it('returns a build response with a URL containing targetLanguageId', () => {
      const result = mockClient.buildProjectFileTranslation({
        request: { targetLanguageId: 'de' },
      });
      expect(result.data.url).toContain('de');
    });

    it('returns a custom URL when provided', () => {
      const customUrl = 'https://example.com/custom-translation';
      const result = mockClient.buildProjectFileTranslation({
        url: customUrl,
      });
      expect(result.data.url).toBe(customUrl);
    });
  });
});