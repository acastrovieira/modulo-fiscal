import type { AuditRecorder } from "@/modules/audit/application/audit-service";
import type { FiscalCandidateRecord } from "@/modules/fiscal/application/fiscal-candidate-service";
import {
  canApproveBatchForFutureIssuance,
  canCancelBatch,
  canIncludeCandidateInBatch,
  canSimulateBatchInternally,
  canSubmitBatchForReview,
  type FiscalBatch,
  type FiscalBatchItem,
  type FiscalBatchStatus
} from "@/modules/fiscal/domain/fiscal-batch";
import {
  assertPermissionForCommand,
  createCommandAuditEvent,
  type CommandContext
} from "@/shared/application/command-context";
import { InvalidStateError, NotFoundError, ValidationError } from "@/shared/errors/application-error";
import {
  runIdempotentCommand,
  type CommandIdempotencyRepository
} from "@/shared/idempotency/command-idempotency";
import { assertTenantScope } from "@/shared/security/tenant-scope";

export type FiscalBatchRecord = FiscalBatch & {
  items?: FiscalBatchItemRecord[];
};

export type FiscalBatchItemRecord = FiscalBatchItem;

export type CreateFiscalBatchInput = {
  context: CommandContext;
  candidateIds: string[];
  batchNumber?: string | null;
  idempotencyKey?: string | null;
};

export type BatchTransitionInput = {
  context: CommandContext;
  batchId: string;
  now?: Date;
  idempotencyKey?: string | null;
};

export type CancelFiscalBatchInput = BatchTransitionInput & {
  reason: string;
};

export type CreateFiscalBatchRepositoryInput = {
  tenantId: string;
  batchNumber?: string | null;
  createdBy: string;
  status: "DRAFT";
  totalGrossAmountCents: bigint;
  items: Array<{
    tenantId: string;
    candidateId: string;
    status: "INCLUDED";
    grossAmountCents: bigint;
  }>;
};

export type FiscalBatchRepository = {
  findCandidateById(id: string): Promise<FiscalCandidateRecord | null>;
  countOpenBlockingInconsistenciesByCandidateId(candidateId: string, tenantId: string): Promise<number>;
  createFiscalBatch(input: CreateFiscalBatchRepositoryInput): Promise<FiscalBatchRecord>;
  findBatchById(id: string): Promise<FiscalBatchRecord | null>;
  findIncludedBatchItems(batchId: string, tenantId: string): Promise<FiscalBatchItemRecord[]>;
  updateBatchStatus(input: {
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
  }): Promise<FiscalBatchRecord>;
  updateCandidateStatus(candidateId: string, tenantId: string, status: "READY_FOR_BATCH" | "IN_BATCH" | "SIMULATED" | "APPROVED_FOR_FUTURE_ISSUANCE"): Promise<FiscalCandidateRecord>;
};

function assertNonEmptyCandidates(candidateIds: string[]): void {
  if (candidateIds.length === 0) {
    throw new ValidationError("Fiscal batch requires at least one candidate.");
  }
}

function uniqueCandidateIds(candidateIds: string[]): string[] {
  return [...new Set(candidateIds)];
}

function assertNoDuplicates(candidateIds: string[]): void {
  if (uniqueCandidateIds(candidateIds).length !== candidateIds.length) {
    throw new ValidationError("Fiscal batch cannot contain duplicate candidates.");
  }
}

function assertCancellationReason(reason: string): void {
  if (!reason.trim()) {
    throw new ValidationError("Cancellation reason is required.");
  }
}

async function loadIncludedItems(repository: FiscalBatchRepository, batch: FiscalBatchRecord): Promise<FiscalBatchItemRecord[]> {
  if (batch.items) {
    return batch.items.filter((item) => item.status === "INCLUDED");
  }

  return repository.findIncludedBatchItems(batch.id, batch.tenantId);
}

async function updateBatchCandidates(
  repository: FiscalBatchRepository,
  items: FiscalBatchItemRecord[],
  tenantId: string,
  status: "READY_FOR_BATCH" | "IN_BATCH" | "SIMULATED" | "APPROVED_FOR_FUTURE_ISSUANCE"
): Promise<void> {
  for (const item of items) {
    assertTenantScope(tenantId, item);
    await repository.updateCandidateStatus(item.candidateId, tenantId, status);
  }
}

