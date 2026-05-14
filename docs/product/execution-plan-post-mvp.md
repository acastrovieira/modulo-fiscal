# Plano de Orquestracao e Execucao - Pos-MVP VetFiscal OS

Atualizado em: 2026-05-13

## 1. Objetivo
Este plano continua o VetFiscal OS depois da fundacao MVP fiscal supervisionada concluida nas Sprints 0 a 8.

A meta agora e transformar a fundacao tecnica em produto operavel: release readiness, setup reproduzivel, CI, APIs/telas operacionais completas, seed de demo, observabilidade, seguranca e preparacao controlada para integracoes futuras. A regra central permanece: sem emissao real de NFS-e, sem scraping e sem provider externo ate existir PRD, ADR, homologacao e ambiente seguro para isso.

## 2. Dashboard de Progresso
| Ordem | Sprint | Status | Progresso | Gate principal | Squad recomendado |
| --- | --- | --- | --- | --- | --- |
| 9 | Release readiness e PR tecnico | Concluida | 100% | Branch limpa, PR pronto, docs de setup | Codex + @qa |
| 10 | Setup local, seed e demo data | Nao iniciada | 0% | Projeto sobe do zero com dados demo | Codex + @devops |
| 11 | CI, quality gates e GitHub workflow | Nao iniciada | 0% | CI roda lint/typecheck/test/build | Codex + @devops + @qa |
| 12 | APIs operacionais de importacoes e candidatos | Nao iniciada | 0% | API-first com RBAC/tenant/audit | Codex + @architect |
| 13 | APIs operacionais de inconsistencias e lotes | Nao iniciada | 0% | Workflow fiscal sem provider externo | Codex + Claude + @qa |
| 14 | Telas operacionais completas | Nao iniciada | 0% | UX cockpit, nao CRUD generico | Gemini + Codex |
| 15 | Auditoria, documentos e LGPD operacional | Nao iniciada | 0% | audit.view/documents.download protegidos | Codex + @qa + seguranca/LGPD |
| 16 | Observabilidade, runbooks e beta readiness | Nao iniciada | 0% | Checklist beta aprovado | Codex + @devops + @architect |

## 3. Principios de Execucao
- Toda nova tela deve consumir API Route ou server action fina, nunca Prisma direto.
- Toda API deve resolver usuario e tenant no backend; `tenantId` vindo do client nao e confiavel.
- Toda mutation critica deve validar RBAC e registrar auditoria.
- Toda resposta publica deve usar DTO allowlist, sem entidade ORM crua.
- Todo valor monetario permanece em centavos.
- Todo dado pessoal deve ser mascaravel e minimizado.
- Nenhuma sprint autoriza emissao real de NFS-e.
- Nenhuma sprint autoriza scraping.
- Nenhuma integracao externa entra no core fiscal sem ADR e adapter isolado.

## 4. Roteamento de Agentes e Modelos
| Tipo de tarefa | Agente/modelo recomendado | Motivo |
| --- | --- | --- |
| Arquitetura, boundaries, contratos e refactors | Codex + @architect | Preserva modular monolith, DDD leve e fluxo seguro |
| Regras fiscais, semantica de estados e riscos de NFS-e | Claude + @architect | Revisao de dominio fiscal e ambiguidade operacional |
| UI, layout, cockpit, responsividade e shadcn | Gemini + Codex | Refinamento visual com implementacao integrada |
| Testes, regressao, tenant/RBAC e LGPD | Codex + @qa | Automatizacao e validacao negativa |
| CI, deploy, env, seed e runbooks | Codex + @devops | Reprodutibilidade e operacao segura |
| PRD, backlog, priorizacao e escopo | @pm + @po + Codex | Mantem produto claro e executavel |

## 5. Gates Globais Pos-MVP
Antes de fechar qualquer sprint:
- [ ] `npm run lint` verde.
- [ ] `npm run typecheck` verde.
- [ ] `npm test` verde.
- [ ] `npm run build` verde.
- [ ] `npx prisma validate` verde.
- [ ] Nenhum componente React acessa Prisma.
- [ ] Nenhuma regra fiscal foi implementada em React.
- [ ] Nenhuma rota aceita `tenantId` do client como fonte de verdade.
- [ ] Toda mutation critica valida permissao no backend.
- [ ] Toda mutation critica registra auditoria ou documenta motivo de nao registrar.
- [ ] Nenhum DTO publico retorna dado sensivel completo sem decisao explicita.
- [ ] Nenhuma emissao real de NFS-e foi implementada.
- [ ] Nenhum scraping foi implementado.
- [ ] Nenhum provider externo foi chamado no core fiscal.

