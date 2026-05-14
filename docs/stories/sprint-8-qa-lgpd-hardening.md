# Story - Sprint 8 QA LGPD Auditoria e Hardening

## Status
Done

## Objetivo
Fechar o MVP fiscal supervisionado com regressao automatizada, evidencias de isolamento por tenant, RBAC, auditoria, LGPD basica e ausencia de emissao real, scraping ou provider externo.

## Tarefas
- [x] Criar regressao integrada do fluxo importacao -> candidato -> inconsistencia -> lote -> simulacao interna -> aprovacao futura.
- [x] Provar que inconsistencia bloqueante impede criacao de lote.
- [x] Provar que resolucao supervisionada libera candidato para revisao e lote.
- [x] Provar que eventos criticos registram tenant, ator e correlation id.
- [x] Provar metadata `externalProviderCalled: false` e `nfseIssued: false` em eventos de lote.
- [x] Provar bloqueio cross-tenant em documento/importacao.
- [x] Criar varredura automatizada para impedir Prisma em React/UI.
- [x] Criar varredura automatizada para impedir provider NFS-e, scraping client, fila fiscal real ou invoice request no source code.
- [x] Provar erro publico sanitizado com `requestId` e sem stack/SQL.
- [x] Provar que DTOs do cockpit nao expõem CPF/CNPJ/e-mail/telefone.
- [x] Confirmar `audit.view` e `documents.download` como permissoes modeladas.
- [x] Atualizar Definition of Done do MVP no plano de execucao.

## Criterios de Aceite
- [x] Fluxo feliz passa de ponta a ponta sem efeito externo.
- [x] Bloqueios fiscais impedem lote.
- [x] Auditoria permite rastrear tenant, ator, entidade e correlation id.
- [x] LGPD basica esta coberta por mascaramento e minimizacao de DTO.
- [x] Nao ha emissao real de NFS-e, scraping, adapter externo ou job fiscal real.
- [x] Cockpit segue API-first e sem Prisma em React.
- [x] Todos os gates globais ficaram verdes.

## Gates
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`

## Agentes
- Codex: implementacao da regressao, hardening tests, gates e commit.
- @architect: revisao final de riscos do MVP fiscal supervisionado.
- @qa: matriz P0/P1/P2 de regressao e compliance.
- Squad seguranca/LGPD: checklist de dados sensiveis, erro publico, tenant e secrets.

## Checklist Manual MVP
- [x] Nenhuma rota ou service implementa emissao real de NFS-e.
- [x] Nenhum scraping/browser automation foi introduzido no core fiscal.
- [x] Nenhum provider municipal ou adapter NFS-e ativo existe no source code.
- [x] Tenant isolation tem testes negativos.
- [x] RBAC tem testes negativos para comandos criticos.
- [x] Dados sensiveis do cockpit sao minimizados.
- [x] Erros de API possuem envelope com requestId.
- [x] Build, lint, typecheck e testes devem permanecer verdes antes de release.
