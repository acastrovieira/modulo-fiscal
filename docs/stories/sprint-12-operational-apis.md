# Story - Sprint 12 APIs Operacionais de Importacoes e Candidatos

## Status
Done

## Objetivo
Expor APIs operacionais finas para importacoes e candidatos fiscais, preservando API-first, RBAC, tenant isolation, DTO allowlist, auditoria nas mutations existentes e ausencia total de emissao real de NFS-e, scraping ou provider externo.

## Endpoints Entregues
- [x] `GET /api/imports`
- [x] `POST /api/imports`
- [x] `GET /api/imports/[id]`
- [x] `POST /api/imports/[id]/validate`
- [x] `POST /api/imports/[id]/candidates`
- [x] `GET /api/candidates`
- [x] `GET /api/candidates/[id]`
- [x] `POST /api/candidates/[id]/ready-for-batch`

## Tarefas
- [x] Criar query application service para listagem/detalhe de importacoes.
- [x] Criar query application service para listagem/detalhe de candidatos.
- [x] Criar DTOs allowlist para importacoes.
- [x] Criar DTOs allowlist para candidatos.
- [x] Criar schemas backend com Zod para body/query.
- [x] Criar repository Prisma de importacoes em `infrastructure`.
- [x] Criar repository Prisma de candidatos em `infrastructure`.
- [x] Reutilizar services existentes para mutations de importacao.
- [x] Reutilizar services existentes para geracao/revisao de candidatos.
- [x] Tratar erro Zod como `VALIDATION_ERROR` sanitizado.
- [x] Ajustar ESLint para bloquear Prisma em app/UI/presentation e liberar apenas infrastructure.
- [x] Criar testes de contrato para APIs de importacoes.
- [x] Criar testes de contrato para APIs de candidatos.

## Criterios de Aceite
- [x] APIs nao retornam entidade Prisma crua.
- [x] APIs nao aceitam `tenantId` do client como escopo confiavel.
- [x] Query services validam RBAC no backend.
- [x] Mutations seguem usando services com RBAC, tenant scope e audit.
- [x] DTOs nao expõem `tenantId`, `rawPayload`, `fiscalFingerprint` completo ou BigInt cru.
- [x] Dinheiro em centavos sai como string nos DTOs.
- [x] Nenhum componente React acessa Prisma.
- [x] Nenhuma regra fiscal entra em React.
- [x] Nenhuma emissao real, scraping ou provider externo foi introduzido.

## Gates
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`

## Agentes
- Codex: implementacao das APIs, repositories, schemas, DTOs, testes e gates.
- @architect: revisao de endpoints, DTOs e boundaries.
- @qa: cenarios negativos de RBAC, tenant isolation, allowlist e hardening.

## Observacoes
- O endpoint `POST /api/imports/[id]/candidates` cria candidatos supervisionados a partir de linhas normalizadas, mas nao executa emissao fiscal.
- O CI/branch protection da Sprint 11 continuara bloqueando regressao antes de merge.
- Testes com PostgreSQL real permanecem fora desta sprint; os contratos foram cobertos com repositories mockados e hardening textual.