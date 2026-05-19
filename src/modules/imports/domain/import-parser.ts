import { createHash } from "node:crypto";
import { ValidationError } from "@/shared/errors/application-error";

export const supportedImportParserVersions = ["vetcare_structured_v1"] as const;

export type ImportParserVersion = (typeof supportedImportParserVersions)[number];

export const defaultImportParserVersion: ImportParserVersion = "vetcare_structured_v1";

const parserVersionOrder: Record<ImportParserVersion, number> = {
  vetcare_structured_v1: 1
};

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
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "authorization",
  "cookie",
  "privateKey",
  "private_key",
  "providerPayload",
  "provider_payload",
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

export function assertImportParserReplayAllowed(input: {
  latestParserVersion?: string | null;
  requestedParserVersion: ImportParserVersion;
}): void {
  if (!input.latestParserVersion) {
    return;
  }

  const latestParserVersion = assertSupportedImportParserVersion(input.latestParserVersion);
  if (input.requestedParserVersion !== latestParserVersion) {
    const requestedOrder = parserVersionOrder[input.requestedParserVersion];
    const latestOrder = parserVersionOrder[latestParserVersion];
    const reason = requestedOrder < latestOrder ? "downgrade" : "parser change";
    throw new ValidationError(`Import replay with parser ${reason} is not allowed without an explicit migration workflow.`);
  }
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

function readIsoDate(row: Record<string, unknown>, keys: readonly string[], rowNumber: number): string | null {
  const value = readString(row, keys);
  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ValidationError(`Import row ${rowNumber} has invalid date format.`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new ValidationError(`Import row ${rowNumber} has invalid date.`);
  }

  return value;
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
  const serviceDate = readIsoDate(input.row, ["serviceDate", "service_date", "competenceDate", "competence_date"], input.rowNumber);
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
