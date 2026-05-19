# Supabase Setup - Controlled Beta

## Objective
Prepare Supabase Auth and future Storage usage without introducing real fiscal issuance, scraping or provider integrations.

## Auth Checklist
- Configure the site URL for the active environment.
- Configure redirect URLs for `/auth/callback`.
- Use environment-specific URLs: local, preview, staging and production must not share an accidental callback target.
- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are scoped to the correct environment.
- Store `SUPABASE_SERVICE_ROLE_KEY` only in Vercel or Supabase secret management. Never commit it.
- Confirm `NEXT_PUBLIC_APP_ENV` is not `Local` outside local development.

## Email And Templates
- Keep templates neutral and operational.
- Do not include CPF, CNPJ, document names, storage paths or tenant internals in email templates.
- Validate invitation and recovery flows with fictitious users before beta.

## Storage Policy
Supabase Storage remains future-facing for this beta track. Until explicit implementation:

- no signed upload URLs are exposed;
- no storage path is accepted from client payloads;
- no production document download is enabled;
- storage paths remain server-generated and redacted in DTOs/audit.

## Database And RLS
The MVP uses application-layer tenant guards with Prisma. If Supabase RLS is introduced later, it must be covered by a separate ADR and tests. For this beta prep, Prisma migrations and application tenant isolation remain the source of truth.

## Required Gates
- GitHub Quality gates green.
- `npm run lint`.
- `npm run typecheck`.
- `npm test`.
- `npm run security:secrets`.
- `npx prisma validate`.
- `npm run build`.

## Explicit Non-Goals
- No real NFS-e issuance.
- No scraping.
- No municipal provider integration.
- No certificate handling.
- No fiscal queue/job execution.
