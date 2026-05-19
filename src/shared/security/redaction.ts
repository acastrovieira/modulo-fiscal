export type RedactedPayload = Record<string, unknown> | unknown[] | string | number | boolean | null;

const sensitiveKeyPattern = /(password|senha|token|secret|authorization|cookie|certificate|certificado|privateKey|storagePath|rawPayload|providerResponse|signedUrl|bucket|checksum|idempotencyKey|cpf|cnpj|document|email|phone|telefone)/i;
const cpfPattern = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const cnpjPattern = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g;
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const phonePattern = /\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/g;
const maxDepth = 3;
const maxArrayItems = 8;
const maxStringLength = 160;

function maskString(value: string): string {
  return value
    .replace(cpfPattern, "***.***.***-**")
    .replace(cnpjPattern, "**.***.***/****-**")
    .replace(emailPattern, "***@***")
    .replace(phonePattern, "(**) *****-****")
    .slice(0, maxStringLength);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

export function redactSensitiveValue(value: unknown, depth = 0): RedactedPayload {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return maskString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (depth >= maxDepth) return "[redacted-depth-limit]";

  if (Array.isArray(value)) {
    return value.slice(0, maxArrayItems).map((item) => redactSensitiveValue(item, depth + 1));
  }

  if (!isPlainRecord(value)) return "[redacted-unsupported]";

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      sensitiveKeyPattern.test(key) ? "[redacted]" : redactSensitiveValue(entry, depth + 1)
    ])
  );
}

export function redactAuditPayload(value: unknown): RedactedPayload | null {
  if (value === null || value === undefined) return null;
  return redactSensitiveValue(value);
}

export function previewChecksum(checksum: string): string {
  if (checksum.length <= 16) return checksum;
  return `${checksum.slice(0, 8)}...${checksum.slice(-8)}`;
}

export function containsPublicDocumentNumber(value: unknown): boolean {
  const serialized = JSON.stringify(value);
  if (!serialized) return false;
  return /\b\d{11}\b|\b\d{14}\b|\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(serialized);
}
