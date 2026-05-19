# Sprint 39 - Controlled Beta Pilot Readiness

## Objetivo
Formalizar a proxima etapa depois do release candidate: preparar o piloto beta controlado com donos, tenants aprovados, smoke de dois tenants e decisao go/no-go.

## Status
Planejada. Esta sprint depende do merge da Sprint 38 e de decisoes externas de produto, suporte e ambiente.

## Checklist Planejado
- [ ] Mergear o PR da Sprint 38.
- [ ] Confirmar Quality Gates verdes em `main`.
- [ ] Confirmar deploy staging/beta com o commit final.
- [ ] Nomear product owner, engineering owner e support owner.
- [ ] Aprovar 1-3 tenants beta fora do repositorio.
- [ ] Aprovar usuarios beta com least privilege.
- [ ] Rodar smoke manual com dois tenants.
- [ ] Registrar evidencias seguras.
- [ ] Atualizar riscos aceitos e bloqueadores.
- [ ] Registrar go/no-go final.

## Fora de Escopo
- Emissao real de NFS-e.
- Scraping.
- Provider municipal.
- Certificado digital.
- Fila fiscal real.
- Dados reais sem aprovacao formal.

## Squad Recomendado
- Codex: coordenacao tecnica, gates e PR.
- @pm/@po: decisao de piloto e escopo.
- @qa: smoke e regressao manual.
- @devops: deploy e rollback.
- Seguranca/LGPD: revisao de dados e acessos.

