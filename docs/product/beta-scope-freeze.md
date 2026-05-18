# Beta Scope Freeze - VetFiscal OS

Atualizado em: 2026-05-18

## Status
Escopo congelado para preparacao de beta fiscal supervisionado.

Este documento nao libera go-live. Ele define o que pode entrar no beta controlado e o que deve permanecer fora ate novo PRD, ADR e aprovacao explicita.

## Beta Target
- Publico: 1 a 3 tenants controlados.
- Perfil: clinicas veterinarias com fluxo operacional fiscal simples e usuarios nomeados.
- Objetivo: provar confianca operacional, revisao humana, auditoria, isolamento por tenant e explicabilidade do simulador.
- Ambiente: staging/beta com dados ficticios ou dados reais somente apos go/no-go formal.

## Official Beta Journey
1. Usuario autentica via Supabase Auth.
2. Usuario entra em tenant ativo permitido.
3. Admin/owner revisa membros, convites e roles.
4. Operador fiscal consulta dashboard operacional.
5. Operador cria importacao a partir de documento registrado.
6. Importacao e validada com parser versionado.
7. Linhas validas geram candidatos fiscais supervisionados.
8. Candidatos exibem motivos de bloqueio e warnings LGPD.
9. Gestor fiscal resolve ou dispensa inconsistencias com justificativa.
10. Candidatos aptos entram em lote supervisionado.
11. Lote e submetido para revisao e simulado internamente.
12. Gestor aprova lote para etapa futura, sem emissao real.
13. Auditor/contador consulta documentos permitidos e trilha de auditoria.
14. Operacao registra evidencias de correlation id, tenant, ator, evento e payload redigido.

## MVP Beta
- Auth server-side com Supabase preparado.
- Tenant, memberships, convites e tenant switch.
- Cockpit operacional e fiscal.
- Importacoes estruturadas com parser versionado `vetcare_structured_v1`.
- Candidatos fiscais com review gate.
- Inconsistencias com resolucao/dispensa auditavel.
- Lotes simulados internos com aprovacao futura.
- Simulador fiscal governado e cenarios versionados.
- Auditoria, documentos metadata/download intent e observabilidade governada.
- Seed demo seguro e dados ficticios para validacao.
- Runbooks operacionais e matriz de riscos residuais.

## Post-Beta
- Upload real com Supabase Storage e URLs assinadas.
- Exportacao CSV/XLSX/PDF de relatorios operacionais.
- Playwright/e2e automatizado amplo.
- Rate limiting e protecoes adicionais de abuso.
- Sentry runtime com scrubbers e ADR propria.
- Feature flags por tenant para rollout gradual.
- Financeiro, CRM, DRE, fluxo de caixa, analytics e automacoes.
- Homologacao futura de provider NFS-e em ambiente isolado.

## Out Of Scope
- Emissao real de NFS-e.
- Scraping.
- Provider municipal, SEFAZ, prefeitura ou Ambiente Nacional.
- Certificado digital.
- pg-boss ou fila fiscal real.
- n8n para core fiscal.
- Service role Supabase exposta ao client ou versionada.
- Microsservicos.
- Billing comercial completo.
- Customizacoes por cliente durante beta.

## Controlled Beta Tenants
Os tenants abaixo sao placeholders de validacao e nao representam clientes reais.

| Tenant | Uso | Usuarios previstos | Status |
| --- | --- | --- | --- |
| Clinica VetFiscal Demo | Demo local e smoke de produto | owner, fiscal manager, fiscal operator, accountant, auditor | Ficticio |
| Clinica Beta Controlada A | Smoke beta multi-tenant | owner, fiscal manager, fiscal operator | Ficticio |
| Clinica Beta Controlada B | Teste de isolamento cross-tenant | owner, auditor | Ficticio |

Usuarios beta devem usar e-mails controlados ou dominio `.local` ate aprovacao de dados reais.

## Go/No-Go
Go somente se:
- PR da release candidate tiver Quality Gates verdes.
- Smoke com dois tenants passar.
- Tenant isolation e RBAC negativos passarem.
- Auditoria cobrir a jornada beta.
- LGPD/redaction passar sem vazamento de CPF/CNPJ bruto, token, storage path ou raw payload publico.
- Runbooks de import failure, stuck batch, tenant incident e beta release estiverem revisados.
- Produto confirmar explicitamente: sem emissao real, sem scraping e sem provider externo.

No-go imediato se:
- houver vazamento cross-tenant;
- dado sensivel completo aparecer em log, DTO ou auditoria publica;
- acao critica ocorrer sem auditoria;
- lote/candidato puder avançar contornando backend;
- surgir qualquer caminho de emissao real, scraping, certificado ou provider externo.

## Squad Routing
- Codex: implementacao, testes, Prisma/API, commits e integracao.
- @pm/@po: escopo beta, go/no-go, priorizacao e evidencia de produto.
- @architect: idempotencia, RBAC, boundaries e invariantes de lote.
- Segurança/LGPD: redaction, tenant isolation, dados sensiveis e runbooks.
- @qa: cenarios negativos, smoke beta e evidence pack.
- @devops: ambientes, Supabase/Vercel, rollback e release checklist.
