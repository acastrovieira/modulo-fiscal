import { describe, expect, it, vi } from "vitest";
import { createImportService, type DocumentFileRecord, type ImportBatchRecord, type ImportRepository } from "@/modules/imports/application/import-service";
import { defaultImportParserVersion } from "@/modules/imports/domain/import-parser";
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
    replaceImportRows: vi.fn().mockResolvedValue(undefined),
    countFiscalCandidatesByImportBatchId: vi.fn().mockResolvedValue(0),
    findLatestValidationAttempt: vi.fn().mockResolvedValue(null),
    createValidationAttempt: vi.fn().mockResolvedValue(undefined),
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
      parserVersion: defaultImportParserVersion,
      rows: [
        {
          source_row_id: "1",
          serviceDescription: "Consulta",
          amountCents: "10000",
          tutorName: "Maria Demo",
          customerDocumentMasked: "***.123.***-**",
          serviceDate: "2026-05-13"
        }
      ],
      now
    });

    expect(result.status).toBe("READY_FOR_REVIEW");
    expect(repository.updateImportBatch).toHaveBeenNthCalledWith(1, {
      id: "import-1",
      tenantId: tenantAId,
      status: "VALIDATING"
    });
    expect(repository.replaceImportRows).toHaveBeenCalledWith({
      importBatchId: "import-1",
      tenantId: tenantAId,
      rows: [
      expect.objectContaining({
        tenantId: tenantAId,
        importBatchId: "import-1",
        rowNumber: 1,
        sourceRowId: "1",
        status: "NORMALIZED",
        normalizedPayload: expect.objectContaining({
          parserVersion: defaultImportParserVersion,
          description: "Consulta",
          amountCents: "10000",
          customerName: "Maria Demo",
          customerDocumentMasked: "***.123.***-**",
          duplicateWithinImport: false
        })
      })
      ]
    });
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
      rows: [{ description: "Vacina", amount: 4500 }, null]
    });

    expect(result.status).toBe("HAS_ERRORS");
    expect(repository.replaceImportRows).toHaveBeenCalledWith(
      expect.objectContaining({
        rows: expect.arrayContaining([
        expect.objectContaining({ status: "NORMALIZED" }),
        expect.objectContaining({ status: "QUARANTINED" })
        ])
      })
    );
  });

  it("flags duplicate rows within the same parser version without blocking review", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createImportService({ repository, audit });

    const result = await service.validateImport({
      context: makeCommandContext("OWNER"),
      importBatchId: "import-1",
      rows: [
        { sourceRowId: "line-1", description: "Consulta", amount: 10000, serviceDate: "2026-05-13" },
        { sourceRowId: "line-1", description: "Consulta", amount: 10000, serviceDate: "2026-05-13" }
      ]
    });

    expect(result.status).toBe("READY_FOR_REVIEW");
    expect(repository.replaceImportRows).toHaveBeenCalledWith({
      importBatchId: "import-1",
      tenantId: tenantAId,
      rows: [
      expect.objectContaining({
        normalizedPayload: expect.objectContaining({ duplicateWithinImport: false })
      }),
      expect.objectContaining({
        normalizedPayload: expect.objectContaining({ duplicateWithinImport: true })
      })
      ]
    });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "imports.validation_finished",
        afterPayload: expect.objectContaining({ duplicateRows: 1, parserVersion: defaultImportParserVersion })
      })
    );
  });

  it("rejects client-controlled tenant and raw document fields in rows", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createImportService({ repository, audit });

    const result = await service.validateImport({
      context: makeCommandContext("OWNER"),
      importBatchId: "import-1",
      rows: [
        { description: "Consulta", amount: 10000, tenantId: tenantBId },
        { description: "Consulta", amount: 10000, customerDocument: "12345678901" }
      ]
    });

    expect(result.status).toBe("HAS_ERRORS");
    expect(repository.replaceImportRows).toHaveBeenCalledWith({
      importBatchId: "import-1",
      tenantId: tenantAId,
      rows: [
      expect.objectContaining({
        status: "QUARANTINED",
        errorPayload: expect.objectContaining({ parserVersion: defaultImportParserVersion })
      }),
      expect.objectContaining({
        status: "QUARANTINED",
        errorPayload: expect.objectContaining({ parserVersion: defaultImportParserVersion })
      })
      ]
    });
    expect(JSON.stringify(audit.record.mock.calls)).not.toContain("12345678901");
  });

  it("fails fast for unsupported parser versions", async () => {
    const repository = makeRepository();
    const service = createImportService({ repository, audit: makeAudit() });

    await expect(
      service.validateImport({
        context: makeCommandContext("OWNER"),
        importBatchId: "import-1",
        rows: [],
        parserVersion: "unknown_parser_v1"
      })
    ).rejects.toThrow(ValidationError);
    expect(repository.findImportBatchById).not.toHaveBeenCalled();
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
    expect(repository.replaceImportRows).toHaveBeenCalledWith({ importBatchId: "import-1", tenantId: tenantAId, rows: [] });
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
      findImportBatchById: vi.fn().mockResolvedValue(makeImportBatch({ status: "ARCHIVED" }))
    });
    const service = createImportService({ repository, audit: makeAudit() });

    await expect(
      service.validateImport({ context: makeCommandContext("OWNER"), importBatchId: "import-1", rows: [] })
    ).rejects.toThrow(InvalidStateError);
  });

  it("replays validation with the same parser by replacing rows and recording another attempt", async () => {
    const repository = makeRepository({
      findImportBatchById: vi.fn().mockResolvedValue(makeImportBatch({ status: "HAS_ERRORS", validRows: 1, invalidRows: 1 })),
      findLatestValidationAttempt: vi.fn().mockResolvedValue({
        id: "attempt-1",
        tenantId: tenantAId,
        importBatchId: "import-1",
        parserVersion: defaultImportParserVersion,
        status: "QUARANTINED",
        totalRows: 2,
        validRows: 1,
        invalidRows: 1,
        duplicateRows: 0,
        createdBy: userAId,
        correlationId: "corr_previous",
        errorsSummary: [],
        createdAt: new Date("2026-05-13T12:00:00.000Z")
      })
    });
    const service = createImportService({ repository, audit: makeAudit() });

    const result = await service.validateImport({
      context: makeCommandContext("FISCAL_OPERATOR"),
      importBatchId: "import-1",
      parserVersion: defaultImportParserVersion,
      rows: [{ description: "Consulta revisada", amountCents: "10000" }]
    });

    expect(result.status).toBe("READY_FOR_REVIEW");
    expect(repository.replaceImportRows).toHaveBeenCalledTimes(1);
    expect(repository.createValidationAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: tenantAId,
        importBatchId: "import-1",
        parserVersion: defaultImportParserVersion,
        status: "SUCCEEDED",
        totalRows: 1,
        validRows: 1,
        invalidRows: 0
      })
    );
  });

  it("blocks replay after fiscal candidates were already created", async () => {
    const repository = makeRepository({
      findImportBatchById: vi.fn().mockResolvedValue(makeImportBatch({ status: "READY_FOR_REVIEW" })),
      countFiscalCandidatesByImportBatchId: vi.fn().mockResolvedValue(1)
    });
    const service = createImportService({ repository, audit: makeAudit() });

    await expect(
      service.validateImport({ context: makeCommandContext("OWNER"), importBatchId: "import-1", rows: [] })
    ).rejects.toThrow(InvalidStateError);
    expect(repository.replaceImportRows).not.toHaveBeenCalled();
  });
});
