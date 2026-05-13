# Workflow Fiscal Supervisionado

## Objetivo
Definir o fluxo operacional inicial para importações, candidatos fiscais, inconsistências e lotes supervisionados. Este documento orienta o PRD e futuras implementações sem introduzir emissão real de NFS-e nesta fase.

## Princípios
- Toda transição crítica acontece no backend.
- Componentes React exibem estado e disparam comandos, mas não executam lógica fiscal.
- Cada comando crítico valida tenant, permissão e estado atual.
- Cada transição relevante gera evento de auditoria.
- Operações repetíveis devem usar idempotência.
- Revisão humana é parte obrigatória do fluxo fiscal.

## Estados Conceituais
### ImportBatch
- DRAFT: lote de importação iniciado, ainda sem processamento.
- PENDING_VALIDATION: arquivo recebido e aguardando validação.
- VALIDATING: validação em andamento.
- VALIDATED: importação validada sem bloqueios críticos.
- HAS_ERRORS: importação contém erros bloqueantes.
- READY_FOR_REVIEW: dados importados podem ser revisados por operador fiscal.
- ARCHIVED: importação preservada para consulta, sem novas ações.

### ImportRow
- RECEIVED: linha recebida do arquivo ou fonte estruturada.
- NORMALIZED: linha convertida para formato interno.
- REJECTED: linha rejeitada por erro estrutural ou regra mínima.
- CANDIDATE_CREATED: linha originou um candidato fiscal.

### FiscalCandidate
- DRAFT: candidato criado, ainda incompleto.
- NEEDS_REVIEW: candidato precisa de conferência humana.
- BLOCKED: candidato bloqueado por inconsistência.
- READY_FOR_BATCH: candidato revisado e apto para lote supervisionado.
- IN_BATCH: candidato associado a um lote.
- SIMULATED: candidato passou por simulação interna futura.
- APPROVED_FOR_FUTURE_ISSUANCE: candidato aprovado para etapa futura, sem emissão real nesta fase.

### FiscalInconsistency
- OPEN: inconsistência criada e pendente.
- IN_REVIEW: inconsistência em análise humana.
- RESOLVED: inconsistência resolvida com evidência.
- WAIVED: inconsistência dispensada com justificativa auditável.

### FiscalBatch
- DRAFT: lote em preparação.
- IN_REVIEW: lote em revisão por gestor fiscal.
- SIMULATED: lote passou por simulação interna futura.
- APPROVED: lote aprovado para etapa futura supervisionada.
- CANCELLED: lote cancelado com motivo auditável.

## Eventos Internos Iniciais
- imports.created
- imports.validation_started
- imports.validation_finished
- imports.row_rejected
- fiscal_candidate.created
- fiscal_candidate.review_requested
- fiscal_candidate.marked_ready
- inconsistency.opened
- inconsistency.resolved
- inconsistency.waived
- batch.created
- batch.submitted_for_review
- batch.simulated
- batch.approved
- batch.cancelled

## Permissões Por Transição
- Criar importação: `imports.create`
- Ver importações: `imports.view`
- Ver candidatos: `candidates.view`
- Resolver inconsistência: `inconsistencies.resolve`
- Simular lote futuro: `batches.simulate`
- Aprovar lote: `batches.approve`
- Consultar auditoria: `audit.view`
- Baixar documentos: `documents.download`

## Auditoria
Cada transição crítica deve registrar:
- tenantId
- actorId
- eventType
- entityType
- entityId
- beforePayload
- afterPayload
- metadata
- correlationId
- createdAt

A auditoria deve permitir reconstruir a decisão operacional sem depender de logs técnicos voláteis.

## Idempotência
Comandos que criam ou mudam estados relevantes devem aceitar uma chave de idempotência futura. A chave deve considerar tenant, ator, comando e entidade-alvo quando aplicável.

## Fingerprint Fiscal
O fingerprint fiscal deve ser versionado e calculado fora da interface. Ele será usado futuramente para detectar duplicidade, mudanças relevantes de dados e reprocessamentos seguros.

## Limites Desta Fase
- Não existe provider adapter ativo.
- Não existe envio para prefeitura.
- Não existe certificado digital.
- Não existe scraping.
- Não existe motor fiscal municipal completo.

## Implicação Para o PRD
O PRD deve descrever jornadas por transição de estado, não por CRUD. Cada tela precisa responder qual trabalho operacional está sendo feito, qual risco está sendo reduzido e qual evidência fica registrada.