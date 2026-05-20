# Plano de Orquestracao e Execucao - Pos-MVP VetFiscal OS

Atualizado em: 2026-05-18

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
| 15 | Auditoria, documentos e LGPD operacional | Concluida | 100% | audit.view/documents.download protegidos | Codex + @qa + seguranca/LGPD |
| 16 | Observabilidade, runbooks e beta readiness | Concluida | 100% | Checklist beta aprovado | Codex + @devops + @architect |
| 17 | Supabase Auth, tenant real e sessao segura | Concluida | 100% | currentSession com membership real | Codex + @architect + seguranca/LGPD + @qa |
| 18 | Tenant Admin, convites e memberships | Concluida | 100% | Tenant switch, convites supervisionados e gestao de membros | Codex + @architect + seguranca/LGPD + @qa |
| 19 | Invite lifecycle e aceite seguro | Concluida | 100% | Accept/revoke/resend com token hash e auditoria | Codex + @architect + seguranca/LGPD + @qa |
| 20 | Onboarding e tenant bootstrap | Concluida | 100% | Primeiro tenant/OWNER com idempotencia | Codex + @architect + seguranca/LGPD + @qa |
| 21 | Security, tenant e LGPD hardening | Concluida | 100% | Secret scanner, cookie clear seguro e inventario LGPD | Codex + seguranca/LGPD + @qa |
| 22 | Simulador fiscal governado v1 | Concluida | 100% | Perfil, tomadores e documentos simulados sem provider | Codex + @architect + fiscal/LGPD + @qa |
| 23 | Hardening de contratos do simulador | Concluida | 100% | DTO allowlist, auditoria padronizada e linguagem segura | Codex + @architect + @qa |
| 24 | Cenarios fiscais versionados | Concluida | 100% | Scenario set versionado, API de avaliacao e audit trail | Codex + @architect + fiscal/produto + @qa |
| 25 | Observabilidade e governanca fiscal | Concluida | 100% | Relatorio audit-based, flags proibidas e endpoint governado | Codex + observabilidade + @qa |
| 26 | UX operacional fiscal | Concluida | 100% | Cockpit fiscal para simulador, cenarios e governanca | Codex + frontend/UX + @qa |
| 27 | Importacoes avancadas e contratos versionados | Concluida | 100% | Parser versionado, fingerprints e bloqueios LGPD | Codex + @architect + seguranca/LGPD + @qa |
| 28 | Guardrails de revisao de candidatos | Concluida | 100% | Review gate auditavel antes de lotes | Codex + @architect + seguranca/LGPD + @qa |
| 29 | Beta scope freeze | Concluida | 100% | PR #15 mergeado e escopo beta congelado | Codex + @pm + @po |
| 30 | Command idempotency e transition ledger | Concluida | 100% | Comandos criticos idempotentes/auditaveis | Codex + @architect |
| 31 | RBAC matrix e flow permissions | Concluida | 100% | Matriz papel/acao/estado validada | Codex + @architect + @qa |
| 32 | Audit completeness e redaction | Concluida | 100% | Acoes criticas com auditoria segura | Codex + seguranca/LGPD + @qa |
| 33 | Import replay, quarantine e parser governance | Concluida | 100% | Reprocessamento seguro de imports | Codex + @architect + @qa |
| 34 | Candidate review workbench hardening | Concluida | 100% | Revisao humana robusta e rastreavel | Codex + Gemini + @qa |
| 35 | Batch snapshot e concurrency guards | Concluida | 100% | Lotes com snapshot, lock e revalidacao | Codex + @architect + @qa |
| 36 | Tenant isolation e abuse testing | Concluida | 100% | Zero vazamento cross-tenant | Codex + seguranca/LGPD + @qa |
| 37 | Environments, Supabase e Vercel release prep | Concluida | 100% | Staging/beta com envs e deploy controlados | Codex + @devops |
| 38 | Beta release candidate e evidence pack | Concluida | 100% | Go/no-go beta com evidencias | Codex + @pm + @qa + @devops |
| 39 | Controlled beta pilot readiness | Concluida tecnica | 70% | Piloto controlado com donos, smoke e go/no-go | Codex + @pm + @po + @qa + @devops |
| 40 | Staging/Beta environment activation | Proxima | 0% | Ambiente staging/beta acessivel e seguro | Codex + @devops + seguranca/LGPD |
| 41 | Beta users, roles e tenant setup | Planejada | 0% | Usuarios aprovados com least privilege | Codex + @qa + seguranca/LGPD |
| 42 | Two-tenant smoke test | Planejada | 0% | Jornada completa com isolamento validado | @qa + Codex + seguranca/LGPD |
| 43 | UX/test feedback hardening | Planejada | 0% | Zero P0/P1 e UX beta utilizavel | Gemini + Codex + @qa |
| 44 | Pilot go/no-go pack | Planejada | 0% | Decisao formal com evidencias | @pm + @po + @qa + @devops + Codex |
| 45 | Controlled pilot run | Planejada | 0% | Piloto com 1-3 tenants sem incidente critico | @pm/@po + @qa + Codex + @devops |
| 46 | Pilot findings e stabilization | Planejada | 0% | Achados corrigidos ou priorizados | Codex + @qa + Gemini |
| 47 | PRD fiscal real / homologacao | Futuro | 0% | PRD/ADR antes de qualquer emissao real | @pm + @po + @architect + fiscal + Codex |

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
- [x] Criar API `GET /api/audit-events` protegida por `audit.view`.
- [x] Criar filtros por entidade, evento, data e correlationId.
- [x] Criar tela de trilha de auditoria.
- [x] Criar API de metadata de documentos protegida por tenant.
- [x] Preparar fluxo futuro de download protegido por `documents.download`.
- [x] Registrar evento conceitual de visualizacao/download quando aplicavel.
- [x] Criar helper de sanitizacao/mascaramento para logs e DTOs.
- [x] Documentar politica inicial LGPD de minimizacao e retencao.
- [x] Criar testes de acesso negado para audit/documents.

