# Audit Completeness e Redaction

## Objetivo
Garantir que a auditoria do beta fiscal supervisionado seja completa, tenant-scoped e segura por padrao, sem armazenar ou expor dados sensiveis completos em payloads publicos.

## Campos Obrigatorios
Todo evento critico deve conter:

- `tenantId`
- `actorId` ou `null` para evento sistemico
- `eventType`
- `entityType`
- `entityId` quando existir entidade alvo
- `correlationId`
- `beforePayload` e/ou `afterPayload` quando houver transicao de estado
- `metadata` minima para rastreabilidade operacional

## Eventos Criticos Mapeados
| Area | Eventos |
| --- | --- |
| Onboarding/Tenant | `tenant.bootstrap.created`, `tenant.switched`, `tenant_member.suspended` |
| Convites | `tenant_invite.created`, `tenant_invite.resent`, `tenant_invite.revoked`, `tenant_invite.accepted`, `tenant_invite.expired` |
| Documentos | `documents.download_intent_recorded` |
| Importacoes | `imports.created`, `imports.validation_started`, `imports.validation_finished` |
| Candidatos | `fiscal_candidate.created`, `fiscal_candidate.marked_ready` |
| Inconsistencias | `inconsistency.opened`, `inconsistency.resolved`, `inconsistency.waived` |
| Lotes | `fiscal_batch.created`, `fiscal_batch.submitted_for_review`, `fiscal_batch.simulated_internally`, `fiscal_batch.approved_for_future_issuance`, `fiscal_batch.cancelled` |
| Simulador fiscal | `fiscal_simulation.profile_configured`, `fiscal_simulation.service_taker_created`, `fiscal_simulation.document_created`, `fiscal_simulation.document_validated`, `fiscal_simulation.document_simulated_issued`, `fiscal_simulation.document_voided`, `fiscal_simulation.scenarios_evaluated` |

## Redaction
`audit.record` sanitiza payloads antes da persistencia. As consultas publicas de auditoria tambem retornam apenas previews redigidos.

Chaves e valores sensiveis redigidos:

- CPF/CNPJ bruto
- e-mail e telefone
- `token`, `secret`, `authorization`, `cookie`
- certificados e private keys
- `storagePath`, `signedUrl`, `bucket`
- `rawPayload`
- `providerResponse`
- `checksum`
- `idempotencyKey`
- campos com `document`

## Regras
- Nunca gravar resposta bruta de provider externo em auditoria publica.
- Nunca gravar CPF/CNPJ completo, mesmo em metadata.
- Auditoria de simulacao deve manter flags `externalProviderCalled: false`, `nfseIssued: false`, `externalTransmission: false` ou equivalentes.
- Tentativas negadas continuam registradas quando forem fiscalmente relevantes em sprint futura; nesta sprint o foco e garantir que eventos existentes sejam seguros.

## Fora de Escopo
- Emissao real de NFS-e.
- Scraping.
- Provider municipal.
- Certificado digital.
- Retencao legal definitiva de auditoria, que exige decisao juridica antes de producao real.
