# Sprint 15 - Auditoria, Documentos e LGPD Operacional

## Status
Concluida.

## Objetivo
Tornar auditoria e documentos consultaveis no cockpit com RBAC, tenant scope, DTOs allowlist e minimizacao LGPD, sem implementar download real, storage externo, provider fiscal ou emissao NFS-e.

## Entregas
- Helper central `redaction.ts` para mascarar chaves sensiveis, documentos, e-mails, telefones, strings longas e checksums.
- API `GET /api/audit-events` com filtros por evento, entidade, ator, periodo e correlationId.
- API `GET /api/audit-events/[id]` com previews sanitizados de payloads.
- API `GET /api/documents` e `GET /api/documents/[id]` com metadados seguros.
- API `POST /api/documents/[id]/download-intent` protegida por `documents.download`, auditada e sem chamada a storage real.
- Paginas `/dashboard/audit` e `/dashboard/documents` no cockpit operacional.
- Politica inicial LGPD de minimizacao e retencao.
- Testes de RBAC, tenant isolation, DTO allowlist, redaction e download-intent auditavel.

## Fora De Escopo Intencional
- Download real de arquivo.
- Supabase Storage, URL assinada, bucket ou token externo.
- Upload real de documentos.
- Exposicao de payload completo de auditoria.
- Emissao NFS-e real, scraping, certificado digital ou provider externo.

## Checklist De Aceite
- [x] Apenas roles com `audit.view` acessam eventos.
- [x] Rotas de documento usam `documents.download` nesta fase.
- [x] Auditoria nao expoe payload sensivel completo por padrao.
- [x] Documento nao expoe `storagePath`.
- [x] DTOs usam allowlist.
- [x] Download-intent registra auditoria sem storage real.
- [x] Erros publicos continuam no envelope seguro.
- [x] Testes cobrem redaction, RBAC e isolamento por tenant.

## Agentes/Squads
- @architect: validou fronteiras, endpoints e DTOs.
- Segurança/LGPD: revisou politica de minimizacao e riscos de vazamento.
- @qa: definiu cenarios negativos de RBAC, tenant isolation e DTOs seguros.
- Codex: implementou, testou, integrou e preparou commit.
