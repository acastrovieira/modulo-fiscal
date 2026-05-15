# Inventario LGPD Inicial

## Objetivo
Manter uma visao simples e revisavel dos dados pessoais tratados pelo VetFiscal OS, com finalidade, minimizacao, mascaramento e retencao inicial. Este inventario nao substitui revisao juridica, mas orienta implementacao segura por sprint.

## Categorias
| Categoria | Exemplos | Finalidade | Exposicao padrao | Retencao inicial |
| --- | --- | --- | --- | --- |
| Identificacao de usuario | nome, email | autenticacao, auditoria e colaboracao no tenant | email mascaravel em listas futuras | enquanto houver conta ativa e trilha operacional necessaria |
| Identificacao do tenant | nome, razao social, CNPJ | contexto SaaS, configuracao fiscal e segregacao de dados | CNPJ mascarado em auditoria e telas nao fiscais | enquanto o tenant estiver ativo e pelo prazo fiscal aplicavel |
| Membership e permissoes | role, status, convites | RBAC, governanca e rastreabilidade | DTO allowlist, sem token bruto | enquanto houver vinculo ou auditoria exigida |
| Documentos operacionais | metadados de arquivo, checksum, storagePath interno | importacao, evidencias e reconciliacao fiscal | storagePath nao deve sair em DTO publico | conforme politica fiscal/documental futura |
| Auditoria | ator, tenant, evento, entidade, payload minimizado | rastreabilidade, investigacao e compliance | payload sanitizado por padrao | enquanto necessario para rastreabilidade fiscal e operacional |
| Segredos e integracoes | tokens, service accounts, chaves privadas | operacao futura de integracoes | nunca expor em repo, DTO, log ou browser | somente em secret manager, com rotacao definida |

## Regras De Implementacao
- APIs nunca aceitam `tenantId` do cliente como fonte de verdade.
- Dados pessoais completos devem ficar fora de logs, erros publicos e DTOs de lista.
- Eventos de auditoria devem preferir identificadores e metadados mascarados.
- Tokens de convite, service role, certificados e chaves privadas nunca entram no repositorio.
- Exportacoes futuras de dados pessoais devem registrar evento de auditoria com escopo e ator.

## Pendencias Para Sprints Futuras
- Definir prazo formal de retencao por categoria com apoio juridico/contabil.
- Criar fluxo de exportacao e correcao de dados do titular.
- Definir politica de anonimizacao para tenants inativos sem quebrar obrigacoes fiscais.
- Avaliar criptografia campo-a-campo para dados fiscais sensiveis quando houver provider real.
