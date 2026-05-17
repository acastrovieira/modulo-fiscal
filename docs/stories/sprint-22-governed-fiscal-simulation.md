# Sprint 22 - Simulador Fiscal Governado v1

## Status
Concluida.

## Objetivo
Entregar o primeiro nucleo fiscal interno para simulacao governada, permitindo configurar perfil fiscal do tenant, cadastrar tomadores com minimizacao de dados e criar documentos fiscais simulados sem qualquer efeito externo.

## Escopo Entregue
- Perfil fiscal simulado por tenant com `simulationMode=true`.
- Tomador fiscal com documento mascarado e hash escopado por tenant.
- Documento fiscal simulado com `simulationId`, itens, total em centavos e flags `fiscalValue=false` e `externalTransmission=false`.
- Idempotencia por tenant, operacao e chave.
- State machine explicita: `DRAFT`, `VALIDATED`, `SIMULATED_ISSUED`, `VOIDED`.
- APIs em `/api/fiscal/simulation/*`.
- RBAC especifico para perfil, tomadores e documentos simulados.
- Auditoria nas mutacoes principais sem documento fiscal bruto.
- Testes unitarios de dominio/application para RBAC, tenant isolation, idempotencia, auditoria e transicoes.

## Decisoes
- Esta sprint nao cria UI dedicada; a API e o dominio vem primeiro para evitar regra fiscal em React.
- O modulo usa linguagem de simulacao e evita status de emissao real.
- CNPJ alfanumerico e aceito como formato de simulacao quando tiver 14 caracteres alfanumericos.

## Fora De Escopo
- Emissao real de NFS-e.
- DANFSe oficial.
- Prefeitura, SEFIN, Ambiente Nacional ou provider externo.
- Certificado digital.
- QR Code oficial.
- Email ao tomador como nota emitida.
- Calculo tributario definitivo.

## Gates
- [x] `npm run security:secrets`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npx prisma validate`
- [x] `npm run build`
