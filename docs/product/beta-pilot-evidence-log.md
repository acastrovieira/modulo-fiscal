# Log de Evidencias do Piloto Beta Controlado - Sprint 39

## Status
Documentacao de readiness do piloto preparada.

Decisao atual: NO-GO para uso beta real ate owners, tenants aprovados, deploy staging/beta e smoke manual com dois tenants estarem completos.

## Evidencias Confirmadas
| Evidencia | Status | Detalhes |
| --- | --- | --- |
| PR da Sprint 38 | Mergeado | PR #24 mergeado em 2026-05-19. |
| Merge commit da Sprint 38 | Capturado | `5c14c9eef1cec88c70d07520afd1ff7928193728`. |
| Quality Gates da Sprint 38 | Aprovado | `https://github.com/acastrovieira/modulo-fiscal/actions/runs/26103778717/job/76761820308` |
| Pacote de evidencias do release candidate | Presente | `docs/product/beta-release-candidate-evidence-pack.md` |
| Plano de readiness do piloto | Presente | `docs/product/beta-pilot-readiness-plan.md` |
| Runbook beta | Presente | `docs/operations/runbooks/beta-release.md` |
| Lint local da Sprint 39 | Aprovado | `npm run lint` passou em 2026-05-19. |
| Typecheck local da Sprint 39 | Aprovado | `npm run typecheck` passou em 2026-05-19. |
| Testes locais da Sprint 39 | Aprovado | `npm test` passou em 2026-05-19 com 305 testes. |
| Scanner de secrets da Sprint 39 | Aprovado | `npm run security:secrets` nao encontrou potenciais secrets. |
| Prisma validate da Sprint 39 | Aprovado | `npx prisma validate` passou com `DATABASE_URL` local/demo. |
| Build de producao tecnica da Sprint 39 | Aprovado | `npm run build` passou em 2026-05-19. |
| Template de setup Sprint 41 | Presente | `docs/product/beta-users-roles-tenant-setup.md` |
| Template de smoke Sprint 42 | Presente | `docs/product/two-tenant-smoke-evidence.md` |
| Hardening UX Sprint 43 | Presente | `docs/stories/sprint-43-ux-test-feedback-hardening.md` |
| Pacote go/no-go Sprint 44 | Presente | `docs/product/pilot-go-no-go-pack.md` registra decisao atual como NO-GO. |
| Runbook piloto controlado Sprint 45 | Presente | `docs/operations/runbooks/controlled-pilot-run.md` prepara execucao apos GO. |
| Plano de estabilizacao Sprint 46 | Presente | `docs/product/pilot-findings-stabilization-plan.md` prepara triagem pos-piloto. |
| PRD/ADR de homologacao Sprint 47 | Presente | `docs/product/prd-real-nfse-homologation.md` e ADR 0011 planejam trabalho futuro sem implementar emissao real. |
| Preparacao Supabase staging Sprint 52 | Presente | `docs/operations/supabase-staging-beta.md` documenta envs, migrations, redirects e service role fora do repo. |
| Supabase Auth smoke Sprint 53 | Presente | `docs/operations/runbooks/supabase-auth-smoke.md` e `docs/product/supabase-auth-smoke-evidence.md` preparam smoke seguro com dois tenants. |

## Evidencias Pendentes Antes de Piloto Real
| Evidencia | Responsavel exigido | Status |
| --- | --- | --- |
| PO nomeado | @pm/@po | Pendente |
| Responsavel de engenharia nomeado | Engenharia | Pendente |
| Responsavel de suporte nomeado | Suporte | Pendente |
| Tenants beta aprovados | @pm/@po | Pendente |
| Usuarios beta e roles aprovados | @pm/@po + Seguranca/LGPD | Pendente |
| URL de deploy staging/beta | @devops | Pendente |
| Redirects do Supabase staging/beta verificados | @devops | Pendente |
| Migrations aplicadas no staging/beta | @devops | Pendente |
| Smoke Supabase Auth com usuarios aprovados | @qa + @devops | Pendente |
| Bloqueio de usuario sem membership em staging/beta | @qa | Pendente |
| Bloqueio cross-tenant por URL direta em staging/beta | @qa + Seguranca/LGPD | Pendente |
| Evidencia de smoke manual com dois tenants | @qa | Pendente |
| Screenshots seguros sem dados pessoais | @qa | Pendente |
| Decisao go/no-go final | @pm/@po | Pendente |
| Janela de piloto e responsavel por rollback | @pm/@po + @devops | Pendente |
| Relatorio de encerramento do piloto controlado | @pm/@po + @qa | Pendente |
| Achados do piloto classificados | @qa + Produto | Pendente |
| Release candidate pos-piloto | Engenharia + @qa | Pendente |
| Aprovacao do PRD de homologacao fiscal | Produto + Engenharia + Fiscal + Seguranca/LGPD | Pendente |

## Template de Evidencia de Smoke Manual
Use este template quando o ambiente staging/beta estiver disponivel.

| Etapa | Resultado Esperado | Resultado | Link de Evidencia |
| --- | --- | --- | --- |
| Entrar como usuario aprovado | Sessao autenticada sem erro cru | Pendente | Pendente |
| Conferir badge de tenant ativo | Tenant e ambiente corretos | Pendente | Pendente |
| Abrir dashboard | Cockpit operacional renderiza | Pendente | Pendente |
| Abrir importacoes | Apenas dados do tenant ativo | Pendente | Pendente |
| Abrir candidatos | Campos sensiveis mascarados | Pendente | Pendente |
| Abrir inconsistencias | Acoes de workflow respeitam role | Pendente | Pendente |
| Abrir lotes | Nenhuma acao de emissao oficial | Pendente | Pendente |
| Abrir auditoria | Auditoria redigida e tenant-scoped | Pendente | Pendente |
| Trocar para segundo tenant | Contexto de tenant muda com seguranca | Pendente | Pendente |
| Tentar URL direta cross-tenant | Request bloqueado sem enumeracao | Pendente | Pendente |

## Condicoes de NO-GO
- Qualquer Quality Gate falho.
- Qualquer P0/P1 de isolamento por tenant, auditoria, redacao ou exposicao de secrets.
- Qualquer tenant ou usuario real nao aprovado.
- Qualquer documento pessoal, token, storage path ou payload de provider sem redacao em evidencia publica.
- Qualquer caminho habilitado para emissao oficial de NFS-e, scraping, chamadas a provider municipal, certificados ou jobs fiscais.

## Nota de Decisao Sprint 44/45
As Sprints 44 e 45 estao tecnicamente e operacionalmente preparadas no repositorio. A execucao real do piloto continua bloqueada ate owners externos, URL de staging/beta, evidencia de smoke com dois tenants, usuarios aprovados e tenants aprovados serem registrados no cadastro privado do piloto e resumidos aqui sem secrets ou documentos pessoais.

## Nota de Decisao Sprint 46/47
As Sprints 46 e 47 estao apenas prontas para planejamento. A estabilizacao exige achados reais do piloto, e a homologacao fiscal exige aprovacao explicita do PRD, ADR especifica de provider, politica de certificado, evidencia de sandbox e revisao de especialista fiscal antes de qualquer implementacao.
