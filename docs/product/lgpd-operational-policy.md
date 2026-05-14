# Politica Operacional LGPD - VetFiscal OS

## Status
Accepted for MVP foundation.

## Objetivo
Reduzir risco fiscal, operacional e de privacidade ao expor auditoria e documentos no cockpit. Dados pessoais e infraestrutura interna devem ser minimizados por padrao, especialmente em APIs, logs, DTOs, erros publicos e eventos de auditoria.

## Dados Permitidos Por Padrao
- IDs operacionais do tenant ativo.
- Status, datas, contadores e correlationId.
- Nome de arquivo, tipo, MIME, tamanho e checksum truncado.
- Documento de tomador somente mascarado.
- Eventos de auditoria com payloads resumidos ou redigidos.

## Dados Restritos
- `storagePath`, bucket, URL assinada e tokens.
- `rawPayload`, `beforePayload`, `afterPayload` completos e `details` livres.
- CPF/CNPJ completo, e-mail, telefone e endereco de tutor/cliente.
- `fiscalFingerprint` em DTO publico.
- CNPJ do tenant fora de contexto administrativo autorizado.
- Stack trace, SQL, erro Prisma cru ou path interno em resposta publica.

## Regras De Implementacao
- APIs nunca aceitam `tenantId` do cliente como fonte de verdade.
- Toda consulta usa `context.tenantId` e valida escopo antes de serializar DTO.
- DTO publico deve ser allowlist, nunca retorno cru do Prisma.
- Auditoria publica nao retorna payload completo por padrao.
- Documento publico nao retorna `storagePath`.
- Intencao de download registra auditoria com metadata minima e sem storage real.
- Download real, URL assinada e Supabase Storage permanecem fora desta sprint.

## Retencao Inicial
- Eventos de auditoria sao retidos enquanto forem necessarios para rastreabilidade fiscal e operacional.
- Payloads livres devem ser pequenos, redigidos e vinculados a finalidade clara.
- Politica formal de retencao por tipo de dado sera detalhada antes do beta com dados reais.

## Testes De Controle
- DTOs de auditoria e documentos nao podem expor `tenantId`, `storagePath`, `rawPayload`, `beforePayload` ou `afterPayload` crus.
- Redaction deve mascarar CPF/CNPJ, e-mail e telefone quando aparecerem em payload livre.
- Rotas de auditoria exigem `audit.view`.
- Rotas de documento e download-intent exigem `documents.download`.
