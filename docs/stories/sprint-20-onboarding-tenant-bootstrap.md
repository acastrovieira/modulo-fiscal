# Sprint 20 - Onboarding e Tenant Bootstrap

## Status
Concluida.

## Objetivo
Permitir que um usuario autenticado sem tenant ativo crie o primeiro tenant operacional do VetFiscal OS com membership OWNER, sem depender de tenant preexistente, sem service role e sem expor dados sensiveis.

## Escopo Entregue
- `GET /api/onboarding/status` informa se o usuario deve ir para `/dashboard` ou `/onboarding`.
- `POST /api/onboarding/tenant` cria tenant, profile e membership OWNER em fluxo transacional.
- `tenant_bootstrap_requests` registra idempotencia por `userId` e `idempotencyKey`.
- Login consulta o status de onboarding antes de redirecionar.
- Tela `/onboarding` coleta nome operacional, razao social e CNPJ opcional.
- Auditoria `tenant.bootstrap.created` registra somente metadados minimizados e CNPJ mascarado.
- Testes cobrem status, bootstrap, idempotencia, usuario desativado, membership existente, CNPJ invalido e CNPJ duplicado.

## Decisoes
- O onboarding nao usa `currentSession()` porque esse helper exige tenant/membership ativos.
- O usuario autenticado vem do Supabase Auth server-side.
- CNPJ e opcional; quando informado, e normalizado para 14 digitos e mascarado em auditoria.
- A chave de idempotencia pode vir do body ou do header `idempotency-key`.

## Fora de Escopo
- Emissao real de NFS-e.
- Scraping.
- Provider fiscal externo.
- Certificado digital.
- E-mail transacional real.
- Multi-tenant bootstrap automatico.
- Seed de dados reais.

## Gates
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run lint`
- [x] `npm run build`
