import type { AuditRecorder } from "@/modules/audit/application/audit-service";
import { canMarkCandidateReadyForBatch, type FiscalCandidateStatus } from "@/modules/fiscal/domain/fiscal-candidate";
import { createFiscalFingerprint, FISCAL_FINGERPRINT_VERSION } from "@/modules/fiscal/domain/fiscal-fingerprint";
import { maskBrazilianDocument } from "@/modules/fiscal/domain/masking";
import {
  assertPermissionForCommand,
  createCommandAuditEvent,
  type CommandContext
} from "@/shared/application/command-context";
import { InvalidStateError, NotFoundError } from "@/shared/errors/application-error";
import { assertTenantScope } from "@/shared/security/tenant-scope";

export type FiscalImportBatchStatus =
  | "PENDING_VALIDATION"
  | "VALIDATING"
  | "VALIDATED"
  | "HAS_ERRORS"
  | "READY_FOR_REVIEW"
  | "ARCHIVED";

export type FiscalImportBatchRecord = {
  id: string;
  tenantId: string;
  documentFileId: string;
  status: FiscalImportBatchStatus;
};

export type FiscalImportRowRecord = {
  id: string;
  tenantId: string;
  importBatchId: string;
  status: "RECEIVED" | "NORMALIZED" | "REJECTED" | "CANDIDATE_CREATED";
  normalizedPayload: unknown;
};

export type FiscalCandidateRecord = {
  id: string;
  tenantId: string;
  importBatchId: string;
  importRowId: string | null;
  documentFileId: string | null;
  customerName: string | null;
  customerDocumentMasked: string | null;
  serviceDate: Date | null;
  competenceDate: Date | null;
  serviceDescription: string | null;
  grossAmountCents: bigint | null;
  status: FiscalCandidateStatus;
  fiscalFingerprintVersion: string;
  fiscalFingerprint: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
};

export type CreateFiscalCandidateInput = {
  tenantId: string;
  importBatchId: string;
  importRowId: string;
  documentFileId: string;
  customerName: string | null;
  customerDocumentMasked: string | null;
  serviceDate: Date | null;
  competenceDate: Date | null;
  serviceDescription: string | null;
  grossAmountCents: bigint | null;
  status: FiscalCandidateStatus;
  fiscalFingerprintVersion: string;
  fiscalFingerprint: string;
};

export type FiscalCandidateRepository = {
  findImportBatchById(id: string): Promise<FiscalImportBatchRecord | null>;
  findNormalizedRowsByImportBatchId(importBatchId: string): Promise<FiscalImportRowRecord[]>;
  findCandidateByFingerprint(tenantId: string, version: string, fingerprint: string): Promise<FiscalCandidateRecord | null>;
  createFiscalCandidate(input: CreateFiscalCandidateInput): Promise<FiscalCandidateRecord>;
  markImportRowCandidateCreated(id: string, tenantId: string): Promise<void>;
  findCandidateById(id: string): Promise<FiscalCandidateRecord | null>;
  countOpenBlockingInconsistenciesByCandidateId(candidateId: string, tenantId: string): Promise<number>;
  updateFiscalCandidate(input: {
    id: string;
    tenantId: string;
    status: FiscalCandidateStatus;
    reviewedBy?: string;
    reviewedAt?: Date;
  }): Promise<FiscalCandidateRecord>;
};

export type CreateFiscalCandidatesFromImportInput = {
  context: CommandContext;
  importBatchId: string;
};

export type MarkCandidateReadyForBatchInput = {
  context: CommandContext;
  candidateId: string;
  now?: Date;
};

type NormalizedFiscalRow = {
  customerName?: string | null;
  customerDocument?: string | null;
  serviceDate?: string | Date | null;
  competenceDate?: string | Date | null;
  serviceDescription?: string | null;
  grossAmountCents?: bigint | number | string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function toCents(value: unknown): bigint | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    return BigInt(value);
  }

  if (typeof value === "string" && /^-?\d+$/.test(value)) {
    return BigInt(value);
  }

  return null;
}

function parseFiscalRow(row: unknown): NormalizedFiscalRow {
  if (!isRecord(row)) {
    return {};
  }

  return row as NormalizedFiscalRow;
}

function inferInitialStatus(input: {
  grossAmountCents: bigint | null;
  serviceDate: Date | null;
  competenceDate: Date | null;
  duplicate: boolean;
}): FiscalCandidateStatus {
  if (input.duplicate || input.grossAmountCents === null || input.grossAmountCents <= 0n || (!input.serviceDate && !input.competenceDate)) {
    return "BLOCKED";
  }

  return "NEEDS_REVIEW";
}

