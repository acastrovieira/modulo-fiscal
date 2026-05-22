# Sprint 45 - Execucao do Piloto Controlado

## Status
Operacionalmente preparada.

Decisao atual: a execucao do piloto esta bloqueada ate os gates externos da Sprint 44 mudarem para GO ou GO com restricoes.

## Objetivo
Preparar a execucao acompanhada do piloto para 1-3 tenants aprovados, com abertura segura de acesso, checks diarios, entrada de feedback, triagem de incidentes, procedimento de rollback e relatorio de encerramento.

## Checklist
- [x] Criar runbook de execucao do piloto controlado.
- [x] Criar checklist de abertura do piloto.
- [x] Criar template de check diario do piloto.
- [x] Criar template de feedback e triagem de incidentes.
- [x] Criar template de relatorio de encerramento.
- [x] Exigir confirmacao explicita de que nenhum fluxo tenta emissao fiscal real.
- [x] Atualizar o roadmap do beta controlado.
- [x] Atualizar o evidence log do piloto.
- [ ] Abrir acesso apenas para usuarios aprovados depois de GO.
- [ ] Monitorar login, troca de tenant e uso do cockpit durante a janela real do piloto.
- [ ] Registrar feedback de usuarios em sessoes acompanhadas.
- [ ] Triar bugs por severidade.
- [ ] Encerrar janela do piloto com relatorio final.

## Gate
- [x] Execucao do piloto esta operacionalmente pronta.
- [ ] Piloto conclui sem incidente critico.
- [ ] Feedback coletado e priorizado.
- [ ] Nenhuma emissao oficial de NFS-e, scraping, provider municipal, certificado ou job fiscal e acionado.

## Notas de Revisao do Squad
- PM/PO: responsaveis pela janela do piloto, comunicacoes e encerramento final.
- QA: responsavel por captura de evidencias e triagem de severidade.
- DevOps: responsavel por status de deploy, readiness de rollback e suporte a incidentes.
- Codex: responsavel por implementacao de hotfixes e gates de regressao.
- Seguranca/LGPD: revisa qualquer evidencia antes de compartilhamento fora do grupo privado do piloto.
