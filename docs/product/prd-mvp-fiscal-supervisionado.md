# PRD - MVP Fiscal Supervisionado

## 1. Resumo
O MVP Fiscal Supervisionado do VetFiscal OS e um cockpit operacional para clinicas veterinarias importarem dados estruturados, gerarem candidatos fiscais, tratarem inconsistencias e organizarem lotes em revisao, sem emissao real de NFS-e nesta fase.

O produto deve nascer como SaaS multiempresa, com tenant, RBAC, auditoria, correlation id, idempotencia futura, LGPD-by-design e arquitetura modular. O objetivo e reduzir risco fiscal e operacional antes de automatizar qualquer efeito externo.

## 2. Objetivos
- Permitir que uma clinica acompanhe o fluxo fiscal supervisionado por tenant.
- Registrar arquivos de origem e preservar evidencias tecnicas.
- Transformar uma importacao estruturada em candidatos fiscais revisaveis.
- Identificar inconsistencias bloqueantes e revisaveis.
- Permitir revisao humana antes de qualquer aprovacao futura.
- Preparar lotes para simulacao interna futura, sem emitir NFS-e real.
- Garantir permissao, auditoria e isolamento por tenant em toda acao critica.

## 3. Nao Objetivos
- Nao emitir NFS-e real.
- Nao integrar com prefeitura, provedor NFS-e ou certificado digital.
- Nao fazer scraping.
- Nao criar CRUD generico sem workflow fiscal.
- Nao implementar motor fiscal municipal completo.
- Nao implementar financeiro, CRM, DRE, billing ou analytics avancado.
- Nao usar n8n para core fiscal.
- Nao criar microsservicos nesta etapa.

## 4. Publico e Personas
### Dono da clinica ou administrador
Acompanha indicadores, gerencia acessos e entende se existe risco operacional relevante.

Papeis: OWNER, ADMIN.

### Operador fiscal
Cria importacoes, acompanha validacoes, revisa candidatos e prepara lotes.

Papel: FISCAL_OPERATOR.

### Gestor fiscal
Resolve inconsistencias relevantes, valida revisoes, simula lote futuro e aprova lote supervisionado futuro.

Papel: FISCAL_MANAGER.

### Contador externo
Consulta evidencias e apoia decisao fiscal quando autorizado.

Papel: ACCOUNTANT.

### Auditor
Consulta trilha de auditoria e documentos permitidos, sem alterar workflow.

Papel: AUDITOR.

## 5. Primeiro Fluxo do MVP
```txt
Upload de arquivo estruturado
  -> Registro em document_files
  -> Criacao de importacao
  -> Validacao estrutural
  -> Normalizacao conceitual
  -> Criacao de candidatos fiscais
  -> Abertura de inconsistencias
  -> Revisao humana
  -> Preparacao de lote
  -> Simulacao interna futura
  -> Aprovacao supervisionada futura
```

O fluxo termina antes de qualquer envio externo ou emissao real.

## 6. Fonte de Importacao Inicial
A fonte inicial e upload de arquivo CSV ou XLSX exportado de sistema operacional da clinica.

Requisitos:
- aceitar arquivo estruturado via UI;
- registrar metadados em `document_files` antes do processamento;
- armazenar `fileName`, `fileType`, `mimeType`, `storagePath`, `checksumSha256`, `sizeBytes`, `createdBy`, `tenantId` e `createdAt`;
- associar a importacao ao tenant ativo;
- gerar evento de auditoria no upload;
- impedir processamento quando tenant ou usuario nao estiverem resolvidos;
- nao depender de ERP especifico no primeiro MVP.

## 7. Dados Minimos do Candidato Fiscal
O candidato fiscal inicial deve conter:
- tenantId;
- importId ou referencia equivalente da importacao;
- documentFileId quando houver arquivo de origem;
- sourceRowId ou identificador do registro de origem;
- customerName ou tomador quando existir;
- customerDocumentMasked quando existir dado sensivel;
- serviceDate ou competenceDate;
- serviceDescription;
- grossAmountCents;
- status;
- fiscalFingerprintVersion;
- fiscalFingerprint;
- reviewedBy quando aplicavel;
- createdAt;
- updatedAt.

Regra de engenharia: valores monetarios devem ser armazenados em centavos.

## 8. Estados do Workflow
### Importacao
- PENDING_VALIDATION: arquivo recebido e aguardando validacao.
- VALIDATING: validacao em andamento.
- VALIDATED: importacao validada sem bloqueios criticos.
- HAS_ERRORS: importacao possui erros bloqueantes.
- READY_FOR_REVIEW: dados podem ser revisados por operador fiscal.
- ARCHIVED: importacao preservada para consulta.

