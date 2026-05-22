# Plano de Readiness do Piloto Beta Controlado - Sprint 39

## Status
Handoff operacional preparado. O uso beta real permanece NO-GO ate as aprovacoes externas pendentes e o smoke em staging/beta serem concluidos.

A Sprint 39 existe para sair de um release candidate tecnico para uma decisao de piloto controlado. Ela nao deve adicionar emissao oficial de NFS-e, scraping, integracao com provider municipal, uso de certificado ou jobs fiscais em background.

## Objetivo
Preparar o primeiro piloto beta controlado com 1-3 tenants, confirmando ownership, readiness do ambiente, limites de acesso, evidencias de smoke e procedimentos de suporte.

## Checklist
- [x] Mergear o PR do release candidate da Sprint 38.
- [x] Confirmar GitHub `Quality gates` verdes na `main`.
- [ ] Confirmar que o deploy staging/beta usa o merge commit final.
- [ ] Atribuir product owner para go/no-go beta.
- [ ] Atribuir owner de engenharia para resposta a incidentes.
- [ ] Atribuir owner de suporte para comunicacao com tenants.
- [ ] Aprovar 1-3 tenants beta por nome fora do repositorio.
- [ ] Aprovar usuarios e roles beta usando least privilege.
- [ ] Rodar roteiro de smoke manual com dois tenants do pacote de evidencias da Sprint 38.
- [ ] Capturar screenshots sem dados pessoais.
- [ ] Capturar logs seguros e links de CI.
- [ ] Revisar riscos residuais e marcar cada um como aceito ou bloqueador.
- [ ] Confirmar procedimentos de rollback e migrations de banco.
- [x] Registrar decisao go/no-go atual como NO-GO ate aprovacoes externas e smoke passarem.

## Papeis do Piloto
| Responsabilidade | Exigido Antes do Piloto | Notas |
| --- | --- | --- |
| Product owner | Sim | Responsavel por go/no-go e mudancas de escopo beta. |
| Owner de engenharia | Sim | Responsavel por triagem de incidente, rollback e decisoes de hotfix. |
| Owner de suporte | Sim | Responsavel por comunicacao com tenants beta e escalacao. |
| Owner de QA | Recomendado | Responsavel por evidencias de smoke e checklist de regressao. |

## Criterios de Entrada
- PR da Sprint 38 mergeado na `main` protegida.
- Quality Gates verdes na `main`.
- Nenhum issue P0/P1 aberto.
- Nenhum incidente conhecido de isolamento por tenant, auditoria, redacao ou exposicao de secret.
- Ambiente staging/beta configurado sem commit de secrets.
- Usuarios e tenants beta aprovados fora do repositorio.

## Criterios de Saida
- Smoke manual passa com pelo menos dois tenants.
- Pacote de evidencias contem commit hash, URL de CI, notas de smoke, screenshots seguros e decisao de risco.
- Go/no-go registrado.
- Se GO, janela do piloto e owner de rollback documentados.
- Se NO-GO, bloqueadores convertidos em tarefas de sprint.

## Evidencias de Execucao
- PR da Sprint 38: `https://github.com/acastrovieira/modulo-fiscal/pull/24`
- Merge commit da Sprint 38: `5c14c9eef1cec88c70d07520afd1ff7928193728`
- Quality Gates da Sprint 38: `https://github.com/acastrovieira/modulo-fiscal/actions/runs/26103778717/job/76761820308`
- Evidence log do piloto: `docs/product/beta-pilot-evidence-log.md`
- Runbook de smoke do piloto: `docs/operations/runbooks/beta-pilot-smoke.md`

## Bloqueadores Atuais
- Owners de produto, engenharia e suporte nao estao nomeados no repositorio.
- Tenants e usuarios beta reais nao estao aprovados no repositorio.
- URL de deploy staging/beta nao esta capturada no repositorio.
- Smoke manual com dois tenants nao foi executado em staging/beta.

## Squad Recomendado
- Codex: coordenacao de release, captura de evidencias, PR e gates de regressao.
- @pm/@po: tenants beta, go/no-go e controle de escopo.
- @qa: smoke manual, fluxos negativos e revisao de evidencias.
- @devops: ambiente Vercel/Supabase, deploy e rollback.
- Seguranca/LGPD: redacao, isolamento por tenant e revisao de tratamento de dados.
