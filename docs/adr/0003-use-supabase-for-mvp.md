# 0003 - Use Supabase For MVP

## Status
Accepted

## Context
O MVP precisa autenticação, storage e banco PostgreSQL com velocidade de entrega, sem perder a possibilidade de amadurecimento enterprise.

## Decision
Usaremos Supabase Auth e Supabase Storage no MVP, mantendo a aplicação API-first e sem acoplar regras de domínio diretamente ao provedor.

## Consequences
Supabase acelera autenticação, sessões e arquivos. O trade-off é encapsular integrações para preservar portabilidade e evitar que regras fiscais dependam de detalhes do fornecedor.
