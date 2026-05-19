# Candidate Review Workbench

## Objective
Harden the supervised fiscal candidate review step before any batch workflow. The workbench must make block reasons, LGPD warnings and reviewer decisions visible without exposing raw fiscal documents or moving fiscal rules into React.

## Decision
Fiscal candidate creation persists the deterministic review gate result on the candidate:

- `reviewBlockReasons`: versioned operational reasons that explain why a candidate started blocked.
- `reviewWarnings`: safe warnings such as raw document masking.
- `reviewJustification`: human justification captured only when the candidate is released to `READY_FOR_BATCH`.

The backend remains the source of truth. UI screens may hide or show actions, but the API enforces:

- `markCandidateReadyForBatch` permission.
- tenant scope from server context.
- candidate state `NEEDS_REVIEW`.
- zero open blocking inconsistencies.
- mandatory human review justification.
- audit event with previous status, next status, reviewer, timestamp, justification and preserved review gate context.

## Guardrails
- `BLOCKED` candidates are not directly released by generic editing. A blocking reason must be addressed by the supervised inconsistency flow before the candidate can return to review.
- Review data is allowlisted in DTOs. Fiscal fingerprint and tenant internals remain hidden.
- Bulk review is intentionally not implemented in this sprint. Any future bulk workflow must define a bounded batch size and record per-candidate audit events.
- No NFS-e issuance, scraping, municipal provider, certificate handling or fiscal queue is introduced here.