Checklist de aceite:
- [x] Apenas roles com `audit.view` acessam eventos.
- [x] Apenas roles com `documents.download` acessam documento/download.
- [x] Auditoria nao expÃƒÆ’Ã‚Âµe payload sensivel completo por padrao.
- [x] DTOs usam allowlist.
- [x] Logs/erros publicos seguem envelope seguro.

Agentes/modelos:
- Codex para APIs/telas/testes.
- seguranca/LGPD para revisao.
- @qa para tenant e RBAC negativos.

## 13. Sprint 16 - Observabilidade, Runbooks e Beta Readiness
Objetivo: preparar o produto para uso beta controlado e manutencao operacional.

Tarefas:
- [x] Definir eventos e logs operacionais permitidos.
- [x] Preparar integracao futura com Sentry sem ativar secrets reais.
- [x] Criar healthcheck mais informativo sem vazar internals.
- [x] Criar runbook de falha de importacao.
- [x] Criar runbook de lote travado.
- [x] Criar runbook de incidente de tenant isolation.
- [x] Criar checklist de release beta.
- [x] Criar matriz de riscos residuais.
- [x] Revisar performance basica do cockpit e APIs.
- [x] Rodar regressao completa final.

Checklist de aceite:
- [x] Existe runbook para incidentes operacionais principais.
- [x] Existe checklist beta aprovado.
- [x] Observabilidade nao vaza dado sensivel.
- [x] Gates globais verdes.
- [x] Riscos residuais estao documentados.

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


## 17. Sprint 17 - Supabase Auth, Tenant Real e Sessao Segura
Objetivo: preparar autenticacao server-side com Supabase Auth e resolver tenant/role reais por `Profile` e `TenantMembership`, mantendo fallback local apenas em `Local`/`test`.

