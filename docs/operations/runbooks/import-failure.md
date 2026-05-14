# Runbook - Import Failure

## Severity
P1 when a tenant cannot process new imports. P0 if there is suspected cross-tenant data exposure.

## Symptoms
- Import batch remains in `VALIDATING` beyond SLA.
- Import batch transitions to `HAS_ERRORS` unexpectedly.
- Rows are missing, rejected or not converted to candidates.
- Operator reports duplicate import or idempotency confusion.

## Required Evidence
- `tenantId`
- `importBatchId`
- `documentFileId`
- `correlationId` or API `requestId`
- current import status
- total, valid and invalid row counts
- relevant audit events

## Triage
1. Confirm the active tenant and never use client-provided `tenantId` as source of truth.
2. Check import batch status and timestamps.
3. Check row counts by status: `RECEIVED`, `NORMALIZED`, `REJECTED`, `CANDIDATE_CREATED`.
4. Confirm document checksum exists and is associated with the same tenant.
5. Review audit events: `imports.created`, `imports.validation_started`, `imports.validation_finished`.
6. Do not copy raw payload, CPF/CNPJ, email, phone or storage path into tickets or logs.

## Safe Remediation
- Re-run validation only when idempotency and tenant scope are confirmed.
- Do not manually edit fiscal candidates without an audited command.
- If data exposure is suspected, switch to the tenant isolation incident runbook.
- If the source file is malformed, request a corrected structured file and keep the rejected batch for traceability.

## Pause Criteria
- Unknown tenant association.
- Raw payload leaked in a public response or ticket.
- Same idempotency key creates conflicting operational state.
- Validation suggests provider, scraping or real NFS-e emission was attempted.
