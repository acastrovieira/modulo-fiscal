import type { AuditRecorder } from "@/modules/audit/application/audit-service";
import type { FiscalCandidateRecord, FiscalImportBatchRecord, FiscalImportRowRecord } from "@/modules/fiscal/application/fiscal-candidate-service";
import {
  canCloseBlockingInconsistency,
  canCloseInconsistency,
  isResolutionNoteValid,
  isSeverityAllowedForType,
  type FiscalInconsistency,
  type FiscalInconsistencySeverity,
  type FiscalInconsistencyStatus,
  type FiscalInconsistencyType
} from "@/modules/fiscal/domain/fiscal-inconsistency";
import {
  assertPermissionForCommand,
  createCommandAuditEvent,
  type CommandContext
} from "@/shared/application/command-context";
import { ForbiddenError, InvalidStateError, NotFoundError, ValidationError } from "@/shared/errors/application-error";
import { assertTenantScope } from "@/shared/security/tenant-scope";

export type OpenInconsistencyInput = {
  context: CommandContext;
  candidateId?: string | null;
  importBatchId?: string | null;
  importRowId?: string | null;
  type: FiscalInconsistencyType;
  severity: FiscalInconsistencySeverity;
  message: string;
  details?: unknown;
};

export type CloseInconsistencyInput = {
  context: CommandContext;
  inconsistencyId: string;
  resolutionNote: string;
  now?: Date;
};

export type CreateFiscalInconsistencyInput = {
  tenantId: string;
  candidateId?: string | null;
  importBatchId?: string | null;
  importRowId?: string | null;
  type: FiscalInconsistencyType;
  severity: FiscalInconsistencySeverity;
  status: FiscalInconsistencyStatus;
  message: string;
  details?: unknown;
};

export type FiscalInconsistencyRepository = {
  findCandidateById(id: string): Promise<FiscalCandidateRecord | null>;
  findImportBatchById(id: string): Promise<FiscalImportBatchRecord | null>;
  findImportRowById(id: string): Promise<FiscalImportRowRecord | null>;
  createInconsistency(input: CreateFiscalInconsistencyInput): Promise<FiscalInconsistency>;
  findInconsistencyById(id: string): Promise<FiscalInconsistency | null>;
  updateInconsistency(input: {
    id: string;
    tenantId: string;
    status: "RESOLVED" | "WAIVED";
    resolutionNote: string;
    resolvedBy: string;
    resolvedAt: Date;
  }): Promise<FiscalInconsistency>;
  updateCandidateStatus(candidateId: string, tenantId: string, status: "BLOCKED" | "NEEDS_REVIEW"): Promise<FiscalCandidateRecord>;
  countOpenBlockingInconsistenciesByCandidateId(candidateId: string, tenantId: string): Promise<number>;
};

function assertValidTaxonomy(type: FiscalInconsistencyType, severity: FiscalInconsistencySeverity): void {
  if (!isSeverityAllowedForType(type, severity)) {
    throw new ValidationError("Inconsistency type is not compatible with severity.");
  }
}

function assertValidMessage(message: string): void {
  if (!message.trim()) {
    throw new ValidationError("Inconsistency message is required.");
  }
}

function assertResolutionNote(note: string): void {
  if (!isResolutionNoteValid(note)) {
    throw new ValidationError("Resolution note is required.");
  }
}

function assertCanCloseBySeverity(context: CommandContext, inconsistency: FiscalInconsistency): void {
  if (inconsistency.severity === "BLOCKING" && !canCloseBlockingInconsistency(context.actorRole)) {
    throw new ForbiddenError("Only fiscal managers or administrators can close blocking inconsistencies.");
  }
}

async function releaseCandidateIfUnblocked(
  repository: FiscalInconsistencyRepository,
  candidateId: string | null,
  tenantId: string
): Promise<void> {
  if (!candidateId) {
    return;
  }

  const openBlocking = await repository.countOpenBlockingInconsistenciesByCandidateId(candidateId, tenantId);
  if (openBlocking === 0) {
    await repository.updateCandidateStatus(candidateId, tenantId, "NEEDS_REVIEW");
  }
}

