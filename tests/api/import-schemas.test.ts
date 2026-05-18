import { describe, expect, it } from "vitest";
import { defaultImportParserVersion } from "@/modules/imports/domain/import-parser";
import { validateImportRequestSchema } from "@/modules/imports/presentation/import-schemas";

describe("import API schemas", () => {
  it("accepts the current versioned structured parser contract", () => {
    const payload = validateImportRequestSchema.parse({
      parserVersion: defaultImportParserVersion,
      rows: [{ description: "Consulta", amountCents: "10000" }]
    });

    expect(payload.parserVersion).toBe(defaultImportParserVersion);
    expect(payload.rows).toHaveLength(1);
  });

  it("rejects unsupported parser versions", () => {
    expect(() =>
      validateImportRequestSchema.parse({
        parserVersion: "legacy_csv_v0",
        rows: []
      })
    ).toThrow();
  });

  it("rejects client-controlled tenant scope at request root", () => {
    expect(() =>
      validateImportRequestSchema.parse({
        tenantId: "tenant-from-client",
        rows: []
      })
    ).toThrow();
  });
});
