# 0001 - Use Modular Monolith

## Status
Accepted

## Context
VetFiscal OS começa pelo módulo fiscal inteligente, mas precisa evoluir para financeiro, CRM, DRE, fluxo de caixa, relatórios, analytics e automações. O domínio fiscal exige rastreabilidade, consistência transacional e baixo acoplamento entre áreas do produto.

## Decision
Usaremos um monólito modular com DDD leve, módulos por domínio e limites explícitos entre domain, application, infrastructure e presentation.

## Consequences
A arquitetura reduz complexidade operacional no MVP, facilita refatorações internas e evita custos prematuros de microsserviços. O trade-off é exigir disciplina de dependências internas para que os módulos não virem camadas genéricas acopladas.
