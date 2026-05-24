# Sprint 51 - Projeto Vercel Canonico

## Status
Configuracao operacional aplicada manualmente e documentada.

## Objetivo
Eliminar ambiguidade de deploy Vercel antes do beta controlado, definindo `modulo-fiscal` como unico projeto canonico conectado ao GitHub e mantendo `vetfiscal` desconectado.

## Entregas
- [x] Confirmar `modulo-fiscal` como projeto Vercel oficial.
- [x] Confirmar repositorio GitHub `acastrovieira/modulo-fiscal` conectado ao projeto `modulo-fiscal`.
- [x] Confirmar root directory `vetfiscal` no projeto `modulo-fiscal`.
- [x] Confirmar projeto duplicado `vetfiscal` sem repositorio Git conectado.
- [x] Documentar configuracao canonica em `docs/operations/vercel-canonical-project.md`.
- [x] Atualizar runbook de release Vercel com checklist de projeto canonico.
- [ ] Abrir novo PR e confirmar que apenas `Vercel - modulo-fiscal` aparece nos checks.

## Gate
- [ ] Proximo PR nao gera deploy em `vetfiscal`.
- [ ] Proximo PR gera deploy somente em `modulo-fiscal`.
- [ ] Healthcheck do preview canonico nao reporta `Local`.
- [ ] Quality Gates do PR aprovados.

## Fora de Escopo
- Nenhum secret versionado.
- Nenhuma remocao destrutiva de projeto Vercel.
- Nenhuma mudanca de schema Prisma.
- Nenhuma emissao oficial de NFS-e, scraping, provider municipal, certificado ou fila fiscal real.
