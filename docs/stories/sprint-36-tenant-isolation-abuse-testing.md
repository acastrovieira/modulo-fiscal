# Sprint 36 - Tenant Isolation e Abuse Testing

## Objetivo
Provar isolamento multiempresa antes de qualquer beta com dados reais.

## Checklist
- [x] Criar bateria IDOR/abuse para rotas operacionais.
- [x] Testar troca de tenant sem membership ativa e com tenant inativo.
- [x] Testar bloqueio de `tenantId` e campos de controle vindos do client.
- [x] Testar replay de idempotency key entre tenants via suite existente.
- [x] Testar payload aninhado com campos sensiveis proibidos em imports.
- [x] Corrigir callback Supabase para evitar redirect externo.
- [x] Criar relatorio de evidencias de isolamento.

## Gates
- [x] Zero vazamento cross-tenant conhecido nos testes adicionados.
- [x] Qualquer falha cross-tenant permanece bloqueadora de beta.
- [x] Nenhuma emissao NFS-e real, scraping, provider municipal ou certificado digital foi implementado.
