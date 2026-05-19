# Sprint 31 - RBAC Matrix e Flow Permissions

## Objetivo
Fechar a matriz de permissoes por fluxo, papel e estado para garantir que o beta fiscal supervisionado continue API-first, tenant-scoped e sem acoes criticas abertas por engano.

## Entregas
- [x] Documentada a matriz de roles, comandos e permissoes em `docs/architecture/rbac-flow-permissions.md`.
- [x] Validado que todo comando declarado aparece na matriz de fluxo.
- [x] Validado que todo comando mapeia para permissao backend existente.
- [x] Criados testes negativos por papel para comandos criticos.
- [x] Criados testes para impedir `tenantId` controlado pelo cliente em schemas fiscais.
- [x] Documentada excecao segura de `tenant.switch`, onde `tenantId` representa tenant de destino validado por membership.

## Gates
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run security:secrets`
- [x] `npx prisma validate`
- [x] `npm run build`

## Fora de Escopo
- Criar novos papeis.
- Criar nova tela de administracao.
- Alterar regra fiscal de estados.
- Emissao real de NFS-e, scraping, provider municipal ou certificado digital.
