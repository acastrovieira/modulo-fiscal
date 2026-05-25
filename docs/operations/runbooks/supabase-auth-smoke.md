# Runbook - Smoke Supabase Auth Staging/Beta

## Objetivo
Validar que o ambiente staging/beta do VetFiscal OS autentica usuarios aprovados via Supabase Auth, resolve tenant e RBAC no backend e mantem o piloto bloqueado para qualquer uso fiscal real.

Este smoke nao autoriza emissao oficial de NFS-e, scraping, provider municipal, certificado digital, fila fiscal real ou uso de dados pessoais reais.

## Pre-Requisitos
- Projeto Vercel canonico `modulo-fiscal` conectado ao repositorio correto.
- Root Directory da Vercel vazio, pois o app esta na raiz do repositorio.
- Projeto Supabase exclusivo para staging/beta.
- Variaveis staging/beta configuradas apenas na Vercel e no Supabase, nunca em arquivo versionado.
- `NEXT_PUBLIC_APP_ENV` definido como `Staging` ou `Homologacao`.
- Flags `FEATURE_REAL_NFSE_ENABLED`, `FEATURE_SCRAPING_ENABLED` e `FEATURE_MUNICIPAL_PROVIDER_ENABLED` definidas como `false`.
- `SUPABASE_SERVICE_ROLE_KEY` ausente ou vazia no caminho atual do app.
- Usuarios beta aprovados fora do repositorio.
- Profiles e memberships alinhados aos UUIDs reais do Supabase Auth.
- `Profile.id` deve corresponder aos UUIDs reais do Supabase Auth para usuarios beta aprovados.

## Checklist De Ambiente
- [ ] Rodar `npm run ops:check-beta-env -- .env.local` usando um arquivo local temporario nao versionado.
- [ ] Confirmar que o comando nao imprime `DATABASE_URL`, anon key, tokens ou secrets.
- [ ] Rodar `npm run security:secrets`.
- [ ] Confirmar que `/api/health` responde com ambiente diferente de `Local`.
- [ ] Confirmar que `/login` renderiza sem erro cru.
- [ ] Confirmar que Vercel Authentication, se ativa no preview, esta documentada como protecao externa.

## Checklist Supabase Auth
- [ ] Site URL aponta para a URL staging/beta canonica.
- [ ] Redirect URLs incluem somente dominios aprovados:
  - `https://<staging-ou-preview-canonico>/auth/callback`
  - `https://<staging-ou-preview-canonico>/**`
  - `http://localhost:3000/**` somente para desenvolvimento local.
- [ ] Signup publico esta desabilitado para beta fechado, salvo decisao explicita de produto e seguranca.
- [ ] Templates de email nao contem CPF/CNPJ, tenant internals, storage path, payload cru ou dado fiscal sensivel.
- [ ] Service role nao foi usada em browser, log, print, evidencia publica ou arquivo local versionado.

## Roteiro De Smoke
Use dois tenants controlados, `Tenant A` e `Tenant B`, com dados ficticios ou controlados.

| Etapa | Resultado esperado | Resultado | Evidencia segura |
| --- | --- | --- | --- |
| Login com usuario aprovado Tenant A | Sessao criada e callback retorna para rota local | Pendente | Pendente |
| Abrir `/dashboard` Tenant A | Cockpit renderiza com tenant e role corretos | Pendente | Pendente |
| Abrir importacoes Tenant A | Somente dados do Tenant A aparecem | Pendente | Pendente |
| Abrir candidatos Tenant A | Documentos aparecem mascarados | Pendente | Pendente |
| Abrir inconsistencias Tenant A | Acoes respeitam role e estado | Pendente | Pendente |
| Abrir lotes Tenant A | Nao ha emissao oficial disponivel | Pendente | Pendente |
| Abrir auditoria Tenant A | Eventos redigidos e tenant-scoped | Pendente | Pendente |
| Login com usuario aprovado Tenant B | Sessao criada no segundo tenant | Pendente | Pendente |
| Repetir jornada Tenant B | Dados do Tenant A nao aparecem | Pendente | Pendente |
| Tentar URL direta cross-tenant | Request bloqueado sem enumeracao | Pendente | Pendente |
| Login com usuario sem membership | Dashboard bloqueado com erro seguro | Pendente | Pendente |
| Usuario suspenso ou tenant inativo | Acesso bloqueado | Pendente | Pendente |

Resultado obrigatorio: Usuario sem membership nao acessa dashboard.

## Evidencias Permitidas
- URL do deploy staging/beta sem tokens.
- Commit hash e link do CI.
- Resultado textual de gates sem valores de env.
- Screenshots com dados ficticios, documentos mascarados e sem e-mails pessoais reais.
- Lista de checks concluida com responsavel e data.

## Evidencias Proibidas
- `DATABASE_URL`, `DIRECT_URL`, service role, tokens, senhas ou private keys.
- CPF/CNPJ completo, documentos pessoais reais, telefones reais ou e-mails reais de clientes.
- Storage path real, payload cru de importacao ou resposta de provider.
- Prints do painel Supabase/Vercel que revelem segredo.

## Criterios GO
- Login Supabase funciona para usuario aprovado.
- Tenant ativo e role sao resolvidos no backend.
- Usuario sem membership ou suspenso nao acessa dashboard.
- Dois tenants passam no smoke sem vazamento cruzado.
- Auditoria e DTOs publicos permanecem redigidos.
- Todas as flags fiscais reais continuam `false`.

## Criterios NO-GO
- Qualquer vazamento cross-tenant.
- Qualquer secret exposto em log, print, output, evidencia ou arquivo versionado.
- Qualquer dado pessoal real sem aprovacao e redacao.
- Qualquer caminho que sugira ou habilite emissao oficial de NFS-e, scraping, provider municipal, certificado ou fila fiscal real.
- Signup publico aberto sem decisao explicita de produto e seguranca.
