import { describe, expect, it } from "vitest";
import {
  assertImportParserReplayAllowed,
  assertSupportedImportParserVersion,
  defaultImportParserVersion,
  normalizeImportRow
} from "@/modules/imports/domain/import-parser";
import { ValidationError } from "@/shared/errors/application-error";

describe("import parser governance", () => {
  it("blocks unknown parser versions before repository work", () => {
    expect(() => assertSupportedImportParserVersion("unknown_parser_v1")).toThrow(ValidationError);
  });

  it("allows replay only with the same versioned parser", () => {
    expect(() =>
      assertImportParserReplayAllowed({
        latestParserVersion: defaultImportParserVersion,
        requestedParserVersion: defaultImportParserVersion
      })
    ).not.toThrow();
  });

  it("blocks parser changes during replay without an explicit migration workflow", () => {
    expect(() =>
      assertImportParserReplayAllowed({
        latestParserVersion: "future_parser_v2",
        requestedParserVersion: defaultImportParserVersion
      })
    ).toThrow(ValidationError);
  });

  it("quarantines malicious or forbidden row fields through validation errors", () => {
    const seenFingerprints = new Set<string>();

    for (const forbidden of [
      "tenantId",
      "rawPayload",
      "storagePath",
      "providerPayload",
      "accessToken",
      "refreshToken",
      "authorization",
      "cookie",
      "privateKey",
      "cpf",
      "cnpj"
    ]) {
      expect(() =>
        normalizeImportRow({
          row: { description: "Consulta", amountCents: "10000", [forbidden]: "sensitive" },
          rowNumber: 1,
          parserVersion: defaultImportParserVersion,
          seenFingerprints
        })
      ).toThrow(ValidationError);
    }
  });

  it("rejects forbidden sensitive fields inside nested import payloads", () => {
    expect(() =>
      normalizeImportRow({
        row: {
          description: "Consulta",
          amountCents: "10000",
          metadata: {
            nested: [{ cpf: "12345678901" }, { accessToken: "secret-token" }]
          }
        },
        rowNumber: 1,
        parserVersion: defaultImportParserVersion,
        seenFingerprints: new Set<string>()
      })
    ).toThrow(ValidationError);
  });

  it("rejects invalid dates and invalid amounts before fiscal candidates are created", () => {
    expect(() =>
      normalizeImportRow({
        row: { description: "Consulta", amountCents: "-1", serviceDate: "2026-05-13" },
        rowNumber: 1,
        parserVersion: defaultImportParserVersion,
        seenFingerprints: new Set<string>()
      })
    ).toThrow(ValidationError);

    expect(() =>
      normalizeImportRow({
        row: { description: "Consulta", amountCents: "10000", serviceDate: "2026-02-31" },
        rowNumber: 1,
        parserVersion: defaultImportParserVersion,
        seenFingerprints: new Set<string>()
      })
    ).toThrow(ValidationError);
  });
});
