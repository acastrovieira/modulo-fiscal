# Evidencia de Smoke do Preview - Sprint 50

## Status
NO-GO operacional para promocao beta.

## Contexto
A Sprint 50 iniciou o smoke guiado usando o preview Vercel mais recente disponivel da Sprint 49:

- PR base observado: `#34`
- Preview observado: `https://modulo-fiscal-git-codex-sprint-4-bd6e4b-acastrovieiras-projects.vercel.app`
- Merge commit da Sprint 49: `cd2097bec05e86a29d7f15f232c683b9480d33b0`
- Data/hora local da tentativa: 2026-05-22

O PR da Sprint 50 gerou dois deployments Vercel. Isso confirma uma ambiguidade operacional que precisa ser resolvida antes de qualquer promocao beta.

## Deployments Observados no PR #35
| Projeto Vercel | URL | Resultado |
| --- | --- | --- |
| `modulo-fiscal` | `https://modulo-fiscal-git-codex-sprint-5-a7904e-acastrovieiras-projects.vercel.app` | Deploy pronto, mas protegido por Vercel Authentication |
| `vetfiscal` | `https://vetfiscal.vercel.app` | Deploy pronto e publico, mas health indica ambiente `Local` e banco ausente |

## Resultado do Smoke HTTP
| Check | Resultado | Decisao |
| --- | --- | --- |
| `GET /api/health` no `modulo-fiscal` | HTTP `401 Unauthorized` por Vercel Authentication | Pendente |
| `GET /login` no `modulo-fiscal` | HTTP `401 Unauthorized` por Vercel Authentication | Pendente |
| `GET /api/health` no `vetfiscal` | HTTP `200`, `status: degraded`, `environment: Local`, `databaseConfiguration: missing` | NO-GO |
| `GET /login` no `vetfiscal` | HTTP `200` | Parcial |
| `GET /dashboard` sem sessao no `vetfiscal` | HTTP `500 InternalServerError` | NO-GO |
| Dois projetos Vercel para o mesmo PR | `modulo-fiscal` e `vetfiscal` publicados | NO-GO |
| Vercel CLI | Instalada, versao `53.3.2` | Disponivel |
| `vercel curl` | Requer contexto/bypass aprovado do projeto correto para validar health/login | Pendente |

## Achado Principal
Existem dois projetos Vercel reagindo ao mesmo PR. O projeto `modulo-fiscal` parece ser o alvo esperado do repositorio, mas esta protegido por Vercel Authentication. O projeto `vetfiscal` esta publico, porem responde como ambiente `Local`, com banco ausente e erro 500 no dashboard.

Isso impede qualquer promocao beta ate a configuracao de deploy ser desambiguada.

O preview protegido por autenticacao da Vercel pode ser aceitavel, mas bloqueia o smoke externo de `/api/health` e `/login` enquanto nao houver um metodo aprovado de acesso:

- `vercel curl` autenticado no projeto Vercel correto;
- bypass token gerenciado pelo owner, sem registro em docs/logs;
- ajuste temporario e aprovado da protecao de preview para janela de smoke.

Nenhum secret foi registrado nesta evidencia.

## Decisao Atual
NO-GO para promocao para beta real.

Motivos:
- O PR publica em dois projetos Vercel.
- O projeto `vetfiscal` publico esta com `NEXT_PUBLIC_APP_ENV`/ambiente reportado como `Local`.
- O projeto `vetfiscal` publico esta sem configuracao de banco no healthcheck.
- O dashboard do projeto `vetfiscal` retorna erro 500 sem sessao.
- `/api/health` do projeto `modulo-fiscal` nao foi validado no app por causa da protecao Vercel.
- `/login` do projeto `modulo-fiscal` nao foi validado no app por causa da protecao Vercel.
- Ainda nao ha smoke autenticado com usuario beta/demo aprovado.
- Ainda nao ha evidencia de logs do preview sem erros criticos.

## Proximas Acoes
- [ ] Escolher um unico projeto Vercel canonico para o VetFiscal OS.
- [ ] Desabilitar ou desconectar o projeto Vercel duplicado antes de qualquer promocao beta.
- [ ] Corrigir env vars do projeto canonico para que o healthcheck nao reporte `Local` em preview/staging.
- [ ] Confirmar o projeto Vercel correto para `modulo-fiscal` e o root directory esperado.
- [ ] Validar acesso ao preview canonico via `vercel curl` ou bypass token autorizado.
- [ ] Rodar `GET /api/health`, `GET /login` e `GET /dashboard` sem sessao.
- [ ] Registrar deployment id candidato e deployment id anterior para rollback.
- [ ] Repetir smoke visual e autenticado quando houver usuario beta/demo aprovado.

## Guardrails Confirmados
- Nenhuma emissao oficial de NFS-e foi executada.
- Nenhum scraping foi executado.
- Nenhuma chamada a provider municipal foi executada.
- Nenhum certificado digital foi usado.
- Nenhum job/fila fiscal real foi executado.
- Nenhum dado pessoal real foi usado na tentativa de smoke.
