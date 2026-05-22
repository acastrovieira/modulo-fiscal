# Evidencia de Smoke com Dois Tenants - Sprint 42

## Status
Template de evidencia de smoke preparado. O smoke manual permanece pendente ate o deploy staging/beta e os usuarios aprovados estarem disponiveis.

## Objetivo
Validar a jornada beta controlada com dois tenants e provar que isolamento por tenant, RBAC, redacao de auditoria e guardrails de nao emissao real continuam funcionando em staging/beta.

## Evidencias do Ambiente
| Evidencia | Status | Detalhes |
| --- | --- | --- |
| URL de deploy | Pendente | Capturar URL staging/beta. |
| Commit hash | Pendente | Capturar commit em deploy. |
| URL do CI | Pendente | Capturar URL dos GitHub Quality Gates. |
| Validacao de ambiente | Pendente | Rodar `npm run ops:check-beta-env -- .env.local`. |
| Redirects Supabase Auth | Pendente | Confirmar URLs de callback staging/beta. |
| Status de migration | Pendente | Capturar comando/data/operador externamente. |

## Jornada Tenant A
| Etapa | Resultado Esperado | Status | Evidencia |
| --- | --- | --- | --- |
| Login | Usuario aprovado entra sem erro cru | Pendente | Pendente |
| Dashboard | Cockpit renderiza com tenant correto e badge de ambiente | Pendente | Pendente |
| Importacoes | Importacoes escopadas por tenant renderizam | Pendente | Pendente |
| Candidatos | Candidatos renderizam com campos sensiveis mascarados | Pendente | Pendente |
| Inconsistencias | Acoes de workflow respeitam permissoes de role | Pendente | Pendente |
| Lotes | Nenhuma acao sugere emissao oficial de NFS-e | Pendente | Pendente |
| Auditoria | Auditoria e escopada por tenant e redigida | Pendente | Pendente |
| Documentos | Metadados/intencao de download respeitam permissoes | Pendente | Pendente |

## Jornada Tenant B
| Etapa | Resultado Esperado | Status | Evidencia |
| --- | --- | --- | --- |
| Troca de tenant | Tenant ativo muda com seguranca | Pendente | Pendente |
| Dashboard | Cockpit renderiza apenas contexto do Tenant B | Pendente | Pendente |
| Importacoes | Importacoes do Tenant A nao aparecem | Pendente | Pendente |
| Candidatos | Candidatos do Tenant A nao aparecem | Pendente | Pendente |
| Inconsistencias | Inconsistencias do Tenant A nao aparecem | Pendente | Pendente |
| Lotes | Lotes do Tenant A nao aparecem | Pendente | Pendente |
| Auditoria | Auditoria do Tenant A nao aparece | Pendente | Pendente |
| Documentos | Metadados de documentos do Tenant A nao aparecem | Pendente | Pendente |

## Checks de Abuso
| Check | Resultado Esperado | Status | Evidencia |
| --- | --- | --- | --- |
| URL de importacao do Tenant A com Tenant B ativo | Bloqueado sem enumeracao | Pendente | Pendente |
| URL de candidato do Tenant A com Tenant B ativo | Bloqueado sem enumeracao | Pendente | Pendente |
| URL de lote do Tenant A com Tenant B ativo | Bloqueado sem enumeracao | Pendente | Pendente |
| Login/sessao com membership suspensa | Bloqueado | Pendente | Pendente |
| Acesso ao dashboard sem membership | Bloqueado | Pendente | Pendente |
| Corpo de erro publico | Apenas `{ error: { code, message, requestId } }` | Pendente | Pendente |

## Regras de Evidencia
- Usar screenshots apenas com dados ficticios/demo ou aprovados e redigidos.
- Nao colar secrets, tokens, payloads crus, CPF/CNPJ completo, storage paths ou e-mails reais.
- Se uma falha expuser dados cross-tenant, parar o piloto e abrir bloqueador P0.
- Se uma falha habilitar ou sugerir emissao oficial de NFS-e, parar o piloto e abrir bloqueador P0.

## Decisao Atual
NO-GO para usuarios beta reais ate este smoke passar em staging/beta.
