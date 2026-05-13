# Fronteiras de Dominio

## Objetivo
Definir responsabilidades dos modulos do VetFiscal OS para preservar uma arquitetura modular, SaaS-ready e segura para evolucao fiscal, financeira e operacional.

## Direcao de Dependencias
Cada modulo deve seguir DDD leve:
- `presentation`: componentes, paginas ou adaptadores de interface.
- `application`: casos de uso, comandos, queries e orquestracao.
- `domain`: entidades, value objects, politicas e regras do dominio.
- `infrastructure`: Prisma, storage, provedores externos e adapters tecnicos.

A interface nao acessa Prisma diretamente. Componentes chamam APIs, server actions ou services de aplicacao. Permissoes, tenant e auditoria sao verificados no backend.

## Modulos
### identity
Responsavel por identidade de usuario, perfil local, sessao e ponte com Supabase Auth.

Nao deve possuir regras fiscais, dados financeiros ou decisoes de tenant alem do necessario para autenticacao.

### tenant
Responsavel por tenant, membership, papeis, tenant ativo e isolamento multiempresa.

Nao deve executar workflows fiscais. Deve fornecer contexto e garantias de escopo.

### audit
Responsavel por registrar eventos auditaveis, correlacionar acoes e permitir consulta controlada.

Nao deve ser usado como banco operacional primario. Payloads de auditoria complementam fatos, mas nao substituem tabelas de dominio.

### documents
Responsavel por metadados de arquivos, checksums, storage path e controle de download.

Nao deve interpretar regra fiscal do conteudo. Parsing pertence a imports ou fiscal, conforme o caso.

### imports
Responsavel por receber fontes estruturadas, validar formato, normalizar registros e preparar dados para candidatos fiscais.

Nao deve emitir NFS-e nem tomar decisao fiscal final.

### fiscal
Responsavel por candidatos fiscais, inconsistencias, fingerprints, lotes supervisionados e politicas fiscais internas.

Nao deve chamar provedor municipal diretamente. Integracoes externas passam por contracts/adapters em integrations.

### workflow
Responsavel por estados, transicoes, guards, historico de fluxo e coordenacao de processos longos.

Nao deve conter regra fiscal especifica que pertence ao modulo fiscal.

### integrations
Responsavel por adapters externos futuros, incluindo provedores NFS-e, storage externo, mensageria e APIs terceiras.

Nao deve vazar detalhes de provider para modulos de dominio. O contrato interno governa a dependencia.

### operational
Responsavel por visao operacional agregada, dashboard, filas de trabalho e indicadores de execucao.

Nao deve ser fonte de verdade de regras fiscais. Ele compoe leituras de outros modulos.

### observability
Responsavel por logs estruturados, traces futuros, metricas, Sentry futuro e diagnostico tecnico.

Nao deve armazenar dados sensiveis sem mascaramento e nao substitui auditoria de negocio.

## Regras Transversais
- Tabelas criticas devem carregar `tenantId`.
- Acoes criticas validam `currentUser`, `currentTenant` e `assertPermission`.
- Acoes criticas registram `audit.record`.
- Dados sensiveis devem ser mascaraveis em UI, logs e eventos tecnicos.
- Valores monetarios futuros devem ser armazenados em centavos.
- Datas devem ser persistidas de forma consistente e comparavel.
- `correlationId` acompanha comandos, auditoria e logs.
- Fiscal logic nao deve residir em React.

## Persistencia
Prisma e o acesso primario ao PostgreSQL. Repositorios e gateways devem ficar em `infrastructure`, enquanto casos de uso ficam em `application`.

JSON pode ser usado em auditoria e metadados, mas fatos operacionais importantes devem ganhar modelo proprio quando virarem parte do workflow.

## Integracoes Futuras
Adapters de NFS-e devem ser introduzidos atras de contratos internos, respeitando:
- idempotencia;
- simulacao/homologacao antes de producao;
- segregacao por tenant;
- rastreabilidade de payloads;
- aprovacao humana antes de efeitos fiscais reais.

## Implicacao Para o PRD
O PRD deve organizar requisitos por modulo e jornada operacional. Cada requisito precisa indicar ator, permissao, estado inicial, estado final, auditoria esperada e dados sensiveis envolvidos.