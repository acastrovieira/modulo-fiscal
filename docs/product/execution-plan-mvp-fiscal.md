# Plano de Orquestracao e Execucao - MVP Fiscal Supervisionado

Atualizado em: 2026-05-13

## 1. Objetivo
Este plano transforma o PRD do MVP Fiscal Supervisionado em uma sequencia executavel de sprints, tarefas, checklists, gates de qualidade e roteamento de agentes/modelos.

A regra central e simples: construir primeiro a base fiscal auditavel e segura, depois services e APIs, e somente depois a UI operacional completa. O objetivo e evitar quebras, vazamento de tenant, regra fiscal em React, auditoria incompleta ou qualquer confusao entre aprovacao supervisionada e emissao real de NFS-e.

## 2. Dashboard de Evolucao
| Ordem | Sprint | Status | Progresso | Gate principal | Squad recomendado |
| --- | --- | --- | --- | --- | --- |
| 0 | Planejamento e governanca | Concluida | 100% | PM/PO/architect revisados | Codex + @pm/@po + @architect |
| 1 | Schema operacional e migrations | Concluida | 100% | Prisma validate/generate OK | Codex + @architect |
| 2 | Fundacao RBAC, tenant e auditoria | Concluida | 100% | Comandos criticos protegidos | Codex + @qa |
| 3 | Documentos e importacoes | Nao iniciada | 0% | Importacao auditada por tenant | Codex |
| 4 | Candidatos fiscais e fingerprint | Nao iniciada | 0% | Candidato sem regra em UI | Codex + Claude |
| 5 | Inconsistencias e revisao humana | Nao iniciada | 0% | Bloqueios e justificativas auditaveis | Codex + Claude + @qa |
| 6 | Lotes simulados sem emissao | Nao iniciada | 0% | Fluxo sem provider externo | Codex + Claude |
| 7 | APIs e cockpit operacional | Nao iniciada | 0% | UI chama APIs/services, nao Prisma | Codex + Gemini |
| 8 | QA, LGPD, auditoria e hardening | Nao iniciada | 0% | Regressao completa verde | Codex + @qa + @architect |

## 3. Squads e Roteamento de Modelos
| Squad | Quando chamar | Modelo/agente sugerido | Responsabilidade |
| --- | --- | --- | --- |
| Produto e backlog | Planejamento, priorizacao, criterios de aceite | AIOX `@pm` ou `@po` | Quebrar PRD em stories e validar valor por sprint |
| Arquitetura fiscal | Schema, estados, fronteiras, riscos de quebra | AIOX `@architect` + Claude | Validar sequencia tecnica e dominio fiscal |
| Backend e dominio | Prisma, services, guards, audit, testes | Codex + Claude | Implementar com seguranca e revisar regra de dominio |
| Frontend operacional | Dashboard, telas, responsividade, shadcn/ui | Gemini + Codex | Refinar UX e integrar UI com APIs/services |
| QA e compliance | Testes, regressao, LGPD, RBAC, tenant isolation | AIOX `@qa` + Codex | Garantir gates antes de avancar |
| DevOps futuro | CI, ambientes, observabilidade e deploy | AIOX `@devops` | Entrar depois que o MVP local estiver consistente |

Regra pratica:
- Codex executa mudancas no repositorio e valida gates.
- Claude revisa dominio fiscal, workflow e riscos conceituais.
- Gemini atua quando a tarefa for visual ou experiencia operacional.
- AIOX `@qa` entra antes de fechar sprint.
- AIOX `@architect` entra antes de schema/migration e antes de qualquer mudanca grande de workflow.

## 4. Dependencias Criticas
- UI depende de APIs ou server actions estaveis.
- APIs dependem de services de application.
- Services dependem de dominio, tenant, RBAC, audit e correlation id.
- Importacoes dependem de `document_files`.
- Candidatos dependem de importacoes validadas.
- Inconsistencias dependem de candidatos ou import rows.
- Lotes dependem de candidatos `READY_FOR_BATCH`.
- Simulacao interna depende de lote `IN_REVIEW`.
- Auditoria depende de `correlationId` desde o primeiro comando.
- Nenhuma etapa depende de provider externo NFS-e nesta fase.

