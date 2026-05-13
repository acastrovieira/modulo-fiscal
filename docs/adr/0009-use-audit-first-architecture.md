# 0009 - Use Audit First Architecture

## Status
Accepted

## Context
O VetFiscal OS manipula dados sensíveis e ações críticas de múltiplos tenants. Investigação posterior, LGPD, suporte e governança dependem de trilhas confiáveis.

## Decision
A arquitetura será audit-first: ações críticas devem registrar ator, tenant, entidade, payloads relevantes, metadados e correlation id.

## Consequences
Auditoria desde a fundação aumenta confiança e suporte operacional. O trade-off é custo adicional de modelagem e armazenamento, que deve ser tratado como parte essencial do domínio.
