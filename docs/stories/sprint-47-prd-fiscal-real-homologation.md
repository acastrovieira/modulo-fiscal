# Sprint 47 - PRD Fiscal Real / Homologacao

## Status
Planejamento preparado.

Decisao atual: nenhuma implementacao de emissao real de NFS-e comeca nesta sprint.

## Objetivo
Criar os artefatos de planejamento exigidos antes de qualquer homologacao fiscal real futura: PRD, ADR, fora de escopo explicito, responsabilidades juridicas/contabeis, politica de certificado, fronteiras de adapter de provider, idempotencia, rollback e testes com especialista fiscal.

## Checklist
- [x] Criar PRD para planejamento de homologacao real de NFS-e.
- [x] Criar ADR para emissao real com homologacao primeiro.
- [x] Definir escopo de homologacao.
- [x] Definir politica de certificado como decisao controlada futura.
- [x] Definir requisitos de sandbox/homologacao municipal.
- [x] Definir requisitos de idempotencia de emissao real.
- [x] Definir requisitos de rollback e contingencia fiscal.
- [x] Definir responsabilidades juridicas/contabeis.
- [x] Definir testes com contador ou especialista fiscal.
- [x] Bloquear explicitamente implementacao ate aprovacao futura.

## Gate
- [x] Nenhuma implementacao fiscal real comeca sem PRD, ADR, homologacao e aprovacao.
- [x] Nenhum provider, scraping, certificado, transmissao municipal ou fila fiscal foi implementado.
- [ ] Implementacao futura tem aprovacao explicita dos responsaveis e ADR especifica de provider.

## Notas de Squad
- Produto/PO e responsavel por escopo e impacto no usuario.
- Arquitetura e responsavel por fronteira de adapter de provider e seguranca da state machine.
- Seguranca/LGPD e responsavel por certificado, secrets, minimizacao de dados e exposicao em auditoria.
- Especialista fiscal/contador e responsavel por interpretacao legal e validacao municipal.
- Codex so implementa apos aprovacao futura explicita.

