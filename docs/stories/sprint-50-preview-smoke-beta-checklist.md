# Sprint 50 - Smoke Guiado no Preview Vercel

## Status
Preparada com NO-GO operacional ate validacao completa do preview.

## Objetivo
Criar e iniciar um processo seguro de smoke para Preview/Staging Vercel antes de qualquer promocao beta, com foco em healthcheck, login, rotas protegidas, evidencias seguras, rollback e ausencia de emissao fiscal real.

## Squad
- @qa: checklist de smoke, criterios GO/NO-GO e evidencia segura.
- @devops: Vercel Preview, flags, healthcheck, rollback e risco de secrets.
- Codex: implementacao documental, smoke HTTP inicial, gates, git e PR.

## Entregas
- [x] Criar checklist operacional de smoke do Preview Vercel.
- [x] Registrar evidencia inicial do preview mais recente disponivel.
- [x] Registrar bloqueio por Vercel Authentication como NO-GO operacional.
- [x] Identificar ambiguidade de dois projetos Vercel publicando o mesmo PR.
- [x] Registrar `vetfiscal.vercel.app` como NO-GO por health `Local`, banco ausente e dashboard `500`.
- [x] Confirmar que `.vercel/` permanece ignorado pelo Git.
- [x] Repetir smoke HTTP no preview especifico do PR da Sprint 50.
- [ ] Validar `/api/health` e `/login` com acesso aprovado ao preview canonico.
- [ ] Capturar deployment id candidato e rollback target.

## Gate
- [ ] Preview da Sprint 50 acessivel por metodo aprovado.
- [ ] `/api/health` validado sem secrets.
- [ ] `/login` validado.
- [ ] Rota protegida bloqueia acesso anonimo.
- [ ] Projeto Vercel canonico definido sem deploy duplicado.
- [ ] Quality Gates do PR aprovados.

## Fora de Escopo
- Nenhum deploy para producao.
- Nenhuma alteracao de schema Prisma.
- Nenhuma criacao de usuario real.
- Nenhuma emissao oficial de NFS-e, scraping, provider municipal, certificado ou fila fiscal real.
