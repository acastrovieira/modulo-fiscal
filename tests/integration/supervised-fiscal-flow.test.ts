import { describe, expect, it } from "vitest";
import { createImportService, type DocumentFileRecord, type ImportBatchRecord, type ImportRepository, type ImportRowCreateInput } from "@/modules/imports/application/import-service";
import { createFiscalCandidateService, type CreateFiscalCandidateInput, type FiscalCandidateRecord, type FiscalCandidateRepository, type FiscalImportRowRecord } from "@/modules/fiscal/application/fiscal-candidate-service";
import { createFiscalInconsistencyService, type CreateFiscalInconsistencyInput, type FiscalInconsistencyRepository } from "@/modules/fiscal/application/fiscal-inconsistency-service";
import { createFiscalBatchService, type CreateFiscalBatchRepositoryInput, type FiscalBatchRecord, type FiscalBatchRepository, type FiscalBatchItemRecord } from "@/modules/fiscal/application/fiscal-batch-service";
import type { FiscalCandidateStatus } from "@/modules/fiscal/domain/fiscal-candidate";
import type { FiscalInconsistency } from "@/modules/fiscal/domain/fiscal-inconsistency";
import type { FiscalBatchStatus } from "@/modules/fiscal/domain/fiscal-batch";
import { InvalidStateError, TenantScopeError } from "@/shared/errors/application-error";
import { makeCommandContext, tenantAId, tenantBId, userAId } from "../fixtures/security";

type AuditEvent = {
  eventType: string;
  tenantId: string;
  actorId?: string | null;
  correlationId: string;
  metadata?: unknown;
};

function makeDocumentFile(overrides: Partial<DocumentFileRecord> = {}): DocumentFileRecord {
  return {
    id: "doc-1",
    tenantId: tenantAId,
    fileName: "agenda.csv",
    fileType: "csv",
    mimeType: "text/csv",
    storagePath: "tenant-a/imports/agenda.csv",
    checksumSha256: "checksum-1",
    sizeBytes: 1024n,
    createdBy: userAId,
    createdAt: new Date("2026-05-13T10:00:00.000Z"),
    ...overrides
  };
}

function makeImportBatch(input: Partial<ImportBatchRecord> = {}): ImportBatchRecord {
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
    createdAt: new Date("2026-05-13T10:00:00.000Z"),
    updatedAt: new Date("2026-05-13T10:00:00.000Z"),
    validatedAt: null,
    archivedAt: null,
    ...input
  };
}

class InMemoryFiscalWorkflowRepository implements ImportRepository, FiscalCandidateRepository, FiscalInconsistencyRepository, FiscalBatchRepository {
  documents = new Map<string, DocumentFileRecord>([["doc-1", makeDocumentFile()]]);
  importBatches = new Map<string, ImportBatchRecord>();
  importRows = new Map<string, FiscalImportRowRecord>();
  candidates = new Map<string, FiscalCandidateRecord>();
  inconsistencies = new Map<string, FiscalInconsistency>();
  batches = new Map<string, FiscalBatchRecord>();
  batchItems = new Map<string, FiscalBatchItemRecord>();

  private nextImport = 1;
  private nextRow = 1;
  private nextCandidate = 1;
  private nextInconsistency = 1;
  private nextBatch = 1;
  private nextBatchItem = 1;

  async findDocumentFileById(id: string): Promise<DocumentFileRecord | null> {
    return this.documents.get(id) ?? null;
  }

  async findImportBatchById(id: string): Promise<ImportBatchRecord | null> {
    return this.importBatches.get(id) ?? null;
  }

  async findImportBatchByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<ImportBatchRecord | null> {
    return [...this.importBatches.values()].find((batch) => batch.tenantId === tenantId && batch.idempotencyKey === idempotencyKey) ?? null;
  }

  async createImportBatch(input: {
    tenantId: string;
    documentFileId: string;
    createdBy: string;
    status: ImportBatchRecord["status"];
    sourceType: string;
    sourceName?: string | null;
    idempotencyKey?: string | null;
  }): Promise<ImportBatchRecord> {
    const batch = makeImportBatch({
      id: `import-${this.nextImport++}`,
      tenantId: input.tenantId,
      documentFileId: input.documentFileId,
      createdBy: input.createdBy,
      status: input.status,
      sourceType: input.sourceType,
      sourceName: input.sourceName ?? null,
      idempotencyKey: input.idempotencyKey ?? null
    });
    this.importBatches.set(batch.id, batch);
    return batch;
  }

