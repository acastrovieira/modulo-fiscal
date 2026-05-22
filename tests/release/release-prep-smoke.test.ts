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
      expect(content, file).toMatch(/No real NFS-e|sem emissao|scraping|provider/i);
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
    const sprint46Story = readProjectFile("docs/stories/sprint-46-pilot-findings-stabilization.md");
    const sprint47Story = readProjectFile("docs/stories/sprint-47-prd-fiscal-real-homologation.md");
    const goNoGoPack = readProjectFile("docs/product/pilot-go-no-go-pack.md");
    const stabilizationPlan = readProjectFile("docs/product/pilot-findings-stabilization-plan.md");
    const realNfsePrd = readProjectFile("docs/product/prd-real-nfse-homologation.md");
    const homologationAdr = readProjectFile("docs/adr/0011-use-homologation-first-real-issuance.md");
    const loginPage = readProjectFile("src/app/(auth)/login/page.tsx");
    const operationalPage = readProjectFile("src/modules/operational/presentation/operational-workflow-page.tsx");
    const dashboardError = readProjectFile("src/app/(dashboard)/error.tsx");
    const sidebar = readProjectFile("src/components/layout/app-sidebar.tsx");
    const logoutButton = readProjectFile("src/components/layout/logout-button.tsx");
    const permissionGuard = readProjectFile("src/shared/security/assert-permission.ts");
    const runbook = readProjectFile("docs/operations/runbooks/beta-release.md");
    const smoke = readProjectFile("docs/operations/runbooks/beta-pilot-smoke.md");
    const controlledPilotRunbook = readProjectFile("docs/operations/runbooks/controlled-pilot-run.md");

    expect(evidence).toMatch(/Decisao atual: NO-GO para usuarios beta reais/i);
    expect(evidence).toMatch(/Sem emissao oficial de NFS-e/i);
    expect(evidence).toMatch(/Sem scraping/i);
    expect(evidence).toMatch(/Sem integracao com provider municipal/i);
    expect(evidence).toMatch(/Quality Gates/i);
    expect(evidence).toMatch(/dois tenants/i);

    expect(pilot).toMatch(/Product owner/i);
    expect(pilot).toMatch(/Owner de engenharia/i);
    expect(pilot).toMatch(/Owner de suporte/i);
    expect(pilot).toMatch(/least privilege/i);
    expect(pilot).toMatch(/go\/no-go/i);
    expect(pilot).toMatch(/Bloqueadores Atuais/i);

    expect(pilotEvidence).toMatch(/Decisao atual: NO-GO para uso beta real/i);
    expect(pilotEvidence).toMatch(/5c14c9eef1cec88c70d07520afd1ff7928193728/i);
    expect(pilotEvidence).toMatch(/Template de Evidencia de Smoke Manual/i);
    expect(pilotEvidence).toMatch(/Qualquer caminho habilitado para emissao oficial de NFS-e, scraping, chamadas a provider municipal, certificados ou jobs fiscais/i);

    expect(runbook).toMatch(/Condicoes de No-Go/i);
    expect(runbook).toMatch(/emissao oficial de NFS-e, scraping, chamadas a provider municipal, certificados ou jobs fiscais/i);

    expect(smoke).toMatch(/Fluxo Tenant A/i);
    expect(smoke).toMatch(/Fluxo Tenant B/i);
    expect(smoke).toMatch(/Checks de Abuso/i);
    expect(smoke).toMatch(/Nao colar secrets, tokens, payloads crus ou documentos pessoais completos/i);

    expect(roadmap).toMatch(/Ativacao do Ambiente Staging\/Beta/i);
    expect(roadmap).toMatch(/Smoke com Dois Tenants/i);
    expect(roadmap).toMatch(/PRD Fiscal Real \/ Homologacao/i);
    expect(roadmap).toMatch(/Sem emissao oficial de NFS-e antes de aprovacao futura pos-Sprint 47/i);
    expect(roadmap).toMatch(/Sem integracao com provider municipal/i);

    expect(stagingActivation).toMatch(/npm run ops:check-beta-env -- \.env\.local/i);
    expect(stagingActivation).toMatch(/NEXT_PUBLIC_APP_ENV=Local/i);
    expect(stagingActivation).toMatch(/Qualquer flag de seguranca fiscal real como `true`/i);

    expect(betaUsers).toMatch(/Matriz de Roles de Menor Privilegio/i);
    expect(betaUsers).toMatch(/Nao armazenar e-mails pessoais reais/i);
    expect(betaUsers).toMatch(/Usuario sem membership nao acessa dashboard/i);
    expect(betaUsers).toMatch(/Qualquer e-mail real, CPF, CNPJ, token ou documento aparece em docs do repositorio/i);

    expect(twoTenantSmoke).toMatch(/Jornada Tenant A/i);
    expect(twoTenantSmoke).toMatch(/Jornada Tenant B/i);
    expect(twoTenantSmoke).toMatch(/Checks de Abuso/i);
    expect(twoTenantSmoke).toMatch(/NO-GO para usuarios beta reais ate este smoke passar em staging\/beta/i);

    expect(sprint43Story).toMatch(/codigo de suporte/i);
    expect(sprint44Story).toMatch(/Decisao atual: NO-GO para usuarios beta reais/i);
    expect(sprint44Story).toMatch(/URL de deploy staging\/beta e evidencia de smoke com dois tenants estao capturadas/i);
    expect(sprint45Story).toMatch(/a execucao do piloto esta bloqueada ate os gates externos da Sprint 44 mudarem para GO/i);
    expect(sprint45Story).toMatch(/Nenhuma emissao oficial de NFS-e, scraping, provider municipal, certificado ou job fiscal e acionado/i);
    expect(goNoGoPack).toMatch(/Decisao atual: NO-GO/i);
    expect(goNoGoPack).toMatch(/GO com restricoes/i);
    expect(goNoGoPack).toMatch(/Qualquer caminho habilitado para emissao oficial de NFS-e, scraping, integracao com provider municipal, uso de certificado ou execucao de fila fiscal/i);
    expect(controlledPilotRunbook).toMatch(/Decisao da Sprint 44 e GO ou GO com restricoes/i);
    expect(controlledPilotRunbook).toMatch(/Parar piloto imediatamente/i);
    expect(controlledPilotRunbook).toMatch(/Exposicao de dados cross-tenant/i);
    expect(sprint46Story).toMatch(/Processo de estabilizacao documentado/i);
    expect(sprint46Story).toMatch(/emissao real de NFS-e, scraping, provider municipal, certificado e job fiscal/i);
    expect(stabilizationPlan).toMatch(/P0 \| Vazamento entre tenants, vazamento de segredo, acao fiscal real/i);
    expect(stabilizationPlan).toMatch(/Criterios do Release Candidate Pos-Piloto/i);
    expect(stabilizationPlan).toMatch(/Sem emissao real de NFS-e/i);
    expect(sprint47Story).toMatch(/nenhuma implementacao de emissao real de NFS-e comeca nesta sprint/i);
    expect(realNfsePrd).toMatch(/Este PRD nao autoriza implementacao/i);
    expect(realNfsePrd).toMatch(/Nenhum upload ou armazenamento de certificado/i);
    expect(realNfsePrd).toMatch(/Timeout do provider nao pode criar automaticamente uma segunda transmissao fiscal/i);
    expect(homologationAdr).toMatch(/Esta ADR nao autoriza implementacao/i);
    expect(homologationAdr).toMatch(/Sem emissao real sem PRD explicito, ADR de provider, evidencia de homologacao e aprovacao go\/no-go/i);
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
