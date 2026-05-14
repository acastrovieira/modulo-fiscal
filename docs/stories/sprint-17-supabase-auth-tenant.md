# Sprint 17 - Supabase Auth, Tenant Real e Sessao Segura

## Status
Concluida.

## Objetivo
Preparar autenticacao server-side com Supabase Auth e resolver tenant/role reais por `Profile` e `TenantMembership`, preservando fallback local seguro para desenvolvimento e testes.

## Entregas
- Branch `codex/sprint-17-supabase-auth-tenant` criada a partir de `main`.
- Adapter Supabase server-side com `createServerClient` e `auth.getUser()`.
- Middleware Supabase para refresh/propagacao segura de cookies quando Supabase estiver configurado.
- `currentSession()` cacheado e atomico para resolver usuario e tenant em uma fronteira unica.
- `currentUser()` resolvendo `Profile ACTIVE` pelo id do usuario autenticado.
- `currentTenant()` resolvendo `TenantMembership ACTIVE` + `Tenant ACTIVE`.
- Role efetiva derivada exclusivamente da membership ativa.
- Cookie `vetfiscal.activeTenantId` validado como UUID antes de uso.
- Fallback local limitado a `NODE_ENV=test` ou `NEXT_PUBLIC_APP_ENV=Local`.
- `CommandContext` e resumo operacional usando `currentSession()`.
- Testes de perfil desativado, usuario sem membership, cookie invalido, fallback local explicito e ausencia de fallback em env faltante.
- Documentacao de fronteira auth/tenant/RBAC.

## Fora De Escopo Intencional
- Tela real de login/logout.
- Callback OAuth/password reset.
- Endpoint de troca de tenant ativo.
- Convites e gestao de memberships.
- Uso de `SUPABASE_SERVICE_ROLE_KEY`.
- Supabase Storage.

## Checklist De Aceite
- [x] Supabase Auth server-side preparado.
- [x] Sessao sem Supabase configurado fora de Local/test retorna erro previsivel.
- [x] Usuario autenticado precisa de `Profile ACTIVE`.
- [x] Tenant ativo precisa de membership ativa e tenant ativo.
- [x] Role vem da membership, nao do client.
- [x] Cookie de tenant invalido nao chega ao repository.
- [x] Fallback OWNER local nao liga quando env esta ausente fora de teste.
- [x] Gates locais verdes.

## Riscos Residuais Para Sprint 18
- Criar endpoint server-side para trocar tenant ativo e setar cookie seguro.
- Criar login/logout UI e callback Supabase.
- Revisar repositories legados que ainda fazem lookup global por `id` antes do `assertTenantScope`.
- Separar permissao futura `documents.view` de `documents.download`.

## Agentes/Squads
- @architect: revisou fronteiras auth/tenant/RBAC e recomendou `currentSession()`.
- Segurança/LGPD: revisou fallback local, cookies, service role e secrets.
- @qa: revisou cenarios negativos de profile/membership/tenant.
- Codex: implementou, testou e integrou a sprint.
