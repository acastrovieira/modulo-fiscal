# Roadmap de Execucao do Beta Controlado - Sprints 40-47

## Status
A Sprint 39 esta mergeada na `main`. O projeto esta pronto para preparar um ambiente controlado de staging/beta, mas o uso beta real continua bloqueado ate existirem owners, tenants, usuarios, deploy e evidencias de smoke com dois tenants.

## Dashboard
| Sprint | Nome | Status | Gate principal |
| --- | --- | --- | --- |
| 40 | Ativacao do ambiente staging/beta | Proxima | URL do ambiente, login e healthcheck funcionando sem secrets no repositorio |
| 41 | Usuarios, roles e tenants beta | Tecnicamente preparada | Usuarios aprovados autenticam com roles de menor privilegio |
| 42 | Smoke com dois tenants | Tecnicamente preparada | Jornada completa passa com bloqueio cross-tenant |
| 43 | Hardening de UX e feedback de teste | Tecnicamente preparada | Sem P0/P1 e UX beta utilizavel |
| 44 | Pacote Go/No-Go do piloto | Tecnicamente preparada | Decisao formal registrada com evidencias |
| 45 | Execucao do piloto controlado | Operacionalmente preparada | 1-3 tenants concluem piloto sem incidente critico |
| 46 | Achados do piloto e estabilizacao | Tecnicamente preparada | Achados triados, corrigidos ou convertidos em backlog |
| 47 | PRD fiscal real / homologacao | Planejamento preparado | Nenhuma implementacao fiscal real sem PRD, ADR e aprovacao |

## Sprint 40 - Ativacao do Ambiente Staging/Beta
Objetivo: ativar ambiente real de teste sem versionar secrets.

Checklist:
- [ ] Escolher ambiente alvo: Vercel Preview, Staging ou Beta.
- [ ] Vincular o projeto Vercel correto ao `modulo-fiscal`.
- [ ] Configurar variaveis de ambiente no provedor para banco, Supabase e app.
- [ ] Manter flags de funcionalidade fiscal real desativadas.
- [ ] Validar envs com `npm run ops:check-beta-env -- .env.local`.
- [ ] Configurar URLs, callback, site URL, templates e dominio autorizado no Supabase Auth.
- [ ] Aplicar migrations no banco staging/beta.
- [ ] Rodar seed demo seguro apenas se o ambiente for demo.
- [ ] Confirmar `/api/health`, `/login` e `/dashboard` autenticado.

Gate:
- [ ] Ambiente acessivel.
- [ ] Login funcionando.
- [ ] Nenhum secret versionado.
- [ ] Nenhuma funcionalidade fiscal real habilitada.

Squad recomendado: Codex, @devops e Seguranca/LGPD.

Runbook:
- `docs/operations/staging-beta-activation.md`

## Sprint 41 - Usuarios, Roles e Tenants Beta
Objetivo: preparar acesso controlado com menor privilegio.

Checklist:
- [x] Criar template de setup por alias de tenant e usuario.
- [x] Definir matriz beta de roles por menor privilegio.
- [ ] Nomear PO, responsavel de engenharia, suporte e QA opcional.
- [ ] Aprovar 1-3 tenants beta fora do repositorio.
- [ ] Aprovar usuarios beta fora do repositorio.
- [ ] Atribuir roles por menor privilegio.
- [ ] Criar ou validar memberships.
- [ ] Validar troca de tenant.
- [ ] Confirmar que usuario sem membership nao acessa o dashboard.
- [ ] Confirmar que usuario suspenso nao acessa o tenant.
- [ ] Registrar evidencia em `docs/product/beta-pilot-evidence-log.md`.

Gate:
- [ ] Usuarios autenticam.
- [ ] Roles estao coerentes.
- [ ] Nenhum usuario visualiza tenant incorreto.

Squad recomendado: Codex, @qa e Seguranca/LGPD.

Runbook:
- `docs/product/beta-users-roles-tenant-setup.md`

