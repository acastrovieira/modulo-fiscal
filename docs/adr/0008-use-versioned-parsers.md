# 0008 - Use Versioned Parsers

## Status
Accepted

## Context
Importações de planilhas, documentos e integrações externas mudam com o tempo. Em domínio fiscal, reprocessar dados antigos com parser novo pode alterar resultados indevidamente.

## Decision
Parsers de importação serão versionados e registrados nos metadados dos processamentos.

## Consequences
Versionamento permite reprodutibilidade e diagnóstico de divergências. O trade-off é manter compatibilidade e governança sobre versões antigas.
