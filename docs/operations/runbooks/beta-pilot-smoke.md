# Runbook - Controlled Beta Pilot Smoke

## Objective
Validate the controlled beta journey with two tenants before allowing real beta usage.

This smoke does not authorize real NFS-e issuance, scraping, municipal provider calls, certificates or fiscal queue execution.

## Preconditions
- Sprint 38 PR is merged into protected `main`.
- GitHub Quality Gates are green on `main`.
- Staging/beta deployment uses the final merge commit.
- Product, engineering and support owners are named.
- Beta tenants and users are approved outside the repository.
- Secrets are configured only in the provider environment, never committed.

## Tenant A Flow
- [ ] Sign in as an approved OWNER or ADMIN.
- [ ] Confirm active tenant badge and environment badge.
- [ ] Open dashboard.
- [ ] Open imports.
- [ ] Open candidates.
- [ ] Open inconsistencies.
- [ ] Open batches.
- [ ] Open audit.
- [ ] Open documents.
- [ ] Confirm sensitive fields are masked.
- [ ] Confirm no action implies real NFS-e issuance.

## Tenant B Flow
- [ ] Switch to Tenant B using the tenant switch flow.
- [ ] Confirm active tenant badge changed.
- [ ] Repeat dashboard, imports, candidates, inconsistencies, batches, audit and documents.
- [ ] Confirm only Tenant B records are visible.
- [ ] Confirm sensitive fields are masked.

## Abuse Checks
- [ ] Try a direct Tenant A import URL while Tenant B is active.
- [ ] Try a direct Tenant A candidate URL while Tenant B is active.
- [ ] Try a direct Tenant A batch URL while Tenant B is active.
- [ ] Confirm requests are blocked without revealing whether the resource exists.
- [ ] Confirm audit does not expose full CPF/CNPJ, token, storage path or raw payload.

## Evidence Rules
- Capture screenshots only with fictitious/demo or approved redacted data.
- Do not paste secrets, tokens, raw payloads or full personal documents into tickets or docs.
- Record CI URL, deploy URL, commit hash and smoke date.
- If any no-go condition appears, stop the pilot and open a blocker task.

