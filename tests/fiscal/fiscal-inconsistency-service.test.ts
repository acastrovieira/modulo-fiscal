import { describe, expect, it, vi } from "vitest";
import {
  createFiscalInconsistencyService,
  type FiscalInconsistencyRepository
} from "@/modules/fiscal/application/fiscal-inconsistency-service";
import type { FiscalCandidateRecord, FiscalImportBatchRecord, FiscalImportRowRecord } from "@/modules/fiscal/application/fiscal-candidate-service";
import type { FiscalInconsistency } from "@/modules/fiscal/domain/fiscal-inconsistency";
import { expectedSeverityForType } from "@/modules/fiscal/domain/fiscal-inconsistency";
import { ForbiddenError, InvalidStateError, NotFoundError, TenantScopeError, ValidationError } from "@/shared/errors/application-error";
import { makeCommandContext, tenantAId, tenantBId, userAId } from "../fixtures/security";

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
    fiscalFingerprintVersion: "v1",
    fiscalFingerprint: "fingerprint-1",
    reviewedBy: null,
    reviewedAt: null,
    ...overrides
  };
}

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
    normalizedPayload: { serviceDescription: "Consulta" },
    ...overrides
  };
}

function makeInconsistency(overrides: Partial<FiscalInconsistency> = {}): FiscalInconsistency {
  return {
    id: "inc-1",
    tenantId: tenantAId,
    candidateId: "candidate-1",
    importBatchId: "import-1",
    importRowId: "row-1",
    type: "MISSING_AMOUNT",
    severity: "BLOCKING",
    status: "OPEN",
    message: "Valor ausente",
    details: null,
    resolutionNote: null,
    resolvedBy: null,
    resolvedAt: null,
    ...overrides
  };
}

function makeRepository(overrides: Partial<FiscalInconsistencyRepository> = {}) {
  const repository: FiscalInconsistencyRepository = {
    findCandidateById: vi.fn().mockResolvedValue(makeCandidate()),
    findImportBatchById: vi.fn().mockResolvedValue(makeImportBatch()),
    findImportRowById: vi.fn().mockResolvedValue(makeImportRow()),
    createInconsistency: vi.fn().mockImplementation(async (input) =>
      makeInconsistency({
        tenantId: input.tenantId,
        candidateId: input.candidateId ?? null,
        importBatchId: input.importBatchId ?? null,
        importRowId: input.importRowId ?? null,
        type: input.type,
        severity: input.severity,
        status: input.status,
        message: input.message,
        details: input.details ?? null
      })
    ),
    findInconsistencyById: vi.fn().mockResolvedValue(makeInconsistency()),
    updateInconsistency: vi.fn().mockImplementation(async (input) =>
      makeInconsistency({
        id: input.id,
        tenantId: input.tenantId,
        status: input.status,
        resolutionNote: input.resolutionNote,
        resolvedBy: input.resolvedBy,
        resolvedAt: input.resolvedAt
      })
    ),
    updateCandidateStatus: vi.fn().mockImplementation(async (candidateId, tenantId, status) =>
      makeCandidate({ id: candidateId, tenantId, status })
    ),
    countOpenBlockingInconsistenciesByCandidateId: vi.fn().mockResolvedValue(0),
    ...overrides
  };

  return repository;
}

function makeAudit() {
  return {
    record: vi.fn().mockResolvedValue(undefined)
  };
}

describe("fiscal inconsistency taxonomy", () => {
  it("centralizes expected severity by inconsistency type", () => {
    expect(expectedSeverityForType("MISSING_AMOUNT")).toBe("BLOCKING");
    expect(expectedSeverityForType("QUESTIONABLE_SERVICE_CLASSIFICATION")).toBe("REVIEWABLE");
  });
});

