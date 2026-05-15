# Sprint 18 - Tenant Admin, Convites e Gestao de Memberships

## Status
Concluida em branch `codex/sprint-18-tenant-admin-memberships`.

## Objetivo
Criar a base segura para administracao de tenants, troca de tenant ativo, convites supervisionados e gestao inicial de memberships sem abrir CRUD generico e sem usar service role ou envio real de e-mail.

## Entregas
- Endpoint `GET /api/tenants` para listar tenants acessiveis pela membership ativa do usuario.
- Endpoint `POST /api/tenants/switch` para trocar tenant ativo apos validacao server-side e setar cookie `HttpOnly`, `SameSite=Lax`, `Secure` em producao e TTL explicito.
- Endpoints `GET /api/tenant/members`, `POST /api/tenant/members`, `POST /api/tenant/invites` e `POST /api/tenant/members/[id]/suspend` com RBAC backend.
- Modelo `TenantInvite` com token armazenado apenas como hash, expiracao e status.
- Tela `/dashboard/tenant` para tenant ativo, membros e registro de convites supervisionados.
- Login `/login`, `POST /api/auth/login`, `POST /api/auth/logout` e callback `/auth/callback` usando Supabase anon key server-side, sem service role.
- Auditoria para troca de tenant, convite registrado e suspensao de membership.

## Decisoes
- Convite de `OWNER` fica fora do fluxo desta sprint.
- Convites sao registrados, mas envio real de e-mail fica fora desta sprint.
- Aceite de convite, revogacao, reenvio e alteracao de role ficam para sprints futuras.
- Service role continua fora do client e nao foi usado nesta sprint.

## Checklist QA/LGPD
- [x] Tenant switch valida membership ativa e tenant ativo antes do cookie.
- [x] Cookie de tenant ativo possui flags server-side seguras.
- [x] APIs administrativas usam `currentSession`/`createCommandContext`, nunca `tenantId` do client como escopo.
- [x] Convite armazena hash do token, nao token puro.
- [x] Auditoria usa e-mail mascarado em metadata de convite.
- [x] Backend bloqueia roles sem permissao de Tenant Admin.
- [x] Backend bloqueia auto-suspensao e suspensao do ultimo OWNER ativo.
- [x] Nenhuma emissao NFS-e real, scraping, provider fiscal ou certificado digital foi introduzido.

## Gates Executados
- `npx prisma validate` com `DATABASE_URL` local ficticia para validacao.
- `npx prisma generate --no-engine` para atualizar tipos sem tocar engine travado.
- `npm run typecheck`.
- `npm test`.

## Fora De Escopo
- Envio real de e-mail de convite.
- Aceite/revogacao/reenvio de convite.
- Promocao ou transferencia de OWNER.
- Rate limit persistente por IP/tenant.
- E2E Playwright.
