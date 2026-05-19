# Beta Readiness Checklist - VetFiscal OS

## Status
Scope frozen for controlled beta planning. Sprint 38 release candidate was merged, but real beta usage remains NO-GO until Sprint 39 external approvals and staging/beta smoke are completed.

Sprint 38 release candidate evidence is tracked in `docs/product/beta-release-candidate-evidence-pack.md`.

## Scope Control
- [x] Beta tenants are explicitly listed as controlled/fictitious placeholders in `docs/product/beta-scope-freeze.md`.
- [ ] Real beta tenants are approved for go-live.
- [ ] Real beta users are named and assigned least-privilege roles.
- [x] Product confirms no real NFS-e issuance in beta scope.
- [x] Product confirms no scraping and no municipal provider integration.
- [ ] Support owner and engineering owner are defined for the release candidate.

## Technical Gates
- [x] GitHub `Quality gates` check is green.
- [x] `npm run lint` passed.
- [x] `npm run typecheck` passed.
- [x] `npm test` passed.
- [x] `npm run build` passed.
- [x] `npx prisma validate` passed.
- [ ] Working tree is clean before release.

## Security And LGPD
- [x] `.env` is not versioned.
- [x] `.env.example` contains only local/fictitious values.
- [x] `SENTRY_DSN` remains empty unless future ADR/configuration approves it.
- [x] Public API errors keep `{ error: { code, message, requestId } }`.
- [x] DTOs do not expose raw payloads, full CPF/CNPJ, email, phone or storage path.
- [x] Tenant isolation regression tests are green.

## Operational Readiness
- [ ] `/api/health` returns public readiness without secrets.
- [ ] Observability policy reviewed.
- [ ] Runbook of import failure reviewed.
- [ ] Runbook of stuck batch reviewed.
- [ ] Runbook of tenant isolation incident reviewed.
- [x] Beta release runbook reviewed.
- [x] Beta pilot smoke runbook created.
- [ ] Residual risk matrix reviewed and accepted or blocked.

## Evidence To Attach To PR Or Release Note
- [x] Release candidate evidence pack.
- [x] Final Sprint 38 merge commit hash.
- [x] CI URL after PR creation.
- [x] Gate outputs or summary.
- [ ] Known risks and accepted mitigations.
- [ ] Explicit confirmation that NFS-e real remains disabled.
