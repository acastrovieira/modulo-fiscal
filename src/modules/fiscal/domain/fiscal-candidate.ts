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

export type FiscalCandidateReviewBlockReason =
  | "DUPLICATE_WITHIN_IMPORT"
  | "MISSING_OR_INVALID_AMOUNT"
  | "MISSING_SERVICE_DATE";

export type FiscalCandidateReviewWarning = "RAW_CUSTOMER_DOCUMENT_RECEIVED";

export type FiscalCandidateReviewGateInput = {
  grossAmountCents: bigint | null;
  serviceDate: Date | null;
  competenceDate: Date | null;
  duplicateWithinImport: boolean;
  rawCustomerDocumentReceived: boolean;
};

export type FiscalCandidateReviewGate = {
  initialStatus: "NEEDS_REVIEW" | "BLOCKED";
  blockedReasons: FiscalCandidateReviewBlockReason[];
  warnings: FiscalCandidateReviewWarning[];
};

const readyTransitionSources: readonly FiscalCandidateStatus[] = ["NEEDS_REVIEW"];

export function canMarkCandidateReadyForBatch(status: FiscalCandidateStatus): boolean {
  return readyTransitionSources.includes(status);
}

export function evaluateFiscalCandidateReviewGate(input: FiscalCandidateReviewGateInput): FiscalCandidateReviewGate {
  const blockedReasons: FiscalCandidateReviewBlockReason[] = [];
  const warnings: FiscalCandidateReviewWarning[] = [];

  if (input.duplicateWithinImport) {
    blockedReasons.push("DUPLICATE_WITHIN_IMPORT");
  }

  if (input.grossAmountCents === null || input.grossAmountCents <= 0n) {
    blockedReasons.push("MISSING_OR_INVALID_AMOUNT");
  }

  if (!input.serviceDate && !input.competenceDate) {
    blockedReasons.push("MISSING_SERVICE_DATE");
  }

  if (input.rawCustomerDocumentReceived) {
    warnings.push("RAW_CUSTOMER_DOCUMENT_RECEIVED");
  }

  return {
    initialStatus: blockedReasons.length > 0 ? "BLOCKED" : "NEEDS_REVIEW",
    blockedReasons,
    warnings
  };
}
