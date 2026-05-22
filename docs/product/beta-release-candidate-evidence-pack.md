# Pacote de Evidencias do Release Candidate Beta - Sprint 38

## Status
Pacote tecnico do release candidate preparado.

O beta nao esta aprovado para usuarios reais ate o pull request estar mergeado, os GitHub Quality Gates estarem verdes, os owners do piloto estarem nomeados e os tenants do beta controlado estarem explicitamente aprovados.

## Escopo do Release Candidate
- Beta controlado para 1-3 tenants aprovados.
- Workflow fiscal supervisionado apenas.
- Revisao de importacao, revisao de candidatos, inconsistencias, lotes, simulacao interna, auditoria e documentos.
- Sem emissao oficial de NFS-e.
- Sem scraping.
- Sem integracao com provider municipal.
- Sem uso de certificado.
- Sem fila fiscal ou execucao de job fiscal externo.

## Resumo de Evidencias
| Evidencia | Status | Notas |
| --- | --- | --- |
| Commit base | Capturado | `f3df1c8` antes das mudancas da Sprint 38. |
| Commit do pull request | Capturado | Merge commit da Sprint 38 `5c14c9eef1cec88c70d07520afd1ff7928193728`. |
| URL do CI | Capturada | `https://github.com/acastrovieira/modulo-fiscal/actions/runs/26103778717/job/76761820308` |
| Lint local | Aprovado | `npm run lint` aprovado em 2026-05-19. |
| Typecheck local | Aprovado | `npm run typecheck` aprovado em 2026-05-19. |
| Testes locais | Aprovados | `npm test` aprovado em 2026-05-19 com 305 testes. |
| Scanner de secrets | Aprovado | `npm run security:secrets` nao encontrou potenciais secrets. |
| Prisma validate | Aprovado | `npx prisma validate` aprovado com `DATABASE_URL` local/demo. |
| Build de producao tecnica | Aprovado | `npm run build` aprovado em 2026-05-19. |
| Smoke manual com dois tenants | Pendente ambiente externo beta/staging | Deve ser repetido em staging/beta antes do piloto real. |

## Comandos Obrigatorios de Gate
```bash
npm run lint
npm run typecheck
npm test
npm run security:secrets
npx prisma validate
npm run build
```

## Roteiro de Smoke Manual
Executar com dois tenants controlados em ambiente staging/beta depois do PR mergeado e das variaveis de ambiente configuradas.

1. Entrar como OWNER ou ADMIN aprovado.
2. Confirmar badge de tenant ativo e badge de ambiente.
3. Alternar para Tenant A e abrir dashboard, importacoes, candidatos, inconsistencias, lotes, auditoria e documentos.
4. Confirmar que registros do Tenant A aparecem e campos sensiveis estao mascarados.
5. Alternar para Tenant B e repetir as mesmas rotas.
6. Tentar abrir URL direta de recurso do Tenant A com Tenant B ativo.
7. Confirmar bloqueio sem vazar se o recurso existe.
8. Validar que eventos de auditoria sao escopados por tenant e redigidos.
9. Confirmar que nao ha acao, rotulo ou resposta sugerindo emissao oficial de NFS-e.

## Decisao Go/No-Go
Decisao atual: NO-GO para usuarios beta reais.

Motivos:
- O PR da Sprint 38 esta mergeado e validado pelos GitHub Quality Gates.
- Tenants beta reais e usuarios beta nao estao nomeados no repositorio.
- Owners de suporte, engenharia e rollback ainda exigem atribuicao explicita.
- Smoke manual com dois tenants deve rodar em staging/beta com o build final em deploy.

## Riscos Residuais Aceitos
| Risco | Status | Mitigacao |
| --- | --- | --- |
| Alguns metodos de repositorio ainda usam ids globais antes de escopo por tenant no service code | Aceito apenas para RC | Coberto por testes de isolamento de tenant e documentado como alvo de hardening. |
| Sem envio real de e-mail para convites | Aceito | Beta pode usar entrega supervisionada de token ate existir ADR de provider de e-mail. |
| Sem provider fiscal real ou certificado | Intencional | Exigido pelo congelamento de escopo beta. |
| Smoke manual depende de ambiente externo staging/beta | Aceito | Deve ser concluido antes de habilitar usuarios reais do piloto. |

## Riscos Bloqueadores
- Qualquer falha P0/P1 de isolamento por tenant.
- Qualquer CPF/CNPJ, token, storage path ou payload de provider sem redacao em DTOs publicos, logs ou views de auditoria.
- Qualquer caminho habilitado de NFS-e real, scraping, provider municipal ou certificado.
- Qualquer Quality Gate falho no PR do release candidate.

## Links de Evidencia
- Congelamento de escopo: `docs/product/beta-scope-freeze.md`
- Checklist de readiness: `docs/product/beta-readiness-checklist.md`
- Riscos residuais: `docs/product/beta-residual-risk-matrix.md`
- Evidencia de isolamento por tenant: `docs/security/tenant-isolation-evidence.md`
- Runbook beta: `docs/operations/runbooks/beta-release.md`
- Matriz de ambientes: `docs/operations/environments.md`
- Runbook de release Vercel: `docs/operations/vercel-release.md`
- Setup Supabase: `docs/operations/supabase-setup.md`
- Migrations de banco: `docs/operations/database-migrations.md`
- Evidence log do piloto Sprint 39: `docs/product/beta-pilot-evidence-log.md`
- Runbook de smoke do piloto: `docs/operations/runbooks/beta-pilot-smoke.md`
