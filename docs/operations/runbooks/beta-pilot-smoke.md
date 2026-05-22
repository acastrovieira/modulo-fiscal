# Runbook - Smoke do Piloto Beta Controlado

## Objetivo
Validar a jornada beta controlada com dois tenants antes de permitir uso beta real.

Este smoke nao autoriza emissao oficial de NFS-e, scraping, chamadas a provider municipal, certificados ou fila fiscal.

## Pre-condicoes
- PR da Sprint 38 mergeado na `main` protegida.
- GitHub Quality Gates verdes na `main`.
- Deploy staging/beta usando o merge commit final.
- Owners de produto, engenharia e suporte nomeados.
- Tenants e usuarios beta aprovados fora do repositorio.
- Secrets configurados apenas no ambiente do provedor, nunca commitados.

## Fluxo Tenant A
- [ ] Entrar como OWNER ou ADMIN aprovado.
- [ ] Confirmar badge de tenant ativo e badge de ambiente.
- [ ] Abrir dashboard.
- [ ] Abrir importacoes.
- [ ] Abrir candidatos.
- [ ] Abrir inconsistencias.
- [ ] Abrir lotes.
- [ ] Abrir auditoria.
- [ ] Abrir documentos.
- [ ] Confirmar campos sensiveis mascarados.
- [ ] Confirmar que nenhuma acao sugere emissao oficial de NFS-e.

## Fluxo Tenant B
- [ ] Trocar para Tenant B pelo fluxo de troca de tenant.
- [ ] Confirmar que o badge de tenant ativo mudou.
- [ ] Repetir dashboard, importacoes, candidatos, inconsistencias, lotes, auditoria e documentos.
- [ ] Confirmar que apenas registros do Tenant B estao visiveis.
- [ ] Confirmar campos sensiveis mascarados.

## Checks de Abuso
- [ ] Tentar URL direta de importacao do Tenant A enquanto Tenant B esta ativo.
- [ ] Tentar URL direta de candidato do Tenant A enquanto Tenant B esta ativo.
- [ ] Tentar URL direta de lote do Tenant A enquanto Tenant B esta ativo.
- [ ] Confirmar que requests sao bloqueados sem revelar se o recurso existe.
- [ ] Confirmar que auditoria nao expoe CPF/CNPJ completo, token, storage path ou payload cru.

## Regras de Evidencia
- Capturar screenshots apenas com dados ficticios/demo ou aprovados e redigidos.
- Nao colar secrets, tokens, payloads crus ou documentos pessoais completos em tickets ou docs.
- Registrar URL de CI, URL de deploy, commit hash e data do smoke.
- Se qualquer condicao de no-go aparecer, parar o piloto e abrir tarefa bloqueadora.

## Template de Evidencia
Use `docs/product/two-tenant-smoke-evidence.md` como checklist canonico de evidencia de smoke.

## Setup de Usuarios e Roles
Use `docs/product/beta-users-roles-tenant-setup.md` antes de rodar este smoke. Nao rode smoke com tenants nao aprovados, usuarios nao aprovados ou roles amplas criadas apenas por conveniencia.

