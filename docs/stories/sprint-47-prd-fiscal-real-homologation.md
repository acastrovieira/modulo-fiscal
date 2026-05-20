# Sprint 47 - PRD Fiscal Real / Homologation

## Status
Planning prepared.

Current decision: NO implementation of real NFS-e issuance starts in this sprint.

## Objective
Create the planning artifacts required before any future real fiscal homologation: PRD, ADR, explicit non-goals, legal/accounting responsibilities, certificate policy, provider adapter boundaries, idempotency, rollback and tests with a fiscal specialist.

## Checklist
- [x] Create PRD for real NFS-e homologation planning.
- [x] Create ADR for homologation-first real fiscal issuance.
- [x] Define homologation scope.
- [x] Define certificate policy as a future controlled decision.
- [x] Define municipal sandbox/homologation requirements.
- [x] Define real issuance idempotency requirements.
- [x] Define rollback and fiscal contingency requirements.
- [x] Define legal/accounting responsibilities.
- [x] Define tests with accountant or fiscal specialist.
- [x] Explicitly block implementation until approval.

## Gate
- [x] No real fiscal implementation starts without PRD, ADR, homologation and approval.
- [x] No provider, scraping, certificate, municipal transmission or fiscal queue is implemented.
- [ ] Future implementation has explicit owner approval and provider-specific ADR.

## Squad Review Notes
- Product/PO owns scope and user impact.
- Architect owns provider adapter boundary and state machine safety.
- Security/LGPD owns certificate, secrets, data minimization and audit exposure.
- Fiscal specialist/accountant owns legal interpretation and municipal validation.
- Codex only implements after explicit future approval.

