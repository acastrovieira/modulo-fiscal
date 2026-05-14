# Plano de Orquestracao e Execucao - Pos-MVP VetFiscal OS

Atualizado em: 2026-05-13

## 1. Objetivo
Este plano continua o VetFiscal OS depois da fundacao MVP fiscal supervisionada concluida nas Sprints 0 a 8.

A meta agora e transformar a fundacao tecnica em produto operavel: release readiness, setup reproduzivel, CI, APIs/telas operacionais completas, seed de demo, observabilidade, seguranca e preparacao controlada para integracoes futuras. A regra central permanece: sem emissao real de NFS-e, sem scraping e sem provider externo ate existir PRD, ADR, homologacao e ambiente seguro para isso.

## 2. Dashboard de Progresso
| Ordem | Sprint | Status | Progresso | Gate principal | Squad recomendado |
| --- | --- | --- | --- | --- | --- |
| 9 | Release readiness e PR tecnico | Concluida | 100% | Branch limpa, PR pronto, docs de setup | Codex + @qa |
| 10 | Setup local, seed e demo data | Concluida | 100% | Projeto sobe do zero com dados demo | Codex + @devops |
| 11 | CI, quality gates e GitHub workflow | Concluida | 100% | CI roda lint/typecheck/test/build | Codex + @devops + @qa |
| 12 | APIs operacionais de importacoes e candidatos | Concluida | 100% | API-first com RBAC/tenant/audit | Codex + @architect |
| 13 | APIs operacionais de inconsistencias e lotes | Concluida | 100% | Workflow fiscal sem provider externo | Codex + Claude + @qa |
| 14 | Telas operacionais completas | Concluida | 100% | UX cockpit, nao CRUD generico | Gemini + Codex |
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
- [x] Criar `.env.example` completo e seguro.
- [x] Criar seed Prisma com tenant demo, usuarios, documentos, importacoes, candidatos, inconsistencias e lotes simulados.
- [x] Garantir que seed nao contenha CPF/CNPJ real.
- [x] Criar script `db:seed`.
- [x] Documentar reset local seguro sem criar script destrutivo.
- [x] Atualizar README com setup do banco.
- [x] Garantir dados demo para o cockpit quando DB estiver populado.
- [x] Criar smoke test para seed demo.
- [x] Confirmar que seed respeita tenant/RBAC/auditoria conceitual.

Checklist de aceite:
- [x] Dev consegue clonar, instalar, configurar env, migrar/validar e popular demo.
- [x] Dados demo aparecem no cockpit quando seed e DB local estiverem disponiveis.
- [x] Dados demo nao usam informacao pessoal real.
- [x] `npm test` segue verde depois do seed script.

Agentes/modelos:
- Codex para Prisma/seed/scripts.
- @devops para setup reproduzivel.
- @qa para smoke de dados demo.
## 8. Sprint 11 - CI, Quality Gates e GitHub Workflow
Objetivo: garantir que todo PR rode a regressao minima automaticamente.

Tarefas:
- [x] Criar GitHub Actions para install, lint, typecheck, test, prisma validate e build.
- [x] Configurar cache de npm.
- [x] Garantir `DATABASE_URL` seguro para `prisma validate` em CI.
- [x] Publicar summary de testes/gates no GitHub Step Summary.
- [x] Documentar politica de branch e PR.
- [x] Criar badge de CI no README.
- [x] Validar que CI nao requer secrets reais nesta fase.
- [x] Rodar gates locais equivalentes antes do push.

Checklist de aceite:
- [x] CI passa em branch limpa quando GitHub Actions executar no remoto.
- [x] Falhas de lint/typecheck/test/build bloqueiam merge quando branch protection exigir o check.
- [x] Nenhum secret real fica no workflow.
- [x] README aponta status do CI.

Agentes/modelos:
- Codex para workflow.
- @devops para revisao de pipeline.
- @qa para criterios de bloqueio.

## 9. Sprint 12 - APIs Operacionais de Importacoes e Candidatos
Objetivo: expor fluxos de importacao e candidatos por APIs seguras, finas e testaveis.