export function createFiscalInconsistencyService(dependencies: {
  repository: FiscalInconsistencyRepository;
  audit: AuditRecorder;
}) {
  const { repository, audit } = dependencies;

  return {
    async openInconsistency(input: OpenInconsistencyInput): Promise<FiscalInconsistency> {
      assertPermissionForCommand(input.context, "openInconsistency");
      assertValidTaxonomy(input.type, input.severity);
      assertValidMessage(input.message);

      if (!input.candidateId && !input.importBatchId && !input.importRowId) {
        throw new ValidationError("Inconsistency must reference at least one entity.");
      }

      let candidate: FiscalCandidateRecord | null = null;
      if (input.candidateId) {
        candidate = await repository.findCandidateById(input.candidateId);
        if (!candidate) {
          throw new NotFoundError("Fiscal candidate not found.");
        }
        assertTenantScope(input.context.tenantId, candidate);
      }

      if (input.importBatchId) {
        const importBatch = await repository.findImportBatchById(input.importBatchId);
        if (!importBatch) {
          throw new NotFoundError("Import batch not found.");
        }
        assertTenantScope(input.context.tenantId, importBatch);
      }

      if (input.importRowId) {
        const importRow = await repository.findImportRowById(input.importRowId);
        if (!importRow) {
          throw new NotFoundError("Import row not found.");
        }
        assertTenantScope(input.context.tenantId, importRow);
      }

      const inconsistency = await repository.createInconsistency({
        tenantId: input.context.tenantId,
        candidateId: input.candidateId ?? null,
        importBatchId: input.importBatchId ?? null,
        importRowId: input.importRowId ?? null,
        type: input.type,
        severity: input.severity,
        status: "OPEN",
        message: input.message,
        details: input.details
      });

      if (candidate && input.severity === "BLOCKING" && candidate.status !== "BLOCKED") {
        await repository.updateCandidateStatus(candidate.id, input.context.tenantId, "BLOCKED");
      }

      await audit.record(
        createCommandAuditEvent(input.context, {
          eventType: "inconsistency.opened",
          entityType: "FiscalInconsistency",
          entityId: inconsistency.id,
          afterPayload: {
            status: inconsistency.status,
            severity: inconsistency.severity,
            type: inconsistency.type,
            candidateId: inconsistency.candidateId,
            importBatchId: inconsistency.importBatchId,
            importRowId: inconsistency.importRowId
          }
        })
      );

      return inconsistency;
    },

    async resolveInconsistency(input: CloseInconsistencyInput): Promise<FiscalInconsistency> {
      assertPermissionForCommand(input.context, "resolveInconsistency");
      assertResolutionNote(input.resolutionNote);

      const inconsistency = await repository.findInconsistencyById(input.inconsistencyId);
      if (!inconsistency) {
        throw new NotFoundError("Fiscal inconsistency not found.");
      }
      assertTenantScope(input.context.tenantId, inconsistency);
      assertCanCloseBySeverity(input.context, inconsistency);

      if (!canCloseInconsistency(inconsistency.status)) {
        throw new InvalidStateError(`Cannot resolve inconsistency from ${inconsistency.status}.`);
      }

      const resolved = await repository.updateInconsistency({
        id: inconsistency.id,
        tenantId: input.context.tenantId,
        status: "RESOLVED",
        resolutionNote: input.resolutionNote.trim(),
        resolvedBy: input.context.actorId,
        resolvedAt: input.now ?? new Date()
      });

      await releaseCandidateIfUnblocked(repository, inconsistency.candidateId, input.context.tenantId);

      await audit.record(
        createCommandAuditEvent(input.context, {
          eventType: "inconsistency.resolved",
          entityType: "FiscalInconsistency",
          entityId: resolved.id,
          beforePayload: {
            status: inconsistency.status,
            severity: inconsistency.severity,
            type: inconsistency.type
          },
          afterPayload: {
            status: resolved.status,
            resolutionNote: resolved.resolutionNote,
            resolvedBy: resolved.resolvedBy,
            resolvedAt: resolved.resolvedAt
          }
        })
      );

      return resolved;
    },

    async waiveInconsistency(input: CloseInconsistencyInput): Promise<FiscalInconsistency> {
      assertPermissionForCommand(input.context, "waiveInconsistency");
      assertResolutionNote(input.resolutionNote);

      const inconsistency = await repository.findInconsistencyById(input.inconsistencyId);
      if (!inconsistency) {
        throw new NotFoundError("Fiscal inconsistency not found.");
      }
      assertTenantScope(input.context.tenantId, inconsistency);
      assertCanCloseBySeverity(input.context, inconsistency);

      if (!canCloseInconsistency(inconsistency.status)) {
        throw new InvalidStateError(`Cannot waive inconsistency from ${inconsistency.status}.`);
      }

      const waived = await repository.updateInconsistency({
        id: inconsistency.id,
        tenantId: input.context.tenantId,
        status: "WAIVED",
        resolutionNote: input.resolutionNote.trim(),
        resolvedBy: input.context.actorId,
        resolvedAt: input.now ?? new Date()
      });

      await releaseCandidateIfUnblocked(repository, inconsistency.candidateId, input.context.tenantId);

      await audit.record(
        createCommandAuditEvent(input.context, {
          eventType: "inconsistency.waived",
          entityType: "FiscalInconsistency",
          entityId: waived.id,
          beforePayload: {
            status: inconsistency.status,
            severity: inconsistency.severity,
            type: inconsistency.type
          },
          afterPayload: {
            status: waived.status,
            severity: waived.severity,
            resolutionNote: waived.resolutionNote,
            resolvedBy: waived.resolvedBy,
            resolvedAt: waived.resolvedAt
          }
        })
      );

      return waived;
    }
  };
}