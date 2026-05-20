# Controlled Beta Execution Roadmap - Sprints 40-47

## Status
Sprint 39 is merged into `main`. The project is ready to prepare a controlled staging/beta environment, but real beta usage remains blocked until owners, tenants, users, deployment and two-tenant smoke evidence are complete.

## Dashboard
| Sprint | Name | Status | Main gate |
| --- | --- | --- | --- |
| 40 | Staging/Beta Environment Activation | Next | Environment URL, login and healthcheck work without secrets in repo |
| 41 | Beta Users, Roles and Tenant Setup | Technically prepared | Approved users can authenticate with least-privilege roles |
| 42 | Two-Tenant Smoke Test | Technically prepared | Full journey passes with cross-tenant access blocked |
| 43 | UX/Test Feedback Hardening | Technically prepared | No P0/P1 and beta-facing UX is usable |
| 44 | Pilot Go/No-Go Pack | Technically prepared | Formal decision recorded with evidence |
| 45 | Controlled Pilot Run | Operationally prepared | 1-3 tenants complete pilot without critical incident |
| 46 | Pilot Findings and Stabilization | Technically prepared | Pilot findings triaged, fixed or converted into backlog |
| 47 | PRD Fiscal Real / Homologation | Planning prepared | No real fiscal implementation without PRD, ADR and approval |

## Sprint 40 - Staging/Beta Environment Activation
Objective: activate a real test environment without committing secrets.

Checklist:
- [ ] Choose target environment: Vercel Preview, Staging or Beta.
- [ ] Link the correct Vercel project to `modulo-fiscal`.
- [ ] Configure provider-side environment variables for database, Supabase and app environment.
- [ ] Keep real fiscal feature flags disabled.
- [ ] Validate pulled env vars with `npm run ops:check-beta-env -- .env.local`.
- [ ] Configure Supabase Auth URLs, callback, site URL, templates and authorized domain.
- [ ] Apply staging/beta database migrations.
- [ ] Run safe demo seed only if the environment is demo.
- [ ] Confirm `/api/health`, `/login` and authenticated `/dashboard`.

Gate:
- [ ] Environment is accessible.
- [ ] Login works.
- [ ] No secrets are versioned.
- [ ] No real fiscal feature is enabled.

Recommended squad: Codex, @devops and Security/LGPD.

Runbook:
- `docs/operations/staging-beta-activation.md`

## Sprint 41 - Beta Users, Roles and Tenant Setup
Objective: prepare controlled test access with least privilege.

Checklist:
- [x] Create alias-based tenant and user setup template.
- [x] Define least-privilege beta role matrix.
- [ ] Name product owner, engineering owner, support owner and optional QA owner.
- [ ] Approve 1-3 beta tenants outside the repository.
- [ ] Approve beta users outside the repository.
- [ ] Assign roles by least privilege.
- [ ] Create or validate memberships.
- [ ] Validate tenant switch.
- [ ] Confirm users without membership cannot access the dashboard.
- [ ] Confirm suspended users cannot access the tenant.
- [ ] Record evidence in `docs/product/beta-pilot-evidence-log.md`.

Gate:
- [ ] Users authenticate.
- [ ] Roles are coherent.
- [ ] No user sees the wrong tenant.

Recommended squad: Codex, @qa and Security/LGPD.

Runbook:
- `docs/product/beta-users-roles-tenant-setup.md`

## Sprint 42 - Two-Tenant Smoke Test
Objective: prove the full beta journey with two tenants.

Checklist:
- [x] Create two-tenant smoke evidence template.
- [x] Define Tenant A and Tenant B journey.
- [x] Define cross-tenant abuse checks.
- [x] Define safe screenshot/evidence rules.
- [ ] Run Tenant A journey: login, dashboard, imports, candidates, inconsistencies, batches, audit and documents.
- [ ] Run Tenant B journey with the same route list.
- [ ] Try direct Tenant A resource URLs while Tenant B is active.
- [ ] Confirm blocked access does not enumerate resources.
- [ ] Confirm sensitive data is masked.
- [ ] Confirm no UI or API implies real NFS-e issuance.
- [ ] Capture screenshots without personal data.
- [ ] Record CI URL, deploy URL, commit hash and smoke evidence.

Gate:
- [ ] Happy path works.
- [ ] Cross-tenant access is blocked.
- [ ] Audit, logs and DTOs do not leak sensitive data.

Recommended squad: @qa, Codex and Security/LGPD.

Runbook:
- `docs/product/two-tenant-smoke-evidence.md`

## Sprint 43 - UX/Test Feedback Hardening
Objective: fix smoke-test friction before inviting pilot users.

Checklist:
- [x] Review login and session errors.
- [x] Improve empty, loading and error states.
- [x] Review permission denied messages.
- [x] Adjust copy that could imply real issuance.
- [ ] Review cockpit responsiveness.
- [ ] Fix smoke-test bugs.
- [ ] Run full regression gates.
- [ ] Update pilot evidence log.