Tarefas:
- [x] Criar branch `codex/sprint-17-supabase-auth-tenant`.
- [x] Criar adapter Supabase server-side com `auth.getUser()`.
- [x] Criar middleware para refresh de cookies Supabase.
- [x] Criar `currentSession()` atomico e cacheado.
- [x] Resolver `Profile ACTIVE` pelo id do usuario autenticado.
- [x] Resolver `TenantMembership ACTIVE` e `Tenant ACTIVE`.
- [x] Validar cookie de tenant ativo como UUID.
- [x] Limitar fallback local a `Local`/`test`.
- [x] Atualizar `CommandContext` para usar sessao unica.
- [x] Criar testes negativos de profile, membership, tenant e fallback.

Checklist de aceite:
- [x] Role efetiva vem da membership ativa.
- [x] Usuario sem Supabase configurado fora de Local/test recebe erro previsivel.
- [x] Cookie de tenant invalido nao chega ao repository.
- [x] Dados de sessao nao vazam em erro publico.

## 18. Sprint 18 - Tenant Admin, Convites e Gestao de Memberships
Objetivo: criar a camada administrativa segura para gerir usuarios por tenant, convites e troca de tenant ativo.

Tarefas planejadas:
- [x] Criar endpoint server-side para trocar tenant ativo e setar cookie seguro.
- [x] Criar login/logout UI e callback Supabase.
- [x] Criar casos de uso de convite sem CRUD generico.
- [x] Criar tela de membros do tenant orientada a workflow.
- [x] Testar roles, convites seguros, membership suspensa e bloqueios de tenant/membership.

## 19. Sprint 19 - Invite Lifecycle e Aceite Seguro
Objetivo: completar o ciclo de vida dos convites sem envio real de e-mail, sem service role e sem CRUD generico.

Tarefas concluidas:
- [x] Criar aceite autenticado de convite por token no body, sem depender de tenant ativo.
- [x] Validar e-mail autenticado contra e-mail do convite normalizado.
- [x] Reenviar/regenerar convite com novo hash e nova expiracao.
- [x] Revogar convite pendente de forma auditavel.
- [x] Listar convites do tenant com e-mail mascarado e DTO allowlist.
- [x] Marcar convite expirado de forma lazy no aceite.
- [x] Ajustar indice para permitir historico e manter apenas um convite PENDING por tenant/e-mail.
- [x] Testar token hash, e-mail divergente, membership suspensa, expiracao, revogacao e reenvio.

## 20. Sprint 20 - Onboarding e Tenant Bootstrap
Objetivo: permitir que um usuario autenticado sem tenant crie o primeiro tenant operacional e uma membership OWNER de forma segura, auditavel e idempotente.

Tarefas concluidas:
- [x] Criar endpoint `GET /api/onboarding/status` fora da dependencia de tenant ativo.
- [x] Criar endpoint `POST /api/onboarding/tenant` para bootstrap transacional.
- [x] Criar tabela `tenant_bootstrap_requests` com idempotencia por usuario e chave.
- [x] Criar primeiro `Tenant`, `Profile` e `TenantMembership OWNER` em transacao.
- [x] Setar cookie de tenant ativo depois do bootstrap.
- [x] Redirecionar login para `/onboarding` quando nao houver membership ativa.
- [x] Registrar auditoria com CNPJ mascarado.
- [x] Bloquear usuario desativado, usuario ja membro e CNPJ duplicado sem enumeracao.
- [x] Criar tela operacional de onboarding sem CRUD generico.
- [x] Testar idempotencia, auditoria mascarada, bloqueios e status de onboarding.

Checklist de aceite:
- [x] Usuario autenticado sem tenant nao cai em erro cru de sessao.
- [x] Bootstrap cria tenant e OWNER uma unica vez por idempotency key.
- [x] Nenhum dado sensivel completo e exposto em auditoria publica.
- [x] Nenhuma service role, emissao fiscal, provider externo ou seed real entra no fluxo.

## 21. Sprint 21 - Security, Tenant e LGPD Hardening
Objetivo: reduzir risco operacional apos onboarding, reforcando guardrails de secrets, sessao/cookies, tenant isolation e inventario LGPD antes de ampliar o dominio fiscal.

