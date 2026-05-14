# Story - Sprint 10 Setup Local Seed e Demo Data

## Status
Done

## Objetivo
Permitir que qualquer dev ou agente rode o VetFiscal OS localmente com dados demo seguros, reproduziveis e uteis no cockpit operacional.

## Tarefas
- [x] Corrigir README removendo literais invalidos de quebra de linha.
- [x] Documentar setup local com install, env, Prisma generate, migrate, seed e dev server.
- [x] Documentar reset local manual com aviso destrutivo.
- [x] Manter ausencia de script `db:reset`.
- [x] Atualizar `.env.example` com `DATABASE_URL`, `DIRECT_URL` e app URL local.
- [x] Criar `prisma/seed.js` em CommonJS, sem dependencia nova.
- [x] Configurar Prisma seed como `node prisma/seed.js`.
- [x] Criar script `npm run db:seed`.
- [x] Seedar um tenant completo demo compativel com `currentTenant` local.
- [x] Seedar usuarios `@vetfiscal.local` por roles principais.
- [x] Seedar documento, importacao, linhas, candidatos, inconsistencias, lotes e auditoria.
- [x] Garantir dados mascarados e ficticios.
- [x] Garantir metadata `externalProviderCalled: false` e `nfseIssued: false` nos eventos demo de lote.
- [x] Criar smoke test de seguranca do seed demo.

## Criterios de Aceite
- [x] Seed usa IDs deterministicos e `upsert` para reduzir duplicacao.
- [x] Dados demo nao usam e-mail externo, CPF/CNPJ real ou dado pessoal real.
- [x] README explica reset destrutivo apenas como comando manual.
- [x] Nenhum script destrutivo de reset foi adicionado.
- [x] Teste do seed valida documentos mascarados e ausencia de provider/scraping/emissao real.
- [x] Gates globais verdes.

## Gates
- [x] `node --check prisma/seed.js`
- [x] `npm test -- tests/seed/demo-seed.test.ts`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`

## Agentes
- Codex: implementacao do seed, scripts, docs, testes e gates.
- @devops: revisao de setup local, idempotencia e reset manual.
- @qa: smoke de dados demo, seguranca, idempotencia e cockpit.

## Observacoes
- `npm run db:seed` deve ser executado depois de migrations aplicadas no banco local. Tentativa realizada nesta sprint falhou apenas porque nao havia PostgreSQL acessivel em `localhost:5432`.
- Esta sprint nao cria seed multi-tenant; tenant isolation avancado fica para sprint futura.
- Esta sprint nao cria `db:reset` por decisao de seguranca operacional.
