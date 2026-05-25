# Evidencia - Sprint 53 Supabase Auth Smoke

## Status
Preparacao documental concluida no repositorio. Execucao real continua pendente ate existir projeto Supabase staging/beta, variaveis Vercel configuradas e usuarios beta aprovados.

Decisao atual: NO-GO para uso beta real ate o smoke Supabase Auth com dois tenants estar completo.

## Escopo
- Validar login Supabase Auth em staging/beta.
- Validar resolucao server-side de profile, tenant ativo, membership e role.
- Validar bloqueios para usuario sem membership, usuario suspenso e tenant inativo.
- Validar que evidencias nao exponham secrets ou dados pessoais.
- Manter NFS-e real, scraping, provider municipal, certificado digital e fila fiscal real fora de escopo.

## Evidencias A Capturar
| Evidencia | Responsavel | Status | Link ou referencia segura |
| --- | --- | --- | --- |
| URL staging/beta canonica do projeto `modulo-fiscal` | @devops | Pendente | Pendente |
| Commit hash implantado | Codex/@devops | Pendente | Pendente |
| Quality Gates do commit | Codex/@devops | Pendente | Pendente |
| Resultado de `npm run ops:check-beta-env -- .env.local` | @devops | Pendente | Pendente |
| Resultado de `npm run security:secrets` | Codex/@devops | Pendente | Pendente |
| Redirects Supabase Auth conferidos | @devops + Seguranca/LGPD | Pendente | Pendente |
| Signup publico fechado ou decisao registrada | @pm/@po + Seguranca/LGPD | Pendente | Pendente |
| Usuario aprovado Tenant A autenticado | @qa | Pendente | Pendente |
| Usuario aprovado Tenant B autenticado | @qa | Pendente | Pendente |
| Usuario sem membership bloqueado | @qa | Pendente | Pendente |
| Cross-tenant por URL direta bloqueado | @qa + Seguranca/LGPD | Pendente | Pendente |
| Dashboard renderizado com tenant e role corretos | @qa | Pendente | Pendente |
| Evidencias sem CPF/CNPJ completo, token ou segredo | Seguranca/LGPD | Pendente | Pendente |

## Checklist De Execucao
- [ ] Confirmar que a Vercel canonica e `modulo-fiscal`, nao projeto duplicado.
- [ ] Confirmar Root Directory vazio na Vercel.
- [ ] Confirmar envs staging/beta na Vercel sem `NEXT_PUBLIC_*` sensivel.
- [ ] Confirmar `NEXT_PUBLIC_APP_ENV=Staging` ou `NEXT_PUBLIC_APP_ENV=Homologacao`.
- [ ] Confirmar `FEATURE_REAL_NFSE_ENABLED=false`.
- [ ] Confirmar `FEATURE_SCRAPING_ENABLED=false`.
- [ ] Confirmar `FEATURE_MUNICIPAL_PROVIDER_ENABLED=false`.
- [ ] Confirmar `SUPABASE_SERVICE_ROLE_KEY` vazio ou ausente.
- [ ] Confirmar Supabase Site URL e Redirect URLs.
- [ ] Confirmar usuarios beta criados com menor privilegio.
- [ ] Confirmar `Profile.id` alinhado ao UUID do usuario Supabase Auth.
- [ ] Confirmar memberships ativas para usuarios aprovados.
- [ ] Rodar smoke do runbook `docs/operations/runbooks/supabase-auth-smoke.md`.
- [ ] Atualizar `docs/product/beta-pilot-evidence-log.md` apenas com referencias seguras.

## Bloqueadores Atuais
- Projeto Supabase staging/beta ainda nao registrado neste log.
- URL staging/beta canonica ainda nao registrada neste log.
- Usuarios beta reais/controlados ainda nao registrados fora do repositorio.
- Smoke manual com dois tenants ainda nao executado.

## Criterio De Fechamento Da Sprint 53
- Runbook de smoke Supabase Auth criado.
- Template de evidencia criado.
- Evidence log atualizado sem dados sensiveis.
- Teste automatizado garante que os guardrails estao documentados.
- Piloto real permanece NO-GO ate a execucao externa do smoke.
