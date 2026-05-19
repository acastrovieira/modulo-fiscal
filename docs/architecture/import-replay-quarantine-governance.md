# Import Replay, Quarantine e Parser Governance

## Objetivo
Permitir revalidacao segura de importacoes estruturadas sem perder rastreabilidade, sem duplicar linhas/candidatos e sem aceitar parser desconhecido, downgrade ou payload malicioso.

## Contrato
Toda validacao de importacao registra uma tentativa em `import_validation_attempts` com:

- `tenantId`
- `importBatchId`
- `parserVersion`
- `status`
- totais de linhas, validas, invalidas e duplicadas
- `createdBy`
- `correlationId`
- resumo redigido de erros

As linhas invalidas passam a usar `ImportRowStatus.QUARANTINED`. O status do import continua `HAS_ERRORS` quando ha quarentena de linhas.

## Replay Seguro
Uma importacao pode ser revalidada quando esta em:

- `PENDING_VALIDATION`
- `HAS_ERRORS`
- `VALIDATED`
- `READY_FOR_REVIEW`

O replay e bloqueado quando:

- o import esta `ARCHIVED` ou `VALIDATING`;
- ja existem candidatos fiscais criados para o import;
- a versao do parser solicitada difere da ultima tentativa registrada;
- o parser e desconhecido.

Durante replay, as linhas antigas do import sao substituidas de forma transacional antes da criacao das novas linhas normalizadas/quarentenadas. Isso evita duplicidade silenciosa.

## Governanca de Parser
O parser suportado nesta etapa e `vetcare_structured_v1`.

Parser desconhecido falha fechado antes de buscar ou alterar o import. Mudanca de parser ou downgrade exige um fluxo explicito futuro de migracao/revalidacao governada.

## Campos Proibidos
O parser rejeita campos controlados por cliente ou sensiveis, incluindo:

- `tenantId`
- `rawPayload`
- `storagePath`
- `documentHash`
- `customerDocument`, `cpf`, `cnpj`
- `providerToken`, `providerPayload`
- `accessToken`, `refreshToken`, `authorization`, `cookie`
- `privateKey`, `serviceRoleKey`

CPF/CNPJ bruto nao entra em payload normalizado. Documento de tomador deve chegar mascarado quando necessario para revisao humana.

## Auditoria
Eventos existentes continuam:

- `imports.validation_started`
- `imports.validation_finished`

O evento final inclui `parserVersion`, totais, duplicidades e `validationAttemptStatus`, sem payload bruto de linha.

## Fora de Escopo
- Parser multi-versao com migracao assistida.
- Fila assíncrona real.
- Resolucao manual de quarentena pela UI.
- Emissao real de NFS-e, scraping, provider municipal ou certificado digital.
