# Database Migrations

## Objective
Define how VetFiscal OS applies Prisma migrations across local, staging and future production environments.

## Local
Developers may use:
```bash
npx prisma migrate dev
npm run db:seed
```

Destructive reset is allowed only against local/demo databases:
```bash
npx prisma migrate reset
```

## Staging And Production
Use reviewed migrations only:
```bash
npx prisma migrate deploy
npx prisma validate
```

Before applying migrations:
- confirm the target environment;
- confirm the database URL is not local by mistake;
- confirm GitHub Quality gates are green;
- confirm backup/restore ownership;
- confirm beta safety flags remain disabled;
- confirm no real NFS-e issuance, scraping or provider integration is enabled.

## Rollback Policy
Prefer forward-fix migrations. Schema rollback must be planned before deploy, with a named owner and data impact review. Do not use `migrate reset` outside local/demo.

## Evidence To Capture
- commit hash;
- migration directory names;
- CI URL;
- command output summary;
- reviewer/approver;
- rollback or forward-fix decision.

## Blockers
- Missing `DATABASE_URL` or ambiguous environment.
- `NEXT_PUBLIC_APP_ENV=Local` in preview/staging/production.
- Secrets present in git.
- P0/P1 tenant isolation, audit, LGPD or data leakage issue.