## 5. Gates Globais Obrigatorios
Antes de encerrar qualquer sprint:
- [ ] `npm run lint` verde.
- [ ] `npm run typecheck` verde.
- [ ] `npm test` verde.
- [ ] Nenhum componente React acessa Prisma.
- [ ] Nenhuma regra fiscal foi implementada em React.
- [ ] Nenhuma tabela operacional critica ficou sem `tenantId`.
- [ ] Nenhuma acao critica ficou sem permissao backend.
- [ ] Nenhuma transicao critica ficou sem auditoria planejada ou implementada.
- [ ] Nenhum valor monetario foi salvo fora de centavos.
- [ ] Nenhum log tecnico recebeu dado sensivel completo.
- [ ] Nenhuma emissao real de NFS-e foi implementada.
- [ ] Nenhum scraping foi implementado.
- [ ] Nenhuma tela virou CRUD generico sem workflow.

## 6. Sprint 0 - Planejamento e Governanca
Status inicial: concluida.

Objetivo: consolidar artefatos que guiam a execucao sem ambiguidade.

Checklist da sprint:
- [x] Criar ADRs iniciais.
- [x] Criar escopo do MVP.
- [x] Criar personas.
- [x] Criar fronteiras de dominio.
- [x] Criar workflow fiscal supervisionado.
- [x] Criar organizacao de repositorio e roteamento de agentes.
- [x] Criar inputs do PRD.
- [x] Criar PRD do MVP Fiscal Supervisionado.
- [x] Criar plano de orquestracao e execucao.
- [x] Criar stories minimas de readiness e Sprint 1.
- [x] Padronizar status de lote como APPROVED_FOR_FUTURE_ISSUANCE.
- [x] Revisar encoding dos docs criticos de produto e arquitetura.
- [x] Revisar plano com `@pm` e `@po` antes da Sprint 1.
- [x] Revisar riscos de schema com `@architect` antes da Sprint 1.

Criterios de aceite:
- [x] PRD existe em `docs/product/prd-mvp-fiscal-supervisionado.md`.
- [x] Plano de execucao existe em `docs/product/execution-plan-mvp-fiscal.md`.
- [x] Backlog inicial convertido em stories minimas em `docs/stories/`.

Agente/modelo recomendado:
- Codex para criar artefatos e commit.
- AIOX `@pm` ou `@po` para revisar backlog.
- AIOX `@architect` para revisar riscos tecnicos.

## 7. Sprint 1 - Schema Operacional e Migrations
Objetivo: criar a base persistente do fluxo fiscal supervisionado sem implementar regras em UI.

Tarefas:
- [ ] Modelar enums de status para importacao, candidato, inconsistencia e lote.
- [ ] Criar modelos Prisma para import batch e import row.
- [ ] Relacionar importacao com `DocumentFile` e `Tenant`.
- [ ] Criar modelo Prisma para `FiscalCandidate`.
- [ ] Criar modelo Prisma para `FiscalInconsistency`.
- [ ] Criar modelo Prisma para `FiscalBatch` e itens do lote.
- [ ] Garantir `tenantId` em todas as tabelas operacionais criticas.
- [ ] Garantir indices por `tenantId`, status e datas operacionais.
- [ ] Definir campos monetarios em centavos.
- [ ] Definir timestamps consistentes com `Timestamptz`.
- [ ] Rodar `npx prisma validate`.
- [ ] Rodar `npx prisma generate`.
- [ ] Criar ou preparar migration local segura.

Checklist de aceite:
- [ ] Prisma valida sem erro.
- [ ] Prisma Client gera sem erro.
- [ ] Nenhum modelo operacional critico sem `tenantId`.
- [ ] Nomes de status deixam claro que nao existe emissao real.
- [ ] Relacoes impedem lote com candidato de outro tenant por design ou service guard.

Agente/modelo recomendado:
- Codex para schema e validacao.
- AIOX `@architect` + Claude para revisar fronteiras e estados.

Nao iniciar antes de concluir:
- Services de importacao.
- UI de importacao real.
- Lotes.

## 8. Sprint 2 - Fundacao RBAC, Tenant e Auditoria
Objetivo: garantir que todos os comandos futuros nascam com usuario, tenant, permissao, auditoria e correlation id.