  async updateImportBatch(input: {
    id: string;
    tenantId: string;
    status: ImportBatchRecord["status"];
    totalRows?: number;
    validRows?: number;
    invalidRows?: number;
    validatedAt?: Date;
  }): Promise<ImportBatchRecord> {
    const current = this.importBatches.get(input.id);
    if (!current || current.tenantId !== input.tenantId) {
      throw new TenantScopeError();
    }
    const updated = {
      ...current,
      status: input.status,
      totalRows: input.totalRows ?? current.totalRows,
      validRows: input.validRows ?? current.validRows,
      invalidRows: input.invalidRows ?? current.invalidRows,
      validatedAt: input.validatedAt ?? current.validatedAt,
      updatedAt: new Date("2026-05-13T11:00:00.000Z")
    };
    this.importBatches.set(updated.id, updated);
    return updated;
  }

  async replaceImportRows(input: { importBatchId: string; tenantId: string; rows: ImportRowCreateInput[] }): Promise<void> {
    for (const [id, row] of this.importRows.entries()) {
      if (row.importBatchId === input.importBatchId && row.tenantId === input.tenantId) {
        this.importRows.delete(id);
      }
    }

    for (const row of input.rows) {
      const id = `row-${this.nextRow++}`;
      this.importRows.set(id, {
        id,
        tenantId: row.tenantId,
        importBatchId: row.importBatchId,
        status: row.status === "QUARANTINED" ? "REJECTED" : row.status,
        normalizedPayload: row.normalizedPayload ?? null
      });
    }
  }

  async countFiscalCandidatesByImportBatchId(importBatchId: string, tenantId: string): Promise<number> {
    return [...this.candidates.values()].filter((candidate) => candidate.importBatchId === importBatchId && candidate.tenantId === tenantId).length;
  }

  async findLatestValidationAttempt(): Promise<null> {
    return null;
  }

  async createValidationAttempt(): Promise<void> {
    return undefined;
  }

  async findNormalizedRowsByImportBatchId(importBatchId: string): Promise<FiscalImportRowRecord[]> {
    return [...this.importRows.values()].filter((row) => row.importBatchId === importBatchId && row.status === "NORMALIZED");
  }

  async findCandidateByFingerprint(tenantId: string, version: string, fingerprint: string): Promise<FiscalCandidateRecord | null> {
    return [...this.candidates.values()].find(
      (candidate) => candidate.tenantId === tenantId && candidate.fiscalFingerprintVersion === version && candidate.fiscalFingerprint === fingerprint
    ) ?? null;
  }

  async createFiscalCandidate(input: CreateFiscalCandidateInput): Promise<FiscalCandidateRecord> {
    const candidate: FiscalCandidateRecord = {
      id: `candidate-${this.nextCandidate++}`,
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
      fiscalFingerprint: input.fiscalFingerprint,
      reviewBlockReasons: input.reviewBlockReasons,
      reviewWarnings: input.reviewWarnings,
      reviewJustification: null,
      reviewedBy: null,
      reviewedAt: null
    };
    this.candidates.set(candidate.id, candidate);
    return candidate;
  }

  async markImportRowCandidateCreated(id: string, tenantId: string): Promise<void> {
    const row = this.importRows.get(id);
    if (!row || row.tenantId !== tenantId) {
      throw new TenantScopeError();
    }
    this.importRows.set(id, { ...row, status: "CANDIDATE_CREATED" });
  }

  async findCandidateById(id: string): Promise<FiscalCandidateRecord | null> {
    return this.candidates.get(id) ?? null;
  }

  async countOpenBlockingInconsistenciesByCandidateId(candidateId: string, tenantId: string): Promise<number> {
    return [...this.inconsistencies.values()].filter(
      (item) => item.tenantId === tenantId && item.candidateId === candidateId && item.severity === "BLOCKING" && (item.status === "OPEN" || item.status === "IN_REVIEW")
    ).length;
  }

  async updateFiscalCandidate(input: {
    id: string;
    tenantId: string;
    status: FiscalCandidateStatus;
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewJustification?: string;
  }): Promise<FiscalCandidateRecord> {
    return this.updateCandidateStatus(input.id, input.tenantId, input.status, input.reviewedBy, input.reviewedAt, input.reviewJustification);
  }

  async findImportRowById(id: string): Promise<FiscalImportRowRecord | null> {
    return this.importRows.get(id) ?? null;
  }

