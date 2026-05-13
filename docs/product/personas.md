# Personas e Papéis Operacionais

## Objetivo
Este documento define as personas iniciais do VetFiscal OS e sua relação com os papéis de RBAC. A intenção é evitar telas genéricas e orientar o PRD por workflows reais de clínicas veterinárias.

## Dono da Clínica
**Papel sugerido:** OWNER

Responsável final pela operação da clínica, conformidade fiscal, delegação de acessos e acompanhamento de indicadores.

Necessidades principais:
- Ver pendências fiscais sem entrar em detalhes técnicos.
- Saber se há risco operacional ou fiscal relevante.
- Delegar acessos com segurança.
- Consultar auditoria quando houver divergência.

Não deve:
- Executar ações fiscais técnicas por acidente.
- Receber telas de configuração avançada como experiência padrão.

## Administrador da Clínica
**Papel sugerido:** ADMIN

Pessoa responsável por usuários, configuração operacional e apoio ao time fiscal ou financeiro.

Necessidades principais:
- Gerenciar membros do tenant.
- Acompanhar status de importações e documentos.
- Ajustar dados administrativos da clínica.
- Apoiar resolução de pendências operacionais.

Não deve:
- Executar emissão futura sem permissão fiscal específica.
- Alterar regras fiscais versionadas sem trilha de auditoria.

## Gestor Fiscal
**Papel sugerido:** FISCAL_MANAGER

Responsável por revisar, aprovar e supervisionar o processo fiscal antes de qualquer emissão futura.

Necessidades principais:
- Ver candidatos fiscais, inconsistências e lotes.
- Aprovar lotes para etapa supervisionada.
- Justificar decisões e resoluções.
- Consultar trilha de auditoria por correlação.

Não deve:
- Depender de lógica fiscal embutida em interface.
- Aprovar lote sem evidência, estado consistente e permissões validadas no backend.

## Operador Fiscal
**Papel sugerido:** FISCAL_OPERATOR

Pessoa que prepara importações, revisa candidatos e resolve pendências sob supervisão.

Necessidades principais:
- Criar importações.
- Visualizar candidatos fiscais.
- Marcar inconsistências para revisão.
- Preparar lotes para aprovação do gestor.

Não deve:
- Aprovar lote final sem permissão.
- Executar emissão futura.
- Alterar configurações fiscais estruturais.

## Operador Financeiro
**Papel sugerido:** FINANCIAL_OPERATOR

Pessoa que futuramente acompanhará recebimentos, conciliações, fluxo de caixa e indicadores financeiros.

Necessidades principais:
- Visualizar impactos financeiros relacionados a documentos e receitas.
- Apoiar conferência de valores futuros em centavos.
- Consultar pendências que afetam faturamento.

Não deve:
- Executar decisões fiscais sem papel fiscal.
- Acessar dados pessoais além do necessário.

## Contador Externo
**Papel sugerido:** ACCOUNTANT

Profissional externo que apoia conformidade fiscal, parametrização e conferência de evidências.

Necessidades principais:
- Consultar candidatos, inconsistências e auditoria quando autorizado.
- Validar critérios fiscais fora do sistema quando necessário.
- Registrar recomendações ou observações auditáveis em fluxos futuros.

Não deve:
- Gerenciar usuários do tenant por padrão.
- Executar ações operacionais sem autorização explícita.

## Auditor
**Papel sugerido:** AUDITOR

Pessoa que precisa consultar evidências sem alterar o estado operacional.

Necessidades principais:
- Ver eventos de auditoria.
- Baixar documentos quando permitido.
- Rastrear ações por tenant, ator, entidade e `correlationId`.

Não deve:
- Criar importações.
- Resolver inconsistências.
- Aprovar ou executar lotes.

## Matriz Inicial de Intenção de Acesso
- OWNER: gestão completa do tenant, usuários, auditoria e supervisão executiva.
- ADMIN: gestão operacional e usuários, sem poder fiscal irrestrito por padrão.
- FISCAL_MANAGER: revisão, simulação e aprovação de lotes fiscais.
- FISCAL_OPERATOR: importação, visualização e preparação fiscal.
- FINANCIAL_OPERATOR: visão financeira futura e apoio operacional.
- ACCOUNTANT: consulta e revisão técnica autorizada.
- AUDITOR: leitura auditável e acesso restrito a evidências.

## Responsabilidade Humana
O VetFiscal OS deve deixar claro quem preparou, quem revisou, quem aprovou e qual evidência sustentou cada transição crítica. A automação apoia o trabalho, mas não substitui a responsabilidade fiscal humana no MVP.