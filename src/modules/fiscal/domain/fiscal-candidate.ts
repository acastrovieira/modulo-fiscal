export type FiscalCandidateStatus =
  | "DRAFT"
  | "NEEDS_REVIEW"
  | "READY_FOR_BATCH"
  | "BLOCKED";

export type FiscalCandidate = {
  id: string;
  tenantId: string;
  status: FiscalCandidateStatus;
  fiscalFingerprint: string;
};
