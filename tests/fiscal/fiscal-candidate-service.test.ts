import { describe, expect, it, vi } from "vitest";
import {
  createFiscalCandidateService,
  type FiscalCandidateRecord,
  type FiscalCandidateRepository,
  type FiscalImportBatchRecord,
  type FiscalImportRowRecord
} from "@/modules/fiscal/application/fiscal-candidate-service";
import { createFiscalFingerprint, FISCAL_FINGERPRINT_VERSION } from "@/modules/fiscal/domain/fiscal-fingerprint";
import { maskBrazilianDocument } from "@/modules/fiscal/domain/masking";
import { ForbiddenError, InvalidStateError, NotFoundError, TenantScopeError } from "@/shared/errors/application-error";
import { makeCommandContext, tenantAId, tenantBId, userAId } from "../fixtures/security";

function makeImportBatch(overrides: Partial<FiscalImportBatchRecord> = {}): FiscalImportBatchRecord {
  return {
    id: "import-1",
    tenantId: tenantAId,
    documentFileId: "doc-1",
    status: "READY_FOR_REVIEW",
    ...overrides
  };
}

function makeImportRow(overrides: Partial<FiscalImportRowRecord> = {}): FiscalImportRowRecord {
  return {
    id: "row-1",
    tenantId: tenantAId,
    importBatchId: "import-1",
    status: "NORMALIZED",
    normalizedPayload: {
      customerName: "Maria Tutora",
      customerDocument: "12345678901",
      serviceDate: "2026-05-10",
      serviceDescription: "Consulta veterinaria",
      grossAmountCents: 15000
    },
    ...overrides
  };
}

function makeCandidate(overrides: Partial<FiscalCandidateRecord> = {}): FiscalCandidateRecord {
  return {
    id: "candidate-1",
    tenantId: tenantAId,
    importBatchId: "import-1",
    importRowId: "row-1",
    documentFileId: "doc-1",
    customerName: "Maria Tutora",
    customerDocumentMasked: "*******8901",
    serviceDate: new Date("2026-05-10T00:00:00.000Z"),
    competenceDate: null,
    serviceDescription: "Consulta veterinaria",
    grossAmountCents: 15000n,
    status: "NEEDS_REVIEW",
    fiscalFingerprintVersion: FISCAL_FINGERPRINT_VERSION,
    fiscalFingerprint: "fingerprint-1",
    reviewedBy: null,
    reviewedAt: null,
    ...overrides
  };
}

function makeRepository(overrides: Partial<FiscalCandidateRepository> = {}) {
  const repository: FiscalCandidateRepository = {
    findImportBatchById: vi.fn().mockResolvedValue(makeImportBatch()),
    findNormalizedRowsByImportBatchId: vi.fn().mockResolvedValue([makeImportRow()]),
    findCandidateByFingerprint: vi.fn().mockResolvedValue(null),
    createFiscalCandidate: vi.fn().mockImplementation(async (input) =>
      makeCandidate({
        tenantId: input.tenantId,
        importBatchId: input.importBatchId,
        importRowId: input.importRowId,
        documentFileId: input.documentFileId,
        customerName: input.customerName,
        customerDocumentMasked: input.customerDocumentMasked,
        serviceDate: input.serviceDate,
        competenceDate: input.competenceDate,
        serviceDescription: input.serviceDescription,
        grossAmountCents: input.grossAmountCents,
        status: input.status,
        fiscalFingerprintVersion: input.fiscalFingerprintVersion,
        fiscalFingerprint: input.fiscalFingerprint
      })
    ),
    markImportRowCandidateCreated: vi.fn().mockResolvedValue(undefined),
    findCandidateById: vi.fn().mockResolvedValue(makeCandidate()),
    updateFiscalCandidate: vi.fn().mockImplementation(async (input) =>
      makeCandidate({
        id: input.id,
        tenantId: input.tenantId,
        status: input.status,
        reviewedBy: input.reviewedBy ?? null,
        reviewedAt: input.reviewedAt ?? null
      })
    ),
    ...overrides
  };

  return repository;
}

