# Runbook - Execucao do Piloto Controlado

## Objetivo
Rodar um piloto beta acompanhado do VetFiscal OS com 1-3 tenants aprovados depois que a Sprint 44 registrar GO ou GO com restricoes.

Este runbook nao deve ser usado para habilitar emissao oficial de NFS-e, scraping, providers municipais, certificados ou jobs fiscais em background.

## Criterios de Entrada
- [ ] Decisao da Sprint 44 e GO ou GO com restricoes.
- [ ] Owners de produto, engenharia, suporte, QA e rollback nomeados.
- [ ] Tenants e usuarios aprovados registrados fora do repositorio.
- [ ] URL de deploy staging/beta registrada.
- [ ] Smoke com dois tenants aprovado contra o build em deploy.
- [ ] Caminho de rollback documentado e owner disponivel.
- [ ] Nenhum P0/P1 permanece aberto.

## Checklist de Abertura
- [ ] Confirmar commit hash final e URL de deploy.
- [ ] Confirmar GitHub Quality Gates verdes.
- [ ] Confirmar redirects do Supabase Auth alinhados a URL beta.
- [ ] Confirmar migrations de banco aplicadas.
- [ ] Confirmar flags fiscais reais como `false`.
- [ ] Confirmar que apenas usuarios aprovados autenticam.
- [ ] Confirmar que usuario sem membership nao acessa dashboard.
- [ ] Confirmar que usuario suspenso nao acessa tenant.
- [ ] Confirmar regras de captura de evidencia com QA e suporte.

## Check Diario do Piloto
| Check | Resultado esperado | Owner | Status |
| --- | --- | --- | --- |
| Login e logout | Usuarios aprovados entram e saem com seguranca | QA | Pendente |
| Troca de tenant | Usuario ve apenas tenants aprovados | QA | Pendente |
| Resumo do cockpit | Dashboard renderiza sem P0/P1 | QA | Pendente |
| Importacoes | Apenas dados demo ou aprovados | QA | Pendente |
| Candidatos | Campos sensiveis mascarados | QA/Seguranca | Pendente |
| Inconsistencias | Acoes seguem role e workflow | QA | Pendente |
| Lotes | Nenhuma acao de emissao oficial existe | QA | Pendente |
| Auditoria | Eventos tenant-scoped e redigidos | Seguranca/LGPD | Pendente |
| Feedback de suporte | Problemas registrados com severidade | Suporte | Pendente |
| Readiness de rollback | Owner e rota seguem disponiveis | DevOps | Pendente |

## Entrada de Feedback
Cada feedback do piloto deve incluir:
- Data e hora.
- Alias do tenant, nao identificador real publico.
- Role do usuario, nao documento pessoal.
- Area do workflow.
- Severidade: P0, P1, P2 ou P3.
- Passos de reproducao.
- Screenshot seguro ou nota redigida.
- Owner e proxima acao.

## Severidade de Incidente
| Severidade | Definicao | Acao no piloto |
| --- | --- | --- |
| P0 | Vazamento de tenant, vazamento de secret, acao fiscal real ou exposicao de dados | Parar piloto imediatamente |
| P1 | Login quebrado, workflow critico bloqueado ou auditoria ausente | Pausar workflow afetado |
| P2 | Problema importante de usabilidade ou workflow com workaround | Continuar com restricao |
| P3 | Ajuste menor de UX, texto ou documentacao | Registrar para estabilizacao |

## Condicoes de Parada
- Exposicao de dados cross-tenant.
- Dados sensiveis sem redacao em UI, logs, screenshots ou evidencias.
- Surgimento de caminho de NFS-e real, scraping, provider municipal, certificado ou job fiscal.
- Autenticacao ou troca de tenant instavel.
- Trilha de auditoria ausente para acao critica.
- Responsavel por rollback indisponivel durante a janela do piloto.

## Template de Relatorio de Encerramento
| Campo | Valor |
| --- | --- |
| Janela do piloto | Pendente |
| Tenants incluidos | Cadastro privado pendente |
| Usuarios incluidos | Cadastro privado pendente |
| Commit final | Pendente |
| URL de deploy | Pendente |
| URL dos Quality Gates | Pendente |
| Resultado do smoke | Pendente |
| Contagem P0/P1 | Pendente |
| Contagem P2/P3 | Pendente |
| Temas de feedback | Pendente |
| Decisao apos piloto | Pendente |
| Proxima sprint | Sprint 46 - Achados do Piloto e Estabilizacao |

## Criterios de Saida
- [ ] Janela do piloto encerra sem incidente P0/P1.
- [ ] Feedback categorizado e priorizado.
- [ ] Achados convertidos em tarefas da Sprint 46.
- [ ] Evidence log atualizado.
- [ ] Owners concordam sobre proximo ciclo beta, estabilizacao ou NO-GO.

