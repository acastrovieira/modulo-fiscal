import { createHash } from "node:crypto";

export const FISCAL_FINGERPRINT_VERSION = "v1";

export type FiscalFingerprintInput = {
  tenantId: string;
  customerDocumentMasked?: string | null;
  serviceDate?: Date | string | null;
  competenceDate?: Date | string | null;
  serviceDescription?: string | null;
  grossAmountCents?: bigint | number | string | null;
};

function normalizeDate(value: Date | string | null | undefined): string {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function normalizeMoney(value: bigint | number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  return value.toString();
}

export function createFiscalFingerprint(input: FiscalFingerprintInput): string {
  const payload = [
    input.tenantId,
    input.customerDocumentMasked ?? "",
    normalizeDate(input.serviceDate),
    normalizeDate(input.competenceDate),
    input.serviceDescription?.trim().toLowerCase() ?? "",
    normalizeMoney(input.grossAmountCents)
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
}