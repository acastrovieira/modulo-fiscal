# Sprint 24 - Versioned Fiscal Scenarios

## Status
Concluida.

## Objetivo
Criar o primeiro motor de cenarios fiscais versionados para o simulador governado, mantendo o fluxo 100% interno, deterministico e sem valor fiscal.

## Escopo Entregue
- Scenario set versionado `vetcare-simulation-baseline@2026.05`.
- Avaliador de dominio puro para documentos fiscais simulados.
- Findings operacionais para guardrail de simulacao, itens ausentes, documento do tomador desconhecido, codigo de servico divergente e valor alto.
- Service de aplicacao com tenant scope, RBAC e auditoria.
- API backend-first para avaliar cenarios de um documento simulado.
- DTO allowlist com disclaimer e flags explicitas de simulacao.
- Testes de dominio, application service, RBAC e contratos publicos.

## Decisoes
- Nao criar tabelas novas nesta sprint.
- Manter cenarios versionados em codigo ate estabilizar regras e UX de revisao.
- Usar `fiscal_simulation.documents.view` para permitir avaliacao por perfis com acesso de leitura fiscal.
- Registrar auditoria mesmo para avaliacao, pois ela influencia revisao operacional.

## Fora De Escopo
- Persistencia de cenarios customizados por tenant.
- Editor visual de cenarios.
- Comparacao entre versoes.
- Integracao fiscal real.
- Emissao de NFS-e.
- Provider externo, scraping ou certificado digital.

## Gates
- [x] Testes focados da Sprint 24.
- [x] `npm run security:secrets`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`
