import { describe, expect, it } from "vitest";
import { containsPublicDocumentNumber, previewChecksum, redactAuditPayload, redactSensitiveValue } from "@/shared/security/redaction";

describe("LGPD redaction helpers", () => {
  it("redacts known sensitive keys and masks public identifiers", () => {
    const redacted = redactSensitiveValue({
      customerDocument: "12345678901",
      email: "tutora@example.com",
      phone: "11987654321",
      storagePath: "tenant/private/file.csv",
      providerResponse: { official: true },
      idempotencyKey: "retry-key",
      checksumSha256: "0123456789abcdef0123456789abcdef",
      nested: { note: "CNPJ 12.345.678/0001-90" }
    });

    expect(redacted).toEqual({
      customerDocument: "[redacted]",
      email: "[redacted]",
      phone: "[redacted]",
      storagePath: "[redacted]",
      providerResponse: "[redacted]",
      idempotencyKey: "[redacted]",
      checksumSha256: "[redacted]",
      nested: { note: "CNPJ **.***.***/****-**" }
    });
    expect(containsPublicDocumentNumber(redacted)).toBe(false);
  });

  it("creates audit previews without full raw payloads", () => {
    const preview = redactAuditPayload({ rawPayload: { cpf: "12345678901" }, status: "READY_FOR_REVIEW" });

    expect(preview).toEqual({ rawPayload: "[redacted]", status: "READY_FOR_REVIEW" });
    expect(JSON.stringify(preview)).not.toContain("12345678901");
  });

  it("previews checksums without exposing the complete digest", () => {
    expect(previewChecksum("0123456789abcdef0123456789abcdef")).toBe("01234567...89abcdef");
  });
});
