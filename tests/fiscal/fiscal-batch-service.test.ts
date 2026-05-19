import { describe, expect, it, vi } from "vitest";
import {
  createFiscalBatchService,
  type FiscalBatchRecord,
  type FiscalBatchRepository,
  type FiscalBatchItemRecord,
  type CreateFiscalBatchRepositoryInput
} from "@/modules/fiscal/application/fiscal-batch-service";
import type { FiscalCandidateRecord } from "@/modules/fiscal/application/fiscal-candidate-service";
import { ForbiddenError, InvalidStateError, NotFoundError, TenantScopeError, ValidationError } from "@/shared/errors/application-error";
import { makeIdempotencyRepository } from "../fixtures/idempotency";
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
    status: "READY_FOR_BATCH",
    fiscalFingerprintVersion: "v1",
    fiscalFingerprint: "fingerprint-1",
    reviewBlockReasons: [],
    reviewWarnings: [],
    reviewJustification: "Conferencia humana concluida",
    reviewedBy: userAId,
    reviewedAt: new Date("2026-05-13T12:00:00.000Z"),
    ...overrides
  };
}

function makeBatch(overrides: Partial<FiscalBatchRecord> = {}): FiscalBatchRecord {
  return {
    id: "batch-1",
    tenantId: tenantAId,
    status: "DRAFT",
    batchNumber: "BATCH-001",
    createdBy: userAId,
    submittedBy: null,
    submittedAt: null,
    simulatedBy: null,
    simulatedAt: null,
    approvedBy: null,
    approvedAt: null,
    cancelledBy: null,
    cancelledAt: null,
    cancelReason: null,
    totalGrossAmountCents: 15000n,
    items: [makeBatchItem()],
    ...overrides
  };
}

function makeBatchItem(overrides: Partial<FiscalBatchItemRecord> = {}): FiscalBatchItemRecord {
  return {
    id: "item-1",
    tenantId: tenantAId,
    batchId: "batch-1",
    candidateId: "candidate-1",
    status: "INCLUDED",
    grossAmountCents: 15000n,
    ...overrides
  };
}

function makeRepository(overrides: Partial<FiscalBatchRepository> = {}): FiscalBatchRepository {
  const repository: FiscalBatchRepository = {
    findCandidateById: vi.fn().mockImplementation(async (id: string) => makeCandidate({ id })),
    countOpenBlockingInconsistenciesByCandidateId: vi.fn().mockResolvedValue(0),
    createFiscalBatch: vi.fn().mockImplementation(async (input: CreateFiscalBatchRepositoryInput) =>
      makeBatch({
        tenantId: input.tenantId,
        batchNumber: input.batchNumber ?? null,
        createdBy: input.createdBy,
        status: input.status,
        totalGrossAmountCents: input.totalGrossAmountCents,
        items: input.items.map((item: CreateFiscalBatchRepositoryInput["items"][number], index: number) =>
          makeBatchItem({
            id: `item-${index + 1}`,
            tenantId: item.tenantId,
            candidateId: item.candidateId,
            status: item.status,
            grossAmountCents: item.grossAmountCents
          })
        )
      })
    ),
    findBatchById: vi.fn().mockResolvedValue(makeBatch()),
    findIncludedBatchItems: vi.fn().mockResolvedValue([makeBatchItem()]),
    updateBatchStatus: vi.fn().mockImplementation(async (input) =>
      makeBatch({
        id: input.id,
        tenantId: input.tenantId,
        status: input.status,
        submittedBy: input.submittedBy ?? null,
        submittedAt: input.submittedAt ?? null,
        simulatedBy: input.simulatedBy ?? null,
        simulatedAt: input.simulatedAt ?? null,
        approvedBy: input.approvedBy ?? null,
        approvedAt: input.approvedAt ?? null,
        cancelledBy: input.cancelledBy ?? null,
        cancelledAt: input.cancelledAt ?? null,
        cancelReason: input.cancelReason ?? null
      })
    ),
    updateCandidateStatus: vi.fn().mockImplementation(async (candidateId, tenantId, status) => makeCandidate({ id: candidateId, tenantId, status })),
    ...overrides
  };

  return repository;
}

