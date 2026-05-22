# Ambientes - VetFiscal OS

## Objetivo
Definir a matriz operacional para local, preview, staging e producao antes de um beta controlado. Este documento e gate de release: nenhum tenant beta deve ser ativado enquanto ownership de ambiente, secrets e flags de seguranca estiverem ambiguos.

## Matriz
| Ambiente | Finalidade | Politica de dados | Origem do deploy | Gates exigidos |
| --- | --- | --- | --- | --- |
| Local | Workflow de desenvolvimento e seed demo deterministico | Apenas dados ficticios/demo | Maquina local | `npm run lint`, `npm run typecheck`, `npm test`, `npx prisma validate` |
| Preview | Validacao de pull request | Apenas dados ficticios/demo, salvo aprovacao explicita | Branch de preview Vercel | GitHub Quality gates, nenhum secret no repo, flags de seguranca desativadas |
| Staging | Ensaio de beta controlado | Dados sinteticos ou aprovados semelhantes ao beta | Branch staging protegida ou preview promovido | Quality gates, smoke test, migrations revisadas |
| Producao tecnica | Operacao comercial futura da aplicacao | Dados reais apenas apos go/no-go beta | `main` protegida/promocao de producao | Quality gates, go/no-go, aprovacao de migration, responsavel por rollback |
| Producao fiscal | Operacao com emissao oficial de NFS-e | Dados fiscais reais autorizados | Futuro, apenas apos PRD/ADR/homologacao | Aprovacao fiscal, homologacao, certificado aprovado, contingencia e auditoria |

## Variaveis Obrigatorias
- `DATABASE_URL`: connection string de banco apenas server-side.
- `DIRECT_URL`: URL direta de banco apenas server-side para migrations Prisma quando necessario.
- `NEXT_PUBLIC_APP_ENV`: um de `Local`, `Staging`, `Homologacao`, `Producao`.
- `NEXT_PUBLIC_APP_URL`: URL publica do app para redirects.
- `NEXT_PUBLIC_SUPABASE_URL`: URL publica do projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key publica do Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: secret apenas server-side, nunca browser, nunca git.
- `SENTRY_DSN`: vazio/inativo ate aprovacao futura de observabilidade.
- `FEATURE_REAL_NFSE_ENABLED`: deve permanecer `false`.
- `FEATURE_SCRAPING_ENABLED`: deve permanecer `false`.
- `FEATURE_MUNICIPAL_PROVIDER_ENABLED`: deve permanecer `false`.

## Regras Duras
- `NEXT_PUBLIC_APP_ENV=Local` e proibido em Vercel preview, staging e producao.
- `.env.local` e arquivos de env puxados da Vercel nunca sao commitados.
- Deploys preview nao devem apontar para credenciais de banco de producao.
- Service role keys ficam configuradas apenas em gerenciadores de segredo Vercel/Supabase.
- Nenhuma emissao oficial de NFS-e, scraping, chamada a provider municipal, certificado ou fila fiscal e habilitada no beta.
- Producao tecnica nao significa producao fiscal.

## Comandos de Setup
```bash
npm ci
npx prisma generate
npm run lint
npm run typecheck
npm test
npm run security:secrets
npx prisma validate
npm run build
```

Use `vercel env pull .env.local --yes` apenas depois de vincular o projeto ao Vercel correto. Rode novamente o scanner de secrets apos qualquer operacao com arquivo de ambiente.