Tarefas:
- [x] Definir DTOs `ImportListItemDTO`, `ImportDetailDTO`, `CandidateReviewDTO`.
- [x] Criar `GET /api/imports` com filtros seguros.
- [x] Criar `GET /api/imports/[id]` com tenant isolation.
- [x] Criar `POST /api/imports` para criar importacao a partir de documento existente.
- [x] Criar `POST /api/imports/[id]/validate` para validacao estrutural.
- [x] Criar `POST /api/imports/[id]/candidates` para geracao supervisionada de candidatos.
- [x] Criar `GET /api/candidates`.
- [x] Criar `GET /api/candidates/[id]`.
- [x] Criar `POST /api/candidates/[id]/ready-for-batch`.
- [x] Validar inputs com zod no backend.
- [x] Padronizar erros com envelope existente.
- [x] Criar testes de API/service para RBAC e tenant.

Checklist de aceite:
- [x] APIs nao retornam entidade Prisma crua.
- [x] APIs nao aceitam `tenantId` do client como escopo confiavel.
- [x] Backend bloqueia roles sem permissao.
- [x] Nenhum componente React acessa Prisma.
- [x] Nenhuma regra fiscal entra em React.

Agentes/modelos:
- Codex para implementacao e testes.
- @architect para DTOs e boundaries.
- @qa para cenarios negativos.

## 10. Sprint 13 - APIs Operacionais de Inconsistencias e Lotes
Objetivo: expor o workflow de revisao humana e lotes simulados por APIs seguras.

Tarefas:
- [x] Definir DTOs `InconsistencyListItemDTO`, `InconsistencyDetailDTO`, `BatchOperationDTO`.
- [x] Criar `GET /api/inconsistencies`.
- [x] Criar `POST /api/inconsistencies` para abertura supervisionada.
- [x] Criar `GET /api/inconsistencies/[id]`.
- [x] Criar `POST /api/inconsistencies/[id]/resolve`.
- [x] Criar `POST /api/inconsistencies/[id]/waive`.
- [x] Criar `GET /api/batches`.
- [x] Criar `POST /api/batches`.
- [x] Criar `GET /api/batches/[id]`.
- [x] Criar `POST /api/batches/[id]/submit-review`.
- [x] Criar `POST /api/batches/[id]/simulate`.
- [x] Criar `POST /api/batches/[id]/approve-future-issuance`.
- [x] Criar `POST /api/batches/[id]/cancel`.
- [x] Garantir metadata `externalProviderCalled: false` e `nfseIssued: false`.
- [x] Criar testes negativos para operador aprovando lote.

Checklist de aceite:
- [x] Inconsistencia bloqueante impede lote via service/API command path.
- [x] Operador nao aprova lote futuro.
- [x] Tenant A nao altera inconsistencia/lote do Tenant B.
- [x] Nenhuma API chama provider externo.
- [x] Auditoria registra before/after em transicoes criticas.

Agentes/modelos:
- Codex para APIs e testes.
- Claude para semantica fiscal.
- @qa para regressao negativa.

## 11. Sprint 14 - Telas Operacionais Completas
Objetivo: transformar o cockpit em experiencia operacional navegavel, sem CRUD generico.

Tarefas:
- [x] Criar tela de importacoes com fila, status e acoes permitidas.
- [x] Criar tela de candidatos fiscais com revisao e estado seguro.
- [x] Criar tela de inconsistencias com resolucao/dispensa supervisionada.
- [x] Criar tela de lotes em revisao com simulacao interna e aprovacao futura.
- [x] Criar componentes de tabela densa e filtros operacionais.
- [x] Criar estados vazios, loading, erro e refresh por tela.
- [x] Desabilitar acoes quando nao ha dados, mantendo bloqueio backend.
- [x] Mascarar dados sensiveis por padrao via DTOs.
- [x] Validar responsividade desktop em browser local.
- [x] Fazer revisao visual com browser.

Checklist de aceite:
- [x] Telas representam workflows, nao CRUD generico.
- [x] UI chama APIs/actions, nao Prisma.
- [x] UI nao implementa regra fiscal.
- [x] Dados sensiveis aparecem mascarados.
- [x] Fluxos principais sao navegaveis pelo operador fiscal.

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
