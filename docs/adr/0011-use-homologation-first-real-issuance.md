# 0011 - Use Homologation-First Real Issuance

## Status
Accepted

## Context
VetFiscal OS currently supports supervised fiscal simulation and operational review without real NFS-e issuance. Real municipal NFS-e integrations introduce provider variability, legal responsibility, certificate handling, idempotency hazards and audit requirements that cannot be treated as a small extension of the simulated workflow.

## Decision
Any future real NFS-e work must start with a homologation-first approach. The system must plan and validate one municipality/provider at a time in an approved homologation or sandbox environment before production use. Real issuance must remain behind a provider adapter, state machine, RBAC checks, idempotency ledger, audit trail and human approval gate.

This ADR does not authorize implementation. It creates the architectural precondition for future work.

## Consequences
Positive consequences:
- Reduces fiscal risk before any production transmission.
- Keeps provider-specific behavior isolated behind adapters.
- Preserves audit-first and idempotency-first guarantees.
- Makes certificate, secret and LGPD requirements explicit before implementation.
- Prevents simulated workflows from silently becoming real fiscal workflows.

Trade-offs:
- Slower path to production issuance.
- More documentation and approval steps before coding.
- Requires fiscal/accounting review per municipality.
- Requires provider-specific test evidence before expanding scope.

Non-negotiable constraints:
- No scraping as core fiscal mechanism.
- No certificate handling without approved security policy.
- No provider call from React components.
- No real issuance without explicit PRD, provider ADR, homologation evidence and go/no-go approval.

