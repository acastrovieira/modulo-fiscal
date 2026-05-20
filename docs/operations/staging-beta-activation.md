# Staging/Beta Activation - Sprint 40

## Objective
Activate a controlled staging/beta environment for VetFiscal OS without committing secrets and without enabling real fiscal execution.

## Current Decision
Use a Vercel preview/staging-style environment first. Do not promote to production and do not enable real beta users until the Sprint 42 two-tenant smoke passes.

## Required Provider-Side Variables
Configure these only in Vercel/Supabase environment management. Do not commit pulled env files.

| Variable | Scope | Required | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Server | Yes | Staging/beta database, never local or production unless explicitly approved. |
| `DIRECT_URL` | Server | Recommended | Required when Prisma migrations need direct DB access. |
| `NEXT_PUBLIC_APP_ENV` | Browser | Yes | `Staging` or `Homologacao`. Never `Local`. |
| `NEXT_PUBLIC_APP_URL` | Browser | Yes | HTTPS deployment URL. |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | Yes | Staging/beta Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser | Yes | Public anon key for staging/beta. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Optional | Secret manager only. Not required for the current app path. |
| `SENTRY_DSN` | Server | Optional | Keep empty until observability is approved. |
| `FEATURE_REAL_NFSE_ENABLED` | Server | Yes | Must be `false`. |
| `FEATURE_SCRAPING_ENABLED` | Server | Yes | Must be `false`. |
| `FEATURE_MUNICIPAL_PROVIDER_ENABLED` | Server | Yes | Must be `false`. |

## Activation Checklist
- [ ] Confirm PR #26 is merged into `main`.
- [ ] Link local workspace to the correct Vercel project with `vercel link --yes`.
- [ ] Configure provider-side env vars in Vercel.
- [ ] Pull env vars locally into `.env.local` with `vercel env pull .env.local --yes`.
- [ ] Run `npm run ops:check-beta-env -- .env.local`.
- [ ] Run `npm run security:secrets`.
- [ ] Apply staging/beta migrations with an approved database URL.
- [ ] Deploy preview/staging from the Sprint 40 branch or protected staging branch.
- [ ] Confirm `/api/health` returns public health without secrets.
- [ ] Confirm `/login` renders.
- [ ] Confirm authenticated `/dashboard` renders with the expected environment badge.

## Supabase Auth Checklist
- [ ] Configure Site URL to the staging/beta HTTPS URL.
- [ ] Configure redirect URL ending in `/auth/callback`.
- [ ] Confirm local, preview, staging and production callbacks are environment-specific.
- [ ] Confirm invitation/recovery emails do not include CPF, CNPJ, storage path, raw payload or tenant internals.
- [ ] Validate login/logout with fictitious users before approving real beta users.

## Migration Checklist
- [ ] Confirm target database is staging/beta.
- [ ] Run `npx prisma validate`.
- [ ] Review pending migrations before applying them.
- [ ] Apply migrations with the approved staging/beta connection.
- [ ] Record migration command, timestamp and operator in the pilot evidence log.
- [ ] Prefer forward-fix for failures unless a rollback plan was approved before migration.

## No-Go Conditions
- `NEXT_PUBLIC_APP_ENV=Local` in Vercel preview/staging/beta.
- `DATABASE_URL` points to localhost or production by accident.
- Any required env var is missing.
- Any real fiscal safety flag is true.
- Any secret appears in repository files, screenshots, PR comments or logs.
- Any path enables real NFS-e issuance, scraping, municipal provider calls, certificates or fiscal jobs.

## Evidence To Capture
- Vercel deployment URL.
- GitHub Quality Gates URL.
- Commit hash.
- `npm run ops:check-beta-env -- .env.local` result without printing env values.
- `/api/health` result with no secrets.
- Login/dashboard smoke notes.