## 6. Sprint 9 - Release Readiness e PR Tecnico
Objetivo: preparar o estado atual para revisao, PR e continuidade segura.

Tarefas:
- [ ] Revisar `git status` e garantir working tree limpo.
- [ ] Revisar historico de commits das Sprints 0 a 8.
- [ ] Criar resumo tecnico do MVP entregue.
- [ ] Criar checklist de PR com escopo, gates e riscos.
- [ ] Atualizar README com estado atual do projeto.
- [ ] Documentar comandos de setup local.
- [ ] Documentar variaveis de ambiente obrigatorias e opcionais sem secrets reais.
- [ ] Confirmar remote GitHub e branch atual.
- [ ] Rodar gates globais completos.
- [ ] Preparar push/PR.

Checklist de aceite:
- [ ] PR pode ser aberto sem arquivos temporarios ou lixo.
- [ ] README explica como rodar, testar e validar.
- [ ] Gates completos verdes.
- [ ] Escopo deixa claro que nao ha emissao real de NFS-e.

Agentes/modelos:
- Codex para revisao, docs, gates e git.
- @qa para checklist de PR.

## 7. Sprint 10 - Setup Local, Seed e Demo Data
Objetivo: permitir que qualquer agente/dev rode o projeto localmente com dados demo seguros.

Tarefas:
- [ ] Criar `.env.example` completo e seguro.
- [ ] Criar seed Prisma com tenant demo, usuarios, documentos, importacoes, candidatos, inconsistencias e lotes simulados.
- [ ] Garantir que seed nao contenha CPF/CNPJ real.
- [ ] Criar script `db:seed`.
- [ ] Criar script `db:reset` ou documentar reset local seguro.
- [ ] Atualizar README com setup do banco.
- [ ] Garantir dashboard com dados demo quando DB estiver populado.
- [ ] Criar teste ou smoke script para seed.
- [ ] Confirmar que seed respeita tenant/RBAC/auditoria conceitual.

Checklist de aceite:
- [ ] Dev consegue clonar, instalar, configurar env, migrar/validar e popular demo.
- [ ] Dados demo aparecem no cockpit.
- [ ] Dados demo nao usam informacao pessoal real.
- [ ] `npm test` segue verde depois do seed script.

Agentes/modelos:
- Codex para Prisma/seed/scripts.
- @devops para setup reproduzivel.
- @qa para smoke de dados demo.

## 8. Sprint 11 - CI, Quality Gates e GitHub Workflow
Objetivo: garantir que todo PR rode a regressao minima automaticamente.

Tarefas:
- [ ] Criar GitHub Actions para install, lint, typecheck, test, prisma validate e build.
- [ ] Configurar cache de npm.
- [ ] Garantir `DATABASE_URL` seguro para `prisma validate` em CI.
- [ ] Publicar artifact ou summary de testes quando aplicavel.
- [ ] Documentar politica de branch e PR.
- [ ] Criar badge de CI no README.
- [ ] Validar que CI nao requer secrets reais nesta fase.
- [ ] Rodar CI em PR ou branch remota.

Checklist de aceite:
- [ ] CI passa em branch limpa.
- [ ] Falhas de lint/typecheck/test/build bloqueiam merge.
- [ ] Nenhum secret real fica no workflow.
- [ ] README aponta status do CI.

Agentes/modelos:
- Codex para workflow.
- @devops para revisao de pipeline.
- @qa para criterios de bloqueio.

## 9. Sprint 12 - APIs Operacionais de Importacoes e Candidatos
Objetivo: expor fluxos de importacao e candidatos por APIs seguras, finas e testaveis.

