# Sprint 37 - Environments, Supabase e Vercel Release Prep

## Objetivo
Preparar ambiente beta reproduzivel, com secrets fora do repositorio e rollback documentado antes de qualquer usuario real.

## Checklist
- [x] Documentar matriz `local`, `preview`, `staging` e `production`.
- [x] Definir variaveis por ambiente: Supabase URL/anon, `DATABASE_URL`, `APP_ENV`, safety flags e Sentry vazio/inativo.
- [x] Criar checklist Supabase Auth: redirects, dominios, templates, storage futuro e RLS futura.
- [x] Definir politica de migrations em staging/prod.
- [x] Documentar rollback Vercel e rollback/forward-fix de banco.
- [x] Confirmar branch protection e Quality Gates obrigatorios por release docs.

## Gates
- [x] Deploy beta/staging e reproduzivel por runbook.
- [x] Secrets permanecem fora do repositorio.
- [x] Rollback esta documentado antes de usuario real.
- [x] `NEXT_PUBLIC_APP_ENV=Local` fica proibido fora do ambiente local.
