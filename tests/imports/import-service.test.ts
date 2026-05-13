import { describe, expect, it, vi } from "vitest";
import { createImportService, type DocumentFileRecord, type ImportBatchRecord, type ImportRepository } from "@/modules/imports/application/import-service";
import { ForbiddenError, InvalidStateError, NotFoundError, TenantScopeError, ValidationError } from "@/shared/errors/application-error";
import { makeCommandContext, tenantAId, tenantBId, userAId } from "../fixtures/security";

function makeDocumentFile(overrides: Partial<DocumentFileRecord> = {}): DocumentFileRecord {
  return {
    id: "doc-1",
    tenantId: tenantAId,
    fileName: "agenda.csv",
    fileType: "csv",
    mimeType: "text/csv",
    storagePath: "tenant-a/imports/agenda.csv",
    checksumSha256: "abc123",
    sizeBytes: 128n,
    createdBy: userAId,
    createdAt: new Date("2026-05-13T12:00:00.000Z"),
    ...overrides
  };
}

function makeImportBatch(overrides: Partial<ImportBatchRecord> = {}): ImportBatchRecord {
  return {
    id: "import-1",
    tenantId: tenantAId,
    documentFileId: "doc-1",
    createdBy: userAId,
    status: "PENDING_VALIDATION",
    sourceType: "structured_file",
    sourceName: "agenda.csv",
    idempotencyKey: null,
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    createdAt: new Date("2026-05-13T12:00:00.000Z"),
    updatedAt: new Date("2026-05-13T12:00:00.000Z"),
    validatedAt: null,
    archivedAt: null,
    ...overrides
  };
}

function makeRepository(overrides: Partial<ImportRepository> = {}) {
  const repository: ImportRepository = {
    findDocumentFileById: vi.fn().mockResolvedValue(makeDocumentFile()),
    findImportBatchById: vi.fn().mockResolvedValue(makeImportBatch()),
    findImportBatchByIdempotencyKey: vi.fn().mockResolvedValue(null),
    createImportBatch: vi.fn().mockImplementation(async (input) =>
      makeImportBatch({
        tenantId: input.tenantId,
        documentFileId: input.documentFileId,
        createdBy: input.createdBy,
        status: input.status,
        sourceType: input.sourceType,
        sourceName: input.sourceName ?? null,
        idempotencyKey: input.idempotencyKey ?? null
      })
    ),
    updateImportBatch: vi.fn().mockImplementation(async (input) =>
      makeImportBatch({
        tenantId: input.tenantId,
        status: input.status,
        totalRows: input.totalRows ?? 0,
        validRows: input.validRows ?? 0,
        invalidRows: input.invalidRows ?? 0,
        validatedAt: input.validatedAt ?? null
      })
    ),
    createImportRows: vi.fn().mockResolvedValue(undefined),
    ...overrides
  };

  return repository;
}

function makeAudit() {
  return {
    record: vi.fn().mockResolvedValue(undefined)
  };
}

