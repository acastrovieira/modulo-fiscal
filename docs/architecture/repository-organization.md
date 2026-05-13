# Organizacao do Repositorio VetFiscal

## Decisao
O VetFiscal OS permanece como um monolito modular em Next.js. A separacao entre frontend e backend sera feita por responsabilidade e camada, nao por duas pastas raiz separadas.

Essa decisao mantem o MVP simples de rodar, evita complexidade prematura de monorepo e preserva a arquitetura SaaS-ready com DDD leve, tenant, RBAC, auditoria e idempotencia desde a base.

## Como Ler a Estrutura
```txt
src/app                 # Rotas Next, layouts, API routes
src/components          # UI compartilhada e layout visual
src/modules/*/presentation
                        # Componentes especificos de modulo

src/modules/*/domain    # Entidades, estados, politicas, tipos de dominio
src/modules/*/application
                        # Casos de uso, commands, queries, services
src/modules/*/infrastructure
                        # Prisma, Supabase, storage, adapters externos

src/shared              # Auth, database, events, errors, security, logging
src/config              # Configuracao da aplicacao
src/lib                 # Utilitarios pequenos e integracoes locais
prisma                  # Schema e migrations
docs                    # ADR, arquitetura, produto, PRD
tests                   # Testes unitarios, integracao e e2e futuros
```

## Area de Frontend
A area de frontend inclui:
- `src/app`
- `src/components`
- `src/modules/*/presentation`

Responsabilidades:
- Renderizar telas, layouts, estados visuais e navegacao.
- Consumir APIs, server actions ou services de aplicacao.
- Usar shadcn/ui, Radix UI, Tailwind CSS e lucide-react.
- Manter a experiencia como cockpit operacional fiscal premium.

Restricoes:
- Nao acessar Prisma diretamente.
- Nao implementar logica fiscal em React.
- Nao validar permissao apenas no cliente.
- Nao criar CRUD generico sem workflow de dominio.

## Area de Backend, Dominio e Infra
A area de backend inclui:
- `src/modules/*/domain`
- `src/modules/*/application`
- `src/modules/*/infrastructure`
- `src/shared`
- `prisma`
- `tests`

Responsabilidades:
- Modelar dominio, estados, politicas e casos de uso.
- Validar tenant, RBAC e invariantes antes de acoes criticas.
- Registrar auditoria em transicoes relevantes.
- Integrar Prisma, Supabase, storage e adapters futuros.
- Garantir idempotencia em comandos criticos.

Restricoes:
- Nao depender de componentes React.
- Nao expor detalhes de provider fiscal diretamente para UI.
- Nao implementar emissao real de NFS-e nesta fase.
- Nao usar scraping nem n8n para core fiscal.

## Plataforma Compartilhada
`src/shared`, `src/config` e `src/lib` existem para recursos transversais pequenos e bem definidos.

Exemplos adequados:
- autenticacao e sessao;
- tenant atual;
- permissoes;
- database client;
- correlation id;
- eventos internos;
- erros de dominio;
- logging e mascaramento.

Evitar colocar regra fiscal ou regra de produto generica nesses diretorios. Quando a regra pertencer a um modulo, ela deve ficar dentro do modulo.

## Roteamento de Modelos e Agentes
| Tipo de tarefa | Agente/modelo sugerido | Observacao |
| --- | --- | --- |
| UI, layout, dashboard, responsividade, shadcn/ui | Gemini | Ideal para iteracoes visuais e refinamento de experiencia. |
| Dominio fiscal, PRD, DDD, workflows, riscos fiscais | Claude | Bom para texto longo, modelagem e analise conceitual. |
| Implementacao, refactor, Prisma, testes, commits, integracao | Codex | Melhor para executar mudancas no repositorio e verificar qualidade. |

## Regras Para Delegar Tarefas
Toda tarefa entregue a um agente deve informar:
- modulo afetado;
- camada afetada: presentation, application, domain ou infrastructure;
- objetivo operacional;
- criterios de aceite;
- restricoes fiscais e de seguranca aplicaveis.

Exemplo de tarefa frontend:
> Modulo operational, camada presentation. Melhorar cards do dashboard sem acessar Prisma e sem criar regra fiscal no React. Aceite: layout responsivo, visual premium, usa componentes existentes e nao altera services.

Exemplo de tarefa backend:
> Modulo fiscal, camadas domain/application. Modelar transicoes conceituais de FiscalCandidate com guards de permissao. Aceite: testes unitarios, sem provider NFS-e real, com auditoria prevista por evento.

## Quando Reavaliar
Reavaliar monorepo ou separacao fisica `frontend/backend` apenas quando houver pelo menos uma destas necessidades:
- app web e API precisarem deploys independentes;
- existir segundo cliente real consumindo a API;
- filas/workers exigirem runtime separado em producao;
- equipe crescer a ponto de ownership por pacote reduzir conflito;
- contratos publicos de API estabilizarem fora do Next.js.

Ate la, o monolito modular reduz atrito e protege a velocidade do MVP.