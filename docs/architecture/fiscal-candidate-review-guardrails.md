# Fiscal Candidate Review Guardrails

## Objective
Define how VetFiscal OS classifies fiscal candidates created from normalized import rows before any batch workflow, preserving supervised review and avoiding automatic fiscal action.

## Review Gate
Every candidate created from an import row passes through a deterministic review gate.

The gate returns:

- `initialStatus`: `NEEDS_REVIEW` or `BLOCKED`
- `blockedReasons`: machine-readable reasons that require human correction
- `warnings`: non-blocking operational warnings

## Blocking Reasons
- `DUPLICATE_WITHIN_IMPORT`: the import parser marked the normalized row as a duplicate.
- `MISSING_OR_INVALID_AMOUNT`: amount is missing, zero or negative.
- `MISSING_SERVICE_DATE`: both service date and competence date are missing.

## Warnings
- `RAW_CUSTOMER_DOCUMENT_RECEIVED`: legacy normalized payload contained a raw document field. The service masks it before creating the candidate and records only the warning, never the raw document.

## Audit
`fiscal_candidate.created` records the review gate result in `afterPayload.reviewGate`.

Audit payloads must not contain:

- raw CPF/CNPJ
- `tenantId` controlled by client
- provider tokens
- external issuance metadata suggesting real NFS-e

## Non-Goals
- No real NFS-e issuance.
- No scraping.
- No automatic provider call.
- No automatic correction of blocked candidates.
- No fiscal decision in React components.
