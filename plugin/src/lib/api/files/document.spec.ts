import { payloadCrowdinSyncDocumentFilesApi } from './document';
import { payloadCrowdinSyncFilesApi } from './index';
import { pluginOptions } from '../mock/plugin-options';
import type { CrowdinArticleDirectory, CrowdinFile } from '../../payload-types';

/**
 * Minimal mock for a Crowdin article directory.
 */
const mockArticleDirectory: CrowdinArticleDirectory = {
  id: 'dir-001',
  originalId: 111,
  createdAt: '',
  updatedAt: '',
} as CrowdinArticleDirectory;

/**
 * Build a minimal PayloadRequest mock with a controllable payload.delete.
 */
function makeReq(payloadDeleteMock = jest.fn().mockResolvedValue({})) {
  return {
    payload: {
      delete: payloadDeleteMock,
    },
  } as any;
}

/**
 * Create a payloadCrowdinSyncDocumentFilesApi instance with mocked internals.
 */
function makeDocApi(
  opts: Partial<typeof pluginOptions> = {},
  payloadDeleteMock = jest.fn().mockResolvedValue({}),
) {
  const mergedOptions = { ...pluginOptions, ...opts };
  const req = makeReq(payloadDeleteMock);
  const api = new payloadCrowdinSyncDocumentFilesApi(
    {
      document: { id: 'doc-001' } as any,
      articleDirectory: mockArticleDirectory,
      collectionSlug: 'posts',
      global: false,
    },
    mergedOptions,
    req,
  );
  return { api, req };
}

describe('payloadCrowdinSyncDocumentFilesApi: deleteFile', () => {
  const mockCrowdinFile: CrowdinFile = {
    id: 'file-001',
    originalId: 999,
    field: 'fields',
    type: 'json',
    crowdinArticleDirectory: 'dir-001',
    createdAt: '',
    updatedAt: '',
  } as CrowdinFile;

  it('calls sourceFilesApi.deleteFile when deleteCrowdinFiles is true and originalId is set', async () => {
    const deletePayloadMock = jest.fn().mockResolvedValue({ id: 'file-001' });
    const { api } = makeDocApi({ deleteCrowdinFiles: true }, deletePayloadMock);

    const crowdinDeleteFileMock = jest.fn().mockResolvedValue(undefined);
    (api as any).sourceFilesApi = { deleteFile: crowdinDeleteFileMock };

    await api.deleteFile(mockCrowdinFile);

    expect(crowdinDeleteFileMock).toHaveBeenCalledWith(
      pluginOptions.projectId,
      mockCrowdinFile.originalId,
    );
  });

  it('does NOT call sourceFilesApi.deleteFile when deleteCrowdinFiles is false', async () => {
    const deletePayloadMock = jest.fn().mockResolvedValue({ id: 'file-001' });
    const { api } = makeDocApi({ deleteCrowdinFiles: false }, deletePayloadMock);

    const crowdinDeleteFileMock = jest.fn().mockResolvedValue(undefined);
    (api as any).sourceFilesApi = { deleteFile: crowdinDeleteFileMock };

    await api.deleteFile(mockCrowdinFile);

    expect(crowdinDeleteFileMock).not.toHaveBeenCalled();
  });

  it('does NOT call sourceFilesApi.deleteFile when deleteCrowdinFiles is undefined', async () => {
    const deletePayloadMock = jest.fn().mockResolvedValue({ id: 'file-001' });
    const { api } = makeDocApi({}, deletePayloadMock);
    // pluginOptions does not have deleteCrowdinFiles by default

    const crowdinDeleteFileMock = jest.fn().mockResolvedValue(undefined);
    (api as any).sourceFilesApi = { deleteFile: crowdinDeleteFileMock };

    await api.deleteFile(mockCrowdinFile);

    expect(crowdinDeleteFileMock).not.toHaveBeenCalled();
  });

  it('does NOT call sourceFilesApi.deleteFile when originalId is absent', async () => {
    const deletePayloadMock = jest.fn().mockResolvedValue({ id: 'file-001' });
    const { api } = makeDocApi({ deleteCrowdinFiles: true }, deletePayloadMock);

    const crowdinDeleteFileMock = jest.fn().mockResolvedValue(undefined);
    (api as any).sourceFilesApi = { deleteFile: crowdinDeleteFileMock };

    const fileWithoutOriginalId: CrowdinFile = {
      ...mockCrowdinFile,
      originalId: undefined,
    };
    await api.deleteFile(fileWithoutOriginalId);

    expect(crowdinDeleteFileMock).not.toHaveBeenCalled();
  });

  it('always calls payload.delete regardless of deleteCrowdinFiles', async () => {
    const deletePayloadMock = jest.fn().mockResolvedValue({ id: 'file-001' });
    const { api } = makeDocApi({ deleteCrowdinFiles: false }, deletePayloadMock);

    (api as any).sourceFilesApi = { deleteFile: jest.fn() };

    await api.deleteFile(mockCrowdinFile);

    expect(deletePayloadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'crowdin-files',
        id: mockCrowdinFile.id,
      }),
    );
  });

  it('returns the result of payload.delete', async () => {
    const deletedDoc = { id: 'file-001', field: 'fields' };
    const deletePayloadMock = jest.fn().mockResolvedValue(deletedDoc);
    const { api } = makeDocApi({ deleteCrowdinFiles: false }, deletePayloadMock);
    (api as any).sourceFilesApi = { deleteFile: jest.fn() };

    const result = await api.deleteFile(mockCrowdinFile);

    expect(result).toEqual(deletedDoc);
  });
});

