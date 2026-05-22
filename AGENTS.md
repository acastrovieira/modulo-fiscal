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

- Use portugues do Brasil como idioma padrao para respostas, documentos, planos, stories, PRDs, ADRs e runbooks do VetFiscal OS.
- Mantenha este repositorio como um monolito modular Next.js. Nao separe em apps raiz `frontend/` e `backend/` sem uma ADR futura mudando essa decisao.
- Trate trabalho de frontend como `src/app`, `src/components` e `src/modules/*/presentation`.
- Trate trabalho de backend/dominio como `src/modules/*/domain`, `src/modules/*/application`, `src/modules/*/infrastructure`, `src/shared`, `prisma` e `tests`.
- Agentes de frontend nao devem acessar Prisma diretamente nem implementar logica fiscal em componentes React.
- Agentes de backend nao devem colocar regras fiscais em React e devem validar tenant, RBAC, estado e auditoria no backend/camada de aplicacao.
- Qualquer acao critica deve preservar isolamento por tenant, permissoes, auditoria, correlation ids e idempotencia futura.
- Nao implemente emissao real de NFS-e, scraping, CRUD generico sem workflow ou automacao fiscal core baseada em n8n nesta fase.
<!-- VETFISCAL-END: architecture -->

<!-- VETFISCAL-START: agent-routing -->
## VetFiscal Agent and Model Routing

- Use Codex para arquitetura, implementacao, refactors, Prisma, testes, commits, pushes e integracao full-stack.
- Use Gemini para UI, layout, refinamento de dashboard, QA visual, shadcn/ui, lucide-react, Tailwind e responsividade.
- Use Claude para modelagem de dominio fiscal, PRDs, DDD, workflows, raciocinio backend, analise de risco e documentacao longa.
- Toda tarefa delegada deve informar modulo afetado, camada afetada, objetivo operacional, criterios de aceite e restricoes fiscais/de seguranca.
<!-- VETFISCAL-END: agent-routing -->
