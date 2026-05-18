# Import Parser Contracts

## Objective
Define how VetFiscal OS accepts structured operational imports without treating them as fiscal issuance input, without scraping and without calling external providers.

## Current Parser
`vetcare_structured_v1` is the only supported parser version.

The parser accepts structured rows already supplied by an authenticated backend request and normalizes a small allowlist:

- `sourceRowId`, `source_row_id` or `id`
- `description`, `serviceDescription` or `service_description`
- `amountCents`, `grossAmountCents` or `amount`, always as a positive integer in cents
- `customerName`, `customer_name`, `tutorName` or `tutor_name`
- `customerDocumentMasked`, `customer_document_masked`, `documentMasked` or `document_masked`
- `serviceDate`, `service_date`, `competenceDate` or `competence_date`

## Guardrails
- The client does not control `tenantId`; tenant scope comes only from the authenticated command context.
- Rows containing client-controlled tenant fields, raw storage paths, document hashes, provider tokens, service role keys or unmasked CPF/CNPJ fields are rejected.
- Public audit metadata records parser version, row counts and duplicate counts, not raw row payloads or full documents.
- Duplicate rows are detected with a deterministic SHA-256 row fingerprint and flagged as `duplicateWithinImport`.
- Duplicate detection is advisory in this sprint: it does not block `READY_FOR_REVIEW`.

## Non-Goals
- No real NFS-e issuance.
- No scraping.
- No provider integration.
- No certificate handling.
- No fiscal rule engine in React.

## Evolution
New parser versions must be added explicitly, documented here, covered by tests and reviewed against tenant isolation, RBAC, audit and LGPD constraints before use.
