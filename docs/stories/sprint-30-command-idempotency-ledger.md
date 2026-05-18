# Sprint 30 - Command Idempotency e Transition Ledger

## Objetivo
Padronizar idempotencia para comandos criticos do beta fiscal supervisionado, cobrindo revisao de candidato e transicoes de lote sem duplicar efeitos operacionais.

## Entregas
- [x] Criado contrato transversal em `src/shared/idempotency`.
- [x] Criado ledger Prisma `command_idempotency_records`.
- [x] Criada migration dedicada para o ledger.
- [x] Propagado header `idempotency-key` nas APIs criticas de candidatos e lotes.
- [x] Coberta criacao de lote, submit, simulacao interna, aprovacao futura, cancelamento e revisao de candidato.
- [x] Implementado bloqueio de replay divergente por `requestHash`.
- [x] Implementado isolamento por `tenantId + operation + idempotencyKey`.
- [x] Adicionados testes unitarios e de service para replay e cross-tenant.
- [x] Documentada arquitetura do ledger em `docs/architecture/command-idempotency-ledger.md`.

## Gates
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run security:secrets`
- [x] `npx prisma validate`
- [x] `npm run build`

## Fora de Escopo
- Emissao real de NFS-e.
- Scraping.
- Provider municipal.
- Certificado digital.
- Fila fiscal real.
- Locks transacionais avancados para `PROCESSING`, reservados para hardening futuro.
