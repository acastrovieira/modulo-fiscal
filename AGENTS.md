# AGENTS.md - Synkra AIOX (Codex CLI)

Este arquivo define as instrucoes do projeto para o Codex CLI.

<!-- AIOX-MANAGED-START: core -->
## Core Rules

1. Siga a Constitution em `.aiox-core/constitution.md`
2. Priorize `CLI First -> Observability Second -> UI Third`
3. Trabalhe por stories em `docs/stories/`
4. Nao invente requisitos fora dos artefatos existentes
<!-- AIOX-MANAGED-END: core -->

<!-- AIOX-MANAGED-START: quality -->
## Quality Gates

- Rode `npm run lint`
- Rode `npm run typecheck`
- Rode `npm test`
- Atualize checklist e file list da story antes de concluir
<!-- AIOX-MANAGED-END: quality -->

<!-- AIOX-MANAGED-START: codebase -->
## Project Map

- Core framework: `.aiox-core/`
- CLI entrypoints: `bin/`
- Shared packages: `packages/`
- Tests: `tests/`
- Docs: `docs/`
<!-- AIOX-MANAGED-END: codebase -->

<!-- AIOX-MANAGED-START: commands -->
## Common Commands

- `npm run sync:ide`
- `npm run sync:ide:check`
- `npm run sync:skills:codex`
- `npm run sync:skills:codex:global` (opcional; neste repo o padrao e local-first)
- `npm run validate:structure`
- `npm run validate:agents`
<!-- AIOX-MANAGED-END: commands -->

<!-- AIOX-MANAGED-START: shortcuts -->
## Agent Shortcuts

Preferencia de ativacao no Codex CLI:
1. Use `/skills` e selecione `aiox-<agent-id>` vindo de `.codex/skills` (ex.: `aiox-architect`)
2. Se preferir, use os atalhos abaixo (`@architect`, `/architect`, etc.)

Interprete os atalhos abaixo carregando o arquivo correspondente em `.aiox-core/development/agents/` (fallback: `.codex/agents/`), renderize o greeting via `generate-greeting.js` e assuma a persona ate `*exit`:

- `@architect`, `/architect`, `/architect.md` -> `.aiox-core/development/agents/architect.md`
- `@dev`, `/dev`, `/dev.md` -> `.aiox-core/development/agents/dev.md`
- `@qa`, `/qa`, `/qa.md` -> `.aiox-core/development/agents/qa.md`
- `@pm`, `/pm`, `/pm.md` -> `.aiox-core/development/agents/pm.md`
- `@po`, `/po`, `/po.md` -> `.aiox-core/development/agents/po.md`
- `@sm`, `/sm`, `/sm.md` -> `.aiox-core/development/agents/sm.md`
- `@analyst`, `/analyst`, `/analyst.md` -> `.aiox-core/development/agents/analyst.md`
- `@devops`, `/devops`, `/devops.md` -> `.aiox-core/development/agents/devops.md`
- `@data-engineer`, `/data-engineer`, `/data-engineer.md` -> `.aiox-core/development/agents/data-engineer.md`
- `@ux-design-expert`, `/ux-design-expert`, `/ux-design-expert.md` -> `.aiox-core/development/agents/ux-design-expert.md`
- `@squad-creator`, `/squad-creator`, `/squad-creator.md` -> `.aiox-core/development/agents/squad-creator.md`
- `@aiox-master`, `/aiox-master`, `/aiox-master.md` -> `.aiox-core/development/agents/aiox-master.md`
<!-- AIOX-MANAGED-END: shortcuts -->
<!-- VETFISCAL-START: architecture -->
## VetFiscal OS Architecture Rules

- Keep this repository as a modular Next.js monolith. Do not split into root-level `frontend/` and `backend/` apps unless a later ADR changes this decision.
- Treat frontend work as `src/app`, `src/components`, and `src/modules/*/presentation`.
- Treat backend/domain work as `src/modules/*/domain`, `src/modules/*/application`, `src/modules/*/infrastructure`, `src/shared`, `prisma`, and `tests`.
- Frontend agents must not access Prisma directly and must not implement fiscal logic in React components.
- Backend agents must not place fiscal rules in React and must validate tenant, RBAC, state, and audit requirements in backend/application code.
- Any critical action must preserve tenant isolation, permission checks, auditability, correlation ids, and future idempotency.
- Do not implement real NFS-e issuance, scraping, generic CRUD without workflow, or n8n-based core fiscal automation in this phase.
<!-- VETFISCAL-END: architecture -->

<!-- VETFISCAL-START: agent-routing -->
## VetFiscal Agent and Model Routing

- Use Codex for architecture, implementation, refactors, Prisma, tests, commits, pushes, and full-stack integration.
- Use Gemini for UI, layout, dashboard polish, visual QA, shadcn/ui, lucide-react, Tailwind, and responsive behavior.
- Use Claude for fiscal domain modeling, PRD writing, DDD, workflows, backend reasoning, risk analysis, and long-form documentation.
- Every delegated task must state the affected module, affected layer, operational goal, acceptance criteria, and fiscal/security constraints.
<!-- VETFISCAL-END: agent-routing -->