export function createFiscalCandidateService(dependencies: { repository: FiscalCandidateRepository; audit: AuditRecorder }) {
  const { repository, audit } = dependencies;

  return {
    async createFiscalCandidatesFromImport(input: CreateFiscalCandidatesFromImportInput): Promise<FiscalCandidateRecord[]> {
      assertPermissionForCommand(input.context, "createFiscalCandidatesFromImport");

      const importBatch = await repository.findImportBatchById(input.importBatchId);
      if (!importBatch) {
        throw new NotFoundError("Import batch not found.");
      }

      assertTenantScope(input.context.tenantId, importBatch);

      if (importBatch.status !== "VALIDATED" && importBatch.status !== "READY_FOR_REVIEW") {
        throw new InvalidStateError(`Cannot create fiscal candidates from import status ${importBatch.status}.`);
      }

      const rows = await repository.findNormalizedRowsByImportBatchId(importBatch.id);
      const candidates: FiscalCandidateRecord[] = [];

      for (const row of rows) {
        assertTenantScope(input.context.tenantId, row);

        if (row.status !== "NORMALIZED") {
          continue;
        }

        const normalized = parseFiscalRow(row.normalizedPayload);
        const customerDocumentMasked = maskBrazilianDocument(normalized.customerDocument ?? null);
        const serviceDate = toDate(normalized.serviceDate);
        const competenceDate = toDate(normalized.competenceDate);
        const grossAmountCents = toCents(normalized.grossAmountCents);
        const serviceDescription = normalized.serviceDescription?.trim() || null;
        const fingerprint = createFiscalFingerprint({
          tenantId: input.context.tenantId,
          customerDocumentMasked,
          serviceDate,
          competenceDate,
          serviceDescription,
          grossAmountCents
        });
        const existing = await repository.findCandidateByFingerprint(
          input.context.tenantId,
          FISCAL_FINGERPRINT_VERSION,
          fingerprint
        );
        if (existing) {
          candidates.push(existing);
          continue;
        }

        const status = inferInitialStatus({ grossAmountCents, serviceDate, competenceDate, duplicate: false });

        const candidate = await repository.createFiscalCandidate({
          tenantId: input.context.tenantId,
          importBatchId: importBatch.id,
          importRowId: row.id,
          documentFileId: importBatch.documentFileId,
          customerName: normalized.customerName ?? null,
          customerDocumentMasked,
          serviceDate,
          competenceDate,
          serviceDescription,
          grossAmountCents,
          status,
          fiscalFingerprintVersion: FISCAL_FINGERPRINT_VERSION,
          fiscalFingerprint: fingerprint
        });

        await repository.markImportRowCandidateCreated(row.id, input.context.tenantId);
        await audit.record(
          createCommandAuditEvent(input.context, {
            eventType: "fiscal_candidate.created",
            entityType: "FiscalCandidate",
            entityId: candidate.id,
            afterPayload: {
              status: candidate.status,
              importBatchId: candidate.importBatchId,
              importRowId: candidate.importRowId,
              fiscalFingerprintVersion: candidate.fiscalFingerprintVersion,
              duplicateDetected: false
            }
          })
        );

        candidates.push(candidate);
      }

      return candidates;
    },

    async markCandidateReadyForBatch(input: MarkCandidateReadyForBatchInput): Promise<FiscalCandidateRecord> {
      assertPermissionForCommand(input.context, "markCandidateReadyForBatch");

      const candidate = await repository.findCandidateById(input.candidateId);
      if (!candidate) {
        throw new NotFoundError("Fiscal candidate not found.");
      }

      assertTenantScope(input.context.tenantId, candidate);

      if (!canMarkCandidateReadyForBatch(candidate.status)) {
        throw new InvalidStateError(`Cannot mark fiscal candidate as ready from ${candidate.status}.`);
      }

      const openBlockingInconsistencies = await repository.countOpenBlockingInconsistenciesByCandidateId(
        candidate.id,
        input.context.tenantId
      );
      if (openBlockingInconsistencies > 0) {
        throw new InvalidStateError("Fiscal candidate has open blocking inconsistencies.");
      }

      const updated = await repository.updateFiscalCandidate({
        id: candidate.id,
        tenantId: input.context.tenantId,
        status: "READY_FOR_BATCH",
        reviewedBy: input.context.actorId,
        reviewedAt: input.now ?? new Date()
      });

      await audit.record(
        createCommandAuditEvent(input.context, {
          eventType: "fiscal_candidate.marked_ready",
          entityType: "FiscalCandidate",
          entityId: updated.id,
          beforePayload: { status: candidate.status },
          afterPayload: { status: updated.status, reviewedBy: updated.reviewedBy, reviewedAt: updated.reviewedAt }
        })
      );

      return updated;
    }
  };
}