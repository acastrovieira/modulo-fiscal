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
    const pilotEvidence = readProjectFile("docs/product/beta-pilot-evidence-log.md");
    const roadmap = readProjectFile("docs/product/controlled-beta-execution-roadmap.md");
    const stagingActivation = readProjectFile("docs/operations/staging-beta-activation.md");
    const betaUsers = readProjectFile("docs/product/beta-users-roles-tenant-setup.md");
    const twoTenantSmoke = readProjectFile("docs/product/two-tenant-smoke-evidence.md");
    const sprint43Story = readProjectFile("docs/stories/sprint-43-ux-test-feedback-hardening.md");
    const sprint44Story = readProjectFile("docs/stories/sprint-44-pilot-go-no-go-pack.md");
    const sprint45Story = readProjectFile("docs/stories/sprint-45-controlled-pilot-run.md");
    const goNoGoPack = readProjectFile("docs/product/pilot-go-no-go-pack.md");
    const loginPage = readProjectFile("src/app/(auth)/login/page.tsx");
    const operationalPage = readProjectFile("src/modules/operational/presentation/operational-workflow-page.tsx");
    const dashboardError = readProjectFile("src/app/(dashboard)/error.tsx");
    const sidebar = readProjectFile("src/components/layout/app-sidebar.tsx");
    const logoutButton = readProjectFile("src/components/layout/logout-button.tsx");
    const permissionGuard = readProjectFile("src/shared/security/assert-permission.ts");
    const runbook = readProjectFile("docs/operations/runbooks/beta-release.md");
    const smoke = readProjectFile("docs/operations/runbooks/beta-pilot-smoke.md");
    const controlledPilotRunbook = readProjectFile("docs/operations/runbooks/controlled-pilot-run.md");

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
    expect(pilot).toMatch(/Current Blockers/i);

    expect(pilotEvidence).toMatch(/Current decision: NO-GO for real beta usage/i);
    expect(pilotEvidence).toMatch(/5c14c9eef1cec88c70d07520afd1ff7928193728/i);
    expect(pilotEvidence).toMatch(/Manual Smoke Evidence Template/i);
    expect(pilotEvidence).toMatch(/Any enabled path for real NFS-e issuance, scraping, municipal provider calls, certificates or fiscal jobs/i);

    expect(runbook).toMatch(/No-Go Conditions/i);
    expect(runbook).toMatch(/real NFS-e issuance, scraping, municipal provider calls, certificates or fiscal jobs/i);

    expect(smoke).toMatch(/Tenant A Flow/i);
    expect(smoke).toMatch(/Tenant B Flow/i);
    expect(smoke).toMatch(/Abuse Checks/i);
    expect(smoke).toMatch(/Do not paste secrets, tokens, raw payloads or full personal documents/i);

    expect(roadmap).toMatch(/Staging\/Beta Environment Activation/i);
    expect(roadmap).toMatch(/Two-Tenant Smoke Test/i);
    expect(roadmap).toMatch(/PRD Fiscal Real \/ Homologation/i);
    expect(roadmap).toMatch(/No real NFS-e issuance before Sprint 47 approval/i);
    expect(roadmap).toMatch(/No municipal provider integration/i);

    expect(stagingActivation).toMatch(/npm run ops:check-beta-env -- \.env\.local/i);
    expect(stagingActivation).toMatch(/NEXT_PUBLIC_APP_ENV=Local/i);
    expect(stagingActivation).toMatch(/Any real fiscal safety flag is true/i);

    expect(betaUsers).toMatch(/Least-Privilege Role Matrix/i);
    expect(betaUsers).toMatch(/Do not store real personal e-mails/i);
    expect(betaUsers).toMatch(/User without membership cannot access dashboard/i);
    expect(betaUsers).toMatch(/Any real e-mail, CPF, CNPJ, token or document appears in repository docs/i);

    expect(twoTenantSmoke).toMatch(/Tenant A Journey/i);
    expect(twoTenantSmoke).toMatch(/Tenant B Journey/i);
    expect(twoTenantSmoke).toMatch(/Abuse Checks/i);
    expect(twoTenantSmoke).toMatch(/NO-GO for real beta users until this smoke passes in staging\/beta/i);

    expect(sprint43Story).toMatch(/codigo de suporte/i);
    expect(sprint44Story).toMatch(/Current decision: NO-GO for real beta users/i);
    expect(sprint44Story).toMatch(/Staging\/beta deployment URL and two-tenant smoke evidence are captured/i);
    expect(sprint45Story).toMatch(/pilot execution is blocked until Sprint 44 external gates turn GO/i);
    expect(sprint45Story).toMatch(/No real NFS-e issuance, scraping, municipal provider, certificate or fiscal job is triggered/i);
    expect(goNoGoPack).toMatch(/Current decision: NO-GO/i);
    expect(goNoGoPack).toMatch(/GO with restrictions/i);
    expect(goNoGoPack).toMatch(/Any enabled path for real NFS-e issuance, scraping, municipal provider integration, certificate usage or fiscal queue execution/i);
    expect(controlledPilotRunbook).toMatch(/Sprint 44 decision is GO or GO with restrictions/i);
    expect(controlledPilotRunbook).toMatch(/Stop pilot immediately/i);
    expect(controlledPilotRunbook).toMatch(/Cross-tenant data exposure/i);
    expect(loginPage).toMatch(/Ambiente beta supervisionado/i);
    expect(loginPage).toMatch(/Codigo de suporte/i);
    expect(operationalPage).toMatch(/Sem emissao fiscal real/i);
    expect(operationalPage).toMatch(/Confirme tenant ativo, permissoes e dados demo/i);
    expect(operationalPage).toMatch(/ID redigido/i);
    expect(operationalPage).toMatch(/Arquivos fiscais importados/i);
    expect(dashboardError).toMatch(/Codigo de suporte/i);
    expect(sidebar).toMatch(/sem emissao real/i);
    expect(logoutButton).toMatch(/window\.location\.href = "\/login"/i);
    expect(permissionGuard).not.toMatch(/Permission denied: \$/i);
  });
});
