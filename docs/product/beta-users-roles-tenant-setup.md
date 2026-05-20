# Beta Users, Roles and Tenant Setup - Sprint 41

## Status
Technical setup plan prepared. Real beta users and tenants remain pending until approved outside the repository.

## Objective
Prepare controlled beta access for 1-3 tenants with least-privilege roles, tenant isolation and explicit ownership before any real user testing.

## Owners
| Responsibility | Status | Required Before Pilot |
| --- | --- | --- |
| Product owner | Pending | Yes |
| Engineering owner | Pending | Yes |
| Support owner | Pending | Yes |
| QA owner | Pending | Recommended |

## Approved Tenant Register
Use only fictitious names in repository docs. Real tenant names must be approved and tracked outside the repository.

| Tenant Alias | Data Policy | Status | Notes |
| --- | --- | --- | --- |
| Tenant A | Fictitious/demo or formally approved beta data | Pending | Required for two-tenant smoke. |
| Tenant B | Fictitious/demo or formally approved beta data | Pending | Required for isolation smoke. |
| Tenant C | Optional controlled pilot tenant | Pending | Use only after Tenant A/B smoke passes. |

## Least-Privilege Role Matrix
| Role | Beta Purpose | Allowed In Pilot | Notes |
| --- | --- | --- | --- |
| OWNER | Tenant bootstrap and final tenant accountability | Limited | Keep to one active owner per tenant unless business requires more. |
| ADMIN | Tenant administration and invites | Limited | Use for setup and support, not daily fiscal review. |
| FISCAL_MANAGER | Supervise fiscal workflow and approve controlled transitions | Yes | Primary beta fiscal supervisor role. |
| FISCAL_OPERATOR | Import, review and prepare operational fiscal items | Yes | No final ownership decisions. |
| FINANCIAL_OPERATOR | Future finance-adjacent observation | Optional | Avoid if not needed in beta. |
| ACCOUNTANT | Read/review audit and fiscal operational data | Optional | Use least privilege for external accounting review. |
| AUDITOR | Audit/documents read-only review | Optional | No mutation access. |

## User Register Template
Do not store real personal e-mails in this file. Use aliases or external secure tracking for real users.

| User Alias | Tenant Alias | Role | Status | Evidence |
| --- | --- | --- | --- | --- |
| beta-owner-a | Tenant A | OWNER | Pending | External approval required. |
| beta-fiscal-manager-a | Tenant A | FISCAL_MANAGER | Pending | External approval required. |
| beta-fiscal-operator-a | Tenant A | FISCAL_OPERATOR | Pending | External approval required. |
| beta-auditor-a | Tenant A | AUDITOR | Pending | External approval required. |
| beta-owner-b | Tenant B | OWNER | Pending | External approval required. |
| beta-fiscal-manager-b | Tenant B | FISCAL_MANAGER | Pending | External approval required. |
| beta-fiscal-operator-b | Tenant B | FISCAL_OPERATOR | Pending | External approval required. |
| beta-auditor-b | Tenant B | AUDITOR | Pending | External approval required. |

## Setup Checklist
- [ ] Product, engineering and support owners are named.
- [ ] Tenant A and Tenant B are approved outside the repository.
- [ ] Beta users are approved outside the repository.
- [ ] Each user has exactly the minimum role needed.
- [ ] Tenant memberships are created or validated in staging/beta.
- [ ] Tenant switch works for users with multiple memberships.
- [ ] User without membership cannot access dashboard.
- [ ] Suspended user cannot access tenant.
- [ ] Evidence is recorded in `docs/product/beta-pilot-evidence-log.md`.

## No-Go Conditions
- Any real user or tenant is added without approval.
- Any real e-mail, CPF, CNPJ, token or document appears in repository docs.
- Any user can access a tenant without active membership.
- Any suspended user can access a tenant.
- Any role receives broader permissions than needed for the pilot.