function makeAudit() {
  return {
    record: vi.fn().mockResolvedValue(undefined)
  };
}

describe("createFiscalBatch", () => {
  it("creates a draft batch from ready candidates, moves candidates in batch and records audit", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createFiscalBatchService({ repository, audit });

    const result = await service.createFiscalBatch({
      context: makeCommandContext("FISCAL_OPERATOR"),
      candidateIds: ["candidate-1"],
      batchNumber: "BATCH-001"
    });

    expect(result).toMatchObject({ status: "DRAFT", totalGrossAmountCents: 15000n });
    expect(repository.createFiscalBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: tenantAId,
        createdBy: userAId,
        status: "DRAFT",
        totalGrossAmountCents: 15000n,
        items: [expect.objectContaining({ candidateId: "candidate-1", grossAmountCents: 15000n })]
      })
    );
    expect(repository.updateCandidateStatus).toHaveBeenCalledWith("candidate-1", tenantAId, "IN_BATCH");
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "fiscal_batch.created" }));
  });

  it("blocks roles without batches.simulate", async () => {
    const service = createFiscalBatchService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.createFiscalBatch({ context: makeCommandContext("AUDITOR"), candidateIds: ["candidate-1"] })
    ).rejects.toThrow(ForbiddenError);
  });

  it("requires at least one candidate", async () => {
    const service = createFiscalBatchService({ repository: makeRepository(), audit: makeAudit() });

    await expect(service.createFiscalBatch({ context: makeCommandContext("OWNER"), candidateIds: [] })).rejects.toThrow(ValidationError);
  });

  it("blocks duplicate candidates", async () => {
    const service = createFiscalBatchService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.createFiscalBatch({ context: makeCommandContext("OWNER"), candidateIds: ["candidate-1", "candidate-1"] })
    ).rejects.toThrow(ValidationError);
  });

  it("blocks missing candidates", async () => {
    const repository = makeRepository({ findCandidateById: vi.fn().mockResolvedValue(null) });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(
      service.createFiscalBatch({ context: makeCommandContext("OWNER"), candidateIds: ["missing"] })
    ).rejects.toThrow(NotFoundError);
  });

  it("blocks candidates from another tenant", async () => {
    const repository = makeRepository({ findCandidateById: vi.fn().mockResolvedValue(makeCandidate({ tenantId: tenantBId })) });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(
      service.createFiscalBatch({ context: makeCommandContext("OWNER"), candidateIds: ["candidate-1"] })
    ).rejects.toThrow(TenantScopeError);
  });

  it("blocks candidates not ready for batch", async () => {
    const repository = makeRepository({ findCandidateById: vi.fn().mockResolvedValue(makeCandidate({ status: "BLOCKED" })) });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(
      service.createFiscalBatch({ context: makeCommandContext("OWNER"), candidateIds: ["candidate-1"] })
    ).rejects.toThrow(InvalidStateError);
  });

  it("blocks candidates with open blocking inconsistencies", async () => {
    const repository = makeRepository({ countOpenBlockingInconsistenciesByCandidateId: vi.fn().mockResolvedValue(1) });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(
      service.createFiscalBatch({ context: makeCommandContext("OWNER"), candidateIds: ["candidate-1"] })
    ).rejects.toThrow(InvalidStateError);
  });

  it("replays the same idempotent create without creating a second batch", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const idempotency = makeIdempotencyRepository();
    const service = createFiscalBatchService({ repository, audit, idempotencyRepository: idempotency.repository });

    await service.createFiscalBatch({
      context: makeCommandContext("FISCAL_OPERATOR"),
      candidateIds: ["candidate-1"],
      batchNumber: "BATCH-001",
      idempotencyKey: "idem-create-batch"
    });
    await service.createFiscalBatch({
      context: makeCommandContext("FISCAL_OPERATOR"),
      candidateIds: ["candidate-1"],
      batchNumber: "BATCH-001",
      idempotencyKey: "idem-create-batch"
    });

    expect(repository.createFiscalBatch).toHaveBeenCalledTimes(1);
    expect(audit.record).toHaveBeenCalledTimes(1);
    expect(idempotency.repository.createCommandIdempotencyRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: tenantAId,
        actorId: userAId,
        operation: "fiscal_batch.create",
        idempotencyKey: "idem-create-batch",
        responseRef: "batch-1",
        status: "SUCCEEDED"
      })
    );
  });

  it("blocks divergent replay for a fiscal batch create key", async () => {
    const idempotency = makeIdempotencyRepository();
    const service = createFiscalBatchService({
      repository: makeRepository(),
      audit: makeAudit(),
      idempotencyRepository: idempotency.repository
    });

    await service.createFiscalBatch({
      context: makeCommandContext("FISCAL_OPERATOR"),
      candidateIds: ["candidate-1"],
      batchNumber: "BATCH-001",
      idempotencyKey: "idem-divergent"
    });

    await expect(
      service.createFiscalBatch({
        context: makeCommandContext("FISCAL_OPERATOR"),
        candidateIds: ["candidate-2"],
        batchNumber: "BATCH-002",
        idempotencyKey: "idem-divergent"
      })
    ).rejects.toThrow(InvalidStateError);
  });

  it("scopes fiscal batch idempotency keys by tenant", async () => {
    const idempotency = makeIdempotencyRepository();
    const repository = makeRepository({
      findCandidateById: vi.fn().mockImplementation(async (id: string) => makeCandidate({ id, tenantId: id === "candidate-b" ? tenantBId : tenantAId }))
    });
    const service = createFiscalBatchService({ repository, audit: makeAudit(), idempotencyRepository: idempotency.repository });

    await service.createFiscalBatch({
      context: makeCommandContext("FISCAL_OPERATOR"),
      candidateIds: ["candidate-1"],
      idempotencyKey: "same-key"
    });
    await service.createFiscalBatch({
      context: makeCommandContext("FISCAL_OPERATOR", tenantBId),
      candidateIds: ["candidate-b"],
      idempotencyKey: "same-key"
    });

    expect(repository.createFiscalBatch).toHaveBeenCalledTimes(2);
    expect(idempotency.records.size).toBe(2);
  });
});