  async createInconsistency(input: CreateFiscalInconsistencyInput): Promise<FiscalInconsistency> {
    const inconsistency: FiscalInconsistency = {
      id: `inconsistency-${this.nextInconsistency++}`,
      tenantId: input.tenantId,
      candidateId: input.candidateId ?? null,
      importBatchId: input.importBatchId ?? null,
      importRowId: input.importRowId ?? null,
      type: input.type,
      severity: input.severity,
      status: input.status,
      message: input.message,
      details: input.details,
      resolutionNote: null,
      resolvedBy: null,
      resolvedAt: null
    };
    this.inconsistencies.set(inconsistency.id, inconsistency);
    return inconsistency;
  }

  async findInconsistencyById(id: string): Promise<FiscalInconsistency | null> {
    return this.inconsistencies.get(id) ?? null;
  }

  async updateInconsistency(input: {
    id: string;
    tenantId: string;
    status: "RESOLVED" | "WAIVED";
    resolutionNote: string;
    resolvedBy: string;
    resolvedAt: Date;
  }): Promise<FiscalInconsistency> {
    const current = this.inconsistencies.get(input.id);
    if (!current || current.tenantId !== input.tenantId) {
      throw new TenantScopeError();
    }
    const updated = { ...current, status: input.status, resolutionNote: input.resolutionNote, resolvedBy: input.resolvedBy, resolvedAt: input.resolvedAt };
    this.inconsistencies.set(updated.id, updated);
    return updated;
  }

  async updateCandidateStatus(
    candidateId: string,
    tenantId: string,
    status: FiscalCandidateStatus,
    reviewedBy: string | null = null,
    reviewedAt: Date | null = null,
    reviewJustification: string | null = null
  ): Promise<FiscalCandidateRecord> {
    const current = this.candidates.get(candidateId);
    if (!current || current.tenantId !== tenantId) {
      throw new TenantScopeError();
    }
    const updated = {
      ...current,
      status,
      reviewedBy: reviewedBy ?? current.reviewedBy,
      reviewedAt: reviewedAt ?? current.reviewedAt,
      reviewJustification: reviewJustification ?? current.reviewJustification
    };
    this.candidates.set(updated.id, updated);
    return updated;
  }

  async createFiscalBatch(input: CreateFiscalBatchRepositoryInput): Promise<FiscalBatchRecord> {
    const id = `batch-${this.nextBatch++}`;
    const batch: FiscalBatchRecord = {
      id,
      tenantId: input.tenantId,
      status: input.status,
      batchNumber: input.batchNumber ?? null,
      createdBy: input.createdBy,
      submittedBy: null,
      submittedAt: null,
      simulatedBy: null,
      simulatedAt: null,
      approvedBy: null,
      approvedAt: null,
      cancelledBy: null,
      cancelledAt: null,
      cancelReason: null,
      totalGrossAmountCents: input.totalGrossAmountCents,
      items: []
    };
    const items = input.items.map((item) => {
      const batchItem: FiscalBatchItemRecord = {
        id: `batch-item-${this.nextBatchItem++}`,
        tenantId: item.tenantId,
        batchId: id,
        candidateId: item.candidateId,
        status: item.status,
        grossAmountCents: item.grossAmountCents
      };
      this.batchItems.set(batchItem.id, batchItem);
      return batchItem;
    });
    batch.items = items;
    this.batches.set(batch.id, batch);
    return batch;
  }

  async findBatchById(id: string): Promise<FiscalBatchRecord | null> {
    return this.batches.get(id) ?? null;
  }

  async findIncludedBatchItems(batchId: string, tenantId: string): Promise<FiscalBatchItemRecord[]> {
    return [...this.batchItems.values()].filter((item) => item.batchId === batchId && item.tenantId === tenantId && item.status === "INCLUDED");
  }

  async updateBatchStatus(input: {
    id: string;
    tenantId: string;
    status: FiscalBatchStatus;
    submittedBy?: string;
    submittedAt?: Date;
    simulatedBy?: string;
    simulatedAt?: Date;
    approvedBy?: string;
    approvedAt?: Date;
    cancelledBy?: string;
    cancelledAt?: Date;
    cancelReason?: string;
  }): Promise<FiscalBatchRecord> {
    const current = this.batches.get(input.id);
    if (!current || current.tenantId !== input.tenantId) {
      throw new TenantScopeError();
    }
    const updated = { ...current, ...input };
    this.batches.set(updated.id, updated);
    return updated;
  }
}

