import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ZodError, z } from "zod";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { ForbiddenError } from "@/shared/errors/application-error";

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("release prep smoke", () => {
  it("keeps public API errors sanitized and request-correlated", async () => {
    const validation = apiErrorResponse(new ZodError([{
      code: z.ZodIssueCode.custom,
      path: ["secret"],
      message: "postgresql://user:secret@db"
    }]), "req-validation");
    const forbidden = apiErrorResponse(new ForbiddenError("Tenant is not available."), "req-forbidden");
    const internal = apiErrorResponse(new Error("SQL constraint failed with secret"), "req-internal");

    await expect(validation.json()).resolves.toEqual({ error: { code: "VALIDATION_ERROR", message: "Invalid request payload.", requestId: "req-validation" } });
    await expect(forbidden.json()).resolves.toEqual({ error: { code: "FORBIDDEN", message: "Tenant is not available.", requestId: "req-forbidden" } });
    await expect(internal.json()).resolves.toEqual({ error: { code: "INTERNAL_ERROR", message: "Unexpected server error.", requestId: "req-internal" } });
  });

  it("documents release environment, Supabase and migration runbooks before beta", () => {
    const requiredDocs = [
      "docs/operations/environments.md",
      "docs/operations/supabase-setup.md",
      "docs/operations/vercel-release.md",
      "docs/operations/database-migrations.md"
    ];

    for (const file of requiredDocs) {
      const content = readProjectFile(file);
      expect(content.length, file).toBeGreaterThan(500);
      expect(content, file).toMatch(/Quality gates|npm run lint|npm test|prisma validate|migrate deploy/i);
      expect(content, file).toMatch(/No real NFS-e|sem emissao real|scraping|provider/i);
    }
  });

  it("keeps beta safety flags disabled in the committed env template", () => {
    const envExample = readProjectFile(".env.example");

    expect(envExample).toContain('FEATURE_REAL_NFSE_ENABLED="false"');
    expect(envExample).toContain('FEATURE_SCRAPING_ENABLED="false"');
    expect(envExample).toContain('FEATURE_MUNICIPAL_PROVIDER_ENABLED="false"');
    expect(envExample).toContain('SUPABASE_SERVICE_ROLE_KEY=""');
    expect(envExample).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY="[^"]+"/);
    expect(envExample).not.toMatch(/postgres:\/\/[^"\s]*:[^"\s]*@[^"\s]*supabase/i);
  });

  it("keeps the beta release candidate blocked until evidence and owners are ready", () => {
    const evidence = readProjectFile("docs/product/beta-release-candidate-evidence-pack.md");
    const pilot = readProjectFile("docs/product/beta-pilot-readiness-plan.md");
    const runbook = readProjectFile("docs/operations/runbooks/beta-release.md");

    expect(evidence).toMatch(/Current decision: NO-GO for real beta users/i);
    expect(evidence).toMatch(/No real NFS-e issuance/i);
    expect(evidence).toMatch(/No scraping/i);
    expect(evidence).toMatch(/No municipal provider integration/i);
    expect(evidence).toMatch(/Quality Gates/i);
    expect(evidence).toMatch(/two tenants/i);

    expect(pilot).toMatch(/Product owner/i);
    expect(pilot).toMatch(/Engineering owner/i);
    expect(pilot).toMatch(/Support owner/i);
    expect(pilot).toMatch(/least privilege/i);
    expect(pilot).toMatch(/go\/no-go/i);

    expect(runbook).toMatch(/No-Go Conditions/i);
    expect(runbook).toMatch(/real NFS-e issuance, scraping, municipal provider calls, certificates or fiscal jobs/i);
  });
});
