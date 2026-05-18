# Fiscal Governance Observability

## Purpose
Define the observability layer for fiscal simulation governance. Sprint 25 uses audit events as the source of truth and exposes a tenant-scoped governance report for internal operational review.

## Endpoint
- `GET /api/observability/fiscal-governance`
- Query: `windowDays` from 1 to 30.
- Permission: `audit.view`.
- Tenant source: authenticated command context only.

## Report Status
- `ok`: fiscal simulation audit events exist and no unsafe flags were detected.
- `attention`: no fiscal simulation audit coverage was found in the selected period.
- `blocked`: at least one event indicates fiscal value, external provider call, external transmission or NFS-e issuance.

## Safety Checks
The report always exposes:
- `nfseIssuance=disabled`
- external provider call detection
- external transmission detection
- fiscal value detection
- audit coverage detection

It never exposes:
- `tenantId`
- raw audit payloads
- document hash
- raw CPF/CNPJ
- storage paths
- stack traces
- provider credentials

## Metrics
The current report includes:
- total fiscal simulation audit events
- scenario evaluations
- simulated documents created
- simulated documents validated
- simulated documents simulated issued
- simulated documents voided
- unsafe flagged events
- scenario evaluation status counts
- recent event names and timestamps

## Source Of Truth
The report reads `audit_events` filtered by:
- current tenant
- `eventType` prefix `fiscal_simulation.`
- selected time window

No new operational database table is introduced in this sprint. Persistent analytics tables can be added later if the beta requires historical dashboards or SLA calculations.

## Out Of Scope
- Sentry runtime integration.
- pg-boss jobs.
- Alert delivery.
- Public status page.
- Real NFS-e monitoring.
- External fiscal provider monitoring.
