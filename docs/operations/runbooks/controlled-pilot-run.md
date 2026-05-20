# Runbook - Controlled Pilot Run

## Objective
Run an accompanied VetFiscal OS beta pilot with 1-3 approved tenants after Sprint 44 records GO or GO with restrictions.

This runbook must not be used to enable real NFS-e issuance, scraping, municipal providers, certificates or fiscal background jobs.

## Entry Criteria
- [ ] Sprint 44 decision is GO or GO with restrictions.
- [ ] Product, engineering, support, QA and rollback owners are named.
- [ ] Approved tenants and users are recorded outside the repository.
- [ ] Staging/beta deployment URL is recorded.
- [ ] Two-tenant smoke passed against the deployed build.
- [ ] Rollback path is documented and owner is available.
- [ ] No P0/P1 remains open.

## Opening Checklist
- [ ] Confirm final commit hash and deploy URL.
- [ ] Confirm GitHub Quality Gates are green.
- [ ] Confirm Supabase Auth redirects match the beta URL.
- [ ] Confirm database migrations are applied.
- [ ] Confirm real fiscal feature flags are false.
- [ ] Confirm only approved users can authenticate.
- [ ] Confirm user without membership cannot access dashboard.
- [ ] Confirm suspended user cannot access tenant.
- [ ] Confirm evidence capture rules with QA and support.

## Daily Pilot Check
| Check | Expected Result | Owner | Status |
| --- | --- | --- | --- |
| Login and logout | Approved users can enter and leave safely | QA | Pending |
| Tenant switch | User only sees approved tenants | QA | Pending |
| Cockpit summary | Dashboard renders without P0/P1 | QA | Pending |
| Imports | Demo or approved data only | QA | Pending |
| Candidates | Sensitive fields masked | QA/Security | Pending |
| Inconsistencies | Actions follow role and workflow | QA | Pending |
| Batches | No real issuance action exists | QA | Pending |
| Audit | Events are tenant-scoped and redacted | Security/LGPD | Pending |
| Support feedback | Issues recorded with severity | Support | Pending |
| Rollback readiness | Owner and route still available | DevOps | Pending |

## Feedback Intake
Every pilot feedback item must include:
- Date and time.
- Tenant alias, not real public identifier.
- User role, not personal document.
- Workflow area.
- Severity: P0, P1, P2 or P3.
- Reproduction steps.
- Safe screenshot or redacted note.
- Owner and next action.

## Incident Severity
| Severity | Definition | Pilot Action |
| --- | --- | --- |
| P0 | Tenant leak, secret leak, real fiscal action or data exposure | Stop pilot immediately |
| P1 | Login broken, critical workflow blocked or audit missing | Pause affected workflow |
| P2 | Important usability or workflow issue with workaround | Continue with restriction |
| P3 | Minor UX, copy or documentation issue | Track for stabilization |

## Stop Conditions
- Cross-tenant data exposure.
- Unredacted sensitive data in UI, logs, screenshots or evidence.
- Real NFS-e, scraping, municipal provider, certificate or fiscal job path appears.
- Authentication or tenant switch becomes unreliable.
- Audit trail for critical action is missing.
- Rollback owner is unavailable during pilot window.

## Closure Report Template
| Field | Value |
| --- | --- |
| Pilot window | Pending |
| Tenants included | Pending private register |
| Users included | Pending private register |
| Final commit | Pending |
| Deployment URL | Pending |
| Quality Gates URL | Pending |
| Smoke result | Pending |
| P0/P1 count | Pending |
| P2/P3 count | Pending |
| Feedback themes | Pending |
| Decision after pilot | Pending |
| Next sprint | Sprint 46 - Pilot Findings and Stabilization |

## Exit Criteria
- [ ] Pilot window closes without P0/P1 incident.
- [ ] Feedback is categorized and prioritized.
- [ ] Findings are converted into Sprint 46 tasks.
- [ ] Evidence log is updated.
- [ ] Owners agree on next beta cycle, stabilization or NO-GO.

