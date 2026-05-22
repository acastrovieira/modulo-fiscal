# Plano de Achados e Estabilizacao do Piloto - Sprint 46

## Status
Preparado para uso apos a execucao do piloto controlado.

Este documento nao autoriza uso em producao nem operacao fiscal real. Ele define como o VetFiscal OS deve tratar achados do piloto controlado antes de qualquer expansao beta.

## Objetivo
Transformar achados do piloto em um ciclo seguro de estabilizacao com severidade explicita, responsaveis, evidencias de regressao e criterios de release.

## Severidade dos Achados
| Severidade | Definicao | Acao exigida | Impacto no release |
| --- | --- | --- | --- |
| P0 | Vazamento entre tenants, vazamento de segredo, acao fiscal real, exposicao de dados ou perda destrutiva de dados | Parar o piloto, escalar imediatamente e corrigir antes de retomar qualquer acesso | Bloqueia todo uso beta |
| P1 | Workflow critico indisponivel, auditoria ausente em acao critica, login ou troca de tenant instavel | Pausar o workflow afetado e corrigir antes da proxima sessao de piloto | Bloqueia o proximo ciclo beta |
| P2 | Atrito importante no workflow, texto enganoso, divergencia de papel com workaround ou lacuna operacional nao critica | Priorizar na sprint de estabilizacao ou aceitar com aprovacao do responsavel | Pode permitir beta restrito |
| P3 | Ajuste menor de UX, texto, documentacao ou melhoria desejavel | Levar para backlog com prioridade de produto | Nao bloqueia beta |

## Campos de Entrada
Todo achado deve registrar:
- Id do achado.
- Data e hora.
- Alias do tenant, nunca identificador real publico.
- Papel do usuario, nunca documento pessoal.
- Area do workflow.
- Severidade.
- Passos de reproducao.
- Resultado esperado.
- Resultado observado.
- Link de evidencia segura.
- Responsavel.
- Status.
- Exigencia de regressao.
- Decisao de risco aceito, quando nao houver correcao imediata.

## Quadro de Estabilizacao
| Coluna | Significado |
| --- | --- |
| Entrada | Achado capturado, ainda sem triagem |
| Triagem | Severidade e responsavel em avaliacao |
| Correcao | Ajuste de codigo, documentacao ou ambiente em andamento |
| Revisao QA | Evidencia de regressao em coleta |
| Revisao Produto | PO aceita correcao ou risco residual |
| Concluido | Mergeado com gates verdes e evidencia registrada |
| Backlog | Aceito para ciclo futuro com aprovacao do responsavel |

## Expectativas de Regressao
- P0/P1: adicionar ou atualizar testes automatizados quando viavel e rodar gates completos.
- Isolamento por tenant: adicionar teste negativo para acesso direto por id, troca de tenant ou borda de membership.
- LGPD/redacao: adicionar teste que falha com CPF/CNPJ bruto, token, storage path ou payload cru.
- RBAC: adicionar teste negativo por papel e confirmar que o backend segue como barreira real.
- Confusao de UX: ajustar texto, estado vazio ou runbook e adicionar assercao de smoke de release quando fizer sentido.
- Ambiente/deploy: atualizar runbook e registrar evidencia de rollback ou forward-fix.

## Criterios do Release Candidate Pos-Piloto
- [ ] Nenhum P0/P1 permanece aberto.
- [ ] P2 foram corrigidos ou aceitos pelo PO.
- [ ] Gates de regressao estao verdes.
- [ ] Evidence log contem commit final, URL de CI, URL de deploy e screenshots seguras quando disponiveis.
- [ ] Runbooks refletem aprendizados do piloto.
- [ ] Matriz de risco residual foi atualizada.
- [ ] Decisao registrada: expandir beta, repetir piloto, pausar beta ou voltar para estabilizacao.

## Bloqueios Nao Negociaveis
- Sem emissao real de NFS-e.
- Sem scraping.
- Sem integracao com provider municipal.
- Sem uso de certificado.
- Sem fila fiscal ou job fiscal externo.
- Sem dados pessoais reais em docs, screenshots ou logs do repositorio.

