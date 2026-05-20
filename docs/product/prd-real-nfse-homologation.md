# PRD - Real NFS-e Homologation Planning

## Status
Draft for future planning only.

This PRD does not authorize implementation. It defines the minimum product, fiscal, legal and technical questions that must be answered before VetFiscal OS starts any real NFS-e homologation work.

## Problem
Clinics need supervised fiscal operation that can eventually issue valid NFS-e through municipal providers. The current product intentionally stops before real issuance. Moving from simulation to real homologation introduces legal, fiscal, certificate, provider, idempotency, audit and contingency risks that require a dedicated planning and approval cycle.

## Goals
- Define the scope for a future real NFS-e homologation pilot.
- Preserve human-in-the-loop approval before any fiscal transmission.
- Keep tenant isolation, RBAC, audit, idempotency and LGPD as hard gates.
- Define provider adapter boundaries before integrating any municipality.
- Define certificate and secret handling before storing or using credentials.
- Define fiscal contingency and rollback strategy before live usage.

## Non-Goals
- No implementation in this sprint.
- No real NFS-e issuance.
- No municipal provider call.
- No scraping.
- No certificate upload or storage.
- No fiscal queue or external fiscal background job.
- No production release.

## Primary Users
| User | Need |
| --- | --- |
| Fiscal manager | Approve only reviewed and compliant service notes |
| Fiscal operator | Prepare candidates, resolve inconsistencies and assemble batches |
| Accountant | Review fiscal assumptions, municipal rules and edge cases |
| Auditor | Inspect audit trail and evidence without sensitive leakage |
| Support/operations | Monitor failures, retries and contingency paths |

## Future Homologation Scope
- One municipality at a time.
- One approved test tenant.
- Homologation/sandbox environment only.
- Controlled service catalog.
- Limited batch size.
- Manual approval before transmission.
- No automatic issuance on import.
- No customer-facing fiscal document delivery until homologation is approved.

## Required Capabilities Before Implementation
- Provider adapter interface with no provider code in React.
- State machine for real issuance separated from simulated flows.
- Idempotency contract per tenant, provider, operation and fiscal intent.
- Correlation id propagated through command, audit and provider adapter.
- Audit events for approve, transmit, provider response, retry, cancel/void when supported and failure.
- Redaction policy for provider request/response payloads.
- Certificate storage and access policy approved by Security/LGPD.
- Fiscal contingency runbook approved by product, engineering and accountant.

## Provider Adapter Requirements
- Each municipality/provider must live behind an adapter boundary.
- Adapter must expose explicit capabilities such as submit, consult, cancel and status check only when supported.
- Adapter must never be called directly from UI components.
- Adapter must never receive tenant id from client input as source of truth.
- Adapter must return sanitized domain results, not raw provider payloads.
- Raw provider payload retention must be explicitly approved before storage.

## Certificate and Secrets Policy
- No certificate or provider credential is committed to the repository.
- No certificate is uploaded until storage, encryption, access control and rotation are approved.
- Service-role or privileged credentials must be scoped by environment.
- Access to certificate material must be audited.
- Any certificate-related incident blocks homologation.

## Idempotency and Fiscal Safety
- Every real issuance command requires an idempotency key.
- Replay with the same key and same request hash must return the same result reference.
- Replay with same key and different request hash must be blocked.
- Tenant A keys must never affect Tenant B.
- Provider timeout must not automatically create a second fiscal transmission.
- Retrying must use provider status consultation when available before resubmission.

## Audit Requirements
Every critical action must record:
- tenant id.
- actor id.
- role.
- event type.
- entity type and id.
- previous state and next state.
- correlation id.
- idempotency key reference.
- provider adapter name and version when applicable.
- sanitized provider status, never raw sensitive payload by default.

## Legal and Accounting Responsibilities
- Accountant/fiscal specialist validates municipal rules and homologation scenarios.
- Product owner approves user-facing scope and accepted residual risks.
- Engineering owner approves technical implementation and rollback plan.
- Security/LGPD approves certificate, secret and data handling.
- Support owner approves incident communication and escalation.

## Homologation Test Plan
- Happy path issuance in municipal homologation/sandbox.
- Duplicate idempotency replay.
- Provider timeout and status consultation.
- Provider rejection with human-readable inconsistency.
- Tenant isolation negative tests.
- RBAC negative tests by role.
- Audit redaction tests.
- Certificate access audit test.
- Rollback/forward-fix drill.

## Go Criteria For Future Implementation
- Controlled beta is stable with no open P0/P1.
- This PRD is approved by product, engineering, Security/LGPD and fiscal specialist.
- Provider-specific ADR is accepted.
- Certificate policy is accepted.
- Homologation environment is available.
- Test plan is accepted.

## No-Go Criteria
- Any uncertainty about legal/fiscal responsibility.
- Any unresolved tenant isolation, audit or secret handling issue.
- Any missing rollback or contingency owner.
- Any need to use scraping as core fiscal mechanism.
- Any request to bypass human approval before first real fiscal transmissions.

