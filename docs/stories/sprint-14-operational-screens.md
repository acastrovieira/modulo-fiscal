# Story - Sprint 14 Telas Operacionais Completas

## Status
Done

## Objetivo
Transformar o cockpit em experiencia operacional navegavel para importacoes, candidatos, inconsistencias e lotes, consumindo APIs internas e preservando UX densa, profissional, workflow-driven e sem CRUD generico.

## Telas Entregues
- [x] `/dashboard/imports`
- [x] `/dashboard/candidates`
- [x] `/dashboard/inconsistencies`
- [x] `/dashboard/batches`

## Tarefas
- [x] Criar componente operacional compartilhado para telas de workflow.
- [x] Criar tabela densa com colunas por dominio.
- [x] Criar estados de loading, erro e vazio.
- [x] Consumir APIs por `fetch`, sem Prisma em React.
- [x] Atualizar sidebar com links reais para workflows.
- [x] Corrigir textos mojibake do layout.
- [x] Exibir badges de status e resumo por estado.
- [x] Desabilitar acoes quando nao ha dados carregados.
- [x] Manter dados sensiveis mascarados pelos DTOs das APIs.
- [x] Validar visualmente com browser local.

## Criterios de Aceite
- [x] Telas representam workflows, nao CRUD generico.
- [x] UI chama APIs, nao Prisma.
- [x] UI nao implementa regra fiscal.
- [x] Dados sensiveis aparecem mascarados quando fornecidos pelas APIs.
- [x] Fluxos principais ficam navegaveis pelo sidebar.
- [x] Estados de erro nao quebram layout quando PostgreSQL local esta indisponivel.
- [x] Nenhuma emissao real, scraping ou provider externo foi introduzido.

## Gates
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`
- [x] Browser local em `http://127.0.0.1:3000/dashboard/batches`

## Agentes
- Codex: implementacao frontend integrada, gates, browser check e git.
- Gemini recomendado para proxima revisao visual fina antes de beta.
- @qa recomendado para regressao visual automatizada futura com Playwright.

## Observacoes
- As acoes visuais permanecem bloqueadas quando nao ha dados carregados; execucao detalhada por registro fica para refinamento de fluxo da Sprint 14.1 ou Sprint 15.
- Como o PostgreSQL local nao estava ativo, a validacao visual confirmou renderizacao de layout e estado de erro seguro.