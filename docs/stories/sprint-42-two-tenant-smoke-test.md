# Sprint 42 - Two-Tenant Smoke Test

## Objetivo
Preparar e executar, quando houver staging/beta, a validacao manual da jornada completa com dois tenants.

## Checklist Tecnico Executado
- [x] Criar template de evidencia para smoke com Tenant A e Tenant B.
- [x] Definir jornada de dashboard, imports, candidates, inconsistencies, batches, audit e documents.
- [x] Definir checks de abuso cross-tenant.
- [x] Definir regras de captura de evidencias sem dados pessoais reais.
- [x] Adicionar testes de release para proteger o roteiro.

## Pendencias Operacionais
- [ ] Capturar deploy URL.
- [ ] Capturar commit hash implantado.
- [ ] Rodar smoke manual em staging/beta.
- [ ] Capturar screenshots seguras.
- [ ] Registrar resultado final no evidence log.

## Gate
- Jornada feliz passa em dois tenants.
- Acesso cross-tenant e bloqueado sem enumeracao.
- Audit, logs e DTOs nao vazam dados sensiveis.