describe("submitBatchForReview", () => {
  it("submits a draft batch for review and records audit", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createFiscalBatchService({ repository, audit });
    const now = new Date("2026-05-13T15:00:00.000Z");

    const result = await service.submitBatchForReview({ context: makeCommandContext("FISCAL_OPERATOR"), batchId: "batch-1", now });

    expect(result).toMatchObject({ status: "IN_REVIEW", submittedBy: userAId, submittedAt: now });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "fiscal_batch.submitted_for_review" }));
  });

  it("blocks batches from another tenant", async () => {
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ tenantId: tenantBId })) });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(service.submitBatchForReview({ context: makeCommandContext("OWNER"), batchId: "batch-1" })).rejects.toThrow(TenantScopeError);
  });

  it("blocks missing batches", async () => {
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(null) });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(service.submitBatchForReview({ context: makeCommandContext("OWNER"), batchId: "missing" })).rejects.toThrow(NotFoundError);
  });

  it("blocks invalid submit transitions", async () => {
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "SIMULATED" })) });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(service.submitBatchForReview({ context: makeCommandContext("OWNER"), batchId: "batch-1" })).rejects.toThrow(InvalidStateError);
  });

  it("replays an idempotent submit without applying the transition twice", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const idempotency = makeIdempotencyRepository();
    const service = createFiscalBatchService({ repository, audit, idempotencyRepository: idempotency.repository });

    await service.submitBatchForReview({ context: makeCommandContext("FISCAL_OPERATOR"), batchId: "batch-1", idempotencyKey: "idem-submit" });
    await service.submitBatchForReview({ context: makeCommandContext("FISCAL_OPERATOR"), batchId: "batch-1", idempotencyKey: "idem-submit" });

    expect(repository.updateBatchStatus).toHaveBeenCalledTimes(1);
    expect(audit.record).toHaveBeenCalledTimes(1);
  });
});