Tarefas concluidas:
- [x] Criar scanner local `npm run security:secrets` sem dependencia nova.
- [x] Adicionar scanner aos Quality Gates do GitHub.
- [x] Expandir `.gitignore` para chaves privadas, service accounts, credentials e arquivos de comando com secrets.
- [x] Limpar cookie de tenant ativo no logout com as mesmas flags endurecidas do cookie original.
- [x] Criar testes para scanner, CI, `.gitignore` e cookie clear.
- [x] Criar inventario LGPD inicial por categoria de dado, finalidade, exposicao e retencao.
- [x] Documentar que arquivos locais com segredo fora do repositorio exigem rotacao no provedor.

Checklist de aceite:
- [x] `security:secrets` falha se encontrar chave privada, service account ou service role preenchida.
- [x] CI executa o scanner antes dos demais gates.
- [x] Logout remove tenant ativo sem reduzir flags de seguranca.
- [x] Nenhuma emissao real, scraping, provider externo, certificado ou service role foi introduzida.

## 22. Definition of Done Pos-MVP
- [ ] PR tecnico aberto ou mergeado com CI verde.
- [ ] Setup local reproduzivel documentado.
- [ ] Seed demo seguro disponivel.
- [ ] APIs operacionais cobrem imports, candidatos, inconsistencias e lotes.
- [ ] Telas operacionais usam workflow e nao CRUD generico.
- [ ] Auditoria e documentos possuem acesso protegido.
- [ ] LGPD basica documentada e testada.
- [x] Runbooks e checklist beta existem.
- [ ] Nenhuma emissao real, scraping ou provider externo foi introduzido.

## 23. Sprint 22 - Simulador Fiscal Governado v1
Objetivo: criar o primeiro nucleo fiscal interno simulavel, governado por tenant, RBAC, auditoria e idempotencia, sem emissao real de NFS-e, scraping ou provider externo.

Tarefas concluidas:
- [x] Modelar perfil fiscal simulado por tenant.
- [x] Modelar tomadores com documento mascarado e hash por tenant.
- [x] Modelar documentos fiscais simulados com `simulationId`, `fiscalValue=false` e `externalTransmission=false`.
- [x] Criar idempotencia por tenant, operacao e chave.
- [x] Criar service de aplicacao com state machine `DRAFT -> VALIDATED -> SIMULATED_ISSUED` e `VOIDED`.
- [x] Criar APIs backend-first para profile, takers, documents e transicoes.
- [x] Criar permissioes RBAC especificas do simulador fiscal.
- [x] Criar testes de perfil, tomador, documento, idempotencia, transicoes, RBAC e tenant isolation.

Checklist de aceite:
- [x] Nenhum fluxo chama provider externo.
- [x] Nenhum fluxo implementa emissao real de NFS-e.
- [x] Dados do tomador nao sao gravados em auditoria como documento bruto.
- [x] Documento simulado sempre carrega disclaimer e flags de simulacao.
- [x] Mutacoes criticas passam por service de aplicacao, nao por React.

## 24. Sprint 23 - Hardening de Contratos do Simulador
Objetivo: consolidar os contratos publicos do simulador fiscal antes de criar motor de cenarios, versionamento ou UI operacional.

Tarefas concluidas:
- [x] Documentar contratos do simulador fiscal em `docs/architecture/fiscal-simulation-contracts.md`.
- [x] Criar testes de DTO allowlist para tomadores e documentos simulados.
- [x] Garantir que DTOs nao exponham `tenantId`, documento bruto ou hash.
- [x] Bloquear linguagem fiscal oficial proibida em DTOs do simulador.
- [x] Garantir que payloads de request rejeitam `tenantId` controlado pelo client.
- [x] Padronizar auditoria com flags de simulacao e ausencia de provider externo.

Checklist de aceite:
- [x] Simulador segue API-first e sem Prisma em React.
- [x] Contratos deixam claro que nao ha valor fiscal.
- [x] Tenant isolation, RBAC, LGPD, auditoria e idempotencia viram gates de release.
- [x] Nenhuma emissao real, scraping, provider externo ou certificado foi introduzido.

