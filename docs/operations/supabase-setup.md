# Setup Supabase - Beta Controlado

## Objetivo
Preparar Supabase Auth e uso futuro de Storage sem introduzir emissao fiscal real, scraping ou integracoes com providers.

## Checklist de Auth
- Configurar a site URL para o ambiente ativo.
- Configurar redirect URLs para `/auth/callback`.
- Para staging/beta, adicionar allowlist apenas para URLs esperadas:
  - preview canonico Vercel do projeto `modulo-fiscal`;
  - dominio staging/beta aprovado, quando existir;
  - `http://localhost:3000/**` apenas para desenvolvimento local.
- Usar URLs especificas por ambiente: local, preview, staging e producao nao devem compartilhar callback acidental.
- Confirmar que `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` pertencem ao ambiente correto.
- Armazenar `SUPABASE_SERVICE_ROLE_KEY` apenas no gerenciamento de secrets da Vercel ou Supabase. Nunca commitar.
- Confirmar que `NEXT_PUBLIC_APP_ENV` nao e `Local` fora do desenvolvimento local.
- Desabilitar signup publico se o beta for fechado e os usuarios forem convidados/controlados.

## E-mails e Templates
- Manter templates neutros e operacionais.
- Nao incluir CPF, CNPJ, nomes de documentos, storage paths ou detalhes internos de tenant em templates de e-mail.
- Validar fluxos de convite e recuperacao com usuarios ficticios antes do beta.

## Politica de Storage
Supabase Storage permanece futuro para esta trilha beta. Ate existir implementacao explicita:

- nenhuma signed upload URL e exposta;
- nenhum storage path e aceito via payload de client;
- nenhum download de documento de producao e habilitado;
- storage paths permanecem gerados no servidor e redigidos em DTOs/auditoria.

## Banco e RLS
O MVP usa guards de tenant na camada de aplicacao com Prisma. Se Supabase RLS for introduzido depois, deve ter ADR e testes separados. Para esta preparacao beta, migrations Prisma e isolamento por tenant na aplicacao seguem como fonte de verdade.

## Postgres Staging/Beta
- Criar um projeto Supabase separado para staging/beta.
- Usar `DATABASE_URL` e `DIRECT_URL` do Postgres staging/beta apenas em secret manager.
- Aplicar migrations com `npx prisma migrate deploy` somente depois de confirmar o projeto e o banco alvo.
- Rodar `npm run db:seed` apenas quando o ambiente for demo/staging e com dados 100% ficticios.
- Confirmar que `Profile.id` corresponde ao `id` do usuario Supabase Auth para usuarios beta reais.
- Nunca reutilizar banco, service role ou certificados de producao no staging/beta.

## Validacao de Ambiente
Antes de qualquer smoke beta, preparar arquivo local temporario com valores redigidos/puxados do ambiente e rodar:

```bash
npm run ops:check-beta-env -- .env.local
npm run security:secrets
```

O validador bloqueia:
- `DATABASE_URL` ou `DIRECT_URL` apontando para localhost;
- `NEXT_PUBLIC_APP_ENV=Local`;
- `NEXT_PUBLIC_SUPABASE_URL` fora do formato `https://<project>.supabase.co`;
- anon key placeholder;
- qualquer `NEXT_PUBLIC_*` que exponha service role, token, secret, senha, private key, `DATABASE_URL` ou `DIRECT_URL`;
- flags fiscais reais ligadas.

## Evidencia Minima
- URL do projeto Supabase staging, sem chaves.
- URL do preview/staging Vercel.
- Resultado de `npm run ops:check-beta-env`.
- Resultado de `npm run security:secrets`.
- Resultado de `npx prisma validate`.
- Resultado de `npx prisma migrate deploy` ou registro de que migrations ainda nao foram aplicadas.
- Resultado de `npm run db:seed`, se usado em ambiente demo.
- Confirmacao de redirects/callbacks Supabase Auth.
- Confirmacao de que nenhum dado real foi usado no seed.

## Gates Obrigatorios
- GitHub Quality gates verdes.
- `npm run lint`.
- `npm run typecheck`.
- `npm test`.
- `npm run security:secrets`.
- `npx prisma validate`.
- `npm run build`.

## Fora de Escopo Explicito
- Sem emissao oficial de NFS-e.
- Sem scraping.
- Sem integracao com provider municipal.
- Sem tratamento de certificado.
- Sem execucao de fila/job fiscal.
