# Preparacao de Release Vercel

## Objetivo
Definir o caminho controlado de release Vercel para o beta do VetFiscal OS sem commitar secrets ou contornar GitHub Quality gates.

## Mapeamento do Projeto
- Deploys de preview sao criados a partir de branches de pull request.
- Staging deve usar ambiente preview/staging explicitamente escopado.
- Promocao para producao tecnica exige decisao go/no-go e nenhum bloqueador beta P0/P1.

## Variaveis de Ambiente
Usar variaveis de ambiente da Vercel em vez de arquivos `.env` commitados.

Sincronizacao local recomendada:
```bash
vercel link --yes
vercel env pull .env.local --yes
npm run security:secrets
```

Nunca commitar `.env.local`, `.vercel/project.json`, service role keys, credenciais de banco, tokens ou credenciais de provider.

## Gates de Release
- Pull request aponta para `main` protegida.
- Check GitHub `Quality gates` verde.
- `npm run lint` aprovado.
- `npm run typecheck` aprovado.
- `npm test` aprovado.
- `npm run security:secrets` aprovado.
- `npx prisma validate` aprovado.
- `npm run build` aprovado.
- `NEXT_PUBLIC_APP_ENV` e `Staging`, `Homologacao` ou `Producao`, nunca `Local`.
- Flags de seguranca permanecem desabilitadas: NFS-e real, scraping e provider municipal.

## Rollback
Usar rollback da Vercel ou promover o ultimo deploy bom conhecido. Mudancas de banco devem ser tratadas por forward-fix, salvo se um plano de rollback tiver sido explicitamente aprovado antes da migration.

Comandos para operadores:
```bash
vercel ls
vercel inspect <deployment-url>
vercel logs <deployment-url>
vercel rollback
```

## Smoke Pos-Deploy
- `/api/health` retorna health report publico sem secrets.
- `/dashboard` renderiza.
- Paginas de workflow renderizam: importacoes, candidatos, inconsistencias, lotes, auditoria, documentos.
- Erros de API mantem `{ error: { code, message, requestId } }`.
- Nenhuma emissao oficial de NFS-e, scraping, chamada a provider, certificado ou fila fiscal roda.
