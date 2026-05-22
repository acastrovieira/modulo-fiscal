# PRD - Planejamento de Homologacao Real de NFS-e

## Status
Rascunho apenas para planejamento futuro.

Este PRD nao autoriza implementacao. Ele define as perguntas minimas de produto, fiscal, juridico e tecnologia que precisam ser respondidas antes do VetFiscal OS iniciar qualquer trabalho de homologacao real de NFS-e.

## Problema
Clinicas precisam de uma operacao fiscal supervisionada que, no futuro, possa emitir NFS-e valida por meio de provedores municipais. O produto atual para intencionalmente antes da emissao real. A passagem de simulacao para homologacao real introduz riscos legais, fiscais, de certificado, provider, idempotencia, auditoria e contingencia que exigem um ciclo dedicado de planejamento e aprovacao.

## Objetivos
- Definir o escopo de um futuro piloto de homologacao real de NFS-e.
- Preservar aprovacao humana antes de qualquer transmissao fiscal.
- Manter isolamento por tenant, RBAC, auditoria, idempotencia e LGPD como gates duros.
- Definir fronteiras de adapter de provider antes de integrar qualquer municipio.
- Definir tratamento de certificados e secrets antes de armazenar ou usar credenciais.
- Definir contingencia fiscal e rollback antes de uso real.

## Fora de Escopo
- Nenhuma implementacao nesta sprint.
- Nenhuma emissao real de NFS-e.
- Nenhuma chamada a provider municipal.
- Nenhum scraping.
- Nenhum upload ou armazenamento de certificado.
- Nenhuma fila fiscal ou job fiscal externo.
- Nenhum release de producao.

## Usuarios Principais
| Usuario | Necessidade |
| --- | --- |
| Gestor fiscal | Aprovar apenas notas revisadas e conformes |
| Operador fiscal | Preparar candidatos, resolver inconsistencias e montar lotes |
| Contador | Revisar premissas fiscais, regras municipais e casos de borda |
| Auditor | Inspecionar trilha de auditoria e evidencias sem vazamento sensivel |
| Suporte/operacoes | Monitorar falhas, retentativas e contingencias |

## Escopo Futuro de Homologacao
- Um municipio por vez.
- Um tenant de teste aprovado.
- Ambiente de homologacao/sandbox apenas.
- Catalogo de servicos controlado.
- Tamanho de lote limitado.
- Aprovacao manual antes da transmissao.
- Nenhuma emissao automatica no momento da importacao.
- Nenhuma entrega de documento fiscal ao cliente final ate a homologacao ser aprovada.

## Capacidades Exigidas Antes da Implementacao
- Interface de adapter de provider sem codigo de provider em React.
- State machine de emissao real separada dos fluxos simulados.
- Contrato de idempotencia por tenant, provider, operacao e intencao fiscal.
- Correlation id propagado por comando, auditoria e adapter de provider.
- Eventos de auditoria para aprovar, transmitir, resposta do provider, retry, cancelar/anular quando suportado e falha.
- Politica de redacao para payloads de request/response do provider.
- Politica de armazenamento e acesso a certificado aprovada por Seguranca/LGPD.
- Runbook de contingencia fiscal aprovado por produto, engenharia e contador.

## Requisitos do Adapter de Provider
- Cada municipio/provider deve ficar atras de uma fronteira de adapter.
- O adapter deve expor capacidades explicitas como transmitir, consultar, cancelar e verificar status apenas quando suportadas.
- O adapter nunca deve ser chamado diretamente por componentes de UI.
- O adapter nunca deve receber `tenantId` vindo do client como fonte de verdade.
- O adapter deve retornar resultados de dominio sanitizados, nao payloads crus do provider.
- Retencao de payload cru do provider exige aprovacao explicita antes de armazenamento.

## Politica de Certificados e Secrets
- Nenhum certificado ou credencial de provider deve ser commitado no repositorio.
- Nenhum certificado deve ser enviado ate armazenamento, criptografia, controle de acesso e rotacao estarem aprovados.
- Service role ou credenciais privilegiadas devem ser escopadas por ambiente.
- Acesso a material de certificado deve ser auditado.
- Qualquer incidente envolvendo certificado bloqueia a homologacao.

## Idempotencia e Seguranca Fiscal
- Todo comando de emissao real exige chave de idempotencia.
- Replay com a mesma chave e mesmo hash de request deve retornar a mesma referencia de resultado.
- Replay com a mesma chave e hash diferente deve ser bloqueado.
- Chaves do Tenant A nunca podem afetar o Tenant B.
- Timeout do provider nao pode criar automaticamente uma segunda transmissao fiscal.
- Retentativa deve consultar status no provider, quando disponivel, antes de reenviar.

## Requisitos de Auditoria
Toda acao critica deve registrar:
- tenant id.
- actor id.
- papel.
- tipo de evento.
- tipo e id da entidade.
- estado anterior e proximo estado.
- correlation id.
- referencia da chave de idempotencia.
- nome e versao do adapter de provider quando aplicavel.
- status sanitizado do provider, nunca payload sensivel cru por padrao.

## Responsabilidades Juridicas e Contabeis
- Contador/especialista fiscal valida regras municipais e cenarios de homologacao.
- PO aprova escopo visivel ao usuario e riscos residuais aceitos.
- Responsavel de engenharia aprova implementacao tecnica e plano de rollback.
- Seguranca/LGPD aprova certificado, secrets e tratamento de dados.
- Responsavel de suporte aprova comunicacao de incidentes e escalonamento.

## Plano de Testes de Homologacao
- Caminho feliz de emissao em homologacao/sandbox municipal.
- Replay de idempotencia duplicado.
- Timeout do provider e consulta de status.
- Rejeicao do provider com inconsistencia compreensivel.
- Testes negativos de isolamento por tenant.
- Testes negativos de RBAC por papel.
- Testes de redacao em auditoria.
- Teste de auditoria de acesso a certificado.
- Simulado de rollback/forward-fix.

## Criterios de GO Para Implementacao Futura
- Beta controlado estavel sem P0/P1 aberto.
- Este PRD aprovado por produto, engenharia, Seguranca/LGPD e especialista fiscal.
- ADR especifica do provider aprovada.
- Politica de certificado aprovada.
- Ambiente de homologacao disponivel.
- Plano de testes aprovado.

## Criterios de NO-GO
- Qualquer incerteza sobre responsabilidade legal/fiscal.
- Qualquer problema pendente de isolamento por tenant, auditoria ou secrets.
- Falta de responsavel por rollback ou contingencia.
- Necessidade de usar scraping como mecanismo core fiscal.
- Pedido para pular aprovacao humana antes das primeiras transmissoes fiscais reais.

