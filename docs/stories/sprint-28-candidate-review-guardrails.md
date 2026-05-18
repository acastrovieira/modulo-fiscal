# Sprint 28 - Candidate Review Guardrails

## Objective
Endurecer a criacao de candidatos fiscais a partir de importacoes versionadas, tornando explicitos os motivos de bloqueio e avisos LGPD antes de qualquer lote supervisionado.

## Tasks
- [x] Criar review gate deterministico no dominio de candidatos.
- [x] Bloquear candidatos duplicados dentro da importacao.
- [x] Bloquear candidatos sem valor valido em centavos.
- [x] Bloquear candidatos sem data de servico ou competencia.
- [x] Registrar warning quando payload legado trouxer documento bruto.
- [x] Incluir `reviewGate` na auditoria `fiscal_candidate.created`.
- [x] Garantir que documento bruto nao entra no payload de auditoria.
- [x] Documentar contratos em `docs/architecture/fiscal-candidate-review-guardrails.md`.
- [x] Ampliar testes unitarios do dominio e service.

## Acceptance Checklist
- [x] Candidato duplicado vira `BLOCKED`, nao `READY_FOR_BATCH`.
- [x] Candidato sem valor positivo em centavos vira `BLOCKED`.
- [x] Candidato sem data operacional vira `BLOCKED`.
- [x] Avisos LGPD sao auditaveis sem expor CPF/CNPJ bruto.
- [x] Nenhuma emissao real, scraping, provider externo, certificado ou fila fiscal real foi introduzida.

## Agents
- Codex: implementacao, testes, docs e PR.
- @architect: fronteira entre import parser, candidato e batch.
- @qa: cenarios negativos de duplicidade, valor, data e LGPD.
- Segurança/LGPD: warning de documento bruto e minimizacao em auditoria.