Tarefas:
- [ ] Definir DTOs `ImportListItemDTO`, `ImportDetailDTO`, `CandidateReviewDTO`.
- [ ] Criar `GET /api/imports` com filtros seguros.
- [ ] Criar `GET /api/imports/[id]` com tenant isolation.
- [ ] Criar `POST /api/imports` ou action fina para criar importacao a partir de documento existente.
- [ ] Criar `POST /api/imports/[id]/validate` para validacao estrutural.
- [ ] Criar `GET /api/candidates`.
- [ ] Criar `GET /api/candidates/[id]`.
- [ ] Criar `POST /api/candidates/[id]/ready-for-batch`.
- [ ] Validar inputs com zod no backend.
- [ ] Padronizar erros com envelope existente.
- [ ] Criar testes de API/service para RBAC e tenant.

Checklist de aceite:
- [ ] APIs nao retornam entidade Prisma crua.
- [ ] APIs nao aceitam `tenantId` do client como escopo confiavel.
- [ ] Backend bloqueia roles sem permissao.
- [ ] Nenhum componente React acessa Prisma.
- [ ] Nenhuma regra fiscal entra em React.

Agentes/modelos:
- Codex para implementacao e testes.
- @architect para DTOs e boundaries.
- @qa para cenarios negativos.

## 10. Sprint 13 - APIs Operacionais de Inconsistencias e Lotes
Objetivo: expor o workflow de revisao humana e lotes simulados por APIs seguras.

Tarefas:
- [ ] Definir DTOs `InconsistencyListItemDTO`, `InconsistencyDetailDTO`, `BatchOperationDTO`.
- [ ] Criar `GET /api/inconsistencies`.
- [ ] Criar `POST /api/inconsistencies` para abertura supervisionada.
- [ ] Criar `POST /api/inconsistencies/[id]/resolve`.
- [ ] Criar `POST /api/inconsistencies/[id]/waive`.
- [ ] Criar `GET /api/batches`.
- [ ] Criar `POST /api/batches`.
- [ ] Criar `POST /api/batches/[id]/submit`.
- [ ] Criar `POST /api/batches/[id]/simulate`.
- [ ] Criar `POST /api/batches/[id]/approve-future`.
- [ ] Criar `POST /api/batches/[id]/cancel`.
- [ ] Garantir metadata `externalProviderCalled: false` e `nfseIssued: false`.
- [ ] Criar testes negativos para operador aprovando lote.

Checklist de aceite:
- [ ] Inconsistencia bloqueante impede lote via API.
- [ ] Operador nao aprova lote futuro.
- [ ] Tenant A nao altera inconsistencia/lote do Tenant B.
- [ ] Nenhuma API chama provider externo.
- [ ] Auditoria registra before/after em transicoes criticas.

Agentes/modelos:
- Codex para APIs e testes.
- Claude para semantica fiscal.
- @qa para regressao negativa.

## 11. Sprint 14 - Telas Operacionais Completas
Objetivo: transformar o cockpit em experiencia operacional navegavel, sem CRUD generico.

Tarefas:
- [ ] Criar tela de importacoes com fila, status e acoes permitidas.
- [ ] Criar tela de candidatos fiscais com revisao e estado seguro.
- [ ] Criar tela de inconsistencias com resolucao/dispensa supervisionada.
- [ ] Criar tela de lotes em revisao com simulacao interna e aprovacao futura.
- [ ] Criar componentes de tabela densa e filtros operacionais.
- [ ] Criar estados vazios, loading, erro e refresh por tela.
- [ ] Esconder acoes sem permissao na UI, mantendo bloqueio backend.
- [ ] Mascarar dados sensiveis por padrao.
- [ ] Validar responsividade desktop e viewport menor.
- [ ] Fazer revisao visual com screenshot.

Checklist de aceite:
- [ ] Telas representam workflows, nao CRUD generico.
- [ ] UI chama APIs/actions, nao Prisma.
- [ ] UI nao implementa regra fiscal.
- [ ] Dados sensiveis aparecem mascarados.
- [ ] Fluxos principais sao acionaveis pelo operador fiscal.

Agentes/modelos:
- Gemini para UX e layout.
- Codex para implementacao integrada.
- @qa para regressao visual e permissao.

## 12. Sprint 15 - Auditoria, Documentos e LGPD Operacional
Objetivo: tornar auditoria e documentos utilizaveis com permissoes e minimizacao de dados.

