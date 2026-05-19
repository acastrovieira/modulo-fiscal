# Sprint 35 - Batch Snapshot e Concurrency Guards

## Objetivo
Endurecer lotes contra corrida logica, mutacao posterior de candidato e inconsistencia de totais.

## Checklist
- [x] Criar snapshot dos campos fiscais relevantes ao incluir candidato em lote.
- [x] Impedir candidato em dois lotes ativos por guarda de aplicacao.
- [x] Revalidar inconsistencias abertas antes de submit, simulate e approve.
- [x] Recalcular total do lote de forma deterministica a partir dos itens incluidos.
- [x] Proteger submit, simulacao e aprovacao contra estado concorrente de candidato.
- [x] Testar lote duplicado, total divergente e transicoes com estados esperados.

## Gates
- [x] Lote e reproduzivel e auditavel.
- [x] Nenhum lote avanca com candidato bloqueado ou inconsistencia aberta.
- [x] Nenhuma emissao NFS-e real, scraping, provider municipal ou certificado digital foi implementado.
