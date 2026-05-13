export type FiscalCandidateStatus =
  | "DRAFT"
  | "NEEDS_REVIEW"
  | "BLOCKED"
  | "READY_FOR_BATCH"
  | "IN_BATCH"
  | "SIMULATED"
  | "APPROVED_FOR_FUTURE_ISSUANCE";

export type FiscalCandidate = {
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

const readyTransitionSources: readonly FiscalCandidateStatus[] = ["NEEDS_REVIEW"];

export function canMarkCandidateReadyForBatch(status: FiscalCandidateStatus): boolean {
  return readyTransitionSources.includes(status);
}