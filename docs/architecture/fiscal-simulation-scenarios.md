# Fiscal Simulation Scenarios

## Purpose
Define the first versioned scenario engine for supervised fiscal simulation. Sprint 24 keeps the engine deterministic, internal and simulation-only.

## Scope
- Evaluate simulated fiscal documents against a versioned scenario set.
- Return allowlisted findings with safe operational language.
- Record audit metadata for scenario evaluations.
- Preserve tenant scope, RBAC, LGPD redaction and simulation-only guardrails.

## Current Scenario Set
- `scenarioSetId`: `vetcare-simulation-baseline`
- `scenarioSetVersion`: `2026.05`
- `simulatedOnly`: `true`
- `fiscalValue`: `false`
- `externalTransmission`: `false`

The first scenario set is code-versioned rather than tenant-configurable. Persistence for tenant-authored scenarios is deferred until the rules and review workflow stabilize.

## Baseline Findings
- `SIMULATION_ONLY_VIOLATION`: blocks documents that do not keep simulation-only flags.
- `NO_ITEMS`: blocks documents without service items.
- `UNKNOWN_TAKER_DOCUMENT`: requires review for unclassified taker documents.
- `SERVICE_CODE_OUTSIDE_PROFILE_DEFAULT`: requires review when an item differs from the tenant simulation profile default service code.
- `HIGH_VALUE_SIMULATION_REVIEW`: requires review for simulated totals at or above 100000 cents.
- `BASELINE_SCENARIOS_PASSED`: informational success finding when no blocking or review finding exists.

## API Boundary
- `POST /api/fiscal/simulation/documents/[id]/scenario-evaluation`
- Client payload may only include `scenarioSetVersion`.
- Client never provides `tenantId`.
- The backend resolves tenant and role through `createCommandContext`.
- The application service fetches profile, document and taker through the fiscal simulation repository.
- The public DTO never exposes `tenantId`, document hash or raw fiscal registration.

## Audit Rules
Every scenario evaluation records:
- tenant id from command context
- actor id from command context
- correlation id
- simulated document id
- scenario set id and version
- evaluation status and findings count
- `simulatedOnly=true`
- `fiscalValue=false`
- `externalTransmission=false`
- `externalProviderCalled=false`
- `nfseIssued=false`

## Out Of Scope
- Real NFS-e issuance.
- Municipal provider calls.
- Scraping.
- Digital certificates.
- Official XML, RPS, protocol or verification code.
- Tenant-authored scenario persistence.
- UI for scenario editing.