## 25. Sprint 24 - Cenarios Fiscais Versionados
Objetivo: criar o primeiro motor versionado de cenarios fiscais simulados, com avaliacao deterministica e auditavel sobre documentos simulados.

Tarefas concluidas:
- [x] Criar scenario set `vetcare-simulation-baseline@2026.05`.
- [x] Implementar avaliador de dominio puro para cenarios simulados.
- [x] Criar findings para guardrail de simulacao, itens ausentes, documento desconhecido, codigo divergente e valor alto.
- [x] Criar service de aplicacao com tenant scope, RBAC e auditoria.
- [x] Criar API `POST /api/fiscal/simulation/documents/[id]/scenario-evaluation`.
- [x] Criar DTO allowlist com disclaimer e flags de simulacao.
- [x] Documentar contratos em `docs/architecture/fiscal-simulation-scenarios.md`.

Checklist de aceite:
- [x] Nenhuma avaliacao aceita `tenantId` do cliente.
- [x] Nenhuma resposta publica expoe hash, documento bruto ou `tenantId`.
- [x] Auditoria registra scenario set, versao e flags de simulacao.
- [x] Resultado e deterministico para mesmo documento, perfil e tomador.
- [x] Nenhuma emissao real, scraping, provider externo ou certificado foi introduzido.

## 26. Sprint 25 - Observabilidade e Governanca Fiscal
Objetivo: criar a primeira visao governada de observabilidade fiscal para monitorar o simulador com base em auditoria tenant-scoped.

Tarefas concluidas:
- [x] Criar relatorio de governanca fiscal baseado em eventos `fiscal_simulation.*`.
- [x] Criar endpoint `GET /api/observability/fiscal-governance`.
- [x] Exigir permissao `audit.view` no backend.
- [x] Detectar flags proibidas de emissao, provider externo, transmissao externa e valor fiscal.
- [x] Expor metricas de documentos simulados, avaliacoes de cenarios e status de findings.
- [x] Garantir DTO sem `tenantId`, payload bruto, documento completo ou hash.
- [x] Documentar contratos em `docs/architecture/fiscal-governance-observability.md`.

Checklist de aceite:
- [x] Relatorio e sempre tenant-scoped pelo contexto autenticado.
- [x] Falta de eventos gera `attention`, nao vazamento ou erro bruto.
- [x] Qualquer flag proibida gera `blocked`.
- [x] Nenhuma integracao Sentry runtime, provider externo, scraping ou emissao real foi introduzida.

## 27. Sprint 26 - UX Operacional Fiscal
Objetivo: criar uma tela operacional fiscal para visualizar simulador, cenarios versionados e governanca sem criar CRUD generico.

Tarefas concluidas:
- [x] Criar rota `/dashboard/fiscal`.
- [x] Adicionar item Fiscal na sidebar.
- [x] Criar `FiscalOperationsCockpit` consumindo governanca fiscal.
- [x] Criar view model testavel para status, cards e guardrails.
- [x] Exibir jornada supervisionada do simulador.
- [x] Exibir fila de governanca com eventos recentes.
- [x] Testar wiring da rota, sidebar, endpoint e linguagem segura.

Checklist de aceite:
- [x] Nenhuma logica fiscal foi colocada diretamente em componente React.
- [x] Tela consome API/backend, nao Prisma direto.
- [x] UX reforca simulacao, ausencia de emissao real e tenant scope.
- [x] Nenhum CRUD generico, provider externo, scraping ou certificado foi introduzido.

## 28. Sprint 27 - Importacoes Avancadas e Contratos Versionados
Objetivo: preparar importacoes estruturadas para evolucao segura com parser versionado, normalizacao allowlist, fingerprints e bloqueios LGPD, sem implementar integracao externa.

Tarefas concluidas:
- [x] Criar parser versionado `vetcare_structured_v1`.
- [x] Normalizar aliases operacionais de linhas estruturadas.
- [x] Rejeitar campos proibidos como `tenantId`, paths internos, hashes, tokens e documentos brutos.
- [x] Detectar duplicidades dentro da importacao com fingerprint SHA-256 deterministico.
- [x] Expor `parserVersion` no contrato de validacao de importacao.
- [x] Registrar auditoria com versao do parser, totais e duplicidades sem payload sensivel.
- [x] Documentar contratos em `docs/architecture/import-parser-contracts.md`.
- [x] Criar testes de parser, schema, auditoria segura e cenarios negativos.