describe("openInconsistency", () => {
  it("opens a blocking inconsistency, blocks candidate and records audit", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createFiscalInconsistencyService({ repository, audit });

    const result = await service.openInconsistency({
      context: makeCommandContext("FISCAL_OPERATOR"),
      candidateId: "candidate-1",
      importBatchId: "import-1",
      importRowId: "row-1",
      type: "MISSING_AMOUNT",
      severity: "BLOCKING",
      message: "Valor ausente"
    });

    expect(result).toMatchObject({ status: "OPEN", severity: "BLOCKING", type: "MISSING_AMOUNT" });
    expect(repository.updateCandidateStatus).toHaveBeenCalledWith("candidate-1", tenantAId, "BLOCKED");
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: tenantAId,
        actorId: userAId,
        eventType: "inconsistency.opened",
        entityType: "FiscalInconsistency",
        correlationId: "corr_test"
      })
    );
  });

  it("allows reviewable inconsistency without blocking candidate", async () => {
    const repository = makeRepository();
    const service = createFiscalInconsistencyService({ repository, audit: makeAudit() });

    await service.openInconsistency({
      context: makeCommandContext("FISCAL_OPERATOR"),
      candidateId: "candidate-1",
      type: "INCOMPLETE_DESCRIPTION",
      severity: "REVIEWABLE",
      message: "Descricao incompleta"
    });

    expect(repository.updateCandidateStatus).not.toHaveBeenCalled();
  });

  it("blocks users without inconsistency permission", async () => {
    const service = createFiscalInconsistencyService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.openInconsistency({
        context: makeCommandContext("AUDITOR"),
        candidateId: "candidate-1",
        type: "MISSING_AMOUNT",
        severity: "BLOCKING",
        message: "Valor ausente"
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("requires a referenced operational entity", async () => {
    const service = createFiscalInconsistencyService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.openInconsistency({
        context: makeCommandContext("OWNER"),
        type: "MISSING_AMOUNT",
        severity: "BLOCKING",
        message: "Valor ausente"
      })
    ).rejects.toThrow(ValidationError);
  });

  it("validates type and severity compatibility", async () => {
    const service = createFiscalInconsistencyService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.openInconsistency({
        context: makeCommandContext("OWNER"),
        candidateId: "candidate-1",
        type: "MISSING_AMOUNT",
        severity: "REVIEWABLE",
        message: "Valor ausente"
      })
    ).rejects.toThrow(ValidationError);
  });

  it("blocks candidate from another tenant", async () => {
    const repository = makeRepository({ findCandidateById: vi.fn().mockResolvedValue(makeCandidate({ tenantId: tenantBId })) });
    const service = createFiscalInconsistencyService({ repository, audit: makeAudit() });

    await expect(
      service.openInconsistency({
        context: makeCommandContext("OWNER"),
        candidateId: "candidate-1",
        type: "MISSING_AMOUNT",
        severity: "BLOCKING",
        message: "Valor ausente"
      })
    ).rejects.toThrow(TenantScopeError);
  });

  it("fails when referenced candidate does not exist", async () => {
    const repository = makeRepository({ findCandidateById: vi.fn().mockResolvedValue(null) });
    const service = createFiscalInconsistencyService({ repository, audit: makeAudit() });

    await expect(
      service.openInconsistency({
        context: makeCommandContext("OWNER"),
        candidateId: "missing",
        type: "MISSING_AMOUNT",
        severity: "BLOCKING",
        message: "Valor ausente"
      })
    ).rejects.toThrow(NotFoundError);
  });
});

