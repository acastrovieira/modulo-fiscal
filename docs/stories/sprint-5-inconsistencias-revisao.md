# Story - Sprint 5 Inconsistencias e Revisao Humana

## Status
Done

## Objetivo
Abrir, resolver e dispensar inconsistencias fiscais com severidade controlada, justificativa obrigatoria, isolamento por tenant, guardas de permissao e auditoria before/after, sem emissao real de NFS-e.

## Tarefas
- [x] Implementar modelo de dominio de `FiscalInconsistency`.
- [x] Definir taxonomia inicial de tipos de inconsistencia fiscal.
- [x] Separar severidade bloqueante e revisavel por matriz de dominio.
- [x] Implementar `openInconsistency`.
- [x] Implementar `resolveInconsistency`.
- [x] Implementar `waiveInconsistency`.
- [x] Exigir justificativa para resolucao ou dispensa.
- [x] Validar permissao `inconsistencies.resolve` no service.
- [x] Impedir acao sobre inconsistencia de outro tenant.
- [x] Bloquear candidato quando inconsistencia bloqueante e aberta.
- [x] Liberar candidato para `NEEDS_REVIEW` quando ultimo bloqueio e fechado.
- [x] Impedir `READY_FOR_BATCH` enquanto houver bloqueio aberto.
- [x] Registrar auditoria `inconsistency.opened`.
- [x] Registrar auditoria `inconsistency.resolved`.
- [x] Registrar auditoria `inconsistency.waived`.
- [x] Criar testes de bloqueantes e revisaveis.
- [x] Criar testes de resolucao e dispensa sem permissao ou sem justificativa.

## Criterios de Aceite
- [x] Inconsistencia bloqueante impede candidato de ir para lote.
- [x] Inconsistencia revisavel exige justificativa ao fechar.
- [x] Resolucao e dispensa registram before/after payload quando aplicavel.
- [x] Tenant A nao resolve nem dispensa inconsistencia do tenant B.
- [x] Roles operacionais nao fecham bloqueios sem nivel fiscal gerencial.
- [x] Dashboard podera consumir contagem de abertas sem virar fonte de verdade.
- [x] Nenhum lote, simulacao, aprovacao, provider NFS-e ou scraping foi implementado.

## Gates
- [x] `npm test`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npx prisma validate`
- [x] `npm run build`

## Agentes
- Codex: implementacao, testes e fechamento da sprint.
- AIOX @architect ou Claude: revisao de taxonomia, estados e risco fiscal.
- AIOX @qa: validacao de permissoes, tenant isolation, auditoria e cenarios negativos.

