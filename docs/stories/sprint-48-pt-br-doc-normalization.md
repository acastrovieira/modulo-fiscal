# Sprint 48 - Normalizacao PT-BR da Documentacao Beta

## Status
Concluida tecnicamente.

## Objetivo
Normalizar documentos criticos de beta, release, ambiente e piloto para portugues do Brasil, preservando termos tecnicos necessarios e mantendo explicito que o VetFiscal OS segue em beta fiscal supervisionado, sem emissao oficial de NFS-e.

## Escopo Executado
- [x] Normalizar roadmap de execucao do beta controlado.
- [x] Normalizar evidence log do piloto beta.
- [x] Normalizar runbooks de release beta, smoke beta, piloto controlado e ativacao staging/beta.
- [x] Normalizar documentos de Supabase, Vercel e migrations.
- [x] Normalizar pacote de release candidate, readiness do piloto, usuarios/roles/tenants beta e smoke com dois tenants.
- [x] Normalizar stories das Sprints 44 e 45.
- [x] Atualizar smoke test de release para validar a linguagem PT-BR nos documentos criticos.

## Guardrails de Linguagem
- Usar "beta fiscal supervisionado" para o escopo atual.
- Usar "emissao oficial de NFS-e" apenas como algo fora de escopo nesta fase.
- Usar "producao tecnica" quando o assunto for build/deploy, evitando confusao com producao fiscal.
- Evitar copy que sugira emissao real, integracao com provider municipal, scraping, certificado digital ou fila fiscal real.

## Fora de Escopo
- Nenhuma mudanca de codigo de produto.
- Nenhuma alteracao de schema Prisma.
- Nenhum deploy ou configuracao de secret.
- Nenhuma implementacao de emissao real de NFS-e.

## Squad
- Codex: execucao, testes, git e PR.
- @po: revisao de linguagem de produto e escopo beta.
- @qa: foco em consistencia dos gates e ausencia de regressao documental.

## Gate
- [x] `npm test -- tests/release/release-prep-smoke.test.ts` aprovado.
- [x] Gates locais aprovados: lint, typecheck, tests, security:secrets, prisma validate e build.
- [ ] Quality Gates do PR aprovados no GitHub.
