# 0011 - Usar Homologacao Antes de Emissao Real

## Status
Accepted

## Context
O VetFiscal OS hoje suporta simulacao fiscal supervisionada e revisao operacional sem emissao real de NFS-e. Integracoes municipais reais de NFS-e introduzem variacao de provider, responsabilidade legal, tratamento de certificados, riscos de idempotencia e requisitos de auditoria que nao podem ser tratados como uma extensao pequena do workflow simulado.

## Decision
Qualquer trabalho futuro de NFS-e real deve comecar por uma abordagem homologation-first. O sistema deve planejar e validar um municipio/provider por vez em ambiente aprovado de homologacao ou sandbox antes de qualquer uso em producao. Emissao real deve permanecer atras de adapter de provider, state machine, verificacoes de RBAC, ledger de idempotencia, trilha de auditoria e gate de aprovacao humana.

Esta ADR nao autoriza implementacao. Ela cria a pre-condicao arquitetural para trabalho futuro.

## Consequences
Consequencias positivas:
- Reduz risco fiscal antes de qualquer transmissao em producao.
- Mantem comportamento especifico de provider isolado atras de adapters.
- Preserva garantias audit-first e idempotency-first.
- Torna requisitos de certificado, secrets e LGPD explicitos antes da implementacao.
- Impede que workflows simulados virem workflows fiscais reais silenciosamente.

Trade-offs:
- Caminho mais lento ate emissao em producao.
- Mais etapas de documentacao e aprovacao antes de codar.
- Exige revisao fiscal/contabil por municipio.
- Exige evidencia de teste por provider antes de ampliar escopo.

Restricoes nao negociaveis:
- Sem scraping como mecanismo core fiscal.
- Sem tratamento de certificado sem politica de seguranca aprovada.
- Sem chamada de provider por componentes React.
- Sem emissao real sem PRD explicito, ADR de provider, evidencia de homologacao e aprovacao go/no-go.

