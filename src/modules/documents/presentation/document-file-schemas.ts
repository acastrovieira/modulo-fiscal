import { z } from "zod";
import { ValidationError } from "@/shared/errors/application-error";

const pageSchema = z.coerce.number().int().min(1).default(1);
const pageSizeSchema = z.coerce.number().int().min(1).max(100).default(50);
const safeTextSchema = z.string().trim().min(1).max(120);
const dateTextSchema = z.string().datetime();

export const documentFileQuerySchema = z.object({
  fileType: safeTextSchema.optional(),
  mimeType: safeTextSchema.optional(),
  createdBy: safeTextSchema.optional(),
  createdFrom: dateTextSchema.optional(),
  createdTo: dateTextSchema.optional(),
  page: pageSchema,
  pageSize: pageSizeSchema
}).strict();

export function parseDocumentFileQuery(searchParams: URLSearchParams) {
  const parsed = documentFileQuerySchema.parse(Object.fromEntries(searchParams));
  if (parsed.createdFrom && parsed.createdTo && new Date(parsed.createdFrom) > new Date(parsed.createdTo)) {
    throw new ValidationError("createdFrom must be before createdTo.");
  }

  return {
    ...parsed,
    createdFrom: parsed.createdFrom ? new Date(parsed.createdFrom) : undefined,
    createdTo: parsed.createdTo ? new Date(parsed.createdTo) : undefined
  };
}
