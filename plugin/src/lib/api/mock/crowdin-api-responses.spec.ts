import { mockCrowdinClient } from './crowdin-api-responses';
import { pluginOptions } from './plugin-options';

describe('crowdinAPIWrapper: createFile', () => {
  const mockClient = mockCrowdinClient(pluginOptions);

  it('returns revisionId of 1 by default', () => {
    const result = mockClient.createFile({});
    expect(result.data.revisionId).toBe(1);
  });

  it('returns a custom revisionId when provided', () => {
    const result = mockClient.createFile({ revisionId: 5 });
    expect(result.data.revisionId).toBe(5);
  });

  it('returns default fileId of 1079 when not provided', () => {
    const result = mockClient.createFile({});
    expect(result.data.id).toBe(1079);
  });

  it('returns the provided fileId', () => {
    const result = mockClient.createFile({ fileId: 9999 });
    expect(result.data.id).toBe(9999);
  });

  it('includes expected file structure', () => {
    const result = mockClient.createFile({});
    expect(result.data).toMatchObject({
      status: 'active',
      priority: 'normal',
      projectId: pluginOptions.projectId,
    });
  });

  it('uses the request directoryId when provided', () => {
    const result = mockClient.createFile({
      request: {
        directoryId: 5555,
        name: 'content',
        storageId: 1,
        type: 'html',
      },
    });
    expect(result.data.directoryId).toBe(5555);
  });

  it('uses default directoryId of 1172 when not provided in request', () => {
    const result = mockClient.createFile({});
    expect(result.data.directoryId).toBe(1172);
  });
});

describe('crowdinAPIWrapper: updateOrRestoreFile', () => {
  const mockClient = mockCrowdinClient(pluginOptions);

  it('returns revisionId of 2 by default', () => {
    const result = mockClient.updateOrRestoreFile({ fileId: 1079 });
    expect(result.data.revisionId).toBe(2);
  });

  it('returns a custom revisionId when provided', () => {
    const result = mockClient.updateOrRestoreFile({
      fileId: 1079,
      revisionId: 10,
    });
    expect(result.data.revisionId).toBe(10);
  });

  it('returns the provided fileId', () => {
    const result = mockClient.updateOrRestoreFile({ fileId: 2345 });
    expect(result.data.id).toBe(2345);
  });

  it('includes expected file structure', () => {
    const result = mockClient.updateOrRestoreFile({ fileId: 1079 });
    expect(result.data).toMatchObject({
      status: 'active',
      priority: 'normal',
      projectId: pluginOptions.projectId,
    });
  });

  it('revisionId for updateOrRestoreFile (2) is greater than revisionId for createFile (1)', () => {
    const created = mockClient.createFile({});
    const updated = mockClient.updateOrRestoreFile({ fileId: created.data.id });
    expect(updated.data.revisionId).toBeGreaterThan(created.data.revisionId);
  });
});

describe('crowdinAPIWrapper: createDirectory', () => {
  const mockClient = mockCrowdinClient(pluginOptions);

  it('returns default id of 1169 when not provided', () => {
    const result = mockClient.createDirectory({});
    expect(result.data.id).toBe(1169);
  });

  it('returns the provided id', () => {
    const result = mockClient.createDirectory({ id: 42 });
    expect(result.data.id).toBe(42);
  });

  it('uses the projectId from pluginOptions', () => {
    const result = mockClient.createDirectory({});
    expect(result.data.projectId).toBe(pluginOptions.projectId);
  });
});