export function createFiscalBatchService(dependencies: {
  repository: FiscalBatchRepository;
  audit: AuditRecorder;
  idempotencyRepository?: CommandIdempotencyRepository;
}) {
  const { repository, audit, idempotencyRepository } = dependencies;

  async function loadBatchForReplay(context: CommandContext, batchId: string): Promise<FiscalBatchRecord | null> {
    const batch = await repository.findBatchById(batchId);
    if (batch) {
      assertTenantScope(context.tenantId, batch);
    }

    return batch;
  }

  return {
    async createFiscalBatch(input: CreateFiscalBatchInput): Promise<FiscalBatchRecord> {
      assertPermissionForCommand(input.context, "createFiscalBatch");
      assertNonEmptyCandidates(input.candidateIds);
      assertNoDuplicates(input.candidateIds);

      return runIdempotentCommand({
        context: input.context,
        operation: "fiscal_batch.create",
        idempotencyKey: input.idempotencyKey,
        requestPayload: {
          candidateIds: [...input.candidateIds].sort(),
          batchNumber: input.batchNumber ?? null
        },
        repository: idempotencyRepository,
        loadExisting: (batchId) => loadBatchForReplay(input.context, batchId),
        getResponseRef: (batch) => batch.id,
        execute: async () => {
          const candidates: FiscalCandidateRecord[] = [];
          for (const candidateId of input.candidateIds) {
            const candidate = await repository.findCandidateById(candidateId);
            if (!candidate) {
              throw new NotFoundError("Fiscal candidate not found.");
            }

            assertTenantScope(input.context.tenantId, candidate);

            if (!canIncludeCandidateInBatch(candidate.status, candidate.grossAmountCents)) {
              throw new InvalidStateError(`Cannot include fiscal candidate from ${candidate.status}.`);
            }

            const openBlocking = await repository.countOpenBlockingInconsistenciesByCandidateId(candidate.id, input.context.tenantId);
            if (openBlocking > 0) {
              throw new InvalidStateError("Fiscal candidate has open blocking inconsistencies.");
            }

            candidates.push(candidate);
          }

          const totalGrossAmountCents = candidates.reduce((total, candidate) => total + (candidate.grossAmountCents ?? 0n), 0n);
          const batch = await repository.createFiscalBatch({
            tenantId: input.context.tenantId,
            batchNumber: input.batchNumber ?? null,
            createdBy: input.context.actorId,
            status: "DRAFT",
            totalGrossAmountCents,
            items: candidates.map((candidate) => ({
              tenantId: input.context.tenantId,
              candidateId: candidate.id,
              status: "INCLUDED",
              grossAmountCents: candidate.grossAmountCents ?? 0n
            }))
          });

          const items = await loadIncludedItems(repository, batch);
          await updateBatchCandidates(repository, items, input.context.tenantId, "IN_BATCH");

          await audit.record(
            createCommandAuditEvent(input.context, {
              eventType: "fiscal_batch.created",
              entityType: "FiscalBatch",
              entityId: batch.id,
              afterPayload: {
                status: batch.status,
                batchNumber: batch.batchNumber,
                totalGrossAmountCents: batch.totalGrossAmountCents.toString(),
                candidateIds: candidates.map((candidate) => candidate.id)
              }
            })
          );

          return batch;
        }
      });
    },

    async submitBatchForReview(input: BatchTransitionInput): Promise<FiscalBatchRecord> {
      assertPermissionForCommand(input.context, "submitBatchForReview");

      return runIdempotentCommand({
        context: input.context,
        operation: "fiscal_batch.submit_review",
        idempotencyKey: input.idempotencyKey,
        requestPayload: { batchId: input.batchId },
        repository: idempotencyRepository,
        loadExisting: (batchId) => loadBatchForReplay(input.context, batchId),
        getResponseRef: (batch) => batch.id,
        execute: async () => {
          const batch = await repository.findBatchById(input.batchId);
          if (!batch) {
            throw new NotFoundError("Fiscal batch not found.");
          }
          assertTenantScope(input.context.tenantId, batch);

          if (!canSubmitBatchForReview(batch.status)) {
            throw new InvalidStateError(`Cannot submit fiscal batch from ${batch.status}.`);
          }

          const submittedAt = input.now ?? new Date();
          const updated = await repository.updateBatchStatus({
            id: batch.id,
            tenantId: input.context.tenantId,
            status: "IN_REVIEW",
            submittedBy: input.context.actorId,
            submittedAt
          });

          await audit.record(
            createCommandAuditEvent(input.context, {
              eventType: "fiscal_batch.submitted_for_review",
              entityType: "FiscalBatch",
              entityId: updated.id,
              beforePayload: { status: batch.status },
              afterPayload: { status: updated.status, submittedBy: updated.submittedBy, submittedAt: updated.submittedAt }
            })
          );

          return updated;
        }
      });
    },

    async simulateBatchInternally(input: BatchTransitionInput): Promise<FiscalBatchRecord> {
      assertPermissionForCommand(input.context, "simulateBatchInternally");

      return runIdempotentCommand({
        context: input.context,
        operation: "fiscal_batch.simulate_internal",
        idempotencyKey: input.idempotencyKey,
        requestPayload: { batchId: input.batchId },
        repository: idempotencyRepository,
        loadExisting: (batchId) => loadBatchForReplay(input.context, batchId),
        getResponseRef: (batch) => batch.id,
        execute: async () => {
          const batch = await repository.findBatchById(input.batchId);
          if (!batch) {
            throw new NotFoundError("Fiscal batch not found.");
          }
          assertTenantScope(input.context.tenantId, batch);

          if (!canSimulateBatchInternally(batch.status)) {
            throw new InvalidStateError(`Cannot simulate fiscal batch from ${batch.status}.`);
          }

          const items = await loadIncludedItems(repository, batch);
          if (items.length === 0) {
            throw new InvalidStateError("Fiscal batch has no included items to simulate.");
          }

          const simulatedAt = input.now ?? new Date();
          const updated = await repository.updateBatchStatus({
            id: batch.id,
            tenantId: input.context.tenantId,
            status: "SIMULATED",
            simulatedBy: input.context.actorId,
            simulatedAt
          });
          await updateBatchCandidates(repository, items, input.context.tenantId, "SIMULATED");

          await audit.record(
            createCommandAuditEvent(input.context, {
              eventType: "fiscal_batch.simulated_internally",
              entityType: "FiscalBatch",
              entityId: updated.id,
              beforePayload: { status: batch.status },
              afterPayload: { status: updated.status, simulatedBy: updated.simulatedBy, simulatedAt: updated.simulatedAt },
              metadata: { externalProviderCalled: false, nfseIssued: false }
            })
          );

          return updated;
        }
      });
    },

    async approveBatchForFutureIssuance(input: BatchTransitionInput): Promise<FiscalBatchRecord> {
      assertPermissionForCommand(input.context, "approveBatchForFutureIssuance");

      return runIdempotentCommand({
        context: input.context,
        operation: "fiscal_batch.approve_future_issuance",
        idempotencyKey: input.idempotencyKey,
        requestPayload: { batchId: input.batchId },
        repository: idempotencyRepository,
        loadExisting: (batchId) => loadBatchForReplay(input.context, batchId),
        getResponseRef: (batch) => batch.id,
        execute: async () => {
          const batch = await repository.findBatchById(input.batchId);
          if (!batch) {
            throw new NotFoundError("Fiscal batch not found.");
          }
          assertTenantScope(input.context.tenantId, batch);

          if (!canApproveBatchForFutureIssuance(batch.status)) {
            throw new InvalidStateError(`Cannot approve fiscal batch from ${batch.status}.`);
          }

          const items = await loadIncludedItems(repository, batch);
          if (items.length === 0) {
            throw new InvalidStateError("Fiscal batch has no included items to approve.");
          }

          const approvedAt = input.now ?? new Date();
          const updated = await repository.updateBatchStatus({
            id: batch.id,
            tenantId: input.context.tenantId,
            status: "APPROVED_FOR_FUTURE_ISSUANCE",
            approvedBy: input.context.actorId,
            approvedAt
          });
          await updateBatchCandidates(repository, items, input.context.tenantId, "APPROVED_FOR_FUTURE_ISSUANCE");

          await audit.record(
            createCommandAuditEvent(input.context, {
              eventType: "fiscal_batch.approved_for_future_issuance",
              entityType: "FiscalBatch",
              entityId: updated.id,
              beforePayload: { status: batch.status },
              afterPayload: { status: updated.status, approvedBy: updated.approvedBy, approvedAt: updated.approvedAt },
              metadata: { externalProviderCalled: false, nfseIssued: false }
            })
          );

          return updated;
        }
      });
    },

    async cancelBatch(input: CancelFiscalBatchInput): Promise<FiscalBatchRecord> {
      assertPermissionForCommand(input.context, "cancelBatch");
      assertCancellationReason(input.reason);

      return runIdempotentCommand({
        context: input.context,
        operation: "fiscal_batch.cancel",
        idempotencyKey: input.idempotencyKey,
        requestPayload: { batchId: input.batchId, reason: input.reason.trim() },
        repository: idempotencyRepository,
        loadExisting: (batchId) => loadBatchForReplay(input.context, batchId),
        getResponseRef: (batch) => batch.id,
        execute: async () => {
          const batch = await repository.findBatchById(input.batchId);
          if (!batch) {
            throw new NotFoundError("Fiscal batch not found.");
          }
          assertTenantScope(input.context.tenantId, batch);

          if (!canCancelBatch(batch.status)) {
            throw new InvalidStateError(`Cannot cancel fiscal batch from ${batch.status}.`);
          }

          const items = await loadIncludedItems(repository, batch);
          const cancelledAt = input.now ?? new Date();
          const updated = await repository.updateBatchStatus({
            id: batch.id,
            tenantId: input.context.tenantId,
            status: "CANCELLED",
            cancelledBy: input.context.actorId,
            cancelledAt,
            cancelReason: input.reason.trim()
          });
          await updateBatchCandidates(repository, items, input.context.tenantId, "READY_FOR_BATCH");

          await audit.record(
            createCommandAuditEvent(input.context, {
              eventType: "fiscal_batch.cancelled",
              entityType: "FiscalBatch",
              entityId: updated.id,
              beforePayload: { status: batch.status },
              afterPayload: {
                status: updated.status,
                cancelledBy: updated.cancelledBy,
                cancelledAt: updated.cancelledAt,
                cancelReason: updated.cancelReason
              }
            })
          );

          return updated;
        }
      });
    }
  };
}
