# Release Readiness Checklist - VetFiscal OS MVP

Atualizado em: 2026-05-13

## Objetivo
Preparar o MVP Fiscal Supervisionado para PR tecnico, revisao e continuidade segura.

## Escopo Do PR
- [ ] Fundação Next.js/TypeScript/Tailwind/shadcn/ui/Prisma.
- [ ] Schema fiscal operacional inicial.
- [ ] RBAC, tenant context, command context e audit trail.
- [ ] Services de importacoes, candidatos, inconsistencias e lotes simulados.
- [ ] Cockpit operacional API-first.
- [ ] Regressao e hardening com 100 testes.
- [ ] Documentacao de produto, arquitetura, ADRs e planos.

## Fora Do Escopo
- [ ] Emissao real de NFS-e.
- [ ] Provider municipal, SEFAZ, certificado digital ou adapter externo ativo.
- [ ] Scraping.
- [ ] Jobs fiscais reais com pg-boss.
- [ ] Financeiro/CRM/DRE completos.

## Gates Obrigatorios
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npx prisma validate`
- [ ] Busca confirma ausencia de Prisma em React/UI.
- [ ] Busca confirma ausencia de provider NFS-e/scraping/job fiscal real.
- [ ] Working tree limpo antes do push/PR.

## Evidencias Esperadas
- [ ] Output dos gates anexado ou descrito no PR.
- [ ] Hash do commit final informado.
- [ ] Resumo dos principais modulos entregues.
- [ ] Lista de riscos residuais.
- [ ] Confirmacao explicita de que NFS-e real esta desativada.
- [ ] Confirmacao de que `.env` e secrets nao foram versionados.

## Riscos Residuals Conhecidos
| Risco | Tratamento |
| --- | --- |
| Supabase Auth ainda nao esta conectado em producao | MVP usa currentUser/currentTenant server-side local; integrar em sprint futura |
| Seed demo ainda nao existe | Planejado para Sprint 10 |
| CI ainda nao existe | Planejado para Sprint 11 |
| APIs completas por modulo ainda nao existem | Planejadas para Sprints 12 e 13 |
| Telas completas ainda nao existem | Planejadas para Sprint 14 |
| Emissao real ainda nao existe | Intencional; exige PRD/ADR/homologacao futura |

## Checklist De PR Description
- [ ] Objetivo do PR.
- [ ] Escopo funcional.
- [ ] Escopo tecnico.
- [ ] Como rodar localmente.
- [ ] Variaveis de ambiente.
- [ ] Comandos de validacao.
- [ ] Testes executados.
- [ ] Riscos e limitacoes.
- [ ] Confirmacao de ausencia de emissao real/scraping/provider externo.
- [ ] Proximos passos pos-merge.

## Template De PR
```md
## Objetivo
Fecha a fundacao do MVP Fiscal Supervisionado do VetFiscal OS.

## Escopo
- Modular monolith SaaS-ready.
- RBAC, tenant isolation e auditoria.
- Importacoes, candidatos, inconsistencias e lotes simulados.
- Cockpit operacional API-first.
- Regressao e hardening MVP.

## Fora do escopo
- Emissao real de NFS-e.
- Scraping.
- Provider externo municipal/NFS-e.
- Jobs fiscais reais.

## Validacao
- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm test
- [ ] npm run build
- [ ] npx prisma validate

## Riscos residuais
- Supabase Auth real, seed demo, CI e telas completas entram nas proximas sprints.
```
