# Migrations de Banco

## Objetivo
Definir como o VetFiscal OS aplica migrations Prisma em ambientes local, staging e futura producao tecnica.

## Local
Desenvolvedores podem usar:
```bash
npx prisma migrate dev
npm run db:seed
```

Reset destrutivo e permitido apenas contra bancos local/demo:
```bash
npx prisma migrate reset
```

## Staging e Producao
Usar apenas migrations revisadas:
```bash
npx prisma migrate deploy
npx prisma validate
```

Antes de aplicar migrations:
- confirmar o ambiente alvo;
- confirmar que a database URL nao e local por engano;
- confirmar GitHub Quality gates verdes;
- confirmar ownership de backup/restore;
- confirmar que flags de seguranca beta permanecem desabilitadas;
- confirmar que nenhuma emissao oficial de NFS-e, scraping ou integracao com provider esta habilitada.

## Politica de Rollback
Preferir migrations forward-fix. Rollback de schema deve ser planejado antes do deploy, com owner nomeado e revisao de impacto em dados. Nao usar `migrate reset` fora de local/demo.

## Evidencias a Capturar
- commit hash;
- nomes dos diretorios de migration;
- URL do CI;
- resumo da saida dos comandos;
- reviewer/aprovador;
- decisao de rollback ou forward-fix.

## Bloqueadores
- `DATABASE_URL` ausente ou ambiente ambiguo.
- `NEXT_PUBLIC_APP_ENV=Local` em preview/staging/producao.
- Secrets presentes no git.
- Issue P0/P1 de isolamento por tenant, auditoria, LGPD ou vazamento de dados.
