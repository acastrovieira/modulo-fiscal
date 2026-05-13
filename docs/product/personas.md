# Personas e Papeis Operacionais

## Objetivo
Este documento define as personas iniciais do VetFiscal OS e sua relacao com os papeis de RBAC. A intencao e evitar telas genericas e orientar o PRD por workflows reais de clinicas veterinarias.

## Dono da Clinica
**Papel sugerido:** OWNER

Responsavel final pela operacao da clinica, conformidade fiscal, delegacao de acessos e acompanhamento de indicadores.

Necessidades principais:
- Ver pendencias fiscais sem entrar em detalhes tecnicos.
- Saber se ha risco operacional ou fiscal relevante.
- Delegar acessos com seguranca.
- Consultar auditoria quando houver divergencia.

Nao deve:
- Executar acoes fiscais tecnicas por acidente.
- Receber telas de configuracao avancada como experiencia padrao.

## Administrador da Clinica
**Papel sugerido:** ADMIN

Pessoa responsavel por usuarios, configuracao operacional e apoio ao time fiscal ou financeiro.

Necessidades principais:
- Gerenciar membros do tenant.
- Acompanhar status de importacoes e documentos.
- Ajustar dados administrativos da clinica.
- Apoiar resolucao de pendencias operacionais.

Nao deve:
- Executar emissao futura sem permissao fiscal especifica.
- Alterar regras fiscais versionadas sem trilha de auditoria.

## Gestor Fiscal
**Papel sugerido:** FISCAL_MANAGER

Responsavel por revisar, aprovar e supervisionar o processo fiscal antes de qualquer emissao futura.

Necessidades principais:
- Ver candidatos fiscais, inconsistencias e lotes.
- Aprovar lotes para etapa supervisionada.
- Justificar decisoes e resolucoes.
- Consultar trilha de auditoria por correlacao.

Nao deve:
- Depender de logica fiscal embutida em interface.
- Aprovar lote sem evidencia, estado consistente e permissoes validadas no backend.

## Operador Fiscal
**Papel sugerido:** FISCAL_OPERATOR

Pessoa que prepara importacoes, revisa candidatos e resolve pendencias sob supervisao.

Necessidades principais:
- Criar importacoes.
- Visualizar candidatos fiscais.
- Marcar inconsistencias para revisao.
- Preparar lotes para aprovacao do gestor.

Nao deve:
- Aprovar lote final sem permissao.
- Executar emissao futura.
- Alterar configuracoes fiscais estruturais.

## Operador Financeiro
**Papel sugerido:** FINANCIAL_OPERATOR

Pessoa que futuramente acompanhara recebimentos, conciliacoes, fluxo de caixa e indicadores financeiros.

Necessidades principais:
- Visualizar impactos financeiros relacionados a documentos e receitas.
- Apoiar conferencia de valores futuros em centavos.
- Consultar pendencias que afetam faturamento.

Nao deve:
- Executar decisoes fiscais sem papel fiscal.
- Acessar dados pessoais alem do necessario.

## Contador Externo
**Papel sugerido:** ACCOUNTANT

Profissional externo que apoia conformidade fiscal, parametrizacao e conferencia de evidencias.

Necessidades principais:
- Consultar candidatos, inconsistencias e auditoria quando autorizado.
- Validar criterios fiscais fora do sistema quando necessario.
- Registrar recomendacoes ou observacoes auditaveis em fluxos futuros.

Nao deve:
- Gerenciar usuarios do tenant por padrao.
- Executar acoes operacionais sem autorizacao explicita.

## Auditor
**Papel sugerido:** AUDITOR

Pessoa que precisa consultar evidencias sem alterar o estado operacional.

Necessidades principais:
- Ver eventos de auditoria.
- Baixar documentos quando permitido.
- Rastrear acoes por tenant, ator, entidade e `correlationId`.

Nao deve:
- Criar importacoes.
- Resolver inconsistencias.
- Aprovar ou executar lotes.

## Matriz Inicial de Intencao de Acesso
- OWNER: gestao completa do tenant, usuarios, auditoria e supervisao executiva.
- ADMIN: gestao operacional e usuarios, sem poder fiscal irrestrito por padrao.
- FISCAL_MANAGER: revisao, simulacao e aprovacao de lotes fiscais.
- FISCAL_OPERATOR: importacao, visualizacao e preparacao fiscal.
- FINANCIAL_OPERATOR: visao financeira futura e apoio operacional.
- ACCOUNTANT: consulta e revisao tecnica autorizada.
- AUDITOR: leitura auditavel e acesso restrito a evidencias.

## Responsabilidade Humana
O VetFiscal OS deve deixar claro quem preparou, quem revisou, quem aprovou e qual evidencia sustentou cada transicao critica. A automacao apoia o trabalho, mas nao substitui a responsabilidade fiscal humana no MVP.