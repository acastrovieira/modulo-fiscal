# Sprint 43 - UX/Test Feedback Hardening

## Objetivo
Reduzir atritos antes do piloto beta acompanhado, reforcando mensagens de erro, estados vazios e linguagem segura sem abrir emissao real, scraping ou provider externo.

## Checklist Executado
- [x] Melhorar feedback de login com estado de envio e codigo de suporte.
- [x] Melhorar erros client-side com `code` e `requestId` quando o backend retorna envelope seguro.
- [x] Reforcar estados vazios com orientacao de tenant, permissao e dados demo.
- [x] Trocar copy sensivel para linguagem de "sem emissao fiscal real".
- [x] Reforcar aviso de dados ficticios/aprovados no onboarding.
- [x] Redigir IDs internos na listagem de auditoria.
- [x] Criar fallbacks `loading` e `error` para rotas do dashboard.
- [x] Trocar CTA de convite para regeneracao quando nao ha envio real de e-mail.
- [x] Atualizar testes de release para proteger copy beta.

## Pendencias Operacionais
- [ ] Rodar smoke visual em staging/beta real.
- [ ] Registrar screenshots seguras no evidence log.
- [ ] Coletar feedback de usuarios beta aprovados.

## Gate
- Zero P0/P1 conhecido.
- UX minima pronta para usuarios acompanhados.
- Nenhuma tela sugere emissao fiscal real.
