# Command Idempotency Ledger

## Objetivo
Padronizar idempotencia para comandos criticos do beta fiscal supervisionado, evitando duplicidade de efeitos quando uma chamada HTTP e repetida por timeout, retry do cliente ou erro operacional.

## Contrato
Comandos criticos podem receber o header `idempotency-key`. Quando a chave e informada, o backend grava um ledger por:

- `tenantId`
- `actorId`
- `operation`
- `idempotencyKey`
- `requestHash`
- `responseRef`
- `status`

A unicidade e sempre `tenantId + operation + idempotencyKey`. A chave nunca e global e nunca e buscada fora do tenant efetivo resolvido no backend.

## Operacoes cobertas
- `fiscal_candidate.mark_ready`
- `fiscal_batch.create`
- `fiscal_batch.submit_review`
- `fiscal_batch.simulate_internal`
- `fiscal_batch.approve_future_issuance`
- `fiscal_batch.cancel`

## Replay
Replay com mesma chave, mesma operacao e mesmo hash retorna o recurso persistido apontado por `responseRef`, sem reexecutar regra de dominio, transicao, auditoria ou atualizacao de candidatos.

Replay com mesma chave e payload diferente falha fechado com erro de estado invalido. Isso evita que uma chave seja reutilizada para comando divergente.

## Hash canonico
O `requestHash` e calculado a partir de payload canonico, com chaves ordenadas e sem campos volateis como timestamp de execucao. Para lote, a criacao normaliza a lista de candidatos antes do hash, porque a ordem nao carrega significado fiscal nesta etapa.

## Limites desta sprint
- O ledger registra execucoes bem-sucedidas (`SUCCEEDED`).
- Estados de processamento concorrente e falhas recuperaveis ficam reservados para hardening futuro com transacoes/locks dedicados.
- Nenhuma emissao real, scraping, provider municipal ou certificado digital foi introduzido.

## Invariantes
- O tenant vem de sessao/membership server-side, nunca do cliente.
- `responseRef` precisa ser carregado novamente com validacao de tenant scope.
- O payload completo nao e armazenado no ledger; apenas o hash e a referencia do resultado.
- Auditoria de dominio continua no comando original e nao e duplicada no replay.
