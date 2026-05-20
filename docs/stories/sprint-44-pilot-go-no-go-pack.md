# Sprint 44 - Pilot Go/No-Go Pack

## Status
Technically prepared.

Current decision: NO-GO for real beta users.

## Objective
Create the formal decision package for the controlled beta pilot, consolidating evidence, owners, residual risks, rollback requirements and explicit scope guards before any real tenant is enabled.

## Checklist
- [x] Create formal go/no-go decision pack.
- [x] Link release candidate evidence, pilot readiness, smoke evidence and residual risk matrix.
- [x] Keep current decision as NO-GO until external approvals are complete.
- [x] Define required owners: product, engineering, support, QA and rollback.
- [x] Define GO, GO with restrictions and NO-GO criteria.
- [x] Confirm no real NFS-e issuance, scraping, municipal provider, certificate or fiscal job is enabled.
- [x] Update controlled beta roadmap.
- [x] Update pilot evidence log.

## Gate
- [x] Decision is recorded.
- [x] No repository evidence enables real fiscal operation.
- [ ] No known P0/P1 remains open in external tracker.
- [ ] Product, engineering, support, QA and rollback owners are named outside the repository.
- [ ] Staging/beta deployment URL and two-tenant smoke evidence are captured.

## Squad Review Notes
- Product/PM: decision remains blocked until owners and pilot window are explicitly approved.
- QA: two-tenant smoke evidence is mandatory before GO.
- DevOps: deployment URL, migration status and rollback owner are mandatory before GO.
- Security/LGPD: screenshots and logs must stay redacted and tenant-scoped.

