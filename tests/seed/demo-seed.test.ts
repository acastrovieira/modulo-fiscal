import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const requireSeed = createRequire(import.meta.url);
const seedModule = requireSeed("../../prisma/seed.js") as {
  ids: Record<string, string>;
  normalizedRows: Array<{
    customerName: string;
    customerDocumentMasked: string;
    sourceRowId: string;
    fingerprint: string;
  }>;
};

function readSeedSource(): string {
  return readFileSync(join(process.cwd(), "prisma", "seed.js"), "utf8");
}

describe("demo seed safety", () => {
  it("uses deterministic ids compatible with the local tenant context", () => {
    expect(seedModule.ids.tenant).toBe("11111111-1111-4111-8111-111111111111");
    expect(seedModule.ids.owner).toBe("00000000-0000-4000-8000-000000000001");
    expect(new Set(Object.values(seedModule.ids)).size).toBe(Object.values(seedModule.ids).length);
  });

  it("keeps all demo people and emails synthetic", () => {
    const source = readSeedSource();

    expect(source).toContain("@vetfiscal.local");
    expect(source).not.toMatch(/[A-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|icloud)\./i);
    expect(source).not.toMatch(/Anderson de Castro Vieira|acastrovieira@gmail\.com/i);
  });

  it("stores only masked customer documents in normalized demo data", () => {
    expect(seedModule.normalizedRows.length).toBeGreaterThanOrEqual(5);

    for (const row of seedModule.normalizedRows) {
      expect(row.customerName).toMatch(/Demo/);
      expect(row.customerDocumentMasked).toMatch(/^\*{7}\d{4}$/);
      expect(row.customerDocumentMasked).not.toMatch(/^\d{11}$|^\d{14}$/);
    }
  });

  it("does not contain real issuance, scraping or external fiscal provider calls", () => {
    const source = readSeedSource();

    expect(source).toContain("externalProviderCalled: false");
    expect(source).toContain("nfseIssued: false");
    expect(source).not.toMatch(/playwright|puppeteer|selenium|cheerio|crawler/i);
    expect(source).not.toMatch(/prefeitura|sefaz|certificado digital|invoice_request|emitted_at|issued_at/i);
  });
});
