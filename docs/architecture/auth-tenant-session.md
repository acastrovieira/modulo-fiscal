# Auth, Tenant Session and RBAC Boundary

## Status
Accepted for Sprint 17 foundation.

## Objective
Wire VetFiscal OS to server-side Supabase Auth while keeping tenant and RBAC decisions inside the backend. Client input never becomes the source of truth for `tenantId`, role or actor identity.

## Session Resolution
- `currentSession()` is the preferred backend boundary.
- In `Local` and `test`, `currentSession()` uses deterministic demo fixtures.
- Outside `Local` and `test`, `currentSession()` requires Supabase Auth configuration and a valid Supabase user.
- Supabase user id must match `Profile.id`.
- Profile must be `ACTIVE`.
- Tenant access is resolved through `TenantMembership ACTIVE` and `Tenant ACTIVE`.
- Effective role comes only from the active membership.

## Tenant Selection
- The selected tenant may be requested through the `vetfiscal.activeTenantId` cookie.
- Invalid UUID cookie values are ignored.
- Membership lookup still validates user, tenant and status, preventing cross-tenant access.
- Sprint 18 should add a server-side tenant switch endpoint that sets this cookie with `HttpOnly`, `Secure` in production, `SameSite=Lax` and explicit expiration.

## Supabase Boundary
- Browser/client code may use the public anon key only when future UI login is implemented.
- `SUPABASE_SERVICE_ROLE_KEY` must never be imported by React components, public routes or browser bundles.
- Middleware refreshes Supabase cookies when Supabase env vars are configured.
- No raw token, cookie, claim payload or provider error should be returned in public API errors.

## Local Fallback Rule
Local fallback is allowed only when `NODE_ENV=test` or `NEXT_PUBLIC_APP_ENV=Local`. Missing environment configuration must not silently create an OWNER session.

## Out Of Scope For Sprint 17
- Tenant admin UI.
- Invite workflow.
- Login/logout UI actions.
- Password reset.
- Supabase Storage integration.
- Service-role admin automation.