Checklist de aceite:
- [x] Parser desconhecido falha antes de alterar estado da importacao.
- [x] Nenhuma resposta ou auditoria publica expoe CPF/CNPJ bruto.
- [x] Duplicidade e rastreavel, mas permanece human-in-the-loop.
- [x] Nenhum provider externo, scraping, certificado ou emissao real foi introduzido.

## 29. Sprint 28 - Guardrails de Revisao de Candidatos
Objetivo: tornar explicitos os motivos de bloqueio e avisos LGPD na criacao de candidatos fiscais antes do workflow de lotes.

Tarefas concluidas:
- [x] Criar review gate deterministico no dominio de candidatos.
- [x] Bloquear candidatos duplicados dentro da importacao.
- [x] Bloquear candidatos sem valor valido em centavos.
- [x] Bloquear candidatos sem data de servico ou competencia.
- [x] Registrar warning quando payload legado trouxer documento bruto.
- [x] Incluir `reviewGate` em auditoria `fiscal_candidate.created`.
- [x] Documentar contratos em `docs/architecture/fiscal-candidate-review-guardrails.md`.
- [x] Criar testes de dominio e service para bloqueios e warnings.

Checklist de aceite:
- [x] Candidato duplicado nao avanca para lote sem revisao humana.
- [x] Motivos de bloqueio ficam auditaveis sem gravar CPF/CNPJ bruto.
- [x] Candidate service entende payload versionado sem colocar regra fiscal em React.
- [x] Nenhum provider externo, scraping, certificado ou emissao real foi introduzido.

## 30. Sprint 29 - Beta Scope Freeze
Objetivo: consolidar a Sprint 28 e congelar exatamente o escopo do beta fiscal supervisionado.

Tarefas concluidas:
- [x] Confirmar merge do PR #15 na `main`.
- [x] Criar branch `codex/sprint-29-beta-scope-freeze`.
- [x] Criar matriz `MVP beta / post-beta / fora de escopo`.
- [x] Definir jornada beta oficial.
- [x] Criar lista de tenants/usuarios beta ficticios ou controlados.
- [x] Atualizar checklist de go/no-go beta.
- [x] Confirmar explicitamente que NFS-e real, scraping e provider externo permanecem fora.

Checklist de aceite:
- [x] Escopo beta esta documentado em `docs/product/beta-scope-freeze.md`.
- [x] Nenhuma feature grande nova entra sem novo PRD/ADR.
- [x] Beta permanece supervisionado, auditavel e sem efeito fiscal externo.

## 31. Sprint 30 - Command Idempotency e Transition Ledger
Objetivo: padronizar idempotencia para comandos criticos alem de importacao e simulacao.

Tarefas concluidas:
- [x] Criar contrato transversal de idempotencia por tenant, ator, operacao e chave.
- [x] Cobrir criacao de lote, submit, simulate, approve future issuance, cancel e revisao de candidato.
- [x] Registrar `requestHash`, `operation`, `responseRef` e status da tentativa.
- [x] Bloquear replay divergente com a mesma chave.
- [x] Testar replay no mesmo tenant e replay cruzado entre tenants.

Gate:
- [x] Comandos criticos podem ser repetidos sem duplicar efeitos.
- [x] Idempotency key de um tenant nao funciona em outro.

## 32. Sprint 31 - RBAC Matrix e Flow Permissions
Objetivo: fechar matriz de permissoes por fluxo, papel e estado.

Tarefas concluidas:
- [x] Documentar matriz OWNER, ADMIN, FISCAL_MANAGER, FISCAL_OPERATOR, FINANCIAL_OPERATOR, ACCOUNTANT e AUDITOR.
- [x] Validar todos os comandos com `assertPermissionForCommand`.
- [x] Criar testes negativos por papel em imports, candidatos, inconsistencias, lotes, documentos, auditoria e tenant admin.
- [x] Conferir que UI esconde acoes, mas backend continua sendo a barreira real.

