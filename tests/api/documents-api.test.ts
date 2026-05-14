import { describe, expect, it, vi } from "vitest";
import { getDocumentFile, listDocumentFiles, recordDocumentDownloadIntent, type DocumentFileQueryRepository, type DocumentFileRecord } from "@/modules/documents/application/document-file-queries";
import type { AuditRecorder } from "@/modules/audit/application/audit-service";
import type { CommandContext } from "@/shared/application/command-context";

function ctx(role: CommandContext["actorRole"] = "AUDITOR"): CommandContext {
  return { tenantId: "tenant-1", actorId: "user-1", actorRole: role, correlationId: "corr-1" };
}

function document(overrides: Partial<DocumentFileRecord> = {}): DocumentFileRecord {
  return {
    id: "doc-1",
    tenantId: "tenant-1",
    fileName: "agenda-demo.csv",
    fileType: "structured_import",
    mimeType: "text/csv",
    storagePath: "tenant-1/private/agenda-demo.csv",
    checksumSha256: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    sizeBytes: 2048n,
    createdBy: "user-1",
    createdAt: new Date("2026-05-01T10:00:00.000Z"),
    linkedImportBatchesCount: 1,
    linkedFiscalCandidatesCount: 2,
    ...overrides
  };
}

function repo(overrides: Partial<DocumentFileQueryRepository> = {}): DocumentFileQueryRepository {
  return {
    listDocumentFiles: vi.fn().mockResolvedValue([document()]),
    findDocumentFile: vi.fn().mockResolvedValue(document()),
    ...overrides
  };
}

describe("documents API query contracts", () => {
  it("lists document metadata with documents.download and hides storage path", async () => {
    const repository = repo();

    const [item] = await listDocumentFiles({ context: ctx("FINANCIAL_OPERATOR"), repository, filters: { fileType: "structured_import" } });

    expect(repository.listDocumentFiles).toHaveBeenCalledWith({ tenantId: "tenant-1", filters: { fileType: "structured_import" } });
    expect(item).toEqual({
      id: "doc-1",
      fileName: "agenda-demo.csv",
      fileType: "structured_import",
      mimeType: "text/csv",
      checksumSha256Preview: "01234567...89abcdef",
      sizeBytes: "2048",
      createdBy: "user-1",
      createdAt: "2026-05-01T10:00:00.000Z"
    });
    expect(item).not.toHaveProperty("tenantId");
    expect(item).not.toHaveProperty("storagePath");
    expect(item).not.toHaveProperty("checksumSha256");
  });

  it("blocks subjects without documents.download", async () => {
    await expect(listDocumentFiles({ context: ctx("NO_ACCESS" as CommandContext["actorRole"]), repository: repo() })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects cross-tenant document rows", async () => {
    await expect(listDocumentFiles({ context: ctx(), repository: repo({ listDocumentFiles: vi.fn().mockResolvedValue([document({ tenantId: "tenant-2" })]) }) })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns detail without infrastructure storage fields", async () => {
    const detail = await getDocumentFile({ context: ctx(), repository: repo(), documentFileId: "doc-1" });

    expect(detail.linkedImportBatchesCount).toBe(1);
    expect(detail.linkedFiscalCandidatesCount).toBe(2);
    expect(detail.storageAvailable).toBe(false);
    expect(detail).not.toHaveProperty("tenantId");
    expect(detail).not.toHaveProperty("storagePath");
  });

  it("records a safe download intent without calling external storage", async () => {
    const audit: AuditRecorder = { record: vi.fn().mockResolvedValue(undefined) };

    const result = await recordDocumentDownloadIntent({ context: ctx(), repository: repo(), audit, documentFileId: "doc-1" });

    expect(result).toEqual({
      documentId: "doc-1",
      status: "DOWNLOAD_NOT_AVAILABLE_IN_MVP",
      storageAvailable: false,
      externalStorageCalled: false,
      signedUrlGenerated: false
    });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: "tenant-1",
      actorId: "user-1",
      eventType: "documents.download_intent_recorded",
      entityType: "DocumentFile",
      entityId: "doc-1",
      correlationId: "corr-1",
      metadata: expect.not.objectContaining({ storagePath: expect.anything() })
    }));
  });
});


