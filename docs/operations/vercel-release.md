# Vercel Release Prep

## Objective
Define the controlled Vercel release path for VetFiscal OS beta without committing secrets or bypassing GitHub Quality gates.

## Project Mapping
- Preview deployments are created from pull request branches.
- Staging should use an explicitly scoped preview/staging environment.
- Production promotion requires a go/no-go decision and no P0/P1 beta blockers.

## Environment Variables
Use Vercel environment variables instead of committed env files.

Recommended local sync:
```bash
vercel link --yes
vercel env pull .env.local --yes
npm run security:secrets
```

Never commit `.env.local`, `.vercel/project.json`, service role keys, database credentials, tokens or provider credentials.

## Release Gates
- Pull request targets protected `main`.
- GitHub `Quality gates` check is green.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm test` passed.
- `npm run security:secrets` passed.
- `npx prisma validate` passed.
- `npm run build` passed.
- `NEXT_PUBLIC_APP_ENV` is `Staging`, `Homologação` or `Produção`, never `Local`.
- Safety flags remain disabled: real NFS-e, scraping and municipal provider.

## Rollback
Use Vercel rollback or promote the last known-good deployment. Database changes are handled through forward-fix unless a rollback plan was explicitly approved before migration.

Commands for operators:
```bash
vercel ls
vercel inspect <deployment-url>
vercel logs <deployment-url>
vercel rollback
```

## Post-Deploy Smoke
- `/api/health` returns a public health report without secrets.
- `/dashboard` renders.
- Workflow pages render: imports, candidates, inconsistencies, batches, audit, documents.
- API errors keep `{ error: { code, message, requestId } }`.
- No real NFS-e issuance, scraping, provider calls, certificates or fiscal queues run.
