# Ativacao Staging/Beta - Sprint 40

## Objetivo
Ativar um ambiente staging/beta controlado para o VetFiscal OS sem commitar secrets e sem habilitar execucao fiscal real.

## Decisao Atual
Usar primeiro um ambiente Vercel preview/staging. Nao promover para producao tecnica e nao habilitar usuarios beta reais ate o smoke com dois tenants da Sprint 42 passar.

## Variaveis Obrigatorias no Provedor
Configure estas variaveis apenas no gerenciamento de ambiente da Vercel/Supabase. Nao commite arquivos de env puxados do provedor.

| Variavel | Escopo | Obrigatoria | Observacoes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Server | Sim | Banco staging/beta, nunca local ou producao sem aprovacao explicita. |
| `DIRECT_URL` | Server | Recomendada | Exigida quando migrations Prisma precisarem de acesso direto ao banco. |
| `NEXT_PUBLIC_APP_ENV` | Browser | Sim | `Staging` ou `Homologacao`. Nunca `Local`. |
| `NEXT_PUBLIC_APP_URL` | Browser | Sim | URL HTTPS do deploy. |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | Sim | URL do projeto Supabase staging/beta. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser | Sim | Anon key publica de staging/beta. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Opcional | Apenas secret manager. Nao exigida no caminho atual do app. |
| `SENTRY_DSN` | Server | Opcional | Manter vazio ate observabilidade ser aprovada. |
| `FEATURE_REAL_NFSE_ENABLED` | Server | Sim | Deve ser `false`. |
| `FEATURE_SCRAPING_ENABLED` | Server | Sim | Deve ser `false`. |
| `FEATURE_MUNICIPAL_PROVIDER_ENABLED` | Server | Sim | Deve ser `false`. |

## Checklist de Ativacao
- [ ] Confirmar que o PR da sprint base esta mergeado na `main`.
- [ ] Vincular workspace local ao projeto Vercel correto com `vercel link --yes`.
- [ ] Configurar env vars no provedor Vercel.
- [ ] Puxar env vars localmente para `.env.local` com `vercel env pull .env.local --yes`.
- [ ] Rodar `npm run ops:check-beta-env -- .env.local`.
- [ ] Rodar `npm run security:secrets`.
- [ ] Aplicar migrations staging/beta com URL de banco aprovada.
- [ ] Fazer deploy preview/staging a partir da branch da sprint ou branch staging protegida.
- [ ] Confirmar que `/api/health` retorna health publico sem secrets.
- [ ] Confirmar que `/login` renderiza.
- [ ] Confirmar que `/dashboard` autenticado renderiza com badge de ambiente esperado.

## Checklist Supabase Auth
- [ ] Configurar Site URL para a URL HTTPS staging/beta.
- [ ] Configurar redirect URL terminando em `/auth/callback`.
- [ ] Confirmar que callbacks local, preview, staging e producao sao especificos por ambiente.
- [ ] Confirmar que e-mails de convite/recuperacao nao incluem CPF, CNPJ, storage path, payload cru ou internals de tenant.
- [ ] Validar login/logout com usuarios ficticios antes de aprovar usuarios beta reais.

## Checklist de Migration
- [ ] Confirmar que o banco alvo e staging/beta.
- [ ] Rodar `npx prisma validate`.
- [ ] Revisar migrations pendentes antes de aplicar.
- [ ] Aplicar migrations com conexao staging/beta aprovada.
- [ ] Registrar comando, timestamp e operador no evidence log do piloto.
- [ ] Preferir forward-fix para falhas, salvo se rollback tiver sido aprovado antes da migration.

## Condicoes de No-Go
- `NEXT_PUBLIC_APP_ENV=Local` em Vercel preview/staging/beta.
- `DATABASE_URL` aponta por acidente para localhost ou producao.
- Qualquer env var obrigatoria ausente.
- Qualquer flag de seguranca fiscal real como `true`.
- Qualquer secret aparece em arquivos do repositorio, screenshots, comentarios de PR ou logs.
- Qualquer caminho habilita emissao oficial de NFS-e, scraping, chamadas a provider municipal, certificados ou jobs fiscais.

## Evidencias a Capturar
- URL do deploy Vercel.
- URL dos GitHub Quality Gates.
- Commit hash.
- Resultado de `npm run ops:check-beta-env -- .env.local` sem imprimir valores de env.
- Resultado de `/api/health` sem secrets.
- Notas de smoke de login/dashboard.

