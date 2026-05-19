import type { FiscalCandidateStatus } from "@/modules/fiscal/domain/fiscal-candidate";

export type FiscalBatchStatus = "DRAFT" | "IN_REVIEW" | "SIMULATED" | "APPROVED_FOR_FUTURE_ISSUANCE" | "CANCELLED";

export type FiscalBatchItemStatus = "INCLUDED" | "REMOVED";

export type FiscalBatch = {
  id: string;
  tenantId: string;
  status: FiscalBatchStatus;
  batchNumber: string | null;
  createdBy: string | null;
  submittedBy: string | null;
  submittedAt: Date | null;
  simulatedBy: string | null;
  simulatedAt: Date | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  cancelledBy: string | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  totalGrossAmountCents: bigint;
};

export type FiscalBatchItem = {
  id: string;
  tenantId: string;
  batchId: string;
  candidateId: string;
  status: FiscalBatchItemStatus;
  grossAmountCents: bigint;
  candidateSnapshot: FiscalBatchCandidateSnapshot;
};

export type FiscalBatchCandidateSnapshot = {
  customerName: string | null;
  customerDocumentMasked: string | null;
  serviceDate: string | null;
  competenceDate: string | null;
  serviceDescription: string | null;
  grossAmountCents: string;
  fiscalFingerprintVersion: string;
  fiscalFingerprint: string;
};

export function canIncludeCandidateInBatch(status: FiscalCandidateStatus, grossAmountCents: bigint | null): boolean {
  return status === "READY_FOR_BATCH" && grossAmountCents !== null && grossAmountCents > 0n;
}

export function canSubmitBatchForReview(status: FiscalBatchStatus): boolean {
  return status === "DRAFT";
}

export function canSimulateBatchInternally(status: FiscalBatchStatus): boolean {
  return status === "IN_REVIEW";
}

export function canApproveBatchForFutureIssuance(status: FiscalBatchStatus): boolean {
  return status === "SIMULATED";
}

export function canCancelBatch(status: FiscalBatchStatus): boolean {
  return status === "DRAFT" || status === "IN_REVIEW" || status === "SIMULATED";
}
