# Setup de Usuarios, Roles e Tenants Beta - Sprint 41

## Status
Plano de setup tecnico preparado. Usuarios e tenants beta reais permanecem pendentes ate aprovacao fora do repositorio.

## Objetivo
Preparar acesso beta controlado para 1-3 tenants com roles de menor privilegio, isolamento por tenant e ownership explicito antes de qualquer teste com usuario real.

## Owners
| Responsabilidade | Status | Exigido Antes do Piloto |
| --- | --- | --- |
| Product owner | Pendente | Sim |
| Owner de engenharia | Pendente | Sim |
| Owner de suporte | Pendente | Sim |
| Owner de QA | Pendente | Recomendado |

## Cadastro de Tenants Aprovados
Usar apenas nomes ficticios em docs do repositorio. Nomes reais de tenants devem ser aprovados e acompanhados fora do repositorio.

| Alias do Tenant | Politica de Dados | Status | Notas |
| --- | --- | --- | --- |
| Tenant A | Dados ficticios/demo ou dados beta formalmente aprovados | Pendente | Obrigatorio para smoke com dois tenants. |
| Tenant B | Dados ficticios/demo ou dados beta formalmente aprovados | Pendente | Obrigatorio para smoke de isolamento. |
| Tenant C | Tenant opcional de piloto controlado | Pendente | Usar apenas depois do smoke Tenant A/B passar. |

## Matriz de Roles de Menor Privilegio
| Role | Finalidade no Beta | Permitido no Piloto | Notas |
| --- | --- | --- | --- |
| OWNER | Bootstrap do tenant e responsabilidade final do tenant | Limitado | Manter um owner ativo por tenant, salvo necessidade de negocio. |
| ADMIN | Administracao de tenant e convites | Limitado | Usar para setup e suporte, nao para revisao fiscal diaria. |
| FISCAL_MANAGER | Supervisionar workflow fiscal e aprovar transicoes controladas | Sim | Papel principal de supervisor fiscal beta. |
| FISCAL_OPERATOR | Importar, revisar e preparar itens fiscais operacionais | Sim | Sem decisoes finais de ownership. |
| FINANCIAL_OPERATOR | Observacao futura adjacente ao financeiro | Opcional | Evitar se nao for necessario no beta. |
| ACCOUNTANT | Leitura/revisao de dados operacionais fiscais e auditoria | Opcional | Usar menor privilegio para revisao contabil externa. |
| AUDITOR | Revisao somente leitura de auditoria/documentos | Opcional | Sem acesso de mutacao. |

## Template de Cadastro de Usuarios
Nao armazenar e-mails pessoais reais neste arquivo. Use aliases ou acompanhamento externo seguro para usuarios reais.

| Alias do Usuario | Alias do Tenant | Role | Status | Evidencia |
| --- | --- | --- | --- | --- |
| beta-owner-a | Tenant A | OWNER | Pendente | Aprovacao externa obrigatoria. |
| beta-fiscal-manager-a | Tenant A | FISCAL_MANAGER | Pendente | Aprovacao externa obrigatoria. |
| beta-fiscal-operator-a | Tenant A | FISCAL_OPERATOR | Pendente | Aprovacao externa obrigatoria. |
| beta-auditor-a | Tenant A | AUDITOR | Pendente | Aprovacao externa obrigatoria. |
| beta-owner-b | Tenant B | OWNER | Pendente | Aprovacao externa obrigatoria. |
| beta-fiscal-manager-b | Tenant B | FISCAL_MANAGER | Pendente | Aprovacao externa obrigatoria. |
| beta-fiscal-operator-b | Tenant B | FISCAL_OPERATOR | Pendente | Aprovacao externa obrigatoria. |
| beta-auditor-b | Tenant B | AUDITOR | Pendente | Aprovacao externa obrigatoria. |

## Checklist de Setup
- [ ] Owners de produto, engenharia e suporte estao nomeados.
- [ ] Tenant A e Tenant B estao aprovados fora do repositorio.
- [ ] Usuarios beta estao aprovados fora do repositorio.
- [ ] Cada usuario tem exatamente a role minima necessaria.
- [ ] Memberships de tenant estao criadas ou validadas em staging/beta.
- [ ] Troca de tenant funciona para usuarios com multiplas memberships.
- [ ] Usuario sem membership nao acessa dashboard.
- [ ] Usuario suspenso nao acessa tenant.
- [ ] Evidencia registrada em `docs/product/beta-pilot-evidence-log.md`.

## Condicoes de No-Go
- Qualquer usuario ou tenant real e adicionado sem aprovacao.
- Qualquer e-mail real, CPF, CNPJ, token ou documento aparece em docs do repositorio.
- Qualquer usuario acessa tenant sem membership ativa.
- Qualquer usuario suspenso acessa tenant.
- Qualquer role recebe permissoes mais amplas que o necessario para o piloto.
