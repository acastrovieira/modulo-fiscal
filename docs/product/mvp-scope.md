# VetFiscal OS - Escopo do MVP Fiscal Supervisionado

## Objetivo
O MVP do VetFiscal OS deve entregar um cockpit operacional fiscal para clínicas veterinárias acompanharem importações, candidatos fiscais, inconsistências, revisões e lotes supervisionados de NFS-e.

Nesta fase, o produto prepara a fundação de domínio e operação. Ele não emite NFS-e real, não acessa portais municipais, não faz scraping e não toma decisões fiscais irreversíveis sem revisão humana.

## Problema
Clínicas veterinárias acumulam dados de atendimento, produtos, procedimentos, clientes e recebimentos em sistemas heterogêneos. A emissão fiscal costuma depender de conferências manuais, interpretação de regras locais, revisão contábil e controle de evidências.

O risco central do MVP não é apenas técnico. É fiscal, operacional e auditável. Por isso, o fluxo deve priorizar rastreabilidade, segregação de permissões, revisão humana e isolamento por tenant desde o primeiro dia.

## Escopo Incluído
- Cockpit operacional por tenant com visão de pendências fiscais.
- Estrutura multiempresa com tenant ativo, RBAC e auditoria.
- Cadastro técnico mínimo de arquivos importados em `document_files`.
- Pipeline conceitual de importação, normalização, validação e geração futura de candidatos fiscais.
- Estados supervisionados para candidatos fiscais, inconsistências e lotes.
- Permissões iniciais para gestão fiscal, auditoria, importação e documentos.
- Registro de auditoria para ações críticas com `correlationId`.
- Preparação para idempotência em comandos críticos.
- Preparação para fingerprint fiscal versionado.
- Preparação para adapters de provedores NFS-e, sem implementação real no MVP inicial.
- Dashboard placeholder com indicadores operacionais.
- ADRs, fronteiras de domínio e base arquitetural para PRD.

## Fora do Escopo Nesta Fase
- Emissão real de NFS-e.
- Integração com prefeitura, provedor NFS-e ou certificado digital.
- Scraping de portais fiscais, ERPs ou sistemas legados.
- CRUD genérico sem workflow fiscal definido.
- Automatização fiscal sem aprovação humana.
- Motor fiscal completo por município.
- Financeiro completo, CRM, DRE, fluxo de caixa e analytics avançado.
- Billing SaaS e cobrança de assinatura.
- Filas com `pg-boss` em produção.
- Microsserviços.
- Uso de n8n para core fiscal.

## Critérios de Sucesso do MVP
- Toda ação crítica passa por permissão no backend.
- Toda ação crítica pode registrar evento de auditoria.
- Todo dado crítico é associado a um tenant.
- O dashboard mostra o estado operacional sem depender de lógica fiscal em React.
- A arquitetura permite evoluir para importações, candidatos, inconsistências e lotes sem refatoração estrutural.
- O sistema deixa claro quando algo está pendente de revisão humana.
- Nenhuma emissão fiscal real acontece nesta etapa.

## Métricas Operacionais Iniciais
- Importações pendentes.
- Candidatos fiscais em revisão.
- Inconsistências abertas.
- Lotes em revisão.
- Emissões planejadas ou simuladas na semana.
- Alertas críticos por tenant.

## Perguntas Abertas Para o PRD
- Quais fontes de dados serão priorizadas para importação no primeiro fluxo real?
- Quais municípios e provedores NFS-e serão tratados primeiro em homologação futura?
- Quem aprova fiscalmente um lote em cada perfil de clínica?
- Quais campos mínimos formam o candidato fiscal veterinário?
- Quais inconsistências bloqueiam lote e quais permitem justificativa?
- Qual nível de acesso o contador externo deve ter por padrão?
- Quais dados pessoais precisam de mascaramento imediato em telas e logs?