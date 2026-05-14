# Runbook - Beta Release

## Objective
Release VetFiscal OS to a controlled beta without enabling real NFS-e issuance, scraping, municipal providers, certificates or fiscal jobs.

## Pre-Release Gates
- [ ] Branch is clean.
- [ ] Pull request targets protected `main`.
- [ ] GitHub `Quality gates` check is green.
- [ ] `npm run lint` passed.
- [ ] `npm run typecheck` passed.
- [ ] `npm test` passed.
- [ ] `npm run build` passed.
- [ ] `npx prisma validate` passed with local/demo env.
- [ ] No secrets are versioned.
- [ ] `.env.example` contains only fictitious/local values.

## Product Gates
- [ ] Beta tenants are explicitly approved.
- [ ] Roles are reviewed for every beta user.
- [ ] Support and incident contacts are defined.
- [ ] Residual risks are accepted or blocked.
- [ ] Rollback owner is assigned.

## Technical Smoke
- [ ] `/api/health` returns public health report without secrets.
- [ ] `/dashboard` renders cockpit summary.
- [ ] Workflow pages render: imports, candidates, inconsistencies, batches, audit and documents.
- [ ] API errors return `{ error: { code, message, requestId } }`.
- [ ] Audit/document APIs do not expose raw payloads or storage path.

## Explicit Non-Goals
- [ ] No real NFS-e issuance.
- [ ] No scraping.
- [ ] No municipal provider call.
- [ ] No certificate usage.
- [ ] No fiscal queue/job execution.