Gate:
- [x] Nenhum papel sem permissao executa acao critica.
- [x] Nenhuma rota aceita `tenantId` vindo do client como fonte de verdade.

## 33. Sprint 32 - Audit Completeness e Redaction
Objetivo: garantir auditoria completa, pesquisavel e sem vazamento.

Tarefas concluidas:
- [x] Mapear eventos obrigatorios por comando critico.
- [x] Garantir `tenantId`, `actorId`, `correlationId`, entidade, before/after seguro e metadata minima.
- [x] Cobrir tentativas negadas quando fiscalmente relevantes como decisao futura documentada.
- [x] Criar testes que falham com CPF/CNPJ bruto, tokens, storage path, raw payload ou provider response em auditoria publica.
- [x] Atualizar docs de auditoria e LGPD.

Gate:
- [x] Toda acao critica tem auditoria segura.
- [x] Nenhum dado sensivel completo aparece em DTO, log ou auditoria publica.

## 34. Sprint 33 - Import Replay, Quarantine e Parser Governance
Objetivo: tornar imports problematicos reprocessaveis sem perder rastreabilidade.

Tarefas concluidas:
- [x] Definir estado operacional de quarentena para linhas/importacoes invalidas.
- [x] Permitir revalidacao com o mesmo parser versionado.
- [x] Registrar historico de tentativas de validacao.
- [x] Bloquear parser desconhecido ou downgrade nao aprovado.
- [x] Documentar governanca para futuras versoes do parser.
- [x] Testar payload malicioso, duplicidade, datas invalidas, valores invalidos e campos proibidos.

Gate:
- [x] Import invalido falha fechado.
- [x] Reprocessamento preserva auditoria e nao cria candidatos duplicados silenciosamente.

## 35. Sprint 34 - Candidate Review Workbench Hardening
Objetivo: fortalecer a revisao humana antes de lote.

Tarefas concluidas:
- [x] Exibir motivos de bloqueio e warnings LGPD seguros no candidato.
- [x] Permitir justificativa supervisionada sem CRUD generico.
- [x] Exigir justificativa para liberar candidato para lote.
- [x] Documentar que acoes em massa permanecem fora ate existir limite e auditoria por item.
- [x] Garantir auditoria de reviewer, timestamp, motivo e estado anterior/posterior.
- [x] Reforcar UX operacional densa na fila de candidatos.

Gate:
- [x] Candidato so vira `READY_FOR_BATCH` por fluxo humano auditavel.
- [x] Motivo de bloqueio nunca e perdido.

## 36. Sprint 35 - Batch Snapshot e Concurrency Guards
Objetivo: endurecer lotes contra corrida, mutacao posterior e inconsistencia de totais.

Tarefas concluidas:
- [x] Criar snapshot dos campos fiscais relevantes ao incluir candidato em lote.
- [x] Impedir candidato em dois lotes ativos por guarda de aplicacao.
- [x] Revalidar inconsistencias abertas antes de submit, simulate e approve.
- [x] Recalcular total do lote de forma deterministica.
- [x] Proteger submit, simulacao e aprovacao contra estado concorrente de candidato.
- [x] Testar lote duplicado, total divergente e candidato alterado apos inclusao.

Gate:
- [x] Lote e reproduzivel e auditavel.
- [x] Nenhum lote avanca com candidato bloqueado ou inconsistencia aberta.

## 37. Sprint 36 - Tenant Isolation e Abuse Testing
Objetivo: provar isolamento multiempresa antes de qualquer beta com dados reais.

Tarefas concluidas:
- [x] Criar bateria IDOR/abuse para rotas operacionais.
- [x] Testar troca de tenant sem membership ativa e tenant inativo.
- [x] Testar bloqueio de `tenantId` e campos de controle vindos do client.
- [x] Testar replay de idempotency key entre tenants via suite existente.
- [x] Testar payloads aninhados com campos proibidos em imports.
- [x] Criar relatorio de evidencias de isolamento.

