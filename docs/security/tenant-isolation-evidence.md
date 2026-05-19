# Tenant Isolation Evidence - Sprint 36

## Objective
Record the evidence added before controlled beta to reduce IDOR, cross-tenant replay and payload abuse risk.

## Evidence
- Route-level static guardrails prevent operational APIs from accepting `tenantId` through query, headers, params or body.
- Request schemas reject client-controlled `tenantId`, actor, correlation, creator/updater and workflow status fields.
- Tenant switching rejects users without active membership and rejects inactive target tenants.
- Active tenant cookie parsing accepts only UUIDs and uses hardened `httpOnly`, `sameSite=lax`, scoped path and production-only secure flags.
- Idempotency is tenant-scoped through `(tenantId, operation, idempotencyKey)` and existing tests cover same-key cross-tenant isolation.
- Import parser rejects forbidden sensitive fields recursively, including nested CPF/CNPJ, token and service role fields.
- Supabase callback redirects are constrained to local paths and reject absolute/external redirect targets.
- Public API error envelopes return stable `{ error: { code, message, requestId } }` without stack traces or SQL details.

## Residual Risk
Some Prisma repositories still load by global `id` and rely on service-layer `assertTenantScope`. Current services block cross-tenant access, but future work should prefer tenant-aware repository methods such as `id_tenantId` for all by-id reads.

## Beta Gate
Any new cross-tenant leakage, raw sensitive payload exposure, or `NEXT_PUBLIC_APP_ENV=Local` in a Vercel non-local environment blocks beta.
