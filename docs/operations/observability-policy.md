# Observability Policy - VetFiscal OS

## Status
Accepted for beta readiness.

## Objective
Define safe operational telemetry for VetFiscal OS before any beta usage. Observability must help diagnose incidents without exposing personal data, fiscal payloads, storage internals or secrets.

## Allowed Operational Log Fields
- `timestamp`
- `level`
- `service`
- `environment`
- `correlationId`
- `tenantId` only for internal restricted logs
- `actorId` when required for auditability
- `event`
- `entityType`
- `entityId`
- status before/after when redacted and operationally necessary
- counters, durations and retry counts

## Prohibited Fields
- `rawPayload`
- `storagePath`
- CPF/CNPJ completo
- e-mail, telefone ou endereco de tutor/cliente
- tokens, cookies, passwords, certificates or private keys
- signed URLs, bucket names or provider responses
- SQL, Prisma stack traces or internal filesystem paths
- fiscal fingerprint in public telemetry

## Alert Candidates For Beta
- Any `TenantScopeError`.
- Any 5xx in critical mutation routes.
- Import batch in `VALIDATING` beyond SLA.
- Fiscal batch in `IN_REVIEW` or `SIMULATED` beyond SLA.
- Increase in 403 responses by tenant or route.
- Any event suggesting `externalProviderCalled: true` or `nfseIssued: true` before future NFS-e PRD.

## Sentry Readiness
Sentry is not enabled in this sprint. The code may expose readiness metadata indicating whether `SENTRY_DSN` is configured, but no runtime integration, DSN value, stack trace forwarding or source map upload is active.

## Correlation Rule
Every operational incident must start with `correlationId` or `requestId`. If neither exists, the incident review must include a corrective task to add correlation coverage.