Tarefas:
- [ ] Revisar `currentUser` e `currentTenant` para uso em comandos backend.
- [ ] Revisar matriz RBAC inicial por role.
- [ ] Mapear permissao exigida para cada comando do PRD.
- [ ] Padronizar assinatura de comandos com `tenantId`, `actorId`, `correlationId` e permissao esperada.
- [ ] Criar helper ou contrato para audit trail em commands.
- [ ] Criar padrao de erro para acesso negado, tenant invalido e estado invalido.
- [ ] Criar fixtures de tenant, profile e membership para testes.
- [ ] Criar factory de usuarios por role.
- [ ] Expandir testes de `assertPermission`.
- [ ] Expandir testes de `assertTenantScope`.
- [ ] Testar mock padrao de `audit.record`.

Checklist de aceite:
- [ ] Todo comando planejado tem permissao definida.
- [ ] Testes de permissao cobrem roles fiscais principais.
- [ ] Testes de tenant scope cobrem caso positivo e negativo.
- [ ] `audit.record` tem contrato claro para services.
- [ ] `correlationId` e exigido ou gerado em transicoes criticas.

Agente/modelo recomendado:
- Codex para testes e helpers.
- Claude para revisar a matriz de permissao.
- AIOX `@qa` para validar cenarios negativos.

Nao iniciar antes de concluir:
- Services com efeito operacional real.
- APIs publicas do workflow.

## 9. Sprint 3 - Documentos e Importacoes
Objetivo: permitir entrada rastreavel de arquivo estruturado, sem decisao fiscal automatica.

Tarefas:
- [ ] Implementar service `createImportFromDocument`.
- [ ] Validar documento existente, tenant e usuario antes da importacao.
- [ ] Criar estado inicial `PENDING_VALIDATION`.
- [ ] Registrar auditoria `documents.uploaded` quando aplicavel.
- [ ] Registrar auditoria `imports.created`.
- [ ] Implementar `validateImport` com validacao estrutural minima.
- [ ] Criar `ImportRow` a partir de dados estruturados mockados ou fixture inicial.
- [ ] Marcar importacao como `VALIDATED`, `HAS_ERRORS` ou `READY_FOR_REVIEW` conforme resultado.
- [ ] Preparar idempotencia conceitual para importacao repetida.
- [ ] Criar testes unitarios de metadados de arquivo.
- [ ] Criar testes de importacao com e sem permissao `imports.create`.
- [ ] Criar testes de isolamento por tenant.

Checklist de aceite:
- [ ] Importacao nao existe sem tenant.
- [ ] Importacao nao existe sem ator autorizado.
- [ ] Importacao referencia documento rastreavel.
- [ ] Importacao gera auditoria com `correlationId`.
- [ ] Nenhuma regra fiscal definitiva e aplicada nesta sprint.

Agente/modelo recomendado:
- Codex como executor principal.
- AIOX `@qa` para cenarios de permissao e tenant.

Nao iniciar antes de concluir:
- Criacao de candidatos fiscais reais.
- UI rica de importacao.

## 10. Sprint 4 - Candidatos Fiscais e Fingerprint
Objetivo: transformar registros validados em candidatos fiscais revisaveis, mantendo dominio fora da UI.

Tarefas:
- [ ] Implementar modelo de dominio de `FiscalCandidate`.
- [ ] Implementar estados e guards de transicao do candidato.
- [ ] Implementar `createFiscalCandidatesFromImport`.
- [ ] Implementar `markCandidateReadyForBatch`.
- [ ] Criar fiscal fingerprint versionado inicial.
- [ ] Detectar duplicidade provavel por fingerprint.
- [ ] Garantir `grossAmountCents` para valores monetarios.
- [ ] Mascarar documento do tomador quando armazenado para exibicao.
- [ ] Registrar auditoria `fiscal_candidate.created`.
- [ ] Registrar auditoria `fiscal_candidate.marked_ready`.
- [ ] Criar testes de candidato criado a partir de importacao validada.
- [ ] Criar testes para bloqueio por importacao invalida.
- [ ] Criar testes para duplicidade conceitual.

Checklist de aceite:
- [ ] Candidato sempre nasce com tenant e origem.
- [ ] Candidato nunca nasce direto da UI.
- [ ] Fingerprint e versionado.
- [ ] Duplicidade provavel nao gera emissao ou efeito externo.
- [ ] Candidato bloqueado nao pode virar `READY_FOR_BATCH`.

Agente/modelo recomendado:
- Codex para implementation e testes.
- Claude para revisar fingerprint, status e riscos fiscais.
- AIOX `@architect` se houver mudanca de schema.

Nao iniciar antes de concluir:
- Lotes.
- Simulacao.
- Aprovacao.

