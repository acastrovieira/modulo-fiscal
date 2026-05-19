# Sprint 33 - Import Replay, Quarantine e Parser Governance

## Objetivo
Tornar importacoes problematicas reprocessaveis sem perder rastreabilidade, sem duplicar candidatos e sem aceitar parser desconhecido, downgrade ou payload sensivel.

## Entregas
- [x] Adicionado status `QUARANTINED` para linhas de importacao invalidas.
- [x] Criado modelo `ImportValidationAttempt` para historico de validacoes/replays.
- [x] Implementado replay seguro substituindo linhas do import de forma transacional.
- [x] Bloqueado replay quando ja existem candidatos fiscais criados.
- [x] Bloqueado parser desconhecido antes de tocar no import.
- [x] Bloqueada mudanca/downgrade de parser sem fluxo explicito de migracao.
- [x] Rejeitados campos proibidos como `tenantId`, `rawPayload`, tokens, paths, provider payloads e documentos brutos.
- [x] Validacao de datas ISO e valores positivos em centavos reforcada.
- [x] Testes cobrem parser governance, quarentena, replay e fluxo supervisionado.
- [x] Documentado contrato em `docs/architecture/import-replay-quarantine-governance.md`.

## Gates
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run security:secrets`
- [x] `npx prisma validate`
- [x] `npm run build`

## Fora de Escopo
- UI de resolucao de quarentena.
- Parser migration workflow multi-versao.
- Jobs/filas reais.
- Emissao real de NFS-e.
- Scraping, provider municipal ou certificado digital.
