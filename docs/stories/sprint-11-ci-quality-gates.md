# Story - Sprint 11 CI Quality Gates e GitHub Workflow

## Status
Done

## Objetivo
Garantir que todo push e pull request relevante rode a regressao minima do VetFiscal OS automaticamente, sem exigir secrets reais, banco real, migrations destrutivas, scraping ou provider fiscal externo.

## Tarefas
- [x] Criar workflow GitHub Actions em `.github/workflows/ci.yml`.
- [x] Rodar `npm ci` para instalacao reproduzivel pelo lockfile.
- [x] Configurar Node.js 22 com cache npm.
- [x] Rodar `npx prisma generate`.
- [x] Rodar `npx prisma validate` com `DATABASE_URL` e `DIRECT_URL` locais/ficticias.
- [x] Rodar `npm run lint`.
- [x] Rodar `npm run typecheck`.
- [x] Rodar `npm test`.
- [x] Rodar `npm run build`.
- [x] Publicar resumo do workflow no GitHub Step Summary.
- [x] Documentar politica de CI/PR no README.
- [x] Adicionar badge de CI no README.
- [x] Confirmar que o workflow nao usa secrets reais.
- [x] Confirmar que o workflow nao executa migrations, seed ou reset.

## Criterios de Aceite
- [x] CI cobre lint, typecheck, test, Prisma validate e build.
- [x] Workflow falha se qualquer gate principal falhar.
- [x] Workflow nao depende de PostgreSQL real nesta fase.
- [x] Workflow nao contem secrets reais.
- [x] Workflow nao chama provider externo, scraping, emissao NFS-e, migrations ou reset.
- [x] README aponta status do CI e politica de PR.
- [x] Gates locais seguem verdes apos criar o workflow.

## Gates Locais
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`

## Agentes
- Codex: implementacao do workflow, docs, gates e git.
- @devops: revisao de pipeline, cache, envs e comandos seguros.
- @qa: criterios de bloqueio, regressao minima e riscos de seguranca.

## Observacoes
- O CI nao roda `npm run db:seed` porque isso exigiria banco local ativo no runner.
- O CI nao roda `npx prisma migrate dev` porque a Sprint 11 valida qualidade de codigo e schema, nao provisionamento de banco.
- Protecao de branch no GitHub deve ser configurada manualmente para exigir o check `Quality gates` antes de merge.