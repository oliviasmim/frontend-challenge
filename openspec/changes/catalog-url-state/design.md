## Context

Contexto Catálogo apenas. Estado de filtros é a URL (TanStack Router `validateSearch`); dados via TanStack Query com a query key derivada dos params.

## Decisions

- URL é a fonte da verdade; nenhum estado duplicado em `useState`.
- Query key `['nfts', params]` + `signal` do Axios cancela requisições obsoletas.
- Params inválidos na URL são normalizados para o padrão (página 1, ordenação `recent`).

## Risks

- Respostas fora de ordem: mitigado por key por params e cancelamento.
