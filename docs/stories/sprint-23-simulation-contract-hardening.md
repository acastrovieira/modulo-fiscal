# Sprint 23 - Simulation Contract Hardening

## Status
Concluida.

## Objetivo
Consolidar os contratos publicos do Simulador Fiscal Governado v1 antes de evoluir cenarios, versionamento ou UI operacional.

## Escopo Entregue
- Contratos DTO documentados para simulacao fiscal.
- Testes de allowlist para tomadores e documentos simulados.
- Testes contra `tenantId` controlado pelo cliente.
- Testes contra documento/hash bruto em DTO.
- Testes contra linguagem fiscal oficial proibida nos DTOs.
- Auditoria padronizada com metadados `simulatedOnly`, `fiscalValue=false`, `externalTransmission=false`, `externalProviderCalled=false` e `nfseIssued=false`.

## Fora De Escopo
- UI do simulador.
- Motor de cenarios versionados.
- Integracao fiscal real.
- Provider externo.
- Emissao real de NFS-e.

## Gates
- [x] `npm run security:secrets`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`
