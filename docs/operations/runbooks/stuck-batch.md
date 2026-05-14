# Runbook - Stuck Fiscal Batch

## Severity
P1 when batches cannot progress. P0 if the batch indicates real issuance or cross-tenant data.

## Symptoms
- Batch remains in `DRAFT`, `IN_REVIEW` or `SIMULATED` beyond SLA.
- Batch cannot be approved for future issuance.
- Candidate stays locked in `IN_BATCH` after cancellation.
- Operator sees inconsistent item counts or totals.

## Required Evidence
- `tenantId`
- `batchId`
- `batchNumber`
- `correlationId` or API `requestId`
- batch status and timestamps
- item count and total amount in cents
- linked candidates and open blocking inconsistencies
- relevant audit events

## Triage
1. Confirm tenant scope for batch, items and candidates.
2. Confirm actor has `batches.simulate` or `batches.approve` as required.
3. Check whether any linked candidate has blocking inconsistency open.
4. Confirm simulation metadata states `externalProviderCalled: false` and `nfseIssued: false`.
5. Check whether cancellation released candidates.
6. Review audit events for submitted, simulated, approved or cancelled transitions.

## Safe Remediation
- Prefer audited workflow commands over direct data edits.
- If a batch is invalid, cancel it with a clear reason and recreate from eligible candidates.
- If totals are inconsistent, stop the beta flow and open an engineering investigation.
- Never call a municipal provider or create an issuance event during this runbook.

## Pause Criteria
- Any sign of real NFS-e issuance.
- Any provider endpoint, scraping attempt or certificate usage.
- Cross-tenant candidate, item or batch relationship.
- Missing audit events for a critical state transition.
