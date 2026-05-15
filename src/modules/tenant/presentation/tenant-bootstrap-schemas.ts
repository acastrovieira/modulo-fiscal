import { z } from "zod";

export const bootstrapTenantRequestSchema = z.object({
  name: z.string().trim().min(3).max(120),
  legalName: z.string().trim().min(3).max(180).optional().nullable(),
  cnpj: z.string().trim().min(14).max(18).optional().nullable(),
  idempotencyKey: z.string().trim().regex(/^[A-Za-z0-9_-]{16,120}$/).optional()
}).strict();
