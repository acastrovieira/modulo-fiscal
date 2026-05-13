# Story - Sprint 2 Fundacao RBAC, Tenant e Auditoria

## Status
Done

## Objetivo
Garantir que comandos futuros do MVP nascam com usuario, tenant, permissao backend, correlation id, contrato de auditoria e erros previsiveis.

## Tarefas
- [x] Revisar `currentUser` e `currentTenant` para uso em comandos backend.
- [x] Revisar matriz RBAC inicial por role.
- [x] Mapear permissao exigida para cada comando do PRD.
- [x] Padronizar assinatura de comandos com `tenantId`, `actorId`, `correlationId` e role.
- [x] Criar contrato para audit trail em commands.
- [x] Criar padrao de erro para unauthorized, forbidden, tenant mismatch e estado invalido.
- [x] Criar fixtures de tenant, profile e role para testes.
- [x] Criar factory de usuarios/contextos por role.
- [x] Expandir testes de `assertPermission`.
- [x] Expandir testes de `assertTenantScope`.
- [x] Testar mock padrao de `audit.record`.

## Criterios de Aceite
- [x] Todo comando planejado tem permissao definida.
- [x] Testes de permissao cobrem roles fiscais principais.
- [x] Testes de tenant scope cobrem caso positivo, negativo e colecao.
- [x] `audit.record` tem contrato claro para services.
- [x] `correlationId` e exigido ou gerado em transicoes criticas.

## Fora de Escopo
- Services de importacao.
- APIs publicas.
- UI operacional.
- Emissao real de NFS-e.