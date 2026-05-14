# VetFiscal OS

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
NEXT_PUBLIC_APP_ENV="Local"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""`nDIRECT_URL="postgresql://postgres:postgres@localhost:5432/vetfiscal_os?schema=public"`nNEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Gere o Prisma Client quando necessario:`n`n```bash`nnpx prisma generate`n``` `n`n5. Valide o schema Prisma:

```bash
npx prisma validate
```

6. Se for usar banco local com migrations, aplique as migrations quando existirem:`n`n```bash`nnpx prisma migrate dev`n``` `n`n7. Rode o projeto:

```bash
npm run dev
```

Acesse:

```txt
http://localhost:3000/dashboard
```

## Comandos De Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx prisma validate
```

A regressao atual possui 100 testes cobrindo permissao, tenant isolation, auditoria, importacoes, candidatos, inconsistencias, lotes simulados, cockpit e hardening MVP.

## Estrutura Principal

```txt
src/app                  # Rotas Next.js e API routes
src/components           # UI compartilhada e layout
src/modules              # Modulos DDD leve por dominio
src/shared               # Auth, database, security, logging, erros, validacao
prisma                   # Schema Prisma
docs                     # ADRs, arquitetura, produto, stories e planos
tests                    # Unit, integration e hardening tests
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