## 11. Sprint 5 - Inconsistencias e Revisao Humana
Objetivo: abrir, resolver e dispensar inconsistencias com justificativa e auditoria.

Tarefas:
- [ ] Implementar modelo de dominio de `FiscalInconsistency`.
- [ ] Definir tipos iniciais: valor ausente, valor invalido, data ausente, tenant inconsistente, duplicidade provavel, dado sensivel pendente.
- [ ] Separar severidade bloqueante e revisavel.
- [ ] Implementar `openInconsistency`.
- [ ] Implementar `resolveInconsistency`.
- [ ] Implementar `waiveInconsistency`.
- [ ] Exigir justificativa para resolucao ou dispensa.
- [ ] Validar permissao `inconsistencies.resolve`.
- [ ] Impedir resolucao de inconsistencia de outro tenant.
- [ ] Atualizar estado do candidato quando bloqueios forem resolvidos.
- [ ] Registrar auditoria `inconsistency.opened`.
- [ ] Registrar auditoria `inconsistency.resolved`.
- [ ] Registrar auditoria `inconsistency.waived`.
- [ ] Criar testes de bloqueantes e revisaveis.
- [ ] Criar testes de resolucao sem permissao.

Checklist de aceite:
- [ ] Inconsistencia bloqueante impede lote.
- [ ] Inconsistencia revisavel exige justificativa.
- [ ] Resolucao registra before/after payload quando aplicavel.
- [ ] Tenant A nao resolve inconsistencia do tenant B.
- [ ] Dashboard pode consumir contagem de abertas sem virar fonte de verdade.

Agente/modelo recomendado:
- Claude para taxonomia fiscal.
- Codex para services e testes.
- AIOX `@qa` para validar bloqueios.

Nao iniciar antes de concluir:
- Aprovacao de lote.
- Simulacao de lote.

## 12. Sprint 6 - Lotes Simulados sem Emissao
Objetivo: fechar o ciclo operacional com lote supervisionado, simulacao interna e aprovacao futura, sem provider externo.

Tarefas:
- [ ] Implementar modelo de dominio de `FiscalBatch`.
- [ ] Implementar itens de lote vinculados a candidatos.
- [ ] Implementar `createFiscalBatch`.
- [ ] Implementar `submitBatchForReview`.
- [ ] Implementar `simulateBatchInternally`.
- [ ] Implementar `approveBatchForFutureIssuance`.
- [ ] Implementar `cancelBatch`.
- [ ] Validar que apenas candidatos `READY_FOR_BATCH` entram no lote.
- [ ] Impedir mistura de tenants em lote.
- [ ] Separar permissao `batches.simulate` de `batches.approve`.
- [ ] Registrar auditoria para criacao, envio, simulacao, aprovacao e cancelamento.
- [ ] Criar testes para candidato bloqueado em lote.
- [ ] Criar testes para aprovacao sem permissao.
- [ ] Criar teste de regressao garantindo ausencia de provider NFS-e.

Checklist de aceite:
- [ ] Nenhum lote chama prefeitura ou provider externo.
- [ ] Aprovacao significa somente etapa futura supervisionada.
- [ ] Lote nao mistura tenants.
- [ ] Lote nao aceita candidato bloqueado.
- [ ] Auditoria completa existe para o ciclo do lote.

Agente/modelo recomendado:
- Codex para implementation e testes.
- Claude para revisar semantica de aprovacao fiscal.
- AIOX `@architect` para revisar risco de estado.

Nao iniciar antes de concluir:
- Tela final de lote.
- Regressao ponta a ponta.

## 13. Sprint 7 - APIs e Cockpit Operacional
Objetivo: expor services de forma segura e criar experiencia operacional sem regra fiscal em React.

Tarefas:
- [ ] Definir padrao de API routes ou server actions para o MVP.
- [ ] Criar endpoints/actions finos que chamam services.
- [ ] Validar inputs com schemas de validacao.
- [ ] Retornar erros de dominio previsiveis.
- [ ] Implementar dashboard com dados reais ou derivados por tenant.
- [ ] Implementar tela de importacoes.
- [ ] Implementar tela de candidatos fiscais.
- [ ] Implementar tela de inconsistencias.
- [ ] Implementar tela de lotes em revisao.
- [ ] Implementar consulta inicial de auditoria.
- [ ] Criar estados vazios, loading e erro.
- [ ] Aplicar mascaramento visual de dados sensiveis.
- [ ] Garantir que UI esconde acoes sem permissao, mas backend continua bloqueando.
- [ ] Validar responsividade basica.

