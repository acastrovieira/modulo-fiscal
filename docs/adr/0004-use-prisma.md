# 0004 - Use Prisma

## Status
Accepted

## Context
O projeto precisa de modelagem relacional clara, tipos TypeScript e migrações controladas para entidades críticas como tenant, memberships, auditoria e documentos.

## Decision
Usaremos Prisma como ORM e ferramenta de schema/migrations.

## Consequences
Prisma acelera desenvolvimento com tipos seguros e um schema legível. O trade-off é revisar queries críticas e evitar que componentes ou rotas ignorem services de aplicação para acessar Prisma diretamente.
