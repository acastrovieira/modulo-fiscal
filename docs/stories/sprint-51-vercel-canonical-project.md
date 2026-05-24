# Sprint 51 - Projeto Vercel Canonico

## Status
Configuracao operacional aplicada manualmente e documentada.

## Objetivo
Eliminar ambiguidade de deploy Vercel antes do beta controlado, definindo `modulo-fiscal` como unico projeto canonico conectado ao GitHub e mantendo `vetfiscal` desconectado.

## Entregas
- [x] Confirmar `modulo-fiscal` como projeto Vercel oficial.
- [x] Confirmar repositorio GitHub `acastrovieira/modulo-fiscal` conectado ao projeto `modulo-fiscal`.
- [x] Identificar que root directory `vetfiscal` quebra o build porque a raiz do repositorio ja contem o app Next.js.
- [x] Documentar que o Root Directory correto do projeto `modulo-fiscal` deve ficar vazio.
- [x] Confirmar projeto duplicado `vetfiscal` sem repositorio Git conectado.
- [x] Documentar configuracao canonica em `docs/operations/vercel-canonical-project.md`.
- [x] Atualizar runbook de release Vercel com checklist de projeto canonico.
- [ ] Abrir novo PR e confirmar que apenas `Vercel - modulo-fiscal` aparece nos checks.
- [x] Reexecutar deploy apos Root Directory ficar vazio.
- [x] Confirmar Vercel passando apenas no projeto `modulo-fiscal`.
- [x] Confirmar preview protegido por Vercel Authentication para acesso publico.

## Gate
- [x] Proximo PR nao gera deploy em `vetfiscal`.
- [x] Proximo PR gera deploy somente em `modulo-fiscal`.
- [x] Build Vercel nao falha com "Root Directory vetfiscal does not exist".
- [ ] Healthcheck do preview canonico nao reporta `Local`.
- [ ] Quality Gates do PR aprovados.

Observacao: healthcheck de app permanece pendente porque o preview canonico esta protegido por Vercel Authentication e retorna `401 Unauthorized` sem bypass/autenticacao aprovada.

## Fora de Escopo
- Nenhum secret versionado.
- Nenhuma remocao destrutiva de projeto Vercel.
- Nenhuma mudanca de schema Prisma.
- Nenhuma emissao oficial de NFS-e, scraping, provider municipal, certificado ou fila fiscal real.
