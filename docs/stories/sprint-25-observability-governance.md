# Sprint 25 - Observability and Governance

## Status
Concluida.

## Objetivo
Criar uma camada inicial de observabilidade fiscal governada para monitorar o simulador, detectar flags proibidas e apoiar operacao beta sem ativar provider externo ou emissao real.

## Escopo Entregue
- Relatorio tenant-scoped de governanca fiscal baseado em `audit_events`.
- Endpoint `GET /api/observability/fiscal-governance`.
- Permissao `audit.view` exigida no backend.
- Deteccao de flags inseguras: `nfseIssued`, `externalProviderCalled`, `externalTransmission` e `fiscalValue`.
- Metricas de eventos do simulador fiscal e avaliacoes de cenarios.
- DTO publico sem payload bruto, `tenantId`, hash ou dados sensiveis.
- Allowlist de eventos operacionais fiscal simulation.
- Documentacao de arquitetura de observabilidade fiscal.
- Testes de relatorio, RBAC, tenant scope conceitual, DTO seguro e readiness.

## Decisoes
- Usar auditoria como fonte de verdade nesta fase.
- Nao criar tabela de analytics ou jobs nesta sprint.
- Classificar falta de eventos como `attention`, nao como falha tecnica.
- Classificar qualquer flag proibida como `blocked`.

## Fora De Escopo
- Sentry runtime.
- Alertas externos.
- Jobs pg-boss.
- Dashboard visual.
- Monitoramento de provider fiscal real.
- Emissao real de NFS-e.

## Gates
- [x] Testes focados da Sprint 25.
- [x] `npm run security:secrets`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`
