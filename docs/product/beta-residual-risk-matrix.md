# Beta Residual Risk Matrix - VetFiscal OS

| Risk | Severity | Probability | Owner | Mitigation | Beta Decision |
| --- | --- | --- | --- | --- | --- |
| Tenant isolation regression in new API | Critical | Low | Engineering | `context.tenantId`, `assertTenantScope`, composite tenant keys and API tests | Block beta if detected |
| Sensitive data in logs or DTOs | High | Medium | Security/LGPD | Redaction helper, DTO allowlist and hardening tests | Block beta if public leak detected |
| Health endpoint exposes internals | Medium | Low | Engineering | Public readiness only, no DB URL, DSN, host or stack | Accept with tests |
| Sentry enabled without scrubbers | High | Low | DevOps/Security | Readiness only; runtime integration disabled until ADR | Block activation |
| Import stuck in validation | Medium | Medium | Operations | Import failure runbook and audit/correlation review | Accept for controlled beta |
| Fiscal batch stuck in review/simulation | Medium | Medium | Operations | Stuck batch runbook and audited cancel/recreate flow | Accept for controlled beta |
| Real NFS-e path introduced accidentally | Critical | Low | Architecture | Hardening tests, explicit non-goal docs and no provider adapters active | Block beta |
| Seed/demo data mistaken for real data | Medium | Low | Product/QA | `.local` emails, fictitious data and demo tests | Accept with review |
| Broad `documents.download` permission | Medium | Medium | Product/Security | Audit every download intent and revisit `documents.view` permission later | Accept for MVP beta |
| Performance bottleneck in cockpit list views | Medium | Medium | Engineering | Pagination limits, 50/100 record caps and future Playwright/perf pass | Accept for controlled tenant volume |
