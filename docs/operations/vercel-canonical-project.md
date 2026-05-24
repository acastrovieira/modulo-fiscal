# Projeto Vercel Canonico - Sprint 51

## Decisao
O projeto Vercel canonico do VetFiscal OS e:

```txt
modulo-fiscal
```

O projeto Vercel duplicado:

```txt
vetfiscal
```

deve permanecer desconectado do GitHub e nao deve criar deploy automatico para `acastrovieira/modulo-fiscal`.

## Configuracao Esperada do Projeto Canonico
| Item | Valor esperado |
| --- | --- |
| Workspace Vercel | `acastrovieiras-projects` |
| Projeto Vercel | `modulo-fiscal` |
| Repositorio GitHub | `acastrovieira/modulo-fiscal` |
| Production branch | `main` |
| Framework preset | `Next.js` |
| Root directory | `vetfiscal` |
| Build command | Padrao Next.js ou `npm run build` |
| Install command | Padrao Vercel ou `npm install` |
| Output directory | Padrao Next.js `.next` |
| Include files outside root directory | Habilitado por enquanto |

## Evidencia Manual Registrada
Em 2026-05-24, durante a Sprint 51:

- O projeto `modulo-fiscal` foi confirmado conectado ao repositorio `acastrovieira/modulo-fiscal`.
- O root directory do projeto `modulo-fiscal` foi confirmado como `vetfiscal`.
- O projeto `vetfiscal` foi confirmado sem repositorio Git conectado.

## Motivo
A Sprint 50 identificou deploy duplicado em dois projetos Vercel para o mesmo PR:

- `modulo-fiscal`
- `vetfiscal`

Isso criava ambiguidade operacional, risco de testar o deploy errado e risco de promover ambiente incorreto. A Sprint 51 corrige a decisao operacional: apenas `modulo-fiscal` deve representar o VetFiscal OS na Vercel.

## Variaveis Minimas Para Preview/Staging
Configurar somente no painel da Vercel ou via `vercel env`, nunca em arquivos versionados:

```txt
NEXT_PUBLIC_APP_ENV=Staging
NEXT_PUBLIC_APP_URL=<url-do-preview-ou-staging>
FEATURE_REAL_NFSE_ENABLED=false
FEATURE_SCRAPING_ENABLED=false
FEATURE_MUNICIPAL_PROVIDER_ENABLED=false
DATABASE_URL=<postgres-staging-ou-demo>
NEXT_PUBLIC_SUPABASE_URL=<supabase-staging>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-staging>
```

Variaveis sensiveis, quando existirem, devem ser server-only:

```txt
DIRECT_URL
SUPABASE_SERVICE_ROLE_KEY
SENTRY_DSN
```

## Checks Obrigatorios No Proximo PR
- [ ] GitHub mostra `Vercel - modulo-fiscal`.
- [ ] GitHub nao mostra `Vercel - vetfiscal`.
- [ ] `/api/health` no preview canonico nao reporta `Local`.
- [ ] `/api/health` nao expoe secrets, connection string, CPF/CNPJ completo ou stack trace.
- [ ] `/login` renderiza.
- [ ] `/dashboard` sem sessao bloqueia ou redireciona sem erro 500.
- [ ] Nenhuma emissao oficial de NFS-e, scraping, provider municipal, certificado ou fila fiscal real esta habilitada.

## Criterios NO-GO
- Qualquer PR volta a criar deploy em `vetfiscal`.
- `NEXT_PUBLIC_APP_ENV=Local` aparece em preview/staging.
- `/dashboard` retorna 500 sem sessao.
- `/api/health` expoe segredo ou retorna informacao sensivel.
- Qualquer caminho habilita emissao oficial de NFS-e, scraping, provider municipal, certificado ou job fiscal real.
