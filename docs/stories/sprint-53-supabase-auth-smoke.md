# Sprint 53 - Supabase Auth Smoke Staging/Beta

## Objetivo
Preparar a execucao segura do primeiro smoke real de Supabase Auth em staging/beta, conectando Vercel, Supabase, usuarios aprovados, tenant/RBAC e evidencias operacionais sem versionar secrets.

## Escopo Entregue
- [x] Criar runbook operacional de smoke Supabase Auth.
- [x] Criar template de evidencia para ativacao e smoke.
- [x] Atualizar log de evidencias do piloto beta com referencias da Sprint 53.
- [x] Adicionar teste automatizado para proteger os guardrails de auth, tenant, secrets e ausencia de emissao real.

## Fora De Escopo
- Configurar secrets reais no repositorio.
- Criar projeto Supabase real via codigo.
- Rodar migrations em banco staging/beta sem credencial aprovada.
- Criar usuarios reais no Supabase Auth.
- Habilitar Supabase Storage.
- Implementar emissao real de NFS-e, scraping, provider municipal, certificado digital ou fila fiscal real.

## Squad Recomendado
- Codex: documentacao operacional, testes, commit, PR e gates.
- @devops: configuracao real no painel Vercel/Supabase.
- Seguranca/LGPD: revisao de secrets, redirects, signup e evidencias.
- @qa: smoke com dois tenants e cenarios negativos.

## Gates
- [x] Documentacao nao contem secrets.
- [x] Runbook exige dois tenants e cenarios negativos.
- [x] Service role continua fora do browser, repo e evidencias.
- [x] Piloto real segue NO-GO ate smoke externo concluido.
- [ ] Execucao real em staging/beta concluida por @devops/@qa.

## Testes
- [x] `npm test -- tests/release/supabase-auth-smoke-docs.test.ts`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run security:secrets`
- [ ] `git diff --check`

## Proximo Passo
Depois do merge, configurar Supabase staging/beta fora do repositorio, preencher variaveis na Vercel, rodar `npm run ops:check-beta-env -- .env.local` com arquivo local nao versionado e executar o smoke manual do runbook.