Checklist de aceite:
- [ ] Nenhum componente usa Prisma.
- [ ] Nenhum componente implementa regra fiscal.
- [ ] Dashboard mostra cards obrigatorios do PRD.
- [ ] Telas representam workflow, nao CRUD generico.
- [ ] Dados sensiveis aparecem mascarados por padrao quando aplicavel.
- [ ] Acoes proibidas falham no backend mesmo se chamadas manualmente.

Agente/modelo recomendado:
- Gemini para UX, dashboard, responsividade e shadcn/ui.
- Codex para integrar UI com APIs/services.
- AIOX `@qa` para validar permissao e regressao visual.

Nao iniciar antes de concluir:
- UI completa antes dos services basicos.

## 14. Sprint 8 - QA, LGPD, Auditoria e Hardening
Objetivo: fechar o MVP com regressao, seguranca operacional e evidencia auditavel.

Tarefas:
- [ ] Criar fixtures com dois tenants e usuarios por role.
- [ ] Criar regressao do fluxo: importacao -> candidato -> inconsistencia -> lote -> simulacao interna.
- [ ] Criar testes negativos de RBAC para comandos criticos.
- [ ] Criar testes negativos de tenant isolation.
- [ ] Criar testes de auditoria por evento obrigatorio.
- [ ] Criar testes de mascaramento LGPD.
- [ ] Validar que `audit.view` controla acesso a eventos.
- [ ] Validar que `documents.download` controla acesso a documentos.
- [ ] Confirmar que logs tecnicos nao vazam dado sensivel completo.
- [ ] Confirmar que nao existe emissao real de NFS-e.
- [ ] Confirmar que nao existe scraping.
- [ ] Rodar build local.
- [ ] Rodar lint, typecheck e tests.
- [ ] Preparar checklist manual de aceite do MVP.

Checklist de aceite:
- [ ] Fluxo feliz passa de ponta a ponta sem efeito externo.
- [ ] Bloqueios fiscais impedem lote.
- [ ] Auditoria permite rastrear tenant, ator, entidade e correlation id.
- [ ] LGPD basica esta coberta por mascaramento e acesso.
- [ ] Build, lint, typecheck e tests verdes.

Agente/modelo recomendado:
- AIOX `@qa` para estrategia e cenarios.
- Codex para automatizar testes e corrigir falhas.
- AIOX `@architect` para revisao final de riscos.
- Gemini para revisao final visual.

## 15. Riscos e Mitigacoes
| Risco | Severidade | Mitigacao |
| --- | --- | --- |
| Regra fiscal em React | Alta | Services e guards no backend; revisao de PR antes de UI fechar |
| Vazamento entre tenants | Critica | `tenantId` obrigatorio, testes negativos e fixtures multi-tenant |
| Auditoria incompleta | Critica | Checklist de evento por comando critico |
| Aprovacao confundida com emissao | Critica | Nomear como aprovacao futura; nenhum provider externo |
| CRUD generico sem workflow | Alta | Toda tela deve mapear estado e acao operacional |
| Dado sensivel em log ou payload | Alta | Mascaramento, fixtures LGPD e revisao QA |
| Schema prematuro demais | Media | Sprint 1 revisada por `@architect`; migrations pequenas |
| UI antes de services | Media | Sprint 7 so fecha apos services centrais |

## 16. Ordem de Execucao Recomendada
1. Revisar este plano com AIOX `@pm` ou `@po`.
2. Revisar Sprint 1 com AIOX `@architect`.
3. Executar Sprint 1 em branch propria.
4. Rodar gates globais.
5. Atualizar dashboard de evolucao.
6. Commitar sprint concluida.
7. Repetir para cada sprint sem pular dependencias.

## 17. Definition of Done do MVP
- [ ] Todos os gates globais verdes.
- [ ] Todas as sprints marcadas como concluidas no dashboard.
- [ ] Fluxo supervisionado funciona sem emissao real.
- [ ] RBAC validado no backend.
- [ ] Tenant isolation validado por testes.
- [ ] Auditoria registra eventos criticos.
- [ ] Dados sensiveis sao mascaraveis.
- [ ] UI operacional esta densa, clara e sem cara de landing page.
- [ ] Nenhuma integracao municipal, scraping ou provider NFS-e real foi implementado.