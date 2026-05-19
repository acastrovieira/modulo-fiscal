# Controlled Beta Pilot Readiness Plan - Sprint 39

## Status
Planned operational handoff after Sprint 38 release candidate.

Sprint 39 exists to move from a technical release candidate to a controlled pilot decision. It must not add real NFS-e issuance, scraping, municipal provider integration, certificate usage or fiscal background jobs.

## Objective
Prepare the first controlled beta pilot with 1-3 tenants by confirming ownership, environment readiness, access boundaries, smoke evidence and support procedures.

## Checklist
- [ ] Merge the Sprint 38 release candidate PR.
- [ ] Confirm GitHub `Quality gates` are green on `main`.
- [ ] Confirm staging/beta deployment uses the final merge commit.
- [ ] Assign product owner for beta go/no-go.
- [ ] Assign engineering owner for incident response.
- [ ] Assign support owner for tenant communication.
- [ ] Approve 1-3 beta tenants by name outside the repository.
- [ ] Approve beta users and roles using least privilege.
- [ ] Run the two-tenant manual smoke script from the Sprint 38 evidence pack.
- [ ] Capture screenshots without personal data.
- [ ] Capture safe logs and CI links.
- [ ] Review residual risks and mark each as accepted or blocking.
- [ ] Confirm rollback and database migration procedures.
- [ ] Record final go/no-go decision.

## Pilot Roles
| Responsibility | Required Before Pilot | Notes |
| --- | --- | --- |
| Product owner | Yes | Owns go/no-go and beta scope changes. |
| Engineering owner | Yes | Owns incident triage, rollback and hotfix decisions. |
| Support owner | Yes | Owns beta tenant communication and escalation. |
| QA owner | Recommended | Owns smoke evidence and regression checklist. |

## Entry Criteria
- Sprint 38 PR merged into protected `main`.
- Quality Gates green on `main`.
- No open P0/P1 issue.
- No known tenant isolation, audit, redaction or secret exposure incident.
- Staging/beta environment configured without committing secrets.
- Beta users and tenants approved outside the repository.

## Exit Criteria
- Manual smoke passes with at least two tenants.
- Evidence package contains commit hash, CI URL, smoke notes, safe screenshots and risk decision.
- Go/no-go is recorded.
- If GO, pilot window and rollback owner are documented.
- If NO-GO, blockers are converted into new sprint tasks.

## Recommended Squad
- Codex: release coordination, evidence capture, PR and regression gates.
- @pm/@po: beta tenants, go/no-go and scope control.
- @qa: manual smoke, negative flows and evidence review.
- @devops: Vercel/Supabase environment, deployment and rollback.
- Seguranca/LGPD: redaction, tenant isolation and data handling review.

