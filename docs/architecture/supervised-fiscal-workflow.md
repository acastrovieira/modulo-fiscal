# Workflow Fiscal Supervisionado

## Objetivo
Definir o fluxo operacional inicial para importacoes, candidatos fiscais, inconsistencias e lotes supervisionados. Este documento orienta o PRD e futuras implementacoes sem introduzir emissao real de NFS-e nesta fase.

## Principios
- Toda transicao critica acontece no backend.
- Componentes React exibem estado e disparam comandos, mas nao executam logica fiscal.
- Cada comando critico valida tenant, permissao e estado atual.
- Cada transicao relevante gera evento de auditoria.
- Operacoes repetiveis devem usar idempotencia.
- Revisao humana e parte obrigatoria do fluxo fiscal.

## Estados Conceituais
### ImportBatch
- DRAFT: lote de importacao iniciado, ainda sem processamento.
- PENDING_VALIDATION: arquivo recebido e aguardando validacao.
- VALIDATING: validacao em andamento.
- VALIDATED: importacao validada sem bloqueios criticos.
- HAS_ERRORS: importacao contem erros bloqueantes.
- READY_FOR_REVIEW: dados importados podem ser revisados por operador fiscal.
- ARCHIVED: importacao preservada para consulta, sem novas acoes.

### ImportRow
- RECEIVED: linha recebida do arquivo ou fonte estruturada.
- NORMALIZED: linha convertida para formato interno.
- REJECTED: linha rejeitada por erro estrutural ou regra minima.
- CANDIDATE_CREATED: linha originou um candidato fiscal.

### FiscalCandidate
- DRAFT: candidato criado, ainda incompleto.
- NEEDS_REVIEW: candidato precisa de conferencia humana.
- BLOCKED: candidato bloqueado por inconsistencia.
- READY_FOR_BATCH: candidato revisado e apto para lote supervisionado.
- IN_BATCH: candidato associado a um lote.
- SIMULATED: candidato passou por simulacao interna futura.
- APPROVED_FOR_FUTURE_ISSUANCE: candidato aprovado para etapa futura, sem emissao real nesta fase.

### FiscalInconsistency
- OPEN: inconsistencia criada e pendente.
- IN_REVIEW: inconsistencia em analise humana.
- RESOLVED: inconsistencia resolvida com evidencia.
- WAIVED: inconsistencia dispensada com justificativa auditavel.

### FiscalBatch
- DRAFT: lote em preparacao.
- IN_REVIEW: lote em revisao por gestor fiscal.
- SIMULATED: lote passou por simulacao interna futura.
- APPROVED_FOR_FUTURE_ISSUANCE: lote aprovado para etapa futura supervisionada, sem emissao real.
- CANCELLED: lote cancelado com motivo auditavel.

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
- batch.approved_for_future_issuance
- batch.cancelled

## Permissoes Por Transicao
- Criar importacao: `imports.create`
- Ver importacoes: `imports.view`
- Ver candidatos: `candidates.view`
- Resolver inconsistencia: `inconsistencies.resolve`
- Simular lote futuro: `batches.simulate`
- Aprovar lote: `batches.approve`
- Consultar auditoria: `audit.view`
- Baixar documentos: `documents.download`

## Auditoria
Cada transicao critica deve registrar:
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

A auditoria deve permitir reconstruir a decisao operacional sem depender de logs tecnicos volateis.

## Idempotencia
Comandos que criam ou mudam estados relevantes devem aceitar uma chave de idempotencia futura. A chave deve considerar tenant, ator, comando e entidade-alvo quando aplicavel.

## Fingerprint Fiscal
O fingerprint fiscal deve ser versionado e calculado fora da interface. Ele sera usado futuramente para detectar duplicidade, mudancas relevantes de dados e reprocessamentos seguros.

## Limites Desta Fase
- Nao existe provider adapter ativo.
- Nao existe envio para prefeitura.
- Nao existe certificado digital.
- Nao existe scraping.
- Nao existe motor fiscal municipal completo.

## Implicacao Para o PRD
O PRD deve descrever jornadas por transicao de estado, nao por CRUD. Cada tela precisa responder qual trabalho operacional esta sendo feito, qual risco esta sendo reduzido e qual evidencia fica registrada.