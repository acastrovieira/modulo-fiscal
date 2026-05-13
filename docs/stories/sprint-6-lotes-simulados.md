# Story - Sprint 6 Lotes Simulados sem Emissao

## Status
Done

## Objetivo
Fechar o ciclo operacional fiscal supervisionado com lotes internos, revisao, simulacao auditavel e aprovacao futura, sem chamar provider NFS-e, prefeitura, fila de emissao ou scraping.

## Tarefas
- [x] Implementar dominio de `FiscalBatch` e `FiscalBatchItem`.
- [x] Implementar guards de estado para criar, enviar para revisao, simular, aprovar e cancelar.
- [x] Implementar `createFiscalBatch`.
- [x] Implementar `submitBatchForReview`.
- [x] Implementar `simulateBatchInternally`.
- [x] Implementar `approveBatchForFutureIssuance`.
- [x] Implementar `cancelBatch`.
- [x] Aceitar somente candidatos `READY_FOR_BATCH` com valor positivo em centavos.
- [x] Bloquear candidatos com inconsistencias bloqueantes abertas.
- [x] Impedir mistura de tenants em candidatos, itens e lotes.
- [x] Separar permissao `batches.simulate` de `batches.approve`.
- [x] Atualizar candidatos para `IN_BATCH`, `SIMULATED` e `APPROVED_FOR_FUTURE_ISSUANCE` conforme transicoes.
- [x] Liberar candidatos para `READY_FOR_BATCH` quando lote cancelavel e cancelado.
- [x] Registrar auditoria de criacao, envio, simulacao interna, aprovacao futura e cancelamento.
- [x] Garantir metadata explicita `externalProviderCalled: false` e `nfseIssued: false` em simulacao/aprovacao.
- [x] Criar testes positivos e negativos para RBAC, tenant isolation, estados invalidos, lote vazio e candidato bloqueado.

## Criterios de Aceite
- [x] Nenhum lote chama prefeitura ou provider externo.
- [x] Aprovacao significa somente etapa futura supervisionada.
- [x] Lote nao mistura tenants.
- [x] Lote nao aceita candidato bloqueado ou com inconsistencia bloqueante aberta.
- [x] Auditoria cobre o ciclo do lote com before/after quando aplicavel.
- [x] Operador pode criar/submeter/simular, mas nao aprovar.
- [x] Cancelamento exige justificativa.

## Gates
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`

## Agentes
- Codex: implementacao, testes, gates e commit.
- @architect/Claude: revisao de estados, semantica de aprovacao e fronteira sem emissao.
- @qa: cenarios positivos e negativos de permissao, tenant e ausencia de provider.

