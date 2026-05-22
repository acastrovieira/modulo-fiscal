# Setup Supabase - Beta Controlado

## Objetivo
Preparar Supabase Auth e uso futuro de Storage sem introduzir emissao fiscal real, scraping ou integracoes com providers.

## Checklist de Auth
- Configurar a site URL para o ambiente ativo.
- Configurar redirect URLs para `/auth/callback`.
- Usar URLs especificas por ambiente: local, preview, staging e producao nao devem compartilhar callback acidental.
- Confirmar que `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` pertencem ao ambiente correto.
- Armazenar `SUPABASE_SERVICE_ROLE_KEY` apenas no gerenciamento de secrets da Vercel ou Supabase. Nunca commitar.
- Confirmar que `NEXT_PUBLIC_APP_ENV` nao e `Local` fora do desenvolvimento local.

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
