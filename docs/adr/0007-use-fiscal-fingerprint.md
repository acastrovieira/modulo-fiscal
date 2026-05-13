# 0007 - Use Fiscal Fingerprint

## Status
Accepted

## Context
O sistema precisará detectar duplicidades, reprocessamentos e divergências entre entradas, candidatos fiscais e lotes.

## Decision
Usaremos um fiscal fingerprint determinístico para identificar semanticamente candidatos e eventos fiscais relevantes.

## Consequences
Fingerprints melhoram idempotência, deduplicação e auditoria. O trade-off é versionar cuidadosamente os campos que compõem o fingerprint para evitar colisões ou mudanças silenciosas.
