# Controlled Beta Pilot Evidence Log - Sprint 39

## Status
Pilot readiness documentation prepared.

Current decision: NO-GO for real beta usage until owners, approved tenants, staging/beta deployment and two-tenant manual smoke are completed.

## Confirmed Evidence
| Evidence | Status | Details |
| --- | --- | --- |
| Sprint 38 PR | Merged | PR #24 merged on 2026-05-19. |
| Sprint 38 merge commit | Captured | `5c14c9eef1cec88c70d07520afd1ff7928193728`. |
| Sprint 38 Quality Gates | Passed | `https://github.com/acastrovieira/modulo-fiscal/actions/runs/26103778717/job/76761820308` |
| Release candidate evidence pack | Present | `docs/product/beta-release-candidate-evidence-pack.md` |
| Pilot readiness plan | Present | `docs/product/beta-pilot-readiness-plan.md` |
| Beta runbook | Present | `docs/operations/runbooks/beta-release.md` |
| Sprint 39 local lint | Passed | `npm run lint` passed on 2026-05-19. |
| Sprint 39 local typecheck | Passed | `npm run typecheck` passed on 2026-05-19. |
| Sprint 39 local tests | Passed | `npm test` passed on 2026-05-19 with 305 tests. |
| Sprint 39 secret scanner | Passed | `npm run security:secrets` found no potential secrets. |
| Sprint 39 Prisma validate | Passed | `npx prisma validate` passed with local/demo `DATABASE_URL`. |
| Sprint 39 production build | Passed | `npm run build` passed on 2026-05-19. |
| Sprint 41 setup template | Present | `docs/product/beta-users-roles-tenant-setup.md` |
| Sprint 42 smoke evidence template | Present | `docs/product/two-tenant-smoke-evidence.md` |

## Pending Evidence Before Real Pilot
| Evidence | Required Owner | Status |
| --- | --- | --- |
| Product owner named | @pm/@po | Pending |
| Engineering owner named | Engineering | Pending |
| Support owner named | Support | Pending |
| Approved beta tenants | @pm/@po | Pending |
| Approved beta users and roles | @pm/@po + Security/LGPD | Pending |
| Staging/beta deployment URL | @devops | Pending |
| Supabase staging/beta auth redirects checked | @devops | Pending |
| Database migrations applied in staging/beta | @devops | Pending |
| Two-tenant manual smoke evidence | @qa | Pending |
| Safe screenshots without personal data | @qa | Pending |
| Final go/no-go decision | @pm/@po | Pending |

## Manual Smoke Evidence Template
Use this template when the staging/beta environment is available.

| Step | Expected Result | Result | Evidence Link |
| --- | --- | --- | --- |
| Sign in as approved user | Authenticated session without raw error | Pending | Pending |
| Confirm active tenant badge | Correct tenant and environment badge | Pending | Pending |
| Open dashboard | Operational cockpit renders | Pending | Pending |
| Open imports | Tenant-scoped data only | Pending | Pending |
| Open candidates | Masked sensitive fields | Pending | Pending |
| Open inconsistencies | Workflow actions gated by role | Pending | Pending |
| Open batches | No real issuance action | Pending | Pending |
| Open audit | Redacted tenant-scoped audit | Pending | Pending |
| Switch to second tenant | Tenant context changes safely | Pending | Pending |
| Try cross-tenant direct URL | Request is blocked without enumeration | Pending | Pending |

## No-Go Conditions
- Any failed Quality Gate.
- Any P0/P1 tenant isolation, audit, redaction or secret exposure issue.
- Any unapproved real tenant or user.
- Any unredacted personal document, token, storage path or provider payload in public evidence.
- Any enabled path for real NFS-e issuance, scraping, municipal provider calls, certificates or fiscal jobs.
