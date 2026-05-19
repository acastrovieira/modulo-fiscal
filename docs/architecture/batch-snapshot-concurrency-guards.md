# Batch Snapshot and Concurrency Guards

## Objective
Make supervised fiscal batches reproducible, auditable and resistant to logical races before any beta workflow touches real operational data.

## Decision
Each `FiscalBatchItem` stores a `candidateSnapshot` at inclusion time. The snapshot captures the candidate fields needed to reproduce the batch total and operational context without re-reading mutable candidate data:

- masked customer document;
- service and competence dates;
- service description;
- gross amount in cents;
- fiscal fingerprint version and fingerprint.

Batch transitions validate the stored item snapshots before advancing:

- included item totals must match `FiscalBatch.totalGrossAmountCents`;
- every included item must remain tenant-scoped;
- candidates must still exist in the expected workflow state;
- open blocking inconsistencies prevent submit, simulation and future approval.

Candidate inclusion also checks active batch membership before creating a new batch. This is a service-level guard for the MVP; stronger database locking may be added when the beta moves to real concurrent usage.

## Guardrails
- A candidate cannot be intentionally included in two active batches.
- A batch cannot advance if item totals diverge from the stored total.
- A batch cannot advance with candidates that have open blocking inconsistencies.
- Snapshots are not exposed in public API DTOs.
- No NFS-e issuance, municipal provider call, certificate handling or fiscal queue is introduced.
