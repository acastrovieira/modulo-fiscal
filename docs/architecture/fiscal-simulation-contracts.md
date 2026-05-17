# Fiscal Simulation Contracts

## Purpose
Define stable contracts for the governed fiscal simulation surface introduced in Sprint 22. This module remains simulation-only and has no legal fiscal effect.

## Public Language
Use:
- simulated fiscal document
- simulation id
- no fiscal value
- not transmitted to official environment

Do not use in API/DTO/UI copy:
- authorized
- official invoice
- official protocol
- verification code
- access key
- DANFSe
- city hall transmission

## API Boundary
- Client payloads never provide `tenantId`.
- Backend resolves tenant and role through `createCommandContext`.
- Mutations are application-service commands, not Prisma calls from React.
- Create document requires an idempotency key from body or `idempotency-key` header.
- DTOs expose allowlisted fields only.

## DTO Rules
- Service taker DTO exposes `documentMasked`, never raw document or `documentHash`.
- Simulated fiscal document DTO exposes `fiscalValue=false` and `externalTransmission=false`.
- Every simulated document DTO includes a clear disclaimer.
- Money values are strings of integer cents.
- No DTO returns Prisma records directly.

## Audit Rules
Every simulation mutation records:
- actor id
- tenant id
- entity type and id
- before/after status when applicable
- correlation id
- `simulatedOnly=true`
- `fiscalValue=false`
- `externalTransmission=false`
- `externalProviderCalled=false`
- `nfseIssued=false`

## Release Gates
- Contract tests must reject client-controlled `tenantId`.
- Contract tests must reject forbidden official fiscal terminology.
- Tenant isolation, RBAC, LGPD redaction, audit and idempotency tests are release blockers.