### Candidato fiscal
- DRAFT: candidato criado, ainda incompleto.
- NEEDS_REVIEW: candidato precisa de revisao humana.
- BLOCKED: candidato bloqueado por inconsistencia.
- READY_FOR_BATCH: candidato apto para lote supervisionado.
- IN_BATCH: candidato associado a lote.
- SIMULATED: candidato passou por simulacao interna futura.
- APPROVED_FOR_FUTURE_ISSUANCE: candidato aprovado para etapa futura, sem emissao real.

### Inconsistencia
- OPEN: inconsistencia pendente.
- IN_REVIEW: inconsistencia em analise.
- RESOLVED: inconsistencia resolvida com evidencia.
- WAIVED: inconsistencia dispensada com justificativa auditavel.

### Lote
- DRAFT: lote em preparacao.
- IN_REVIEW: lote em revisao por gestor fiscal.
- SIMULATED: lote passou por simulacao interna futura.
- APPROVED: lote aprovado para etapa futura.
- CANCELLED: lote cancelado com motivo auditavel.

## 9. Inconsistencias
### Bloqueantes
Devem bloquear candidato ou lote:
- valor ausente;
- valor invalido, zerado quando nao permitido, ou negativo;
- data de competencia ausente;
- duplicidade provavel por fingerprint fiscal;
- tenant inconsistente;
- documento de origem ausente quando obrigatorio;
- arquivo sem checksum;
- dados minimos do tomador ausentes quando obrigatorios no fluxo.

### Revisaveis
Podem aceitar justificativa humana:
- descricao incompleta;
- classificacao operacional duvidosa;
- divergencia nao critica entre fonte e revisao humana;
- alerta de duplicidade sem confianca suficiente;
- dado sensivel que precisa de confirmacao ou mascaramento.

Toda resolucao ou dispensa deve registrar justificativa, ator, data e correlation id.

## 10. Permissoes
- `imports.create`: criar importacao.
- `imports.view`: visualizar importacoes.
- `candidates.view`: visualizar candidatos fiscais.
- `inconsistencies.resolve`: resolver ou dispensar inconsistencias.
- `batches.simulate`: executar simulacao interna futura.
- `batches.approve`: aprovar lote supervisionado futuro.
- `audit.view`: consultar auditoria.
- `documents.download`: baixar documentos permitidos.

Regras:
- permissao deve ser validada no backend;
- UI pode esconder acoes, mas nao pode ser a unica barreira;
- todo comando critico deve receber tenant atual e usuario atual resolvidos no servidor.

## 11. Telas do MVP
### Dashboard operacional
Cards obrigatorios:
- Importacoes pendentes;
- Candidatos fiscais;
- Inconsistencias abertas;
- Lotes em revisao;
- Emissoes da semana, como indicador planejado ou simulado;
- Alertas criticos.

A tela deve mostrar tenant ativo, ambiente e estado operacional denso, sem parecer landing page.

### Importacoes
Funcionalidades:
- listar importacoes por tenant;
- iniciar upload estruturado;
- mostrar status da validacao;
- mostrar arquivo de origem;
- abrir detalhes de erros e candidatos gerados.

### Candidatos fiscais
Funcionalidades:
- listar candidatos por tenant e status;
- filtrar por importacao, status e inconsistencia;
- abrir detalhe do candidato;
- mostrar dados mascarados quando necessario;
- enviar candidato para lote quando estiver apto.

### Inconsistencias
Funcionalidades:
- listar inconsistencias abertas e em revisao;
- diferenciar bloqueante e revisavel;
- permitir resolucao com justificativa;
- permitir dispensa com justificativa quando permitido;
- registrar auditoria.

### Lotes em revisao
Funcionalidades:
- criar lote a partir de candidatos aptos;
- revisar itens do lote;
- simular internamente no futuro;
- aprovar lote para etapa futura;
- cancelar lote com motivo.

### Auditoria
Funcionalidades:
- consultar eventos por tenant;
- filtrar por ator, entidade, tipo de evento e correlation id;
- exibir payloads de forma segura e mascaravel.

## 12. APIs e Services Conceituais
As rotas finais podem ser implementadas como API routes, server actions ou services internos, desde que respeitem as fronteiras de modulo.