Gate:
- [ ] No open P0/P1.
- [ ] Minimum beta UX is ready for accompanied users.

Recommended squad: Gemini, Codex and @qa.

Story:
- `docs/stories/sprint-43-ux-test-feedback-hardening.md`

## Sprint 44 - Pilot Go/No-Go Pack
Objective: make the official pilot decision.

Checklist:
- [x] Create formal go/no-go decision pack.
- [x] Consolidate required commit hash, CI URL, deploy URL, smoke result and safe screenshot fields.
- [x] Review accepted and blocking risks.
- [x] Define required owners and rollback owner.
- [x] Define pilot window requirements.
- [x] Record current decision as NO-GO.
- [x] Convert missing external evidence into explicit blockers.

Gate:
- [x] Decision is recorded.
- [ ] No known P0/P1 remains open in external tracker.
- [ ] Owners, deploy URL and two-tenant smoke evidence are complete.

Recommended squad: @pm, @po, @qa, @devops and Codex.

Pack:
- `docs/product/pilot-go-no-go-pack.md`
- `docs/stories/sprint-44-pilot-go-no-go-pack.md`

## Sprint 45 - Controlled Pilot Run
Objective: run the accompanied pilot with 1-3 tenants.

Checklist:
- [x] Create controlled pilot runbook.
- [x] Create opening checklist.
- [x] Create daily pilot check template.
- [x] Create feedback and incident severity template.
- [x] Create closure report template.
- [x] Confirm no flow can intentionally attempt real fiscal issuance in pilot docs.
- [ ] Open access only to approved users after Sprint 44 turns GO or GO with restrictions.
- [ ] Monitor login, tenant switch and cockpit usage.
- [ ] Record user feedback.
- [ ] Triage bugs by severity.
- [ ] Watch audit and critical events.
- [ ] Run short daily pilot checks.
- [ ] Close the pilot window with a report.

Gate:
- [x] Pilot run is operationally prepared.
- [ ] Pilot completes without critical incident.
- [ ] Feedback is collected and prioritized.

Recommended squad: @pm/@po, @qa, Codex and @devops.

Runbook:
- `docs/operations/runbooks/controlled-pilot-run.md`
- `docs/stories/sprint-45-controlled-pilot-run.md`

## Sprint 46 - Pilot Findings and Stabilization
Objective: stabilize the product after pilot feedback.

Checklist:
- [x] Create pilot findings and stabilization plan.
- [x] Define severity categories P0, P1, P2 and P3.
- [x] Define intake fields, board columns and regression expectations.
- [x] Define post-pilot release candidate criteria.
- [x] Keep real fiscal paths blocked during stabilization.
- [ ] Classify actual findings after pilot execution.
- [ ] Fix critical bugs after pilot execution.
- [ ] Improve confusing flows after pilot execution.
- [ ] Add or improve tests where pilot failures occurred.
- [ ] Update runbooks with real pilot learnings.
- [ ] Update PRD/backlog with learnings.
- [ ] Run full gates after fixes.
- [ ] Create post-pilot release candidate.

Gate:
- [x] Stabilization process is documented.
- [ ] No P0/P1 remains open after pilot.
- [ ] Product is ready for the next beta cycle or expansion.

Recommended squad: Codex, @qa and Gemini for UX changes.

Plan:
- `docs/product/pilot-findings-stabilization-plan.md`
- `docs/stories/sprint-46-pilot-findings-stabilization.md`

## Sprint 47 - PRD Fiscal Real / Homologation
Objective: plan real fiscal homologation only after the supervised beta is stable.

Checklist:
- [x] Create a PRD for real NFS-e homologation planning.
- [x] Create ADR for homologation-first real issuance.
- [x] Define homologation scope.
- [x] Define certificate policy requirements.
- [x] Define municipal sandbox/homologation approach.
- [x] Define real issuance idempotency requirements.
- [x] Define rollback and fiscal contingency requirements.
- [x] Define legal/accounting responsibilities.
- [x] Define tests with accountant or fiscal specialist.
- [x] Plan implementation only after explicit future approval.

Gate:
- [x] No real fiscal implementation starts without PRD, ADR, homologation and approval.
- [x] No provider, scraping, certificate, municipal transmission or fiscal queue is implemented.

Recommended squad: @pm, @po, @architect, Security/LGPD, fiscal specialist and Codex.

Planning artifacts:
- `docs/product/prd-real-nfse-homologation.md`
- `docs/adr/0011-use-homologation-first-real-issuance.md`
- `docs/stories/sprint-47-prd-fiscal-real-homologation.md`

## Global Gates
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run security:secrets`
- [ ] `npx prisma validate`
- [ ] `npm run build`
- [ ] Two-tenant smoke before real beta usage.
- [ ] Rollback documented before real beta usage.

## Non-Negotiable Scope Guards
- No real NFS-e issuance before Sprint 47 approval.
- No scraping.
- No municipal provider integration.
- No certificate usage.
- No fiscal queue or external fiscal job execution.
- No real personal data in screenshots, logs or repository docs.

