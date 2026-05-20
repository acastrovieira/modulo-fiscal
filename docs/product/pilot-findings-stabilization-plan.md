# Pilot Findings and Stabilization Plan - Sprint 46

## Status
Prepared for use after the controlled pilot run.

This document does not authorize production usage or real fiscal operation. It defines how VetFiscal OS should handle findings from a controlled pilot before any beta expansion.

## Objective
Transform pilot findings into a safe stabilization cycle with explicit severity, ownership, regression evidence and release criteria.

## Finding Severity
| Severity | Definition | Required Action | Release Impact |
| --- | --- | --- | --- |
| P0 | Tenant leak, secret leak, real fiscal action, data exposure or destructive data loss | Stop pilot, escalate immediately and fix before any access resumes | Blocks all beta usage |
| P1 | Critical workflow unavailable, audit missing for critical action, login/tenant switch unreliable | Pause affected workflow and fix before next pilot session | Blocks next beta cycle |
| P2 | Important workflow friction, misleading copy, role mismatch with workaround or non-critical operational gap | Prioritize in stabilization sprint or accept with owner sign-off | Can allow restricted beta |
| P3 | Minor UX, wording, documentation or nice-to-have issue | Backlog with product priority | Does not block beta |

## Intake Fields
Every finding must capture:
- Finding id.
- Date and time.
- Tenant alias, never public real identifier.
- User role, never personal document.
- Workflow area.
- Severity.
- Reproduction steps.
- Expected result.
- Actual result.
- Safe evidence link.
- Owner.
- Status.
- Regression requirement.
- Accepted-risk decision, if not fixed.

## Stabilization Board
| Column | Meaning |
| --- | --- |
| Intake | Finding captured but not triaged |
| Triage | Severity and owner under review |
| Fixing | Code, docs or environment change in progress |
| QA Review | Regression evidence being collected |
| Product Review | Product owner accepts fix or residual risk |
| Done | Merged with gates green and evidence logged |
| Backlog | Accepted for later cycle with owner approval |

## Regression Expectations
- P0/P1: add or update automated tests where feasible and run full gates.
- Tenant isolation: add negative test for direct id access, tenant switch or membership edge.
- LGPD/redaction: add test that fails on raw CPF/CNPJ, token, storage path or raw payload.
- RBAC: add role-negative test and confirm backend remains the enforcement layer.
- UX confusion: update copy, empty state or runbook and add release smoke assertion when appropriate.
- Environment/deploy: update runbook and record rollback or forward-fix evidence.

## Post-Pilot Release Candidate Criteria
- [ ] No P0/P1 remains open.
- [ ] P2 issues are fixed or accepted by product owner.
- [ ] Regression gates are green.
- [ ] Evidence log includes final commit, CI URL, deploy URL and safe screenshots if available.
- [ ] Runbooks reflect pilot learnings.
- [ ] Residual risk matrix is updated.
- [ ] Decision is recorded: expand beta, repeat pilot, pause beta or return to stabilization.

## Non-Negotiable Blocks
- No real NFS-e issuance.
- No scraping.
- No municipal provider integration.
- No certificate usage.
- No fiscal queue or external fiscal job.
- No real personal data in repository docs, screenshots or logs.

