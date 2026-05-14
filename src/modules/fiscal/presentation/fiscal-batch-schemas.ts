import { z } from "zod";

export const fiscalBatchStatusSchema = z.enum(["DRAFT", "IN_REVIEW", "SIMULATED", "APPROVED_FOR_FUTURE_ISSUANCE", "CANCELLED"]);
export const createBatchRequestSchema = z.object({ candidateIds: z.array(z.string().uuid()).min(1).max(100), batchNumber: z.string().trim().min(1).max(80).nullable().optional() }).strict();
export const emptyBatchTransitionRequestSchema = z.object({}).strict();
export const cancelBatchRequestSchema = z.object({ reason: z.string().trim().min(1).max(1000) }).strict();
export function parseBatchStatus(value: string | null) { return value ? fiscalBatchStatusSchema.parse(value) : undefined; }