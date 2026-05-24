# Checklist de Smoke do Preview Vercel - Sprint 50

## Objetivo
Validar um deploy Preview/Staging do VetFiscal OS antes de qualquer promocao para ambiente beta controlado, sem expor secrets, sem usar dados reais e sem habilitar emissao oficial de NFS-e.

Este checklist complementa:
- `docs/operations/staging-beta-activation.md`
- `docs/operations/runbooks/beta-pilot-smoke.md`
- `docs/product/two-tenant-smoke-evidence.md`

## Pre-condicoes
- [ ] PR da sprint aberto e com deploy Vercel Preview concluido.
- [ ] GitHub Quality Gates verdes.
- [ ] URL do preview registrada.
- [ ] Commit SHA registrado.
- [ ] Preview usa ambiente `preview`, `staging` ou `staging-candidate`, nunca producao fiscal.
- [ ] Integracoes fiscais reais permanecem desabilitadas:
  - `FEATURE_REAL_NFSE_ENABLED=false`
  - `FEATURE_SCRAPING_ENABLED=false`
  - `FEATURE_MUNICIPAL_PROVIDER_ENABLED=false`
- [ ] Nenhum secret real aparece como `NEXT_PUBLIC_*`.
- [ ] Se o preview estiver protegido pela Vercel, validar acesso via `vercel curl` autenticado ou bypass token autorizado pelo owner.

## Smoke HTTP Minimo
| Check | Esperado | Evidencia Segura |
| --- | --- | --- |
| `GET /api/health` | HTTP `200`, payload curto, sem secrets, sem stack trace | Status HTTP, timestamp e trecho redigido da resposta |
| `GET /login` | HTTP `200`, tela renderiza ou HTML esperado | Status HTTP e confirmacao textual, sem cookies |
| `GET /dashboard` sem sessao | Redireciona para `/login` ou bloqueia com `401/403` sem dados internos | Status HTTP e header de location quando existir |
| Rota publica raiz `/` | Carrega sem erro critico ou redireciona conforme regra do app | Status HTTP |
| Erro publico de API | Corpo segue `{ error: { code, message, requestId } }` | Trecho redigido da resposta |

## Smoke Visual Minimo
- [ ] Abrir preview em aba limpa.
- [ ] Confirmar que nao ha erro visual critico.
- [ ] Confirmar que `/login` comunica ambiente beta/supervisionado quando aplicavel.
- [ ] Confirmar que nao existe texto sugerindo emissao oficial de NFS-e.
- [ ] Confirmar que console do navegador nao tem erro bloqueante.

## Smoke Autenticado
Executar apenas com usuario beta/demo aprovado.

- [ ] Login funciona com usuario autorizado.
- [ ] Credencial invalida retorna mensagem generica.
- [ ] Dashboard renderiza com tenant ativo e badge de ambiente.
- [ ] Rotas de importacoes, candidatos, inconsistencias, lotes, auditoria e documentos renderizam.
- [ ] Campos sensiveis aparecem mascarados.
- [ ] Usuario sem membership nao acessa dashboard.
- [ ] Usuario suspenso nao acessa tenant.
- [ ] URL direta de recurso de outro tenant e bloqueada sem enumeracao.

## Logs e Deploy
- [ ] Confirmar que logs do preview nao mostram stack trace recorrente.
- [ ] Confirmar que logs nao mostram token, cookie, connection string, CPF/CNPJ completo, storage path ou payload cru.
- [ ] Registrar deployment id candidato.
- [ ] Registrar ultimo deployment estavel para rollback.
- [ ] Confirmar processo de rollback via Vercel dashboard ou `vercel rollback`.

## Criterios GO
- `/api/health` responde com sucesso e sem vazamento.
- `/login` renderiza.
- Rotas protegidas bloqueiam acesso anonimo.
- Nenhum caminho de emissao oficial de NFS-e existe.
- Nenhum secret ou dado real aparece em browser, resposta HTTP, log ou evidencia.
- Evidencias estao redigidas e com acesso restrito.

## Criterios NO-GO
- Mais de um projeto Vercel publica deploy para o mesmo PR sem decisao operacional explicita.
- Preview protegido sem metodo aprovado para smoke.
- `/api/health` inacessivel ou expondo detalhe sensivel.
- `/api/health` reporta `Local` fora do ambiente local.
- `/login` indisponivel.
- `/dashboard` retorna `500` no preview/staging.
- Rota protegida acessivel sem autenticacao/autorizacao.
- Preview apontando para banco, filas, provider fiscal, e-mail/SMS ou qualquer recurso de producao sem aprovacao explicita.
- Qualquer possibilidade de emissao oficial de NFS-e, scraping, provider municipal, certificado ou job fiscal real.
- Evidencias exigem ou contem secrets/dados pessoais nao mascarados.

## Notas de Execucao
- Nao commitar `.vercel/`.
- Nao colar bypass token em docs, issues, PRs ou logs.
- Se usar `vercel curl`, registrar apenas status, rota e resultado, nunca token ou headers sensiveis.
