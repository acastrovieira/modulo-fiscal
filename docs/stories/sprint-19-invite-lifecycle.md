# Sprint 19 - Invite Lifecycle e Aceite Seguro

## Status
Concluida em branch `codex/sprint-19-invite-lifecycle`.

## Objetivo
Completar o ciclo de vida operacional de convites do Tenant Admin sem service role, sem envio real de e-mail e sem CRUD generico.

## Entregas
- `GET /api/tenant/invites` lista convites do tenant ativo com e-mail mascarado.
- `POST /api/tenant/invites/[id]/resend` regenera token/hash, renova expiracao e volta `EXPIRED` para `PENDING`.
- `POST /api/tenant/invites/[id]/revoke` revoga convite `PENDING` de forma idempotente para `REVOKED`.
- `POST /api/tenant/invites/accept` aceita convite com token no body e usuario Supabase autenticado, sem exigir tenant ativo.
- Aceite cria/ativa `Profile` e `TenantMembership` em transacao Prisma.
- Auditoria cobre `tenant_invite.created`, `tenant_invite.resent`, `tenant_invite.revoked`, `tenant_invite.expired` e `tenant_invite.accepted`.
- UI `/dashboard/tenant` exibe convites, status, expiracao, reenvio e revogacao.
- Migration adiciona indice unico parcial para um convite `PENDING` por tenant/e-mail, preservando historico.

## Decisoes
- Token bruto nao e retornado por APIs administrativas; envio real fica fora desta sprint.
- Aceite exige usuario autenticado e e-mail igual ao convite normalizado.
- Convite de `OWNER` segue bloqueado.
- Membership `SUSPENDED` nao pode ser reativada por aceite de convite.
- Reenvio de convite aceito ou revogado e bloqueado.

## Gates Esperados
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npx prisma validate`
- `npm run build`

## Fora De Escopo
- Envio real de e-mail.
- Templates transacionais.
- Supabase service role/admin invite.
- Rate limit persistente.
- Transferencia/promocao de OWNER.
