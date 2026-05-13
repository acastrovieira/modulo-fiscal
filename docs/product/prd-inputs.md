# Inputs Para o PRD do MVP Fiscal

## Objetivo
Este documento consolida as decisoes minimas antes da escrita do PRD. Ele evita que o PRD comece amplo demais e fixa o primeiro fluxo real do VetFiscal OS.

## Primeiro Fluxo do MVP
O primeiro fluxo do PRD deve ser:

```txt
Importacao supervisionada
  -> Candidato fiscal
  -> Inconsistencia
  -> Lote em revisao
  -> Simulacao interna futura
  -> Aprovacao supervisionada futura
```

Nesta fase, o fluxo termina antes de qualquer emissao real de NFS-e.

## Fonte de Importacao Inicial
A fonte inicial recomendada e upload de arquivo estruturado, priorizando CSV ou XLSX exportado de sistema operacional da clinica.

Regras iniciais:
- nao usar scraping;
- nao integrar portal municipal;
- nao depender de ERP especifico no primeiro PRD;
- registrar arquivo em `document_files` antes do processamento;
- manter checksum, tamanho, tipo e usuario criador;
- tratar cada importacao como evento auditavel.

## Atores Principais
- FISCAL_OPERATOR: cria importacao, revisa candidatos e prepara lote.
- FISCAL_MANAGER: resolve ou valida inconsistencias relevantes, simula lote e aprova lote futuro.
- ACCOUNTANT: consulta evidencias e apoia decisao fiscal quando autorizado.
- AUDITOR: consulta trilha de auditoria e documentos permitidos.
- OWNER ou ADMIN: gerencia acesso e acompanha indicadores operacionais.

## Dados Minimos do Candidato Fiscal
O PRD deve detalhar os campos definitivos, mas o candidato fiscal inicial deve considerar ao menos:
- tenantId;
- origem da importacao;
- identificador da linha ou registro de origem;
- cliente/tomador quando existir na fonte;
- data do atendimento ou competencia;
- descricao do servico ou item operacional;
- valor bruto em centavos;
- status do candidato;
- fingerprint fiscal versionado futuro;
- lista de inconsistencias associadas;
- usuario responsavel pela ultima revisao;
- timestamps de criacao e atualizacao.

## Inconsistencias Bloqueantes Iniciais
Devem bloquear o candidato ou o lote:
- ausencia de valor;
- valor invalido ou negativo;
- ausencia de data de competencia;
- duplicidade provavel pelo fingerprint fiscal;
- tenant inconsistente;
- documento de origem ausente ou sem checksum;
- dados minimos do tomador ausentes quando obrigatorios para o fluxo definido.

## Inconsistencias Revisaveis
Podem permitir justificativa humana auditavel:
- descricao incompleta;
- classificacao operacional duvidosa;
- divergencia nao critica entre fonte e revisao humana;
- alerta de possivel duplicidade sem certeza suficiente;
- dado sensivel que precise de mascaramento ou confirmacao.

## Permissoes Minimas do Fluxo
- `imports.create`: criar importacao.
- `imports.view`: visualizar importacoes.
- `candidates.view`: visualizar candidatos fiscais.
- `inconsistencies.resolve`: resolver ou dispensar inconsistencias.
- `batches.simulate`: executar simulacao interna futura.
- `batches.approve`: aprovar lote supervisionado futuro.
- `audit.view`: consultar auditoria.
- `documents.download`: baixar documentos permitidos.

## Estados Que o PRD Deve Usar
### Importacao
- PENDING_VALIDATION
- VALIDATING
- VALIDATED
- HAS_ERRORS
- READY_FOR_REVIEW
- ARCHIVED

### Candidato Fiscal
- DRAFT
- NEEDS_REVIEW
- BLOCKED
- READY_FOR_BATCH
- IN_BATCH
- SIMULATED
- APPROVED_FOR_FUTURE_ISSUANCE

### Inconsistencia
- OPEN
- IN_REVIEW
- RESOLVED
- WAIVED

### Lote
- DRAFT
- IN_REVIEW
- SIMULATED
- APPROVED
- CANCELLED

## Auditoria Esperada
O PRD deve exigir evento de auditoria para:
- upload de arquivo;
- inicio e fim de validacao;
- criacao de candidato fiscal;
- abertura de inconsistencia;
- resolucao ou dispensa de inconsistencia;
- criacao de lote;
- envio de lote para revisao;
- simulacao interna futura;
- aprovacao de lote futuro;
- cancelamento de lote.

Cada evento deve carregar tenant, ator, entidade, payload anterior quando aplicavel, payload posterior quando aplicavel, metadata e `correlationId`.

## Fora do PRD Inicial
- emissao real de NFS-e;
- integracao municipal;
- certificado digital;
- scraping;
- workflow financeiro completo;
- CRM;
- DRE;
- billing SaaS;
- analytics avancado;
- automacoes irreversiveis sem revisao humana.

## Criterios de Aceite do PRD
O PRD deve estar pronto quando responder, sem ambiguidade:
- quem executa cada etapa;
- qual permissao cada etapa exige;
- quais estados existem antes e depois de cada acao;
- quais inconsistencias bloqueiam;
- quais inconsistencias aceitam justificativa;
- quais telas ou APIs participam do fluxo;
- quais eventos de auditoria sao gravados;
- quais dados sensiveis precisam de mascaramento;
- onde o MVP para antes da emissao real.