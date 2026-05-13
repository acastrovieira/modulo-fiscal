# Fronteiras de Domínio

## Objetivo
Definir responsabilidades dos módulos do VetFiscal OS para preservar uma arquitetura modular, SaaS-ready e segura para evolução fiscal, financeira e operacional.

## Direção de Dependências
Cada módulo deve seguir DDD leve:
- `presentation`: componentes, páginas ou adaptadores de interface.
- `application`: casos de uso, comandos, queries e orquestração.
- `domain`: entidades, value objects, políticas e regras do domínio.
- `infrastructure`: Prisma, storage, provedores externos e adapters técnicos.

A interface não acessa Prisma diretamente. Componentes chamam APIs, server actions ou services de aplicação. Permissões, tenant e auditoria são verificados no backend.

## Módulos
### identity
Responsável por identidade de usuário, perfil local, sessão e ponte com Supabase Auth.

Não deve possuir regras fiscais, dados financeiros ou decisões de tenant além do necessário para autenticação.

### tenant
Responsável por tenant, membership, papéis, tenant ativo e isolamento multiempresa.

Não deve executar workflows fiscais. Deve fornecer contexto e garantias de escopo.

### audit
Responsável por registrar eventos auditáveis, correlacionar ações e permitir consulta controlada.

Não deve ser usado como banco operacional primário. Payloads de auditoria complementam fatos, mas não substituem tabelas de domínio.

### documents
Responsável por metadados de arquivos, checksums, storage path e controle de download.

Não deve interpretar regra fiscal do conteúdo. Parsing pertence a imports ou fiscal, conforme o caso.

### imports
Responsável por receber fontes estruturadas, validar formato, normalizar registros e preparar dados para candidatos fiscais.

Não deve emitir NFS-e nem tomar decisão fiscal final.

### fiscal
Responsável por candidatos fiscais, inconsistências, fingerprints, lotes supervisionados e políticas fiscais internas.

Não deve chamar provedor municipal diretamente. Integrações externas passam por contracts/adapters em integrations.

### workflow
Responsável por estados, transições, guards, histórico de fluxo e coordenação de processos longos.

Não deve conter regra fiscal específica que pertence ao módulo fiscal.

### integrations
Responsável por adapters externos futuros, incluindo provedores NFS-e, storage externo, mensageria e APIs terceiras.

Não deve vazar detalhes de provider para módulos de domínio. O contrato interno governa a dependência.

### operational
Responsável por visão operacional agregada, dashboard, filas de trabalho e indicadores de execução.

Não deve ser fonte de verdade de regras fiscais. Ele compõe leituras de outros módulos.

### observability
Responsável por logs estruturados, traces futuros, métricas, Sentry futuro e diagnóstico técnico.

Não deve armazenar dados sensíveis sem mascaramento e não substitui auditoria de negócio.

## Regras Transversais
- Tabelas críticas devem carregar `tenantId`.
- Ações críticas validam `currentUser`, `currentTenant` e `assertPermission`.
- Ações críticas registram `audit.record`.
- Dados sensíveis devem ser mascaráveis em UI, logs e eventos técnicos.
- Valores monetários futuros devem ser armazenados em centavos.
- Datas devem ser persistidas de forma consistente e comparável.
- `correlationId` acompanha comandos, auditoria e logs.
- Fiscal logic não deve residir em React.

## Persistência
Prisma é o acesso primário ao PostgreSQL. Repositórios e gateways devem ficar em `infrastructure`, enquanto casos de uso ficam em `application`.

JSON pode ser usado em auditoria e metadados, mas fatos operacionais importantes devem ganhar modelo próprio quando virarem parte do workflow.

## Integrações Futuras
Adapters de NFS-e devem ser introduzidos atrás de contratos internos, respeitando:
- idempotência;
- simulação/homologação antes de produção;
- segregação por tenant;
- rastreabilidade de payloads;
- aprovação humana antes de efeitos fiscais reais.

## Implicação Para o PRD
O PRD deve organizar requisitos por módulo e jornada operacional. Cada requisito precisa indicar ator, permissão, estado inicial, estado final, auditoria esperada e dados sensíveis envolvidos.