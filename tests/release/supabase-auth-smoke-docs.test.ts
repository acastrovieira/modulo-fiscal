import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Supabase Auth staging smoke documentation", () => {
  it("keeps Sprint 53 auth smoke gated, tenant-scoped and secret-safe", () => {
    const runbook = readProjectFile("docs/operations/runbooks/supabase-auth-smoke.md");
    const evidence = readProjectFile("docs/product/supabase-auth-smoke-evidence.md");
    const story = readProjectFile("docs/stories/sprint-53-supabase-auth-smoke.md");
    const pilotEvidence = readProjectFile("docs/product/beta-pilot-evidence-log.md");

    expect(runbook).toMatch(/Projeto Supabase exclusivo para staging\/beta/i);
    expect(runbook).toMatch(/Profile\.id.*UUIDs reais do Supabase Auth/i);
    expect(runbook).toMatch(/Usuario sem membership nao acessa dashboard/i);
    expect(runbook).toMatch(/Tentar URL direta cross-tenant/i);
    expect(runbook).toMatch(/SUPABASE_SERVICE_ROLE_KEY.*ausente ou vazia/i);
    expect(runbook).toMatch(/Evidencias Proibidas/i);
    expect(runbook).toMatch(/emissao oficial de NFS-e, scraping, provider municipal, certificado ou fila fiscal real/i);

    expect(evidence).toMatch(/NO-GO para uso beta real/i);
    expect(evidence).toMatch(/Resultado de `npm run ops:check-beta-env -- \.env\.local`/i);
    expect(evidence).toMatch(/Redirects Supabase Auth conferidos/i);
    expect(evidence).toMatch(/Cross-tenant por URL direta bloqueado/i);
    expect(evidence).toMatch(/sem CPF\/CNPJ completo, token ou segredo/i);
    expect(evidence).toMatch(/FEATURE_REAL_NFSE_ENABLED=false/i);

    expect(story).toMatch(/Sprint 53 - Supabase Auth Smoke Staging\/Beta/i);
    expect(story).toMatch(/@devops/i);
    expect(story).toMatch(/Seguranca\/LGPD/i);
    expect(story).toMatch(/Piloto real segue NO-GO ate smoke externo concluido/i);

    expect(pilotEvidence).toMatch(/Supabase Auth smoke Sprint 53/i);
    expect(pilotEvidence).toMatch(/docs\/operations\/runbooks\/supabase-auth-smoke\.md/i);
    expect(pilotEvidence).toMatch(/docs\/product\/supabase-auth-smoke-evidence\.md/i);
  });
});
