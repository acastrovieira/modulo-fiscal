# Sprint 21 - Security, Tenant e LGPD Hardening

## Status
Concluida.

## Objetivo
Reduzir risco operacional apos onboarding e tenant bootstrap, reforcando guardrails de secrets, sessao/cookies, tenant isolation e inventario LGPD antes de crescer o dominio fiscal.

## Escopo Entregue
- Script `npm run security:secrets` para bloquear chaves privadas, service accounts Google, comandos persistidos de provisionamento de secrets Supabase e `SUPABASE_SERVICE_ROLE_KEY` preenchida.
- Quality Gates do GitHub executam o scanner de secrets.
- `.gitignore` bloqueia formatos comuns de chaves, service accounts e arquivos de comando com secrets.
- Logout limpa o cookie de tenant ativo usando as mesmas flags endurecidas do cookie original.
- Testes cobrem scanner, CI guardrail, `.gitignore` e limpeza segura do cookie.
- Inventario LGPD inicial documenta categorias, finalidade, exposicao e retencao inicial.

## Decisoes
- Esta sprint prioriza hardening antes de criar novas entidades fiscais simuladas.
- O scanner e local e simples, sem dependencia nova.
- Arquivos locais fora do repositorio nao sao versionados nem removidos por commit; se algum segredo real foi salvo localmente, deve ser rotacionado no provedor.

## Fora De Escopo
- Emissao real de NFS-e.
- Provider externo.
- Scraping.
- Certificado digital.
- DLP corporativo completo.
- SIEM ou secret manager real.

## Gates
- [x] `npm run security:secrets`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`