describe("supervised fiscal MVP regression", () => {
  it("runs import -> candidate -> inconsistency -> batch -> internal simulation without external issuance", async () => {
    const repository = new InMemoryFiscalWorkflowRepository();
    const auditEvents: AuditEvent[] = [];
    const audit = { record: async (event: AuditEvent) => { auditEvents.push(event); } };
    const importService = createImportService({ repository, audit });
    const candidateService = createFiscalCandidateService({ repository, audit });
    const inconsistencyService = createFiscalInconsistencyService({ repository, audit });
    const batchService = createFiscalBatchService({ repository, audit });

    const importBatch = await importService.createImportFromDocument({
      context: makeCommandContext("FISCAL_OPERATOR"),
      documentFileId: "doc-1",
      idempotencyKey: "idem-flow-1"
    });
    await importService.validateImport({
      context: makeCommandContext("FISCAL_OPERATOR"),
      importBatchId: importBatch.id,
      rows: [
        {
          customerName: "Maria Tutora",
          customerDocumentMasked: "***.***.***-01",
          serviceDate: "2026-05-10",
          serviceDescription: "Consulta veterinaria",
          grossAmountCents: 15000
        }
      ]
    });

    const [candidate] = await candidateService.createFiscalCandidatesFromImport({
      context: makeCommandContext("FISCAL_OPERATOR"),
      importBatchId: importBatch.id
    });
    expect(candidate.customerDocumentMasked).toBe("***.***.***-01");

    const blocking = await inconsistencyService.openInconsistency({
      context: makeCommandContext("FISCAL_MANAGER"),
      candidateId: candidate.id,
      type: "MISSING_CUSTOMER_DATA",
      severity: "BLOCKING",
      message: "Tomador exige revisao humana antes do lote."
    });
    await expect(
      batchService.createFiscalBatch({ context: makeCommandContext("FISCAL_OPERATOR"), candidateIds: [candidate.id] })
    ).rejects.toThrow(InvalidStateError);

    await inconsistencyService.resolveInconsistency({
      context: makeCommandContext("FISCAL_MANAGER"),
      inconsistencyId: blocking.id,
      resolutionNote: "Dados conferidos com documento de origem."
    });
    await candidateService.markCandidateReadyForBatch({
      context: makeCommandContext("FISCAL_MANAGER"),
      candidateId: candidate.id,
      reviewJustification: "Conferencia humana concluida no fluxo supervisionado."
    });

    const batch = await batchService.createFiscalBatch({
      context: makeCommandContext("FISCAL_OPERATOR"),
      candidateIds: [candidate.id],
      batchNumber: "FLOW-001"
    });
    await batchService.submitBatchForReview({ context: makeCommandContext("FISCAL_OPERATOR"), batchId: batch.id });
    await batchService.simulateBatchInternally({ context: makeCommandContext("FISCAL_OPERATOR"), batchId: batch.id });
    const approved = await batchService.approveBatchForFutureIssuance({ context: makeCommandContext("FISCAL_MANAGER"), batchId: batch.id });

    expect(approved.status).toBe("APPROVED_FOR_FUTURE_ISSUANCE");
    expect(repository.candidates.get(candidate.id)?.status).toBe("APPROVED_FOR_FUTURE_ISSUANCE");
    expect(auditEvents.map((event) => event.eventType)).toEqual(expect.arrayContaining([
      "imports.created",
      "imports.validation_started",
      "imports.validation_finished",
      "fiscal_candidate.created",
      "inconsistency.opened",
      "inconsistency.resolved",
      "fiscal_candidate.marked_ready",
      "fiscal_batch.created",
      "fiscal_batch.submitted_for_review",
      "fiscal_batch.simulated_internally",
      "fiscal_batch.approved_for_future_issuance"
    ]));
    expect(auditEvents.every((event) => event.tenantId === tenantAId && event.actorId === userAId && event.correlationId === "corr_test")).toBe(true);
    expect(auditEvents.filter((event) => event.eventType.includes("fiscal_batch")).map((event) => event.metadata)).toContainEqual({ externalProviderCalled: false, nfseIssued: false });
  });

  it("blocks cross-tenant documents at the first workflow boundary", async () => {
    const repository = new InMemoryFiscalWorkflowRepository();
    repository.documents.set("doc-b", makeDocumentFile({ id: "doc-b", tenantId: tenantBId }));
    const importService = createImportService({ repository, audit: { record: async () => undefined } });

    await expect(
      importService.createImportFromDocument({ context: makeCommandContext("OWNER", tenantAId), documentFileId: "doc-b" })
    ).rejects.toThrow(TenantScopeError);
  });
});