function makeAudit() {
  return {
    record: vi.fn().mockResolvedValue(undefined)
  };
}

describe("fiscal fingerprint", () => {
  it("creates a deterministic versioned fingerprint input", () => {
    const first = createFiscalFingerprint({
      tenantId: tenantAId,
      customerDocumentMasked: "*******8901",
      serviceDate: "2026-05-10",
      serviceDescription: "Consulta veterinaria",
      grossAmountCents: 15000n
    });
    const second = createFiscalFingerprint({
      tenantId: tenantAId,
      customerDocumentMasked: "*******8901",
      serviceDate: "2026-05-10",
      serviceDescription: " consulta VETERINARIA ",
      grossAmountCents: "15000"
    });

    expect(FISCAL_FINGERPRINT_VERSION).toBe("v1");
    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("masks Brazilian documents for candidate display", () => {
    expect(maskBrazilianDocument("123.456.789-01")).toBe("*******8901");
    expect(maskBrazilianDocument(null)).toBeNull();
  });
});

describe("createFiscalCandidatesFromImport", () => {
  it("creates candidates from normalized rows and records audit", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createFiscalCandidateService({ repository, audit });

    const result = await service.createFiscalCandidatesFromImport({
      context: makeCommandContext("FISCAL_OPERATOR"),
      importBatchId: "import-1"
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      tenantId: tenantAId,
      importBatchId: "import-1",
      importRowId: "row-1",
      documentFileId: "doc-1",
      customerDocumentMasked: "*******8901",
      grossAmountCents: 15000n,
      status: "NEEDS_REVIEW",
      fiscalFingerprintVersion: "v1"
    });
    expect(repository.createFiscalCandidate).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: tenantAId,
        status: "NEEDS_REVIEW",
        grossAmountCents: 15000n
      })
    );
    expect(repository.markImportRowCandidateCreated).toHaveBeenCalledWith("row-1", tenantAId);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: tenantAId,
        actorId: userAId,
        eventType: "fiscal_candidate.created",
        entityType: "FiscalCandidate",
        correlationId: "corr_test"
      })
    );
  });

  it("blocks roles without imports.create", async () => {
    const service = createFiscalCandidateService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.createFiscalCandidatesFromImport({
        context: makeCommandContext("AUDITOR"),
        importBatchId: "import-1"
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("blocks import batches from another tenant", async () => {
    const repository = makeRepository({ findImportBatchById: vi.fn().mockResolvedValue(makeImportBatch({ tenantId: tenantBId })) });
    const service = createFiscalCandidateService({ repository, audit: makeAudit() });

    await expect(
      service.createFiscalCandidatesFromImport({ context: makeCommandContext("OWNER"), importBatchId: "import-1" })
    ).rejects.toThrow(TenantScopeError);
  });

  it("fails when import batch does not exist", async () => {
    const repository = makeRepository({ findImportBatchById: vi.fn().mockResolvedValue(null) });
    const service = createFiscalCandidateService({ repository, audit: makeAudit() });

    await expect(
      service.createFiscalCandidatesFromImport({ context: makeCommandContext("OWNER"), importBatchId: "missing" })
    ).rejects.toThrow(NotFoundError);
  });

  it("blocks imports that are not validated or ready for review", async () => {
    const repository = makeRepository({ findImportBatchById: vi.fn().mockResolvedValue(makeImportBatch({ status: "HAS_ERRORS" })) });
    const service = createFiscalCandidateService({ repository, audit: makeAudit() });

    await expect(
      service.createFiscalCandidatesFromImport({ context: makeCommandContext("OWNER"), importBatchId: "import-1" })
    ).rejects.toThrow(InvalidStateError);
  });

  it("returns existing candidates for duplicate fingerprints without creating a duplicate", async () => {
    const existing = makeCandidate({ id: "candidate-existing", status: "NEEDS_REVIEW" });
    const repository = makeRepository({ findCandidateByFingerprint: vi.fn().mockResolvedValue(existing) });
    const audit = makeAudit();
    const service = createFiscalCandidateService({ repository, audit });

    const result = await service.createFiscalCandidatesFromImport({
      context: makeCommandContext("OWNER"),
      importBatchId: "import-1"
    });

    expect(result).toEqual([existing]);
    expect(repository.createFiscalCandidate).not.toHaveBeenCalled();
    expect(repository.markImportRowCandidateCreated).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });

  it("marks candidates with invalid amount as blocked", async () => {
    const repository = makeRepository({
      findNormalizedRowsByImportBatchId: vi.fn().mockResolvedValue([
        makeImportRow({ normalizedPayload: { serviceDate: "2026-05-10", serviceDescription: "Consulta", grossAmountCents: -1 } })
      ])
    });
    const service = createFiscalCandidateService({ repository, audit: makeAudit() });

    const result = await service.createFiscalCandidatesFromImport({ context: makeCommandContext("OWNER"), importBatchId: "import-1" });

    expect(result[0].status).toBe("BLOCKED");
  });

  it("does not create candidates from rejected rows", async () => {
    const repository = makeRepository({ findNormalizedRowsByImportBatchId: vi.fn().mockResolvedValue([makeImportRow({ status: "REJECTED" })]) });
    const service = createFiscalCandidateService({ repository, audit: makeAudit() });

    const result = await service.createFiscalCandidatesFromImport({ context: makeCommandContext("OWNER"), importBatchId: "import-1" });

    expect(result).toHaveLength(0);
    expect(repository.createFiscalCandidate).not.toHaveBeenCalled();
  });
});

describe("markCandidateReadyForBatch", () => {
  it("marks a reviewed candidate as ready for batch and records audit", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createFiscalCandidateService({ repository, audit });
    const now = new Date("2026-05-13T14:00:00.000Z");

    const result = await service.markCandidateReadyForBatch({
      context: makeCommandContext("FISCAL_MANAGER"),
      candidateId: "candidate-1",
      now
    });

    expect(result).toMatchObject({ status: "READY_FOR_BATCH", reviewedBy: userAId, reviewedAt: now });
    expect(repository.updateFiscalCandidate).toHaveBeenCalledWith({
      id: "candidate-1",
      tenantId: tenantAId,
      status: "READY_FOR_BATCH",
      reviewedBy: userAId,
      reviewedAt: now
    });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "fiscal_candidate.marked_ready" }));
  });

  it("blocks roles without inconsistency resolution permission", async () => {
    const service = createFiscalCandidateService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.markCandidateReadyForBatch({ context: makeCommandContext("AUDITOR"), candidateId: "candidate-1" })
    ).rejects.toThrow(ForbiddenError);
  });

  it("blocks candidates from another tenant", async () => {
    const repository = makeRepository({ findCandidateById: vi.fn().mockResolvedValue(makeCandidate({ tenantId: tenantBId })) });
    const service = createFiscalCandidateService({ repository, audit: makeAudit() });

    await expect(
      service.markCandidateReadyForBatch({ context: makeCommandContext("OWNER"), candidateId: "candidate-1" })
    ).rejects.toThrow(TenantScopeError);
  });

  it("blocks missing candidates", async () => {
    const repository = makeRepository({ findCandidateById: vi.fn().mockResolvedValue(null) });
    const service = createFiscalCandidateService({ repository, audit: makeAudit() });

    await expect(
      service.markCandidateReadyForBatch({ context: makeCommandContext("OWNER"), candidateId: "missing" })
    ).rejects.toThrow(NotFoundError);
  });

  it("blocks candidates that are not in review", async () => {
    const repository = makeRepository({ findCandidateById: vi.fn().mockResolvedValue(makeCandidate({ status: "BLOCKED" })) });
    const service = createFiscalCandidateService({ repository, audit: makeAudit() });

    await expect(
      service.markCandidateReadyForBatch({ context: makeCommandContext("OWNER"), candidateId: "candidate-1" })
    ).rejects.toThrow(InvalidStateError);
  });
});