# Evidencia de Smoke do Preview - Sprint 50

## Status
NO-GO operacional para promocao beta ate o preview do PR da Sprint 50 ser validado com acesso aprovado.

## Contexto
A Sprint 50 iniciou o smoke guiado usando o preview Vercel mais recente disponivel da Sprint 49:

- PR base observado: `#34`
- Preview observado: `https://modulo-fiscal-git-codex-sprint-4-bd6e4b-acastrovieiras-projects.vercel.app`
- Merge commit da Sprint 49: `cd2097bec05e86a29d7f15f232c683b9480d33b0`
- Data/hora local da tentativa: 2026-05-22

O preview especifico da Sprint 50 deve ser testado novamente depois que o PR desta sprint for aberto e a Vercel publicar o novo deployment.

## Resultado do Smoke HTTP
| Check | Resultado | Decisao |
| --- | --- | --- |
| `GET /api/health` via HTTP publico | Bloqueado por Vercel Authentication | Pendente |
| `GET /login` via HTTP publico | Bloqueado por Vercel Authentication | Pendente |
| `GET /dashboard` sem sessao | HTTP `401 Unauthorized`/bloqueio sem dados internos | Parcialmente aceitavel |
| Vercel CLI | Instalada, versao `53.3.2` | Disponivel |
| `vercel curl` | Requer contexto/bypass aprovado do projeto correto para validar health/login | Pendente |

## Achado Principal
O preview esta protegido por autenticacao da Vercel. Isso e positivo para seguranca, mas bloqueia o smoke externo de `/api/health` e `/login` enquanto nao houver um metodo aprovado de acesso:

- `vercel curl` autenticado no projeto Vercel correto;
- bypass token gerenciado pelo owner, sem registro em docs/logs;
- ajuste temporario e aprovado da protecao de preview para janela de smoke.

Nenhum secret foi registrado nesta evidencia.

## Decisao Atual
NO-GO para promocao para beta real.

Motivos:
- `/api/health` nao foi validado no app por causa da protecao Vercel.
- `/login` nao foi validado no app por causa da protecao Vercel.
- Ainda nao ha smoke autenticado com usuario beta/demo aprovado.
- Ainda nao ha evidencia de logs do preview sem erros criticos.

## Proximas Acoes
- [ ] Abrir PR da Sprint 50 e aguardar o preview Vercel especifico da branch.
- [ ] Confirmar o projeto Vercel correto para `modulo-fiscal`.
- [ ] Validar acesso ao preview via `vercel curl` ou bypass token autorizado.
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
