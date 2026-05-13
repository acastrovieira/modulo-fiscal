# 0005 - Use pg-boss For Queues

## Status
Accepted

## Context
Importações, validações, simulações e workflows fiscais precisarão de processamento assíncrono confiável. No MVP, manter a pilha operacional enxuta é mais importante do que introduzir broker dedicado.

## Decision
Usaremos pg-boss no futuro para filas baseadas em PostgreSQL.

## Consequences
pg-boss mantém a operação simples e próxima do banco principal. O trade-off é monitorar limites de throughput e considerar broker dedicado apenas quando houver necessidade real.