describe("simulateBatchInternally", () => {
  it("simulates a batch internally, updates candidates and records no external issuance metadata", async () => {
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "IN_REVIEW" })) });
    const audit = makeAudit();
    const service = createFiscalBatchService({ repository, audit });
    const now = new Date("2026-05-13T16:00:00.000Z");

    const result = await service.simulateBatchInternally({ context: makeCommandContext("FISCAL_OPERATOR"), batchId: "batch-1", now });

    expect(result).toMatchObject({ status: "SIMULATED", simulatedBy: userAId, simulatedAt: now });
    expect(repository.updateCandidateStatus).toHaveBeenCalledWith("candidate-1", tenantAId, "SIMULATED");
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "fiscal_batch.simulated_internally",
        metadata: { externalProviderCalled: false, nfseIssued: false }
      })
    );
  });

  it("blocks invalid simulation transitions", async () => {
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "DRAFT" })) });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(service.simulateBatchInternally({ context: makeCommandContext("OWNER"), batchId: "batch-1" })).rejects.toThrow(InvalidStateError);
  });

  it("blocks simulation without included items", async () => {
    const repository = makeRepository({
      findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "IN_REVIEW", items: [] })),
      findIncludedBatchItems: vi.fn().mockResolvedValue([])
    });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(service.simulateBatchInternally({ context: makeCommandContext("OWNER"), batchId: "batch-1" })).rejects.toThrow(InvalidStateError);
  });

  it("records idempotency for internal simulation", async () => {
    const idempotency = makeIdempotencyRepository();
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "IN_REVIEW" })) });
    const service = createFiscalBatchService({ repository, audit: makeAudit(), idempotencyRepository: idempotency.repository });

    await service.simulateBatchInternally({ context: makeCommandContext("FISCAL_OPERATOR"), batchId: "batch-1", idempotencyKey: "idem-simulate" });

    expect(idempotency.repository.createCommandIdempotencyRecord).toHaveBeenCalledWith(
      expect.objectContaining({ operation: "fiscal_batch.simulate_internal", responseRef: "batch-1", status: "SUCCEEDED" })
    );
  });
});

