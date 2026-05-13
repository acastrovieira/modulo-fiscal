# 0002 - Use PostgreSQL

## Status
Accepted

## Context
O produto terá dados fiscais, financeiros, auditoria, documentos e relacionamentos multiempresa. Esses dados exigem integridade, transações, índices sólidos e consultas analíticas futuras.

## Decision
Usaremos PostgreSQL como banco principal do VetFiscal OS.

## Consequences
PostgreSQL oferece robustez transacional, JSON quando necessário e bom caminho para analytics e filas futuras. O trade-off é manter atenção a migrações, isolamento por tenant e performance desde cedo.
