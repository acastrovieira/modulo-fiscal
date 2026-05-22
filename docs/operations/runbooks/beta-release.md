# Runbook - Release Beta

## Objetivo
Liberar o VetFiscal OS para beta controlado sem habilitar emissao oficial de NFS-e, scraping, providers municipais, certificados ou jobs fiscais.

Evidencias do release candidate devem ser coletadas em `docs/product/beta-release-candidate-evidence-pack.md` antes de qualquer tenant beta real ser habilitado.

## Gates Pre-Release
- [ ] Branch limpa.
- [ ] Pull request aponta para `main` protegida.
- [ ] Check GitHub `Quality gates` verde.
- [ ] `npm run lint` aprovado.
- [ ] `npm run typecheck` aprovado.
- [ ] `npm test` aprovado.
- [ ] `npm run build` aprovado.
- [ ] `npx prisma validate` aprovado com env local/demo.
- [ ] Nenhum secret versionado.
- [ ] `.env.example` contem apenas valores ficticios/locais.

## Gates de Produto
- [ ] Tenants beta explicitamente aprovados.
- [ ] Roles revisadas para cada usuario beta.
- [ ] Contatos de suporte e incidente definidos.
- [ ] Riscos residuais aceitos ou bloqueados.
- [ ] Responsavel por rollback definido.

## Smoke Tecnico
- [ ] `/api/health` retorna health publico sem secrets.
- [ ] `/dashboard` renderiza resumo do cockpit.
- [ ] Paginas de workflow renderizam: importacoes, candidatos, inconsistencias, lotes, auditoria e documentos.
- [ ] Erros de API retornam `{ error: { code, message, requestId } }`.
- [ ] APIs de auditoria/documentos nao expoem payload cru nem storage path.

## Fora de Escopo Explicito
- [ ] Sem emissao oficial de NFS-e.
- [ ] Sem scraping.
- [ ] Sem chamada a provider municipal.
- [ ] Sem uso de certificado.
- [ ] Sem execucao de fila/job fiscal.

## Condicoes de No-Go
- Qualquer GitHub Quality Gate falho.
- Qualquer P0/P1 aberto de isolamento por tenant, auditoria, redacao ou exposicao de secrets.
- Qualquer tenant ou usuario real nao aprovado.
- Qualquer caminho habilitado para emissao oficial de NFS-e, scraping, chamadas a provider municipal, certificados ou jobs fiscais.
