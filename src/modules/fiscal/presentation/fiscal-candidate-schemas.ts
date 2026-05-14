import { z } from "zod";

export const fiscalCandidateStatusSchema = z.enum([
  "DRAFT",
  "NEEDS_REVIEW",
  "BLOCKED",
  "READY_FOR_BATCH",
  "IN_BATCH",
  "SIMULATED",
  "APPROVED_FOR_FUTURE_ISSUANCE"
]);

export const readyForBatchRequestSchema = z.object({}).strict();

export function parseFiscalCandidateStatus(value: string | null) {
  if (!value) {
    return undefined;
  }

  return fiscalCandidateStatusSchema.parse(value);
}