## Sprint 42 - Smoke com Dois Tenants
Objetivo: provar a jornada beta completa com dois tenants.

Checklist:
- [x] Criar template de evidencia de smoke com dois tenants.
- [x] Definir jornada do Tenant A e Tenant B.
- [x] Definir checks de abuso cross-tenant.
- [x] Definir regras seguras de screenshot/evidencia.
- [ ] Rodar jornada Tenant A: login, dashboard, imports, candidatos, inconsistencias, lotes, auditoria e documentos.
- [ ] Rodar jornada Tenant B com a mesma lista de rotas.
- [ ] Tentar URLs diretas de recursos do Tenant A com Tenant B ativo.
- [ ] Confirmar que o bloqueio nao enumera recursos.
- [ ] Confirmar dados sensiveis mascarados.
- [ ] Confirmar que UI/API nao sugerem emissao oficial de NFS-e.
- [ ] Capturar screenshots sem dados pessoais.
- [ ] Registrar URL de CI, URL de deploy, commit hash e evidencia do smoke.

Gate:
- [ ] Caminho feliz funciona.
- [ ] Acesso cross-tenant bloqueado.
- [ ] Auditoria, logs e DTOs nao vazam dados sensiveis.

Squad recomendado: @qa, Codex e Seguranca/LGPD.

Runbook:
- `docs/product/two-tenant-smoke-evidence.md`

## Sprint 43 - Hardening de UX e Feedback de Teste
Objetivo: corrigir atritos de smoke antes de convidar usuarios do piloto.

Checklist:
- [x] Revisar erros de login e sessao.
- [x] Melhorar estados vazios, loading e erro.
- [x] Revisar mensagens de permissao negada.
- [x] Ajustar textos que poderiam sugerir emissao oficial.
- [ ] Revisar responsividade do cockpit.
- [ ] Corrigir bugs encontrados no smoke.
- [ ] Rodar gates completos de regressao.
- [ ] Atualizar evidence log do piloto.

Gate:
- [ ] Nenhum P0/P1 aberto.
- [ ] UX minima beta pronta para usuarios acompanhados.

Squad recomendado: Gemini, Codex e @qa.

Story:
- `docs/stories/sprint-43-ux-test-feedback-hardening.md`

## Sprint 44 - Pacote Go/No-Go do Piloto
Objetivo: registrar a decisao oficial do piloto.

Checklist:
- [x] Criar pacote formal de decisao go/no-go.
- [x] Consolidar campos exigidos de commit hash, URL de CI, URL de deploy, resultado de smoke e screenshots seguras.
- [x] Revisar riscos aceitos e bloqueadores.
- [x] Definir owners obrigatorios e responsavel por rollback.
- [x] Definir requisitos da janela de piloto.
- [x] Registrar decisao atual como NO-GO.
- [x] Converter evidencias externas ausentes em bloqueadores explicitos.

Gate:
- [x] Decisao registrada.
- [ ] Nenhum P0/P1 conhecido permanece aberto no tracker externo.
- [ ] Owners, URL de deploy e evidencia de smoke com dois tenants completos.

Squad recomendado: @pm, @po, @qa, @devops e Codex.

Pacote:
- `docs/product/pilot-go-no-go-pack.md`
- `docs/stories/sprint-44-pilot-go-no-go-pack.md`

## Sprint 45 - Execucao do Piloto Controlado
Objetivo: rodar piloto acompanhado com 1-3 tenants.

Checklist:
- [x] Criar runbook do piloto controlado.
- [x] Criar checklist de abertura.
- [x] Criar template de check diario.
- [x] Criar template de feedback e severidade de incidente.
- [x] Criar template de relatorio de encerramento.
- [x] Confirmar em docs que nenhum fluxo tenta emissao fiscal real.
- [ ] Abrir acesso apenas a usuarios aprovados depois da Sprint 44 virar GO ou GO com restricoes.
- [ ] Monitorar login, troca de tenant e uso do cockpit.
- [ ] Registrar feedback dos usuarios.
- [ ] Triage de bugs por severidade.
- [ ] Observar auditoria e eventos criticos.
- [ ] Rodar checks diarios curtos.
- [ ] Encerrar janela do piloto com relatorio.

