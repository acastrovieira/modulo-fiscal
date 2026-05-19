# RBAC Matrix e Flow Permissions

## Objetivo
Fechar a matriz de permissoes por papel, comando e estado operacional para o beta fiscal supervisionado. A UI pode esconder acoes, mas a barreira real permanece no backend por `assertPermissionForCommand`.

## Invariantes
- O tenant efetivo vem de sessao/membership server-side.
- Nenhuma rota fiscal aceita `tenantId` do cliente como fonte de verdade.
- Todo comando critico mapeia para uma permissao backend declarada.
- Estado de dominio ainda e validado pelo service, depois do RBAC.
- Auditoria e idempotencia nao substituem permissao; elas complementam o comando.

## Matriz de Papeis
| Papel | Perfil operacional | Pode mutar fluxo fiscal? | Pode aprovar lote? | Pode ver auditoria? |
| --- | --- | --- | --- | --- |
| OWNER | Dono do tenant | Sim | Sim | Sim |
| ADMIN | Admin operacional | Sim | Sim | Sim |
| FISCAL_MANAGER | Gestor fiscal | Sim | Sim | Sim |
| FISCAL_OPERATOR | Operador fiscal | Sim, sem aprovacao final | Nao | Nao |
| FINANCIAL_OPERATOR | Financeiro | Nao | Nao | Nao |
| ACCOUNTANT | Contabilidade/leitura fiscal | Nao | Nao | Sim |
| AUDITOR | Auditoria/leitura restrita | Nao | Nao | Sim |

## Matriz de Comandos
| Fluxo | Comando | Permissao backend | Estado/condicao de dominio |
| --- | --- | --- | --- |
| Importacoes | `createImportFromDocument` | `imports.create` | Documento pertence ao tenant |
| Importacoes | `validateImport` | `imports.create` | Importacao validavel |
| Candidatos | `createFiscalCandidatesFromImport` | `imports.create` | Importacao `VALIDATED` ou `READY_FOR_REVIEW` |
| Candidatos | `markCandidateReadyForBatch` | `inconsistencies.resolve` | Candidato revisavel e sem bloqueio aberto |
| Inconsistencias | `openInconsistency` | `inconsistencies.resolve` | Entidade alvo pertence ao tenant |
| Inconsistencias | `resolveInconsistency` | `inconsistencies.resolve` | Inconsistencia aberta ou em revisao |
| Inconsistencias | `waiveInconsistency` | `inconsistencies.resolve` | Inconsistencia aberta ou em revisao |
| Lotes | `createFiscalBatch` | `batches.simulate` | Candidatos `READY_FOR_BATCH` |
| Lotes | `submitBatchForReview` | `batches.simulate` | Lote `DRAFT` |
| Lotes | `simulateBatchInternally` | `batches.simulate` | Lote `IN_REVIEW` |
| Lotes | `approveBatchForFutureIssuance` | `batches.approve` | Lote `SIMULATED` |
| Lotes | `cancelBatch` | `batches.approve` | Lote em estado cancelavel |
| Simulador | `upsertFiscalSimulationProfile` | `fiscal_simulation.profile.manage` | Perfil editavel do tenant |
| Simulador | `createFiscalServiceTaker` | `fiscal_simulation.takers.manage` | Documento mascaravel/hashable |
| Simulador | `createSimulatedFiscalDocument` | `fiscal_simulation.documents.create` | Perfil e tomador ativos |
| Simulador | `validateSimulatedFiscalDocument` | `fiscal_simulation.documents.validate` | Documento `DRAFT` |
| Simulador | `simulateIssueFiscalDocument` | `fiscal_simulation.documents.simulate` | Documento `VALIDATED` |
| Simulador | `voidSimulatedFiscalDocument` | `fiscal_simulation.documents.simulate` | Documento nao voided |
| Simulador | `evaluateFiscalSimulationScenarios` | `fiscal_simulation.documents.view` | Documento pertence ao tenant |

## Leitura e Queries
| Area | Permissao | Roles tipicos |
| --- | --- | --- |
| Importacoes | `imports.view` | OWNER, ADMIN, FISCAL_MANAGER, FISCAL_OPERATOR, FINANCIAL_OPERATOR, ACCOUNTANT |
| Candidatos | `candidates.view` | OWNER, ADMIN, FISCAL_MANAGER, ACCOUNTANT |
| Lotes | `batches.simulate` | OWNER, ADMIN, FISCAL_MANAGER, FISCAL_OPERATOR |
| Documentos | `documents.download` | OWNER, ADMIN, FISCAL_MANAGER, FISCAL_OPERATOR, FINANCIAL_OPERATOR, ACCOUNTANT, AUDITOR |
| Auditoria | `audit.view` | OWNER, ADMIN, FISCAL_MANAGER, ACCOUNTANT, AUDITOR |

## Decisoes
- `FISCAL_OPERATOR` pode criar/submeter/simular lote, mas nao aprovar nem cancelar lote.
- `ACCOUNTANT` e `AUDITOR` sao perfis de leitura/auditoria; nao resolvem inconsistencias nem executam comandos fiscais.
- `tenant.switch` e o unico fluxo que recebe `tenantId` no payload, porque ali o campo representa o tenant de destino validado contra memberships do usuario.

## Gates
- Testes garantem que todos os comandos declarados aparecem na matriz.
- Testes garantem que roles sem a permissao mapeada nao executam comando.
- Testes garantem que schemas fiscais rejeitam `tenantId` controlado pelo cliente.
