# Beta Release Candidate Evidence Pack - Sprint 38

## Status
Release candidate technical package prepared.

The beta is not approved for real users until the pull request is merged, GitHub Quality Gates are green, pilot owners are named, and controlled beta tenants are explicitly approved.

## Release Candidate Scope
- Controlled beta for 1-3 approved tenants.
- Supervised fiscal workflow only.
- Import review, candidate review, inconsistencies, batches, internal simulation, audit and documents.
- No real NFS-e issuance.
- No scraping.
- No municipal provider integration.
- No certificate usage.
- No fiscal queue or external fiscal job execution.

## Evidence Summary
| Evidence | Status | Notes |
| --- | --- | --- |
| Base commit | Captured | `f3df1c8` before Sprint 38 changes. |
| Pull request commit | Captured | Sprint 38 merge commit `5c14c9eef1cec88c70d07520afd1ff7928193728`. |
| CI URL | Captured | `https://github.com/acastrovieira/modulo-fiscal/actions/runs/26103778717/job/76761820308` |
| Local lint | Passed | `npm run lint` passed on 2026-05-19. |
| Local typecheck | Passed | `npm run typecheck` passed on 2026-05-19. |
| Local tests | Passed | `npm test` passed on 2026-05-19 with 305 tests. |
| Secret scanner | Passed | `npm run security:secrets` found no potential secrets. |
| Prisma validate | Passed | `npx prisma validate` passed with local/demo `DATABASE_URL`. |
| Production build | Passed | `npm run build` passed on 2026-05-19. |
| Manual two-tenant smoke | Pending external beta env | Must be repeated in staging/beta before real pilot. |

## Required Gate Commands
```bash
npm run lint
npm run typecheck
npm test
npm run security:secrets
npx prisma validate
npm run build
```

## Manual Smoke Script
Run this with two controlled tenants in a staging/beta environment after the PR is merged and environment variables are configured.

1. Sign in as an approved OWNER or ADMIN.
2. Confirm the active tenant badge and environment badge.
3. Switch to Tenant A and open dashboard, imports, candidates, inconsistencies, batches, audit and documents.
4. Confirm Tenant A records are visible and sensitive fields are masked.
5. Switch to Tenant B and repeat the same route checks.
6. Try to open a direct URL for a Tenant A resource while Tenant B is active.
7. Confirm the request is blocked without leaking whether the resource exists.
8. Validate that audit events are tenant-scoped and redacted.
9. Confirm there is no action, label or response implying real NFS-e issuance.

## Go/No-Go Decision
Current decision: NO-GO for real beta users.

Reasons:
- Sprint 38 PR is merged and validated by GitHub Quality Gates.
- Real beta tenants and beta users are not named in the repository.
- Support owner, engineering owner and rollback owner still require explicit assignment.
- Manual smoke with two tenants must run in staging/beta with the final deployed build.

## Accepted Residual Risks
| Risk | Status | Mitigation |
| --- | --- | --- |
| Some repository methods still use global ids before tenant scoping in service code | Accepted for RC only | Covered by tenant isolation tests and documented as a hardening target. |
| No real email delivery for invites | Accepted | Beta can use supervised token handoff until email provider ADR exists. |
| No real fiscal provider or certificate | Intentional | Required by beta scope freeze. |
| Manual smoke depends on external staging/beta env | Accepted | Must be completed before enabling real pilot users. |

## Blocking Risks
- Any P0/P1 tenant isolation failure.
- Any unredacted CPF/CNPJ, token, storage path or provider payload in public DTOs, logs or audit views.
- Any enabled real NFS-e, scraping, municipal provider or certificate path.
- Any failed Quality Gate on the release candidate PR.

## Evidence Links
- Scope freeze: `docs/product/beta-scope-freeze.md`
- Readiness checklist: `docs/product/beta-readiness-checklist.md`
- Residual risks: `docs/product/beta-residual-risk-matrix.md`
- Tenant isolation evidence: `docs/security/tenant-isolation-evidence.md`
- Beta runbook: `docs/operations/runbooks/beta-release.md`
- Environment matrix: `docs/operations/environments.md`
- Vercel release runbook: `docs/operations/vercel-release.md`
- Supabase setup: `docs/operations/supabase-setup.md`
- Database migrations: `docs/operations/database-migrations.md`
- Sprint 39 pilot evidence log: `docs/product/beta-pilot-evidence-log.md`
- Pilot smoke runbook: `docs/operations/runbooks/beta-pilot-smoke.md`
