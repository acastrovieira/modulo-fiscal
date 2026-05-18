# Sprint 27 - Advanced Import Integrations

## Objective
Evoluir importacoes estruturadas com contrato versionado, normalizacao segura e rastreabilidade por fingerprint, sem criar integracao externa, scraping ou emissao fiscal real.

## Tasks
- [x] Criar parser versionado `vetcare_structured_v1`.
- [x] Normalizar aliases operacionais de linha importada.
- [x] Exigir valores monetarios em centavos.
- [x] Rejeitar campos proibidos controlados pelo cliente, incluindo `tenantId`, paths internos, hashes e documentos brutos.
- [x] Marcar duplicidades dentro da mesma importacao com fingerprint deterministico.
- [x] Passar `parserVersion` pelo contrato da API de validacao.
- [x] Registrar auditoria com versao de parser, totais e duplicidades sem payload sensivel bruto.
- [x] Documentar contrato em `docs/architecture/import-parser-contracts.md`.
- [x] Cobrir parser, schema e service com testes.

## Acceptance Checklist
- [x] Nenhum endpoint aceita `tenantId` do cliente como escopo confiavel.
- [x] Nenhum dado de CPF/CNPJ completo entra em auditoria publica.
- [x] Parser desconhecido falha antes de alterar importacao.
- [x] Duplicidade e rastreavel sem bloquear workflow humano.
- [x] Nenhuma emissao real, scraping, provider externo, certificado ou fila fiscal real foi introduzida.

## Agents
- Codex: implementacao, contratos, testes, docs e git.
- @architect: fronteiras de imports, tenant e auditoria.
- @qa: cenarios negativos de parser, tenant e dados sensiveis.
- Segurança/LGPD: minimizacao de dados e bloqueio de documentos brutos.