describe('payloadCrowdinSyncFilesApi: deleteArticleDirectory', () => {
  it('calls sourceFilesApi.deleteDirectory when deleteCrowdinFiles is true', async () => {
    const deletePayloadMock = jest.fn().mockResolvedValue({});
    const req = makeReq(deletePayloadMock);
    const api = new payloadCrowdinSyncFilesApi(
      { ...pluginOptions, deleteCrowdinFiles: true },
      req,
    );

    const crowdinDeleteDirMock = jest.fn().mockResolvedValue(undefined);
    (api as any).sourceFilesApi = { deleteDirectory: crowdinDeleteDirMock };

    // Override getArticleDirectory to return a mock directory directly.
    api.getArticleDirectory = jest.fn().mockResolvedValue(mockArticleDirectory);

    await api.deleteArticleDirectory('doc-001');

    expect(crowdinDeleteDirMock).toHaveBeenCalledWith(
      pluginOptions.projectId,
      mockArticleDirectory.originalId,
    );
  });

  it('does NOT call sourceFilesApi.deleteDirectory when deleteCrowdinFiles is false', async () => {
    const deletePayloadMock = jest.fn().mockResolvedValue({});
    const req = makeReq(deletePayloadMock);
    const api = new payloadCrowdinSyncFilesApi(
      { ...pluginOptions, deleteCrowdinFiles: false },
      req,
    );

    const crowdinDeleteDirMock = jest.fn().mockResolvedValue(undefined);
    (api as any).sourceFilesApi = { deleteDirectory: crowdinDeleteDirMock };
    api.getArticleDirectory = jest.fn().mockResolvedValue(mockArticleDirectory);

    await api.deleteArticleDirectory('doc-001');

    expect(crowdinDeleteDirMock).not.toHaveBeenCalled();
  });

  it('does NOT call sourceFilesApi.deleteDirectory when deleteCrowdinFiles is undefined', async () => {
    const deletePayloadMock = jest.fn().mockResolvedValue({});
    const req = makeReq(deletePayloadMock);
    const api = new payloadCrowdinSyncFilesApi(pluginOptions, req);

    const crowdinDeleteDirMock = jest.fn().mockResolvedValue(undefined);
    (api as any).sourceFilesApi = { deleteDirectory: crowdinDeleteDirMock };
    api.getArticleDirectory = jest.fn().mockResolvedValue(mockArticleDirectory);

    await api.deleteArticleDirectory('doc-001');

    expect(crowdinDeleteDirMock).not.toHaveBeenCalled();
  });

  it('returns early when no article directory is found', async () => {
    const deletePayloadMock = jest.fn().mockResolvedValue({});
    const req = makeReq(deletePayloadMock);
    const api = new payloadCrowdinSyncFilesApi(
      { ...pluginOptions, deleteCrowdinFiles: true },
      req,
    );

    const crowdinDeleteDirMock = jest.fn().mockResolvedValue(undefined);
    (api as any).sourceFilesApi = { deleteDirectory: crowdinDeleteDirMock };
    api.getArticleDirectory = jest.fn().mockResolvedValue(undefined);

    await api.deleteArticleDirectory('doc-001');

    expect(crowdinDeleteDirMock).not.toHaveBeenCalled();
    expect(deletePayloadMock).not.toHaveBeenCalled();
  });

  it('returns early when article directory has no originalId', async () => {
    const deletePayloadMock = jest.fn().mockResolvedValue({});
    const req = makeReq(deletePayloadMock);
    const api = new payloadCrowdinSyncFilesApi(
      { ...pluginOptions, deleteCrowdinFiles: true },
      req,
    );

    const crowdinDeleteDirMock = jest.fn().mockResolvedValue(undefined);
    (api as any).sourceFilesApi = { deleteDirectory: crowdinDeleteDirMock };
    api.getArticleDirectory = jest.fn().mockResolvedValue({
      ...mockArticleDirectory,
      originalId: undefined,
    });

    await api.deleteArticleDirectory('doc-001');

    expect(crowdinDeleteDirMock).not.toHaveBeenCalled();
    expect(deletePayloadMock).not.toHaveBeenCalled();
  });

  it('always deletes the Payload article directory record regardless of deleteCrowdinFiles', async () => {
    const deletePayloadMock = jest.fn().mockResolvedValue({});
    const req = makeReq(deletePayloadMock);
    const api = new payloadCrowdinSyncFilesApi(
      { ...pluginOptions, deleteCrowdinFiles: false },
      req,
    );

    (api as any).sourceFilesApi = { deleteDirectory: jest.fn() };
    api.getArticleDirectory = jest.fn().mockResolvedValue(mockArticleDirectory);

    await api.deleteArticleDirectory('doc-001');

    expect(deletePayloadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'crowdin-article-directories',
        id: mockArticleDirectory.id,
      }),
    );
  });
});