Gate:
- [x] Zero vazamento cross-tenant conhecido nos testes adicionados.
- [x] Qualquer falha cross-tenant bloqueia beta.

## 38. Sprint 37 - Environments, Supabase e Vercel Release Prep
Objetivo: preparar ambiente beta sem secrets no repositorio.

Tarefas concluidas:
- [x] Documentar matriz `local`, `preview`, `staging` e `production`.
- [x] Definir variaveis por ambiente: Supabase URL/anon, `DATABASE_URL`, `APP_ENV`, flags e Sentry vazio/inativo.
- [x] Criar checklist Supabase Auth: redirects, dominio, templates e policies.
- [x] Definir politica de migrations em staging/prod.
- [x] Documentar rollback Vercel e rollback/forward-fix de banco.
- [x] Confirmar branch protection e Quality Gates obrigatorios.

Gate:
- [x] Deploy beta/staging e reproduzivel.
- [x] Secrets permanecem fora do repositorio.
- [x] Rollback esta documentado antes de usuario real.

## 39. Sprint 38 - Beta Release Candidate e Evidence Pack
Objetivo: fechar um release candidate com evidencias objetivas.

Tarefas concluidas:
- [x] Criar pacote de evidencias do release candidate.
- [x] Validar checklist LGPD, audit, tenant isolation e runbooks por documentacao.
- [x] Criar go/no-go tecnico inicial.
- [x] Registrar riscos aceitos e riscos bloqueadores.
- [x] Preparar roteiro do piloto com 1-3 tenants.
- [x] Criar teste de release docs para manter guardrails.
- [ ] Anexar CI URL depois que o PR for aberto.
- [ ] Rodar smoke manual/e2e da jornada beta com dois tenants em staging/beta.

Gate:
- [x] Beta real permanece NO-GO ate merge, CI verde, donos nomeados e smoke staging/beta.
- [x] Nenhum incidente conhecido de tenant, auditoria, dado sensivel ou emissao real foi introduzido nesta sprint.

## 40. Sprint 39 - Controlled Beta Pilot Readiness
Objetivo: preparar a decisao operacional de piloto beta controlado apos o release candidate tecnico.

Tarefas concluidas tecnicamente:
- [x] Mergear o PR da Sprint 38.
- [x] Confirmar Quality Gates verdes em `main`.
- [x] Registrar evidencia de merge commit e CI.
- [x] Criar log de evidencias do piloto.
- [x] Criar runbook de smoke manual com dois tenants.
- [x] Registrar go/no-go atual como NO-GO ate aprovacao externa e smoke.

Tarefas pendentes externas:
- [ ] Confirmar deploy staging/beta com o commit final.
- [ ] Nomear product owner, engineering owner e support owner.
- [ ] Aprovar 1-3 tenants beta fora do repositorio.
- [ ] Aprovar usuarios beta com least privilege.
- [ ] Rodar smoke manual com dois tenants.
- [ ] Registrar evidencias seguras de staging/beta.
- [ ] Atualizar riscos aceitos e bloqueadores.
- [ ] Registrar go/no-go final para abrir o piloto.

Gate:
- [x] Piloto continua bloqueado ate donos nomeados, smoke aprovado e zero P0/P1.
- [x] Nenhum dado real entra sem aprovacao formal e ambiente beta configurado.

## 41. Sprints 40-47 - Roadmap Para Uso e Testes Controlados
Objetivo: orientar a passagem do release candidate documentado para um beta acompanhado e seguro.

Roadmap oficial:
- `docs/product/controlled-beta-execution-roadmap.md`
- `docs/operations/staging-beta-activation.md`

Principios:
- [x] Sprint 39 foi mergeada antes de planejar o ambiente beta.
- [x] O proximo uso/teste continua sendo beta controlado, nao producao.
- [x] Dados reais so entram depois de owners, ambiente e go/no-go.
- [x] NFS-e real, scraping, provider municipal, certificado digital e fila fiscal real continuam fora ate PRD/ADR de homologacao.
