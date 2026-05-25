# Supabase Staging/Beta - Sprint 52

## Objetivo
Preparar a ativacao de Supabase Auth e Postgres staging/beta para o VetFiscal OS, mantendo tenant/RBAC/auditoria no backend, migrations via Prisma e dados demo 100% ficticios.

## Decisao Arquitetural
- Supabase Auth fornece identidade e sessao.
- `Profile.id` deve corresponder ao `id` do usuario autenticado no Supabase Auth.
- Prisma continua sendo a camada de banco da aplicacao.
- Tenant, RBAC, auditoria e isolamento continuam no backend do VetFiscal.
- Supabase RLS fica fora do escopo desta sprint; se entrar depois, exige ADR e testes dedicados.
- Supabase Storage continua futuro; nenhum upload/download real sera habilitado nesta sprint.
- `SUPABASE_SERVICE_ROLE_KEY` nao e exigida no caminho atual do app e deve permanecer vazia salvo necessidade server-side futura aprovada.

## Passos No Painel Supabase
- [ ] Criar projeto exclusivo para staging/beta, sem reaproveitar producao.
- [ ] Copiar apenas `Project URL` e `anon public key` para variaveis Vercel apropriadas.
- [ ] Manter `service_role` fora do repositorio e fora do browser.
- [ ] Configurar Auth Site URL para o preview/staging canonico.
- [ ] Configurar Redirect URLs:
  - `https://<preview-ou-staging-canonico>/**`
  - `https://<preview-ou-staging-canonico>/auth/callback`
  - `http://localhost:3000/**` apenas para desenvolvimento local.
- [ ] Desabilitar signup publico se o beta for fechado.
- [ ] Criar usuarios beta manualmente ou via fluxo aprovado.
- [ ] Confirmar templates de email sem CPF/CNPJ, tenant internals, storage path ou payload cru.

## Passos Na Vercel
Configurar no projeto canonico `modulo-fiscal`.

Variaveis de Preview/Staging:

```txt
NEXT_PUBLIC_APP_ENV=Staging
NEXT_PUBLIC_APP_URL=<url-preview-ou-staging>
NEXT_PUBLIC_SUPABASE_URL=<https://project.supabase.co>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-staging>
DATABASE_URL=<postgres-staging-pooled-ou-direto>
DIRECT_URL=<postgres-staging-direto-quando-necessario>
FEATURE_REAL_NFSE_ENABLED=false
FEATURE_SCRAPING_ENABLED=false
FEATURE_MUNICIPAL_PROVIDER_ENABLED=false
SUPABASE_SERVICE_ROLE_KEY=
SENTRY_DSN=
```

Nunca configurar como `NEXT_PUBLIC_*`:
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- tokens;
- senhas;
- private keys.

## Migrations e Seed
- [ ] Rodar `npx prisma validate` com `DATABASE_URL` de staging.
- [ ] Rodar `npx prisma migrate deploy` no banco staging/beta aprovado.
- [ ] Rodar `npm run db:seed` apenas em demo/staging, nunca em producao.
- [ ] Criar usuarios Supabase Auth com os mesmos UUIDs dos profiles demo ou ajustar profiles/memberships para os UUIDs reais do Auth.
- [ ] Confirmar que seed nao contem CPF/CNPJ real, email real de cliente, telefone real, storage path real ou payload cru.

## Smoke Minimo
- [ ] `npm run ops:check-beta-env -- .env.local` passa sem imprimir valores.
- [ ] `npm run security:secrets` passa.
- [ ] `/api/health` nao retorna `Local`.
- [ ] `/login` renderiza.
- [ ] Login com usuario beta aprovado funciona.
- [ ] Usuario sem membership nao acessa dashboard.
- [ ] Tenant ativo e role aparecem coerentes.
- [ ] Nenhuma acao sugere emissao oficial de NFS-e.

## Criterios GO
- Projeto Supabase staging separado.
- Vercel canonica `modulo-fiscal` aponta para Supabase staging.
- Auth redirects/callbacks configurados.
- Prisma validate/migrate passam no banco staging.
- Seed demo, se usado, contem apenas dados ficticios.
- Service role nao aparece em browser, repo, logs ou evidence.
- Safety flags fiscais seguem `false`.

## Criterios NO-GO
- Usar banco, service role, anon key ou usuario de producao.
- `NEXT_PUBLIC_APP_ENV=Local` em preview/staging.
- `DATABASE_URL` ou `DIRECT_URL` local no ambiente beta.
- `SUPABASE_SERVICE_ROLE_KEY` preenchida em arquivo versionado ou exposta como `NEXT_PUBLIC_*`.
- Signup publico aberto sem decisao de produto/seguranca.
- Redirect URL ampla demais ou apontando para dominio nao aprovado.
- Seed/import com dados reais.
- Qualquer caminho habilitando emissao oficial de NFS-e, scraping, provider municipal, certificado ou fila fiscal real.
