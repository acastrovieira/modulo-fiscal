# Story - Sprint 3 Documentos e Importacoes

## Status
Done

## Objetivo
Permitir entrada rastreavel de arquivo estruturado por meio de services de aplicacao, sem parser fiscal real, sem candidatos fiscais, sem APIs publicas e sem UI operacional.

## Tarefas
- [x] Implementar service `createImportFromDocument`.
- [x] Validar documento existente, tenant e usuario antes da importacao.
- [x] Criar estado inicial `PENDING_VALIDATION`.
- [x] Registrar auditoria `imports.created`.
- [x] Implementar `validateImport` com validacao estrutural minima.
- [x] Criar `ImportRow` a partir de dados estruturados mockados/fixtures.
- [x] Marcar importacao como `VALIDATED`, `HAS_ERRORS` ou `READY_FOR_REVIEW`.
- [x] Preparar idempotencia conceitual por tenant e idempotency key.
- [x] Criar testes de documento com checksum obrigatorio.
- [x] Criar testes de importacao com e sem permissao `imports.create`.
- [x] Criar testes de isolamento por tenant.

## Criterios de Aceite
- [x] Importacao nao existe sem tenant.
- [x] Importacao nao existe sem ator autorizado.
- [x] Importacao referencia documento rastreavel.
- [x] Importacao gera auditoria com `correlationId`.
- [x] Validacao registra `imports.validation_started` e `imports.validation_finished`.
- [x] Nenhuma regra fiscal definitiva e aplicada nesta sprint.
- [x] Nenhum candidato fiscal, lote, provider NFS-e, scraping ou efeito externo foi implementado.

## Gates
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`

## Agentes
- Codex: implementacao e testes.
- AIOX @qa: revisao de cenarios negativos.