Comandos conceituais:
- `createImportFromDocument`
- `validateImport`
- `createFiscalCandidatesFromImport`
- `markCandidateReadyForBatch`
- `openInconsistency`
- `resolveInconsistency`
- `waiveInconsistency`
- `createFiscalBatch`
- `submitBatchForReview`
- `simulateBatchInternally`
- `approveBatchForFutureIssuance`
- `cancelBatch`

Cada comando deve:
- validar usuario atual;
- validar tenant atual;
- validar permissao;
- validar estado atual;
- gravar auditoria quando critico;
- carregar ou gerar correlation id;
- preparar idempotencia futura.

## 13. Auditoria e Observabilidade
Eventos obrigatorios:
- `documents.uploaded`
- `imports.created`
- `imports.validation_started`
- `imports.validation_finished`
- `fiscal_candidate.created`
- `fiscal_candidate.marked_ready`
- `inconsistency.opened`
- `inconsistency.resolved`
- `inconsistency.waived`
- `batch.created`
- `batch.submitted_for_review`
- `batch.simulated`
- `batch.approved`
- `batch.cancelled`

Payload minimo:
- tenantId;
- actorId;
- eventType;
- entityType;
- entityId;
- beforePayload quando aplicavel;
- afterPayload quando aplicavel;
- metadata;
- correlationId;
- createdAt.

## 14. LGPD e Dados Sensiveis
O MVP deve preparar mascaramento para:
- CPF/CNPJ de tomador;
- email;
- telefone;
- endereco;
- nome do tutor quando exposto fora do detalhe operacional;
- payloads de auditoria com dados pessoais.

Regras:
- logs tecnicos nao devem receber dados pessoais completos;
- payloads de auditoria devem permitir mascaramento em visualizacao;
- downloads de documentos exigem permissao;
- dados sensiveis devem ser exibidos apenas quando necessario para o trabalho fiscal.

## 15. Requisitos Nao Funcionais
- TypeScript strict ativo.
- Prisma como acesso principal ao PostgreSQL.
- Tenant isolation em toda tabela critica.
- RBAC em backend para acoes criticas.
- Auditoria em comandos relevantes.
- Componentes React sem logica fiscal.
- UI responsiva, densa, limpa e profissional.
- Estrutura preparada para filas com pg-boss no futuro.
- Estrutura preparada para Sentry no futuro.
- Testes unitarios para permissoes, auditoria, correlation id e tenant scope.

## 16. Criterios de Aceite do MVP
O MVP e aceito quando:
- usuario autenticado consegue acessar dashboard por tenant;
- dashboard mostra cards operacionais do fluxo fiscal;
- upload estruturado registra document file e importacao;
- importacao possui status auditavel;
- candidatos fiscais podem ser listados e revisados;
- inconsistencias bloqueantes impedem lote;
- inconsistencias revisaveis aceitam justificativa auditavel;
- lote pode ser criado com candidatos aptos;
- lote pode entrar em revisao;
- lote pode ser simulado internamente sem emissao real;
- lote pode ser aprovado para etapa futura sem envio externo;
- toda acao critica valida permissao no backend;
- toda acao critica registra auditoria;
- dados sensiveis podem ser mascarados na visualizacao;
- testes minimos passam.

## 17. Indicadores de Produto
- numero de importacoes pendentes;
- taxa de importacoes com erro;
- candidatos criados por importacao;
- candidatos bloqueados;
- inconsistencias abertas por tipo;
- tempo medio de resolucao de inconsistencia;
- lotes em revisao;
- lotes aprovados para etapa futura;
- eventos de auditoria por fluxo.

## 18. Agentes e Modelos Recomendados
- Codex: implementar services, testes, Prisma, APIs, refactors, commits e integracao full-stack.
- Claude: revisar dominio fiscal, completar textos do PRD, refinar workflows e riscos fiscais.
- Gemini: desenhar e revisar telas, melhorar UX visual, responsividade e componentes shadcn/ui.
- AIOX `@pm` ou `@po`: quebrar este PRD em epicos, stories, criterios de aceite e prioridades.
- AIOX `@architect`: revisar fronteiras tecnicas antes de sprints de implementacao.
- AIOX `@qa`: transformar criterios em cenarios de teste e checklist de validacao.

## 19. Proxima Etapa Depois do PRD
Criar o plano de orquestracao e execucao com:
- epicos;
- sprints;
- tarefas sequenciadas;
- checklist por tarefa;
- checklist por sprint;
- dependencias entre tarefas;
- riscos de quebra;
- gates de qualidade;
- dashboard de progresso em markdown;
- agente/modelo recomendado por tarefa.