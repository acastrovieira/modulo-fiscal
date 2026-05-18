import { createHash } from "node:crypto";
import { ValidationError } from "@/shared/errors/application-error";

export const supportedImportParserVersions = ["vetcare_structured_v1"] as const;

export type ImportParserVersion = (typeof supportedImportParserVersions)[number];

export const defaultImportParserVersion: ImportParserVersion = "vetcare_structured_v1";

export type NormalizedImportRow = {
  parserVersion: ImportParserVersion;
  sourceRowId: string | null;
  description: string;
  amountCents: string;
  customerName: string | null;
  customerDocumentMasked: string | null;
  serviceDate: string | null;
  rowFingerprint: string;
  duplicateWithinImport: boolean;
};

const forbiddenRowKeys = new Set([
  "tenantId",
  "tenant_id",
  "storagePath",
  "rawPayload",
  "documentHash",
  "document_sha256",
  "customerDocument",
  "customer_document",
  "cpf",
  "cnpj",
  "providerToken",
  "provider_token",
  "serviceRoleKey",
  "service_role_key"
]);

export function assertSupportedImportParserVersion(value?: string): ImportParserVersion {
  if (!value) {
    return defaultImportParserVersion;
  }

  if (supportedImportParserVersions.includes(value as ImportParserVersion)) {
    return value as ImportParserVersion;
  }

  throw new ValidationError("Unsupported import parser version.");
}

function assertPlainObject(row: unknown, rowNumber: number): asserts row is Record<string, unknown> {
  if (row === null || typeof row !== "object" || Array.isArray(row)) {
    throw new ValidationError(`Import row ${rowNumber} must be an object.`);
  }
}

function assertNoForbiddenKeys(row: Record<string, unknown>, rowNumber: number): void {
  for (const key of Object.keys(row)) {
    if (forbiddenRowKeys.has(key)) {
      throw new ValidationError(`Import row ${rowNumber} contains forbidden field ${key}.`);
    }
  }
}

function readString(row: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
}

function readAmountCents(row: Record<string, unknown>): string {
  const value = row.amountCents ?? row.grossAmountCents ?? row.amount;

  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return String(value);
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim()) && Number(value) > 0) {
    return value.trim();
  }

  throw new ValidationError("Import row amount must be a positive integer in cents.");
}

function createRowFingerprint(input: {
  parserVersion: ImportParserVersion;
  sourceRowId: string | null;
  description: string;
  amountCents: string;
  serviceDate: string | null;
}) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        parserVersion: input.parserVersion,
        sourceRowId: input.sourceRowId,
        description: input.description.toLowerCase(),
        amountCents: input.amountCents,
        serviceDate: input.serviceDate
      })
    )
    .digest("hex");
}

export function normalizeImportRow(input: {
  row: unknown;
  rowNumber: number;
  parserVersion: ImportParserVersion;
  seenFingerprints: Set<string>;
}): NormalizedImportRow {
  assertPlainObject(input.row, input.rowNumber);
  assertNoForbiddenKeys(input.row, input.rowNumber);

  const sourceRowId = readString(input.row, ["sourceRowId", "source_row_id", "id"]);
  const description = readString(input.row, ["description", "serviceDescription", "service_description"]);
  if (!description) {
    throw new ValidationError("Import row description is required.");
  }

  const amountCents = readAmountCents(input.row);
  const customerName = readString(input.row, ["customerName", "customer_name", "tutorName", "tutor_name"]);
  const customerDocumentMasked = readString(input.row, ["customerDocumentMasked", "customer_document_masked", "documentMasked", "document_masked"]);
  const serviceDate = readString(input.row, ["serviceDate", "service_date", "competenceDate", "competence_date"]);
  const rowFingerprint = createRowFingerprint({
    parserVersion: input.parserVersion,
    sourceRowId,
    description,
    amountCents,
    serviceDate
  });
  const duplicateWithinImport = input.seenFingerprints.has(rowFingerprint);
  input.seenFingerprints.add(rowFingerprint);

  return {
    parserVersion: input.parserVersion,
    sourceRowId,
    description,
    amountCents,
    customerName,
    customerDocumentMasked,
    serviceDate,
    rowFingerprint,
    duplicateWithinImport
  };
}