Tarefas:
- [ ] Criar API `GET /api/audit-events` protegida por `audit.view`.
- [ ] Criar filtros por entidade, evento, data e correlationId.
- [ ] Criar tela de trilha de auditoria.
- [ ] Criar API de metadata de documentos protegida por tenant.
- [ ] Preparar fluxo futuro de download protegido por `documents.download`.
- [ ] Registrar evento conceitual de visualizacao/download quando aplicavel.
- [ ] Criar helper de sanitizacao/mascaramento para logs e DTOs.
- [ ] Documentar politica inicial LGPD de minimizacao e retencao.
- [ ] Criar testes de acesso negado para audit/documents.

Checklist de aceite:
- [ ] Apenas roles com `audit.view` acessam eventos.
- [ ] Apenas roles com `documents.download` acessam documento/download.
- [ ] Auditoria nao expõe payload sensivel completo por padrao.
- [ ] DTOs usam allowlist.
- [ ] Logs/erros publicos seguem envelope seguro.

Agentes/modelos:
- Codex para APIs/telas/testes.
- seguranca/LGPD para revisao.
- @qa para tenant e RBAC negativos.

## 13. Sprint 16 - Observabilidade, Runbooks e Beta Readiness
Objetivo: preparar o produto para uso beta controlado e manutencao operacional.

Tarefas:
- [ ] Definir eventos e logs operacionais permitidos.
- [ ] Preparar integracao futura com Sentry sem ativar secrets reais.
- [ ] Criar healthcheck mais informativo sem vazar internals.
- [ ] Criar runbook de falha de importacao.
- [ ] Criar runbook de lote travado.
- [ ] Criar runbook de incidente de tenant isolation.
- [ ] Criar checklist de release beta.
- [ ] Criar matriz de riscos residuais.
- [ ] Revisar performance basica do cockpit e APIs.
- [ ] Rodar regressao completa final.

Checklist de aceite:
- [ ] Existe runbook para incidentes operacionais principais.
- [ ] Existe checklist beta aprovado.
- [ ] Observabilidade nao vaza dado sensivel.
- [ ] Gates globais verdes.
- [ ] Riscos residuais estao documentados.

Agentes/modelos:
- Codex para docs/scripts/checks.
- @devops para observabilidade e runbooks.
- @architect para riscos residuais.

## 14. Riscos Pos-MVP
| Risco | Severidade | Mitigacao |
| --- | --- | --- |
| API crescer como CRUD generico | Alta | DTOs por caso de uso e workflow-driven UI |
| UI voltar a carregar regra fiscal | Alta | Tests/rg guardrails e review por @architect |
| Tenant isolation inconsistente em APIs novas | Critica | Helper de contexto unico e testes negativos por rota |
| Auditoria parcial | Critica | Checklist de eventos por mutation e testes de audit |
| Dados sensiveis em DTO/log | Alta | Allowlist, mascaramento e testes de hardening |
| CI depender de secret real | Media | Workflow com env fake apenas para validate/build |
| Seed conter dado real | Alta | Dados ficticios e teste de fixture sensivel |
| Aprovacao futura ser confundida com emissao | Critica | Nomes, guardrails e ausencia fisica de provider |

## 15. Ordem Recomendada de Execucao
1. Executar Sprint 9 para deixar PR e docs tecnicos prontos.
2. Executar Sprint 10 para setup reproduzivel e dados demo.
3. Executar Sprint 11 para CI antes de ampliar APIs.
4. Executar Sprints 12 e 13 para contratos backend.
5. Executar Sprint 14 para telas operacionais completas.
6. Executar Sprint 15 para auditoria/documentos/LGPD operacional.
7. Executar Sprint 16 para beta readiness.

## 16. Definition of Done Pos-MVP
- [ ] PR tecnico aberto ou mergeado com CI verde.
- [ ] Setup local reproduzivel documentado.
- [ ] Seed demo seguro disponivel.
- [ ] APIs operacionais cobrem imports, candidatos, inconsistencias e lotes.
- [ ] Telas operacionais usam workflow e nao CRUD generico.
- [ ] Auditoria e documentos possuem acesso protegido.
- [ ] LGPD basica documentada e testada.
- [ ] Runbooks e checklist beta existem.
- [ ] Nenhuma emissao real, scraping ou provider externo foi introduzido.