describe("approveBatchForFutureIssuance", () => {
  it("approves only a simulated batch for future issuance and does not emit NFS-e", async () => {
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "SIMULATED" })) });
    const audit = makeAudit();
    const service = createFiscalBatchService({ repository, audit });
    const now = new Date("2026-05-13T17:00:00.000Z");

    const result = await service.approveBatchForFutureIssuance({ context: makeCommandContext("FISCAL_MANAGER"), batchId: "batch-1", now });

    expect(result).toMatchObject({ status: "APPROVED_FOR_FUTURE_ISSUANCE", approvedBy: userAId, approvedAt: now });
    expect(repository.updateCandidateStatus).toHaveBeenCalledWith("candidate-1", tenantAId, "APPROVED_FOR_FUTURE_ISSUANCE");
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "fiscal_batch.approved_for_future_issuance",
        metadata: { externalProviderCalled: false, nfseIssued: false }
      })
    );
  });

  it("blocks roles without batches.approve", async () => {
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "SIMULATED" })) });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(
      service.approveBatchForFutureIssuance({ context: makeCommandContext("FISCAL_OPERATOR"), batchId: "batch-1" })
    ).rejects.toThrow(ForbiddenError);
  });

  it("blocks approval before simulation", async () => {
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "IN_REVIEW" })) });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(
      service.approveBatchForFutureIssuance({ context: makeCommandContext("OWNER"), batchId: "batch-1" })
    ).rejects.toThrow(InvalidStateError);
  });

  it("blocks approval of cancelled batches", async () => {
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "CANCELLED" })) });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(
      service.approveBatchForFutureIssuance({ context: makeCommandContext("OWNER"), batchId: "batch-1" })
    ).rejects.toThrow(InvalidStateError);
  });

  it("records idempotency for future issuance approval without emitting NFS-e", async () => {
    const idempotency = makeIdempotencyRepository();
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "SIMULATED" })) });
    const audit = makeAudit();
    const service = createFiscalBatchService({ repository, audit, idempotencyRepository: idempotency.repository });

    await service.approveBatchForFutureIssuance({
      context: makeCommandContext("FISCAL_MANAGER"),
      batchId: "batch-1",
      idempotencyKey: "idem-approve"
    });

    expect(idempotency.repository.createCommandIdempotencyRecord).toHaveBeenCalledWith(
      expect.objectContaining({ operation: "fiscal_batch.approve_future_issuance", responseRef: "batch-1" })
    );
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ metadata: { externalProviderCalled: false, nfseIssued: false } }));
  });
});

describe("cancelBatch", () => {
  it("cancels a cancellable batch, releases candidates and records audit", async () => {
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "IN_REVIEW" })) });
    const audit = makeAudit();
    const service = createFiscalBatchService({ repository, audit });
    const now = new Date("2026-05-13T18:00:00.000Z");

    const result = await service.cancelBatch({
      context: makeCommandContext("FISCAL_MANAGER"),
      batchId: "batch-1",
      reason: "Importacao revisada manualmente",
      now
    });

    expect(result).toMatchObject({ status: "CANCELLED", cancelledBy: userAId, cancelledAt: now, cancelReason: "Importacao revisada manualmente" });
    expect(repository.updateCandidateStatus).toHaveBeenCalledWith("candidate-1", tenantAId, "READY_FOR_BATCH");
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "fiscal_batch.cancelled" }));
  });

  it("requires a cancellation reason", async () => {
    const service = createFiscalBatchService({ repository: makeRepository(), audit: makeAudit() });

    await expect(
      service.cancelBatch({ context: makeCommandContext("OWNER"), batchId: "batch-1", reason: " " })
    ).rejects.toThrow(ValidationError);
  });

  it("blocks cancellation after future issuance approval", async () => {
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "APPROVED_FOR_FUTURE_ISSUANCE" })) });
    const service = createFiscalBatchService({ repository, audit: makeAudit() });

    await expect(
      service.cancelBatch({ context: makeCommandContext("OWNER"), batchId: "batch-1", reason: "Revisao" })
    ).rejects.toThrow(InvalidStateError);
  });

  it("replays an idempotent cancellation without releasing candidates twice", async () => {
    const repository = makeRepository({ findBatchById: vi.fn().mockResolvedValue(makeBatch({ status: "IN_REVIEW" })) });
    const audit = makeAudit();
    const idempotency = makeIdempotencyRepository();
    const service = createFiscalBatchService({ repository, audit, idempotencyRepository: idempotency.repository });

    await service.cancelBatch({
      context: makeCommandContext("FISCAL_MANAGER"),
      batchId: "batch-1",
      reason: "Importacao revisada",
      idempotencyKey: "idem-cancel"
    });
    await service.cancelBatch({
      context: makeCommandContext("FISCAL_MANAGER"),
      batchId: "batch-1",
      reason: "Importacao revisada",
      idempotencyKey: "idem-cancel"
    });

    expect(repository.updateBatchStatus).toHaveBeenCalledTimes(1);
    expect(repository.updateCandidateStatus).toHaveBeenCalledTimes(1);
    expect(audit.record).toHaveBeenCalledTimes(1);
  });
});


