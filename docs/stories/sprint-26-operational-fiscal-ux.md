# Sprint 26 - Operational Fiscal UX

## Status
Concluida.

## Objetivo
Criar uma experiencia de cockpit fiscal operacional para visualizar simulador, cenarios versionados e governanca sem implementar CRUD generico ou emissao real.

## Escopo Entregue
- Nova rota `/dashboard/fiscal`.
- Navegacao lateral para o cockpit fiscal.
- Componente `FiscalOperationsCockpit`.
- View model testavel para interpretar o relatorio de governanca fiscal.
- Cards de eventos monitorados, cenarios avaliados, documentos simulados e flags proibidas.
- Jornada supervisionada com perfil, tomador, documento, cenarios e governanca.
- Fila de governanca com eventos recentes.
- Guardrails visiveis reforcando simulacao, tenant scope, auditoria e ausencia de dados sensiveis.

## Decisoes
- A UX consome `GET /api/observability/fiscal-governance`.
- A pagina nao cria, edita ou exclui recursos.
- Acoes visuais permanecem informativas nesta sprint.
- Logica de interpretacao fica em application helper, nao espalhada em React.

## Fora De Escopo
- Editor de cenarios.
- CRUD fiscal.
- Fluxo de emissao real.
- Provider externo.
- Sentry runtime.
- Alertas externos.

## Gates
- [x] Testes focados da Sprint 26.
- [x] `npm run security:secrets`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`
