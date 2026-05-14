# Runbook - Tenant Isolation Incident

## Severity
P0. Treat every suspected cross-tenant exposure or mutation as critical until disproved.

## Immediate Actions
1. Pause the affected beta flow or release.
2. Preserve logs, audit events and the exact `requestId` or `correlationId`.
3. Identify route, tenant, actor, entity type and entity id.
4. Stop manual remediation until scope and impact are understood.
5. Notify product, engineering, security/LGPD and the responsible owner.

## Required Evidence
- affected tenant id or tenant ids
- actor id and role
- route and HTTP method
- entity type and id
- request id and correlation id
- audit event ids
- sanitized payload preview only
- timeline of observed actions

## Triage
1. Confirm whether exposure was read-only or included mutation.
2. Check whether the API used `context.tenantId` and `assertTenantScope`.
3. Check repository filters and composite unique keys with tenant scope.
4. Confirm whether UI, API, service or seed/demo data caused the issue.
5. Create or update a regression test before reopening beta.

## Containment
- Disable affected route or feature flag if available.
- Revoke affected session or role only when needed and documented.
- Do not delete records to hide evidence.
- Do not copy raw payloads into issue trackers.

## Exit Criteria
- Root cause identified.
- Data impact classified.
- Regression test added.
- Fix reviewed by engineering and security/LGPD.
- Release or beta flow explicitly re-approved.