Gate:
- [x] Execucao do piloto preparada operacionalmente.
- [ ] Piloto concluido sem incidente critico.
- [ ] Feedback coletado e priorizado.

Squad recomendado: @pm/@po, @qa, Codex e @devops.

Runbook:
- `docs/operations/runbooks/controlled-pilot-run.md`
- `docs/stories/sprint-45-controlled-pilot-run.md`

## Sprint 46 - Achados do Piloto e Estabilizacao
Objetivo: estabilizar o produto apos feedback do piloto.

Checklist:
- [x] Criar plano de achados e estabilizacao do piloto.
- [x] Definir categorias de severidade P0, P1, P2 e P3.
- [x] Definir campos de entrada, colunas do quadro e expectativas de regressao.
- [x] Definir criterios de release candidate pos-piloto.
- [x] Manter caminhos fiscais reais bloqueados durante a estabilizacao.
- [ ] Classificar achados reais apos execucao do piloto.
- [ ] Corrigir bugs criticos apos execucao do piloto.
- [ ] Melhorar fluxos confusos apos execucao do piloto.
- [ ] Adicionar ou melhorar testes onde houve falha no piloto.
- [ ] Atualizar runbooks com aprendizados reais do piloto.
- [ ] Atualizar PRD/backlog com aprendizados.
- [ ] Rodar gates completos apos correcoes.
- [ ] Criar release candidate pos-piloto.

Gate:
- [x] Processo de estabilizacao documentado.
- [ ] Nenhum P0/P1 permanece aberto apos piloto.
- [ ] Produto pronto para proximo ciclo beta ou expansao.

Squad recomendado: Codex, @qa e Gemini para alteracoes de UX.

Plano:
- `docs/product/pilot-findings-stabilization-plan.md`
- `docs/stories/sprint-46-pilot-findings-stabilization.md`

## Sprint 47 - PRD Fiscal Real / Homologacao
Objetivo: planejar homologacao fiscal real apenas depois do beta supervisionado estar estavel.

Checklist:
- [x] Criar PRD para planejamento de homologacao real de NFS-e.
- [x] Criar ADR para emissao real com homologacao primeiro.
- [x] Definir escopo de homologacao.
- [x] Definir requisitos de politica de certificado.
- [x] Definir abordagem de sandbox/homologacao municipal.
- [x] Definir requisitos de idempotencia de emissao real.
- [x] Definir requisitos de rollback e contingencia fiscal.
- [x] Definir responsabilidades juridicas/contabeis.
- [x] Definir testes com contador ou especialista fiscal.
- [x] Planejar implementacao apenas apos aprovacao futura explicita.

Gate:
- [x] Nenhuma implementacao fiscal real comeca sem PRD, ADR, homologacao e aprovacao.
- [x] Nenhum provider, scraping, certificado, transmissao municipal ou fila fiscal foi implementado.

Squad recomendado: @pm, @po, @architect, Seguranca/LGPD, especialista fiscal e Codex.

Artefatos de planejamento:
- `docs/product/prd-real-nfse-homologation.md`
- `docs/adr/0011-use-homologation-first-real-issuance.md`
- `docs/stories/sprint-47-prd-fiscal-real-homologation.md`

## Gates Globais
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run security:secrets`
- [ ] `npx prisma validate`
- [ ] `npm run build`
- [ ] Smoke com dois tenants antes de uso beta real.
- [ ] Rollback documentado antes de uso beta real.

## Guardrails de Escopo Nao Negociaveis
- Sem emissao oficial de NFS-e antes de aprovacao futura pos-Sprint 47.
- Sem scraping.
- Sem integracao com provider municipal.
- Sem uso de certificado digital.
- Sem fila fiscal ou job fiscal externo.
- Sem dados pessoais reais em screenshots, logs ou docs do repositorio.

