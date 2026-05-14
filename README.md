# VetFiscal OS

[![VetFiscal CI](https://github.com/acastrovieira/modulo-fiscal/actions/workflows/ci.yml/badge.svg)](https://github.com/acastrovieira/modulo-fiscal/actions/workflows/ci.yml)

VetFiscal OS e uma plataforma operacional fiscal e financeira modular para clinicas veterinarias. O estado atual entrega a fundacao do **MVP Fiscal Supervisionado**: importacoes estruturadas, candidatos fiscais, inconsistencias, lotes simulados, cockpit operacional, RBAC, tenant isolation, auditoria e regressao de hardening.

## Estado Atual

- Modular monolith com Next.js, TypeScript, Tailwind, shadcn/ui/Radix e Prisma.
- Banco alvo: PostgreSQL.
- Auth futura: Supabase Auth.
- Storage futuro: Supabase Storage.
- Test runner: Vitest.
- Cockpit operacional em `/dashboard`.
- API operacional inicial em `/api/operations/summary`.

## Escopo Do MVP Supervisionado

O MVP atual prepara operacao fiscal supervisionada, mas **nao emite NFS-e real**.

Inclui:

- entrada estruturada de documentos/importacoes;
- geracao de candidatos fiscais revisaveis;
- abertura, resolucao e dispensa de inconsistencias;
- lotes internos simulados;
- aprovacao para emissao futura supervisionada;
- cockpit operacional por tenant;
- auditoria e correlation id;
- hardening basico LGPD/RBAC/tenant.

Fora do escopo atual:

- emissao real de NFS-e;
- integracao com prefeitura, SEFAZ, certificado digital ou provider NFS-e;
- scraping;
- fila fiscal real com pg-boss;
- financeiro, CRM, DRE e analytics completos.

## Requisitos Locais

- Node.js compativel com Next.js 15.
- npm.
- PostgreSQL local ou remoto para uso completo com Prisma.

## Setup Local

1. Instale dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Configure `DATABASE_URL` no `.env`.

Exemplo local:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vetfiscal_os?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/vetfiscal_os?schema=public"
NEXT_PUBLIC_APP_ENV="Local"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

4. Gere o Prisma Client quando necessario:

```bash
npx prisma generate
```

5. Valide o schema Prisma:

```bash
npx prisma validate
```

6. Aplique migrations no banco local:

```bash
npx prisma migrate dev
```

7. Popule dados demo seguros:

```bash
npm run db:seed
```

8. Rode o projeto:

```bash
npm run dev
```

Acesse:

```txt
http://localhost:3000/dashboard
```

## Reset Local Manual

Para recriar completamente o banco local/demo, use apenas quando tiver certeza de que `DATABASE_URL` aponta para um banco local descartavel:

```bash
npx prisma migrate reset
```

Esse comando e destrutivo e apaga os dados do banco configurado. Nao existe script `db:reset` neste projeto para reduzir risco operacional.

## Dados Demo

O seed Prisma cria um tenant demo completo e ficticio:

- tenant `Clinica VetFiscal Demo`;
- usuarios `@vetfiscal.local`;
- documento estruturado demo;
- importacao `READY_FOR_REVIEW`;
- candidatos em revisao, pronto para lote, bloqueado, simulado e aprovado para emissao futura;
- inconsistencias bloqueante e revisavel;
- lotes simulado e aprovado para emissao futura;
- eventos de auditoria com `correlationId`.

Os dados demo nao usam CPF/CNPJ real, e-mails externos, certificado digital, provider NFS-e, scraping ou fila fiscal real.

## CI E Politica De PR

O workflow `VetFiscal CI` roda em `push` e `pull_request` para `main`, `master` e branches `codex/**`.

Gates bloqueantes:

```bash
npm ci
npx prisma generate
npx prisma validate
npm run lint
npm run typecheck
npm test
npm run build
```

O CI usa apenas variaveis ficticias/locais para validar Prisma e build. Ele nao executa migrations, seed, reset de banco, provider fiscal externo, scraping ou emissao real de NFS-e.
## Comandos De Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx prisma validate
```

A regressao atual possui testes cobrindo permissao, tenant isolation, auditoria, importacoes, candidatos, inconsistencias, lotes simulados, cockpit, hardening MVP e seguranca dos dados demo.

## Estrutura Principal

```txt
src/app                  # Rotas Next.js e API routes
src/components           # UI compartilhada e layout
src/modules              # Modulos DDD leve por dominio
src/shared               # Auth, database, security, logging, erros, validacao
prisma                   # Schema Prisma e seed demo
docs                     # ADRs, arquitetura, produto, stories e planos
tests                    # Unit, integration, seed smoke e hardening tests
```

## Fronteiras De Engenharia

- React nao acessa Prisma.
- React nao implementa regra fiscal.
- APIs e services validam RBAC no backend.
- `tenantId` confiavel vem do contexto autenticado, nao do client.
- DTOs publicos usam allowlist.
- Dados sensiveis devem ser mascaraveis.
- Acoes criticas devem registrar auditoria.
- Lotes simulados nao chamam provider externo.

## Documentos Importantes

- `docs/product/prd-mvp-fiscal-supervisionado.md`
- `docs/product/execution-plan-mvp-fiscal.md`
- `docs/product/execution-plan-post-mvp.md`
- `docs/product/release-readiness-checklist.md`
- `docs/architecture/supervised-fiscal-workflow.md`
- `docs/architecture/repository-organization.md`
- `docs/adr/`

## Branch E Release Readiness

Branch atual de trabalho:

```txt
codex/vetfiscal-foundation
```

Remote esperado:

```txt
https://github.com/acastrovieira/modulo-fiscal.git
```

Antes de abrir PR, rode todos os gates de qualidade e confirme que nao ha arquivos temporarios, secrets ou build artifacts staged.
