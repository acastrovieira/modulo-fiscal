import { z } from "zod";
import { supportedImportParserVersions } from "@/modules/imports/domain/import-parser";

export const importStatusSchema = z.enum([
  "PENDING_VALIDATION",
  "VALIDATING",
  "VALIDATED",
  "HAS_ERRORS",
  "READY_FOR_REVIEW",
  "ARCHIVED"
]);

export const createImportRequestSchema = z
  .object({
    documentFileId: z.string().uuid(),
    sourceName: z.string().trim().min(1).max(160).optional(),
    idempotencyKey: z.string().trim().min(1).max(160).optional()
  })
  .strict();

export const validateImportRequestSchema = z
  .object({
    parserVersion: z.enum(supportedImportParserVersions).optional(),
    rows: z.array(z.unknown()).max(500)
  })
  .strict();

export function parseImportStatus(value: string | null) {
  if (!value) {
    return undefined;
  }

  return importStatusSchema.parse(value);
}