describe("createImportFromDocument", () => {
  it("creates a pending import from a same-tenant document and records audit", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createImportService({ repository, audit });

    const result = await service.createImportFromDocument({
      context: makeCommandContext("FISCAL_OPERATOR"),
      documentFileId: "doc-1",
      idempotencyKey: "idem-1"
    });

    expect(result.status).toBe("PENDING_VALIDATION");
    expect(repository.createImportBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: tenantAId,
        documentFileId: "doc-1",
        createdBy: userAId,
        sourceType: "structured_file",
        sourceName: "agenda.csv",
        idempotencyKey: "idem-1"
      })
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: tenantAId,
        actorId: userAId,
        eventType: "imports.created",
        entityType: "ImportBatch",
        correlationId: "corr_test"
      })
    );
  });

  it("blocks roles without imports.create", async () => {
    const service = createImportService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.createImportFromDocument({
        context: makeCommandContext("AUDITOR"),
        documentFileId: "doc-1"
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("blocks document files from another tenant", async () => {
    const repository = makeRepository({
      findDocumentFileById: vi.fn().mockResolvedValue(makeDocumentFile({ tenantId: tenantBId }))
    });
    const service = createImportService({ repository, audit: makeAudit() });

    await expect(
      service.createImportFromDocument({
        context: makeCommandContext("OWNER"),
        documentFileId: "doc-1"
      })
    ).rejects.toThrow(TenantScopeError);
  });

  it("fails when document file does not exist", async () => {
    const repository = makeRepository({ findDocumentFileById: vi.fn().mockResolvedValue(null) });
    const service = createImportService({ repository, audit: makeAudit() });

    await expect(
      service.createImportFromDocument({ context: makeCommandContext("OWNER"), documentFileId: "missing" })
    ).rejects.toThrow(NotFoundError);
  });

  it("fails when document file has no checksum", async () => {
    const repository = makeRepository({
      findDocumentFileById: vi.fn().mockResolvedValue(makeDocumentFile({ checksumSha256: "" }))
    });
    const service = createImportService({ repository, audit: makeAudit() });

    await expect(
      service.createImportFromDocument({ context: makeCommandContext("OWNER"), documentFileId: "doc-1" })
    ).rejects.toThrow(ValidationError);
  });

  it("returns the existing import for the same idempotency key", async () => {
    const existing = makeImportBatch({ id: "import-existing", idempotencyKey: "idem-1" });
    const repository = makeRepository({
      findImportBatchByIdempotencyKey: vi.fn().mockResolvedValue(existing)
    });
    const audit = makeAudit();
    const service = createImportService({ repository, audit });

    const result = await service.createImportFromDocument({
      context: makeCommandContext("OWNER"),
      documentFileId: "doc-1",
      idempotencyKey: "idem-1"
    });

    expect(result.id).toBe("import-existing");
    expect(repository.createImportBatch).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });
});

describe("validateImport", () => {
  it("validates structured rows, creates import rows and records audit", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createImportService({ repository, audit });
    const now = new Date("2026-05-13T13:00:00.000Z");

    const result = await service.validateImport({
      context: makeCommandContext("FISCAL_OPERATOR"),
      importBatchId: "import-1",
      rows: [{ sourceRowId: "1", description: "Consulta", amount: 10000 }],
      now
    });

    expect(result.status).toBe("READY_FOR_REVIEW");
    expect(repository.updateImportBatch).toHaveBeenNthCalledWith(1, {
      id: "import-1",
      tenantId: tenantAId,
      status: "VALIDATING"
    });
    expect(repository.createImportRows).toHaveBeenCalledWith([
      expect.objectContaining({
        tenantId: tenantAId,
        importBatchId: "import-1",
        rowNumber: 1,
        status: "NORMALIZED"
      })
    ]);
    expect(repository.updateImportBatch).toHaveBeenNthCalledWith(2, {
      id: "import-1",
      tenantId: tenantAId,
      status: "READY_FOR_REVIEW",
      totalRows: 1,
      validRows: 1,
      invalidRows: 0,
      validatedAt: now
    });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "imports.validation_started" }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "imports.validation_finished" }));
  });

  it("marks import as HAS_ERRORS when structural rows are invalid", async () => {
    const repository = makeRepository();
    const service = createImportService({ repository, audit: makeAudit() });

    const result = await service.validateImport({
      context: makeCommandContext("OWNER"),
      importBatchId: "import-1",
      rows: [{ ok: true }, null]
    });

    expect(result.status).toBe("HAS_ERRORS");
    expect(repository.createImportRows).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ status: "NORMALIZED" }),
        expect.objectContaining({ status: "REJECTED" })
      ])
    );
  });

  it("marks an empty structural import as VALIDATED", async () => {
    const repository = makeRepository();
    const service = createImportService({ repository, audit: makeAudit() });

    const result = await service.validateImport({
      context: makeCommandContext("OWNER"),
      importBatchId: "import-1",
      rows: []
    });

    expect(result.status).toBe("VALIDATED");
    expect(repository.createImportRows).not.toHaveBeenCalled();
  });

it("blocks validation for roles without imports.create", async () => {
    const service = createImportService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.validateImport({
        context: makeCommandContext("AUDITOR"),
        importBatchId: "import-1",
        rows: []
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("blocks validation from another tenant", async () => {
    const repository = makeRepository({
      findImportBatchById: vi.fn().mockResolvedValue(makeImportBatch({ tenantId: tenantBId }))
    });
    const service = createImportService({ repository, audit: makeAudit() });

    await expect(
      service.validateImport({ context: makeCommandContext("OWNER"), importBatchId: "import-1", rows: [] })
    ).rejects.toThrow(TenantScopeError);
  });

  it("fails when import does not exist", async () => {
    const repository = makeRepository({ findImportBatchById: vi.fn().mockResolvedValue(null) });
    const service = createImportService({ repository, audit: makeAudit() });

    await expect(
      service.validateImport({ context: makeCommandContext("OWNER"), importBatchId: "missing", rows: [] })
    ).rejects.toThrow(NotFoundError);
  });

  it("fails when import status cannot be validated", async () => {
    const repository = makeRepository({
      findImportBatchById: vi.fn().mockResolvedValue(makeImportBatch({ status: "READY_FOR_REVIEW" }))
    });
    const service = createImportService({ repository, audit: makeAudit() });

    await expect(
      service.validateImport({ context: makeCommandContext("OWNER"), importBatchId: "import-1", rows: [] })
    ).rejects.toThrow(InvalidStateError);
  });
});