describe("resolveInconsistency", () => {
  it("resolves open inconsistency with justification, releases candidate to review and records audit", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createFiscalInconsistencyService({ repository, audit });
    const now = new Date("2026-05-13T15:00:00.000Z");

    const result = await service.resolveInconsistency({
      context: makeCommandContext("FISCAL_MANAGER"),
      inconsistencyId: "inc-1",
      resolutionNote: "Valor confirmado na origem",
      now
    });

    expect(result).toMatchObject({ status: "RESOLVED", resolvedBy: userAId, resolvedAt: now });
    expect(repository.updateCandidateStatus).toHaveBeenCalledWith("candidate-1", tenantAId, "NEEDS_REVIEW");
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "inconsistency.resolved",
        beforePayload: expect.objectContaining({ status: "OPEN" }),
        afterPayload: expect.objectContaining({ status: "RESOLVED" })
      })
    );
  });

  it("does not release candidate while another blocking inconsistency remains open", async () => {
    const repository = makeRepository({ countOpenBlockingInconsistenciesByCandidateId: vi.fn().mockResolvedValue(1) });
    const service = createFiscalInconsistencyService({ repository, audit: makeAudit() });

    await service.resolveInconsistency({
      context: makeCommandContext("FISCAL_MANAGER"),
      inconsistencyId: "inc-1",
      resolutionNote: "Resolvido"
    });

    expect(repository.updateCandidateStatus).not.toHaveBeenCalled();
  });

  it("requires justification", async () => {
    const service = createFiscalInconsistencyService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.resolveInconsistency({ context: makeCommandContext("OWNER"), inconsistencyId: "inc-1", resolutionNote: "  " })
    ).rejects.toThrow(ValidationError);
  });

  it("blocks closing already closed inconsistency", async () => {
    const repository = makeRepository({ findInconsistencyById: vi.fn().mockResolvedValue(makeInconsistency({ status: "RESOLVED" })) });
    const service = createFiscalInconsistencyService({ repository, audit: makeAudit() });

    await expect(
      service.resolveInconsistency({ context: makeCommandContext("OWNER"), inconsistencyId: "inc-1", resolutionNote: "Resolvido" })
    ).rejects.toThrow(InvalidStateError);
  });

  it("blocks fiscal operators from resolving blocking inconsistencies", async () => {
    const service = createFiscalInconsistencyService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.resolveInconsistency({ context: makeCommandContext("FISCAL_OPERATOR"), inconsistencyId: "inc-1", resolutionNote: "Resolvido" })
    ).rejects.toThrow(ForbiddenError);
  });

  it("allows fiscal operators to resolve reviewable inconsistencies", async () => {
    const repository = makeRepository({
      findInconsistencyById: vi.fn().mockResolvedValue(
        makeInconsistency({ type: "INCOMPLETE_DESCRIPTION", severity: "REVIEWABLE" })
      )
    });
    const service = createFiscalInconsistencyService({ repository, audit: makeAudit() });

    await expect(
      service.resolveInconsistency({
        context: makeCommandContext("FISCAL_OPERATOR"),
        inconsistencyId: "inc-1",
        resolutionNote: "Descricao complementada"
      })
    ).resolves.toMatchObject({ status: "RESOLVED" });
  });

  it("blocks inconsistency from another tenant", async () => {
    const repository = makeRepository({ findInconsistencyById: vi.fn().mockResolvedValue(makeInconsistency({ tenantId: tenantBId })) });
    const service = createFiscalInconsistencyService({ repository, audit: makeAudit() });

    await expect(
      service.resolveInconsistency({ context: makeCommandContext("OWNER"), inconsistencyId: "inc-1", resolutionNote: "Resolvido" })
    ).rejects.toThrow(TenantScopeError);
  });
});

describe("waiveInconsistency", () => {
  it("waives inconsistency with auditable justification", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createFiscalInconsistencyService({ repository, audit });

    const result = await service.waiveInconsistency({
      context: makeCommandContext("FISCAL_MANAGER"),
      inconsistencyId: "inc-1",
      resolutionNote: "Dispensado apos revisao humana"
    });

    expect(result.status).toBe("WAIVED");
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "inconsistency.waived",
        beforePayload: expect.objectContaining({ severity: "BLOCKING" }),
        afterPayload: expect.objectContaining({ status: "WAIVED" })
      })
    );
  });

  it("requires justification for waiver", async () => {
    const service = createFiscalInconsistencyService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.waiveInconsistency({ context: makeCommandContext("OWNER"), inconsistencyId: "inc-1", resolutionNote: "" })
    ).rejects.toThrow(ValidationError);
  });

  it("blocks fiscal operators from waiving blocking inconsistencies", async () => {
    const service = createFiscalInconsistencyService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.waiveInconsistency({ context: makeCommandContext("FISCAL_OPERATOR"), inconsistencyId: "inc-1", resolutionNote: "Dispensado" })
    ).rejects.toThrow(ForbiddenError);
  });
});