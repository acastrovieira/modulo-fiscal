import { z } from "zod";

export const fiscalInconsistencyStatusSchema = z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "WAIVED"]);
export const fiscalInconsistencySeveritySchema = z.enum(["BLOCKING", "REVIEWABLE"]);
export const fiscalInconsistencyTypeSchema = z.enum([
  "MISSING_AMOUNT",
  "INVALID_AMOUNT",
  "MISSING_COMPETENCE_DATE",
  "POSSIBLE_DUPLICATE",
  "TENANT_MISMATCH",
  "MISSING_SOURCE_DOCUMENT",
  "MISSING_CHECKSUM",
  "MISSING_CUSTOMER_DATA",
  "INCOMPLETE_DESCRIPTION",
  "QUESTIONABLE_SERVICE_CLASSIFICATION",
  "SOURCE_REVIEW_DIVERGENCE",
  "SENSITIVE_DATA_REVIEW"
]);
export const openInconsistencyRequestSchema = z.object({ candidateId: z.string().uuid().optional(), importBatchId: z.string().uuid().optional(), importRowId: z.string().uuid().optional(), type: fiscalInconsistencyTypeSchema, severity: fiscalInconsistencySeveritySchema, message: z.string().trim().min(1).max(500), details: z.unknown().optional() }).strict();
export const closeInconsistencyRequestSchema = z.object({ resolutionNote: z.string().trim().min(1).max(1000) }).strict();
export function parseInconsistencyStatus(value: string | null) { return value ? fiscalInconsistencyStatusSchema.parse(value) : undefined; }
export function parseInconsistencySeverity(value: string | null) { return value ? fiscalInconsistencySeveritySchema.parse(value) : undefined; }