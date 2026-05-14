# Beta Readiness Checklist - VetFiscal OS

## Status
Ready for controlled review. Must be rechecked immediately before beta go-live.

## Scope Control
- [ ] Beta tenants are explicitly listed and approved.
- [ ] Beta users are named and assigned least-privilege roles.
- [ ] Product confirms no real NFS-e issuance in beta scope.
- [ ] Product confirms no scraping and no municipal provider integration.
- [ ] Support owner and engineering owner are defined.

## Technical Gates
- [ ] GitHub `Quality gates` check is green.
- [ ] `npm run lint` passed.
- [ ] `npm run typecheck` passed.
- [ ] `npm test` passed.
- [ ] `npm run build` passed.
- [ ] `npx prisma validate` passed.
- [ ] Working tree is clean before release.

## Security And LGPD
- [ ] `.env` is not versioned.
- [ ] `.env.example` contains only local/fictitious values.
- [ ] `SENTRY_DSN` remains empty unless future ADR/configuration approves it.
- [ ] Public API errors keep `{ error: { code, message, requestId } }`.
- [ ] DTOs do not expose raw payloads, full CPF/CNPJ, email, phone or storage path.
- [ ] Tenant isolation regression tests are green.

## Operational Readiness
- [ ] `/api/health` returns public readiness without secrets.
- [ ] Observability policy reviewed.
- [ ] Runbook of import failure reviewed.
- [ ] Runbook of stuck batch reviewed.
- [ ] Runbook of tenant isolation incident reviewed.
- [ ] Beta release runbook reviewed.
- [ ] Residual risk matrix reviewed and accepted or blocked.

## Evidence To Attach To PR Or Release Note
- [ ] Commit hash.
- [ ] CI URL.
- [ ] Gate outputs or summary.
- [ ] Known risks and accepted mitigations.
- [ ] Explicit confirmation that NFS-e real remains disabled.
