# Sprint 49 - Limpeza Tecnica do Root Next.js

## Status
Concluida tecnicamente.

## Objetivo
Eliminar o warning de build do Next.js sobre multiplos lockfiles e inferencia incorreta de workspace root, sem remover arquivos do projeto e sem tocar no workspace pai.

## Ajuste Aplicado
- [x] Configurar `outputFileTracingRoot` em `next.config.ts` para apontar explicitamente para a pasta do app VetFiscal.
- [x] Preservar `package-lock.json` do projeto.
- [x] Nao apagar nem mover arquivos fora do projeto.

## Validacao
- [x] `npm run typecheck` aprovado.
- [x] `npm run build` aprovado sem o warning de workspace root.
- [ ] Quality Gates do PR aprovados no GitHub.

## Fora de Escopo
- Nenhuma mudanca funcional.
- Nenhuma alteracao de schema Prisma.
- Nenhuma remocao de lockfile.
- Nenhuma configuracao de deploy ou secret.
