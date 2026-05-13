# Story - Sprint 4 Candidatos Fiscais e Fingerprint

## Status
Done

## Objetivo
Transformar linhas importadas normalizadas em candidatos fiscais revisaveis, com fingerprint fiscal versionado, mascaramento de documento, estados seguros e auditoria, sem emissao real de NFS-e.

## Tarefas
- [x] Implementar modelo de dominio de `FiscalCandidate`.
- [x] Implementar estados e guards de transicao do candidato.
- [x] Implementar `createFiscalCandidatesFromImport`.
- [x] Implementar `markCandidateReadyForBatch`.
- [x] Criar fiscal fingerprint versionado inicial.
- [x] Detectar duplicidade provavel por fingerprint.
- [x] Garantir `grossAmountCents` para valores monetarios.
- [x] Mascarar documento do tomador quando armazenado para exibicao.
- [x] Registrar auditoria `fiscal_candidate.created`.
- [x] Registrar auditoria `fiscal_candidate.marked_ready`.
- [x] Criar testes de candidato criado a partir de importacao validada.
- [x] Criar testes para bloqueio por importacao invalida.
- [x] Criar testes para duplicidade conceitual.

## Criterios de Aceite
- [x] Candidato sempre nasce com tenant e origem.
- [x] Candidato nunca nasce direto da UI.
- [x] Fingerprint e versionado.
- [x] Duplicidade provavel nao gera emissao ou efeito externo.
- [x] Candidato bloqueado nao pode virar `READY_FOR_BATCH`.
- [x] Nenhum lote, simulacao, aprovacao, provider NFS-e ou scraping foi implementado.

## Gates
- [x] `npm test`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npx prisma validate`
- [x] `npm run build`

## Agentes
- Codex: implementacao e testes.
- AIOX @architect ou Claude: revisao de fingerprint, estados e riscos fiscais antes do commit.