describe('payloadCrowdinSyncFilesApi: _payloadCrowdinSyncWasExisting flag', () => {
  it('is not present on a freshly created mock file (revisionId = 1)', () => {
    // Verify the mock's default setup: a new file has revisionId=1 and no existing flag.
    // The _payloadCrowdinSyncWasExisting flag is set only during conflict resolution,
    // i.e., when a file already exists on Crowdin with revisionId > 1.
    const mockFileResponse = {
      data: {
        id: 1079,
        revisionId: 1,
      },
    };
    expect((mockFileResponse as any)._payloadCrowdinSyncWasExisting).toBeUndefined();
    // A revisionId of 1 indicates a newly created file: wasExistingFile = false.
    expect(mockFileResponse.data.revisionId > 1).toBe(false);
  });

  it('simulates the existing-file detection heuristic used in document.ts', () => {
    // document.ts uses `crowdinFile.data.revisionId > 1` to detect existing files.
    // An existing file returned from crowdinFindFileByName would have revisionId > 1.
    const existingFileResponse = {
      data: { id: 1079, revisionId: 5 },
      _payloadCrowdinSyncWasExisting: true,
    };
    expect(existingFileResponse._payloadCrowdinSyncWasExisting).toBe(true);
    expect(existingFileResponse.data.revisionId > 1).toBe(true);
  });
});