# VetFiscal OS - Escopo do MVP Fiscal Supervisionado

## Objetivo
O MVP do VetFiscal OS deve entregar um cockpit operacional fiscal para clinicas veterinarias acompanharem importacoes, candidatos fiscais, inconsistencias, revisoes e lotes supervisionados de NFS-e.

Nesta fase, o produto prepara a fundacao de dominio e operacao. Ele nao emite NFS-e real, nao acessa portais municipais, nao faz scraping e nao toma decisoes fiscais irreversiveis sem revisao humana.

## Problema
Clinicas veterinarias acumulam dados de atendimento, produtos, procedimentos, clientes e recebimentos em sistemas heterogeneos. A emissao fiscal costuma depender de conferencias manuais, interpretacao de regras locais, revisao contabil e controle de evidencias.

O risco central do MVP nao e apenas tecnico. E fiscal, operacional e auditavel. Por isso, o fluxo deve priorizar rastreabilidade, segregacao de permissoes, revisao humana e isolamento por tenant desde o primeiro dia.

## Escopo Incluido
- Cockpit operacional por tenant com visao de pendencias fiscais.
- Estrutura multiempresa com tenant ativo, RBAC e auditoria.
- Cadastro tecnico minimo de arquivos importados em `document_files`.
- Pipeline conceitual de importacao, normalizacao, validacao e geracao futura de candidatos fiscais.
- Estados supervisionados para candidatos fiscais, inconsistencias e lotes.
- Permissoes iniciais para gestao fiscal, auditoria, importacao e documentos.
- Registro de auditoria para acoes criticas com `correlationId`.
- Preparacao para idempotencia em comandos criticos.
- Preparacao para fingerprint fiscal versionado.
- Preparacao para adapters de provedores NFS-e, sem implementacao real no MVP inicial.
- Dashboard placeholder com indicadores operacionais.
- ADRs, fronteiras de dominio e base arquitetural para PRD.

## Fora do Escopo Nesta Fase
- Emissao real de NFS-e.
- Integracao com prefeitura, provedor NFS-e ou certificado digital.
- Scraping de portais fiscais, ERPs ou sistemas legados.
- CRUD generico sem workflow fiscal definido.
- Automatizacao fiscal sem aprovacao humana.
- Motor fiscal completo por municipio.
- Financeiro completo, CRM, DRE, fluxo de caixa e analytics avancado.
- Billing SaaS e cobranca de assinatura.
- Filas com `pg-boss` em producao.
- Microsservicos.
- Uso de n8n para core fiscal.

## Criterios de Sucesso do MVP
- Toda acao critica passa por permissao no backend.
- Toda acao critica pode registrar evento de auditoria.
- Todo dado critico e associado a um tenant.
- O dashboard mostra o estado operacional sem depender de logica fiscal em React.
- A arquitetura permite evoluir para importacoes, candidatos, inconsistencias e lotes sem refatoracao estrutural.
- O sistema deixa claro quando algo esta pendente de revisao humana.
- Nenhuma emissao fiscal real acontece nesta etapa.

## Metricas Operacionais Iniciais
- Importacoes pendentes.
- Candidatos fiscais em revisao.
- Inconsistencias abertas.
- Lotes em revisao.
- Emissoes planejadas ou simuladas na semana.
- Alertas criticos por tenant.

## Perguntas Abertas Para o PRD
- Quais fontes de dados serao priorizadas para importacao no primeiro fluxo real?
- Quais municipios e provedores NFS-e serao tratados primeiro em homologacao futura?
- Quem aprova fiscalmente um lote em cada perfil de clinica?
- Quais campos minimos formam o candidato fiscal veterinario?
- Quais inconsistencias bloqueiam lote e quais permitem justificativa?
- Qual nivel de acesso o contador externo deve ter por padrao?
- Quais dados pessoais precisam de mascaramento imediato em telas e logs?