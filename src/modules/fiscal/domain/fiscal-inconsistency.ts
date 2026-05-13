import type { Role } from "@/shared/security/roles";

export type FiscalInconsistencyStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "WAIVED";

export type FiscalInconsistencySeverity = "BLOCKING" | "REVIEWABLE";

export type FiscalInconsistencyType =
  | "MISSING_AMOUNT"
  | "INVALID_AMOUNT"
  | "MISSING_COMPETENCE_DATE"
  | "POSSIBLE_DUPLICATE"
  | "TENANT_MISMATCH"
  | "MISSING_SOURCE_DOCUMENT"
  | "MISSING_CHECKSUM"
  | "MISSING_CUSTOMER_DATA"
  | "INCOMPLETE_DESCRIPTION"
  | "QUESTIONABLE_SERVICE_CLASSIFICATION"
  | "SOURCE_REVIEW_DIVERGENCE"
  | "SENSITIVE_DATA_REVIEW";

export type FiscalInconsistency = {
  id: string;
  tenantId: string;
  candidateId: string | null;
  importBatchId: string | null;
  importRowId: string | null;
  type: FiscalInconsistencyType;
  severity: FiscalInconsistencySeverity;
  status: FiscalInconsistencyStatus;
  message: string;
  details: unknown;
  resolutionNote: string | null;
  resolvedBy: string | null;
  resolvedAt: Date | null;
};

const severityByType: Record<FiscalInconsistencyType, FiscalInconsistencySeverity> = {
  MISSING_AMOUNT: "BLOCKING",
  INVALID_AMOUNT: "BLOCKING",
  MISSING_COMPETENCE_DATE: "BLOCKING",
  POSSIBLE_DUPLICATE: "BLOCKING",
  TENANT_MISMATCH: "BLOCKING",
  MISSING_SOURCE_DOCUMENT: "BLOCKING",
  MISSING_CHECKSUM: "BLOCKING",
  MISSING_CUSTOMER_DATA: "BLOCKING",
  INCOMPLETE_DESCRIPTION: "REVIEWABLE",
  QUESTIONABLE_SERVICE_CLASSIFICATION: "REVIEWABLE",
  SOURCE_REVIEW_DIVERGENCE: "REVIEWABLE",
  SENSITIVE_DATA_REVIEW: "REVIEWABLE"
};

const blockingCloseRoles: readonly Role[] = ["OWNER", "ADMIN", "FISCAL_MANAGER"];

export function expectedSeverityForType(type: FiscalInconsistencyType): FiscalInconsistencySeverity {
  return severityByType[type];
}

export function isSeverityAllowedForType(type: FiscalInconsistencyType, severity: FiscalInconsistencySeverity): boolean {
  return severityByType[type] === severity;
}

export function canCloseInconsistency(status: FiscalInconsistencyStatus): boolean {
  return status === "OPEN" || status === "IN_REVIEW";
}

export function canCloseBlockingInconsistency(role: Role): boolean {
  return blockingCloseRoles.includes(role);
}

export function isResolutionNoteValid(note: string | null | undefined): boolean {
  return Boolean(note?.trim());
}