# Story - Sprint 1 Schema Operacional e Migrations

## Status
Ready

## Objetivo
Criar a base persistente do fluxo fiscal supervisionado sem implementar services, APIs, UI, provider NFS-e real ou scraping.

## Valor
Permitir que o VetFiscal OS tenha modelos operacionais seguros para importacoes, linhas importadas, candidatos fiscais, inconsistencias, lotes e itens de lote, preservando tenant, estados explicitos, centavos, timestamps e caminho de auditoria futura.

## Definition of Ready
- [x] PRD aprovado como referencia.
- [x] Plano de execucao aprovado como referencia.
- [x] @pm revisou backlog e liberou apos ajustes da Sprint 0.
- [x] @po revisou escopo e liberou apos ajustes da Sprint 0.
- [x] @architect recomendou desenho de schema para Sprint 1.
- [x] Status final de lote padronizado como `APPROVED_FOR_FUTURE_ISSUANCE`.
- [x] Nenhuma decisao de produto pendente para o schema operacional.

## Tarefas
- [x] Modelar enums operacionais de importacao, linha, candidato, inconsistencia, lote e item de lote.
- [x] Modelar `ImportBatch` com `tenantId`, documento de origem, status, contadores, idempotency key e timestamps.
- [x] Modelar `ImportRow` com `tenantId`, import batch, payload bruto, payload normalizado, erro e status.
- [x] Modelar `FiscalCandidate` com origem, dados minimos, centavos, fingerprint versionado e status.
- [x] Modelar `FiscalInconsistency` com tipo, severidade, status, mensagem, detalhes e resolucao futura.
- [x] Modelar `FiscalBatch` com status de aprovacao futura, responsaveis, timestamps e total em centavos.
- [x] Modelar `FiscalBatchItem` com lote, candidato, tenant, status e valor em centavos.
- [x] Definir indices por `tenantId`, status, origem e datas operacionais.
- [x] Definir constraints para reduzir risco de relacionamento entre tenants.
- [x] Rodar `npx prisma validate`.
- [x] Rodar `npx prisma generate`.
- [x] Criar migration SQL pequena e isolada.
- [x] Confirmar ausencia de provider NFS-e, prefeitura, certificado, protocolo fiscal ou numero de nota.

## Criterios de Aceite
- [x] Prisma valida sem erro.
- [x] Prisma Client gera sem erro.
- [x] Todos os modelos operacionais criticos possuem `tenantId`.
- [x] Status deixam claro que nao ha emissao real.
- [x] Valores monetarios usam centavos com `BigInt`.
- [x] Timestamps usam `Timestamptz` quando representam instantes.
- [x] Schema nao cria provider NFS-e nem campos de emissao real.
- [x] Migration e isolada e revisavel.

## Agentes Recomendados
- Codex: executar alteracoes no Prisma, migration e validacoes.
- AIOX @architect + Claude: revisar schema final antes do commit da Sprint 1.
- AIOX @qa: revisar gates se houver mudanca em testes ou fixtures.

## Fora de Escopo
- Services de aplicacao.
- APIs ou server actions.
- UI operacional.
- Integracao municipal.
- Emissao real de NFS-e.
- Scraping.