# Story - Sprint 7 APIs e Cockpit Operacional

## Status
Done

## Objetivo
Criar a primeira fronteira API-first do cockpit operacional e renderizar um dashboard fiscal denso, profissional e orientado a workflow, mantendo Prisma e regra fiscal fora de React.

## Tarefas
- [x] Criar `GET /api/operations/summary`.
- [x] Criar envelope de erro padronizado para API routes.
- [x] Criar DTO `OperationalDashboardSummary` orientado ao cockpit.
- [x] Criar service `getOperationalDashboardSummary` com RBAC e tenant context.
- [x] Criar repository Prisma isolado em `src/modules/operational/infrastructure`.
- [x] Criar fallback local degradado para ambiente Local sem banco ativo.
- [x] Atualizar dashboard para consumir a API por `fetch`.
- [x] Adicionar loading skeleton, erro com retry, estado vazio e refresh manual.
- [x] Renderizar cards de importacoes, candidatos, inconsistencias, lotes, emissoes da semana e alertas criticos.
- [x] Renderizar fila operacional e alertas curtos.
- [x] Manter guardrail explicito de NFS-e real desativada.
- [x] Criar testes unitarios para DTO, RBAC e ausencia conceitual de emissao real.
- [x] Verificar por busca que Prisma nao aparece em componentes React.
- [x] Validar dashboard no navegador local.

## Criterios de Aceite
- [x] Nenhum componente React acessa Prisma.
- [x] React renderiza DTOs prontos e nao decide regra fiscal.
- [x] API resolve tenant atual no backend; tenantId nao vem do client.
- [x] Backend valida permissao antes de montar resumo.
- [x] Dashboard renderiza os cards obrigatorios do PRD.
- [x] Dashboard possui loading, erro, vazio e refresh.
- [x] Nao existe emissao real, provider NFS-e, fila fiscal ou scraping.

## Gates
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`
- [x] Validacao local em navegador de `/dashboard`

## Agentes
- Codex: implementacao, testes, gates, validacao local e commit.
- @architect: padrao API-first, DTOs, erro envelopado, fronteira React/backend.
- @qa: cenarios de RBAC, tenant isolation, erros previsiveis e ausencia de Prisma em React.
- Squad frontend/Gemini: recomendacoes de cockpit denso, estados e UX operacional.
