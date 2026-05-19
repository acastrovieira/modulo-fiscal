# Sprint 38 - Beta Release Candidate e Evidence Pack

## Objetivo
Fechar um pacote de release candidate com evidencias objetivas para decidir se o VetFiscal OS pode seguir para piloto beta controlado.

## Checklist
- [x] Criar evidence pack do release candidate.
- [x] Conectar evidence pack ao checklist beta e runbook de release.
- [x] Registrar escopo permitido e fora de escopo.
- [x] Registrar riscos aceitos e bloqueadores.
- [x] Criar testes de documentacao para impedir release sem guardrails.
- [ ] Anexar URL do CI depois que o PR for aberto.
- [ ] Rodar smoke manual/e2e com dois tenants em staging/beta.

## Gate
- [x] Nenhuma emissao real de NFS-e foi introduzida.
- [x] Nenhum scraping foi introduzido.
- [x] Nenhum provider municipal, certificado ou fila fiscal real foi introduzido.
- [x] Beta real permanece NO-GO ate haver PR mergeado, CI verde e aprovacao operacional.

## Evidencias
- `docs/product/beta-release-candidate-evidence-pack.md`
- `docs/product/beta-readiness-checklist.md`
- `docs/operations/runbooks/beta-release.md`
- `tests/release/release-prep-smoke.test.ts`

## Squad Recomendado
- Codex: docs, testes, gates, PR e integracao.
- @pm/@po: go/no-go e escopo beta.
- @qa: smoke de dois tenants e evidencias.
- @devops: CI, Vercel, Supabase e rollback.

