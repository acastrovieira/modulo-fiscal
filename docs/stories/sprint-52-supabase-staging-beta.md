# Sprint 52 - Supabase Staging/Beta

## Status
Preparacao tecnica documentada e guardrails de ambiente fortalecidos.

## Objetivo
Preparar o VetFiscal OS para conectar Vercel Preview/Staging ao Supabase Auth e Postgres staging/beta, sem versionar secrets e sem habilitar fluxo fiscal real.

## Entregas
- [x] Fortalecer `npm run ops:check-beta-env` para Supabase staging.
- [x] Validar que `NEXT_PUBLIC_SUPABASE_URL` usa URL Supabase HTTPS.
- [x] Bloquear anon key placeholder.
- [x] Bloquear `DIRECT_URL` local em staging/beta.
- [x] Bloquear secrets acidentais em variaveis `NEXT_PUBLIC_*`.
- [x] Documentar runbook `docs/operations/supabase-staging-beta.md`.
- [x] Atualizar `docs/operations/supabase-setup.md`.
- [x] Manter `.env.example` sem secrets.

## Dependencias Externas Pendentes
- [ ] Criar projeto Supabase staging/beta.
- [ ] Configurar Auth Site URL e Redirect URLs.
- [ ] Configurar variaveis no projeto Vercel canonico `modulo-fiscal`.
- [ ] Aplicar migrations Prisma no banco staging/beta.
- [ ] Criar usuarios beta/demo aprovados.
- [ ] Rodar seed demo apenas com dados ficticios.

## Gate
- [ ] `npm run ops:check-beta-env -- .env.local` passa com env staging real.
- [ ] `npx prisma migrate deploy` aplicado no banco staging/beta.
- [ ] `/api/health` nao reporta `Local`.
- [ ] Login Supabase funciona com usuario beta/demo aprovado.
- [ ] Nenhum secret ou dado pessoal real aparece em repo, browser, logs ou evidencia.

## Fora de Escopo
- Supabase Storage real.
- RLS como barreira principal.
- Service role obrigatoria.
- Resend/e-mail transacional real.
- NFS-e oficial, scraping, provider municipal, certificado ou fila fiscal real.
