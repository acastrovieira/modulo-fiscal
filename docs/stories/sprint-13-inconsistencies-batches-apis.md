# Story - Sprint 13 APIs Operacionais de Inconsistencias e Lotes

## Status
Done

## Objetivo
Expor APIs operacionais para revisao humana de inconsistencias e workflow de lotes simulados, mantendo RBAC, tenant isolation, audit-first, DTO allowlist e ausencia total de emissao real de NFS-e, scraping ou provider externo.

## Endpoints Entregues
- [x] `GET /api/inconsistencies`
- [x] `POST /api/inconsistencies`
- [x] `GET /api/inconsistencies/[id]`
- [x] `POST /api/inconsistencies/[id]/resolve`
- [x] `POST /api/inconsistencies/[id]/waive`
- [x] `GET /api/batches`
- [x] `POST /api/batches`
- [x] `GET /api/batches/[id]`
- [x] `POST /api/batches/[id]/submit-review`
- [x] `POST /api/batches/[id]/simulate`
- [x] `POST /api/batches/[id]/approve-future-issuance`
- [x] `POST /api/batches/[id]/cancel`

## Tarefas
- [x] Criar query service e DTOs allowlist de inconsistencias.
- [x] Criar query service e DTOs allowlist de lotes.
- [x] Criar schemas Zod estritos para inconsistencias e lotes.
- [x] Criar repository Prisma de inconsistencias.
- [x] Criar repository Prisma de lotes.
- [x] Reutilizar services existentes para abrir/resolver/dispensar inconsistencias.
- [x] Reutilizar services existentes para criar/submeter/simular/aprovar futuro/cancelar lotes.
- [x] Manter `details` bruto fora do DTO publico de inconsistencia.
- [x] Serializar valores monetarios BigInt como string.
- [x] Criar testes de contrato para RBAC, tenant isolation e DTO allowlist.

## Criterios de Aceite
- [x] Inconsistencia bloqueante impede lote via service/API command path.
- [x] Operador fiscal nao aprova lote futuro; aprovacao segue `batches.approve`.
- [x] Tenant A nao altera inconsistencia/lote do Tenant B.
- [x] Nenhuma API chama provider externo.
- [x] Auditoria dos services registra before/after em transicoes criticas.
- [x] Simulacao e aprovacao futura preservam metadata `externalProviderCalled: false` e `nfseIssued: false`.
- [x] DTOs nao retornam Prisma cru, `tenantId`, `rawPayload`, `fiscalFingerprint` ou dinheiro BigInt cru.

## Gates
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`

## Agentes
- Codex: implementacao das APIs, repositories, schemas, DTOs, testes e gates.
- @architect/Claude: revisao de contratos, boundaries e semantica fiscal supervisionada.
- @qa: cenarios negativos de RBAC, tenant isolation, estados invalidos e hardening fiscal.

## Observacoes
- `approve-future-issuance` nao emite NFS-e; apenas marca aprovacao futura supervisionada.
- `simulate` e interno e nao chama provider externo.
- Testes com PostgreSQL real permanecem fora desta sprint; a regressao local e CI cobrem contratos, services e hardening.