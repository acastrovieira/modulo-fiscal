# Sprint 34 - Candidate Review Workbench Hardening

## Objetivo
Fortalecer a revisao humana de candidatos fiscais antes de lote, mantendo o fluxo supervisionado, auditavel e sem CRUD generico.

## Checklist
- [x] Persistir motivos de bloqueio e warnings LGPD seguros no candidato.
- [x] Expor motivos/warnings em DTOs allowlisted e na fila operacional.
- [x] Exigir justificativa humana para liberar candidato para lote.
- [x] Registrar auditoria com reviewer, timestamp, justificativa, estado anterior/posterior e contexto do review gate.
- [x] Manter candidatos `BLOCKED` fora de liberacao direta por CRUD generico.
- [x] Documentar que bulk review permanece fora ate haver limite e auditoria por item.

## Gates
- [x] Candidato so vira `READY_FOR_BATCH` por fluxo humano auditavel.
- [x] Motivo de bloqueio nunca e perdido.
- [x] Nenhuma emissao NFS-e real, scraping, provider municipal ou certificado digital foi implementado.
