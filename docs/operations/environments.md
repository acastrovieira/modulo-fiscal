# Environments - VetFiscal OS

## Objective
Define the operational matrix for local, preview, staging and production before a controlled beta. This document is a release gate: no beta tenant should be onboarded while environment ownership, secrets and safety flags are ambiguous.

## Matrix
| Environment | Purpose | Data Policy | Deploy Source | Required Gates |
| --- | --- | --- | --- | --- |
| Local | Developer workflow and deterministic demo seed | Fictitious/demo only | Local machine | `npm run lint`, `npm run typecheck`, `npm test`, `npx prisma validate` |
| Preview | Pull request validation | Fictitious/demo only unless explicitly approved | Vercel preview branch | GitHub Quality gates, no secrets in repo, safety flags disabled |
| Staging | Controlled beta rehearsal | Synthetic or approved beta-like data only | Protected staging branch or promoted preview | Quality gates, smoke test, migrations reviewed |
| Production | Future commercial operation | Real data only after beta go/no-go | Protected `main`/production promotion | Quality gates, go/no-go, migration approval, rollback owner |

## Required Variables
- `DATABASE_URL`: server-only database connection string.
- `DIRECT_URL`: server-only direct database URL for Prisma migrations when needed.
- `NEXT_PUBLIC_APP_ENV`: one of `Local`, `Staging`, `Homologação`, `Produção`.
- `NEXT_PUBLIC_APP_URL`: public app URL for redirects.
- `NEXT_PUBLIC_SUPABASE_URL`: public Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only secret, never browser, never git.
- `SENTRY_DSN`: empty/inactive until future observability approval.
- `FEATURE_REAL_NFSE_ENABLED`: must remain `false`.
- `FEATURE_SCRAPING_ENABLED`: must remain `false`.
- `FEATURE_MUNICIPAL_PROVIDER_ENABLED`: must remain `false`.

## Hard Rules
- `NEXT_PUBLIC_APP_ENV=Local` is forbidden in Vercel preview, staging and production.
- `.env.local` and Vercel-pulled env files are never committed.
- Preview deployments must not point to production database credentials.
- Service role keys are configured only in Vercel/Supabase secret managers.
- No real NFS-e issuance, scraping, municipal provider calls, certificates or fiscal queues are enabled in beta.

## Setup Commands
```bash
npm ci
npx prisma generate
npm run lint
npm run typecheck
npm test
npm run security:secrets
npx prisma validate
npm run build
```

Use `vercel env pull .env.local --yes` only after the project is linked to the correct Vercel project. Re-run the secret scanner after any environment file operation.
