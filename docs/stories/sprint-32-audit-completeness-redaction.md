# Sprint 32 - Audit Completeness e Redaction

## Objetivo
Garantir que eventos criticos tenham auditoria segura, pesquisavel e sem vazamento de dados sensiveis completos.

## Entregas
- [x] Documentado mapa de eventos criticos em `docs/architecture/audit-completeness-redaction.md`.
- [x] `audit.record` passa a sanitizar `beforePayload`, `afterPayload` e `metadata` antes da persistencia.
- [x] Redaction ampliada para `providerResponse`, `storagePath`, `rawPayload`, `checksum` e `idempotencyKey`.
- [x] Testes provam que payload sensivel nao e persistido cru em auditoria.
- [x] Testes LGPD cobrem novos campos proibidos.
- [x] Dashboard de execucao atualizado.

## Gates
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run security:secrets`
- [x] `npx prisma validate`
- [x] `npm run build`

## Fora de Escopo
- Emissao real de NFS-e.
- Scraping.
- Provider municipal.
- Certificado digital.
- Politica juridica definitiva de retencao.
