# Two-Tenant Smoke Evidence - Sprint 42

## Status
Smoke evidence template prepared. Manual smoke remains pending until staging/beta deployment and approved users are available.

## Objective
Validate the controlled beta journey with two tenants and prove that tenant isolation, RBAC, audit redaction and no-real-issuance guardrails hold in staging/beta.

## Environment Evidence
| Evidence | Status | Details |
| --- | --- | --- |
| Deployment URL | Pending | Capture staging/beta URL. |
| Commit hash | Pending | Capture deployed commit. |
| CI URL | Pending | Capture GitHub Quality Gates URL. |
| Environment validation | Pending | Run `npm run ops:check-beta-env -- .env.local`. |
| Supabase Auth redirects | Pending | Confirm staging/beta callback URLs. |
| Migration status | Pending | Capture migration command/date/operator externally. |

## Tenant A Journey
| Step | Expected Result | Status | Evidence |
| --- | --- | --- | --- |
| Login | Approved user signs in without raw error | Pending | Pending |
| Dashboard | Cockpit renders with correct tenant and environment badge | Pending | Pending |
| Imports | Tenant-scoped imports render | Pending | Pending |
| Candidates | Candidates render with masked sensitive fields | Pending | Pending |
| Inconsistencies | Workflow actions respect role permissions | Pending | Pending |
| Batches | No action implies real NFS-e issuance | Pending | Pending |
| Audit | Audit is tenant-scoped and redacted | Pending | Pending |
| Documents | Document metadata/download intent respects permissions | Pending | Pending |

## Tenant B Journey
| Step | Expected Result | Status | Evidence |
| --- | --- | --- | --- |
| Tenant switch | Active tenant changes safely | Pending | Pending |
| Dashboard | Cockpit renders only Tenant B context | Pending | Pending |
| Imports | Tenant A imports are not visible | Pending | Pending |
| Candidates | Tenant A candidates are not visible | Pending | Pending |
| Inconsistencies | Tenant A inconsistencies are not visible | Pending | Pending |
| Batches | Tenant A batches are not visible | Pending | Pending |
| Audit | Tenant A audit is not visible | Pending | Pending |
| Documents | Tenant A document metadata is not visible | Pending | Pending |

## Abuse Checks
| Check | Expected Result | Status | Evidence |
| --- | --- | --- | --- |
| Tenant A import URL while Tenant B active | Blocked without enumeration | Pending | Pending |
| Tenant A candidate URL while Tenant B active | Blocked without enumeration | Pending | Pending |
| Tenant A batch URL while Tenant B active | Blocked without enumeration | Pending | Pending |
| Suspended membership login/session | Blocked | Pending | Pending |
| User without membership dashboard access | Blocked | Pending | Pending |
| Public error body | `{ error: { code, message, requestId } }` only | Pending | Pending |

## Evidence Rules
- Use screenshots only with fictitious/demo or approved redacted data.
- Do not paste secrets, tokens, raw payloads, full CPF/CNPJ, storage paths or real e-mails.
- If a failure exposes cross-tenant data, stop the pilot and open a P0 blocker.
- If a failure enables or suggests real NFS-e issuance, stop the pilot and open a P0 blocker.

## Current Decision
NO-GO for real beta users until this smoke passes in staging/beta.

