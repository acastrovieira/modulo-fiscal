# 0010 - Use NFS-e Provider Adapter

## Status
Accepted

## Context
NFS-e varia por município e provedor. Acoplar regras de emissão diretamente ao core fiscal tornaria o sistema frágil e difícil de testar.

## Decision
Quando emissão real for implementada, usaremos adaptadores de provedor NFS-e isolados em integrations/infrastructure, chamados por services de aplicação.

## Consequences
Adaptadores isolam diferenças externas, facilitam homologação e testes por provedor. O trade-off é manter contratos internos estáveis e evitar que detalhes de cada prefeitura vazem para a UI ou domínio central.
