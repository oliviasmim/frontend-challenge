# Kurio — Marketplace de NFTs (monorepo)

Implementação parcial do [desafio frontend](CHALLENGE.md), conduzida com **desenvolvimento orientado a specs**. Fatia entregue: **catálogo com estado na URL** (Início do layout) e **carrinho → pagamento → recibo com pedido idempotente**.

> Fora desta fatia (não implementado): login/cadastro, favoritos, perfil, carteiras, Socket.IO, detalhe do NFT, cupom, Lighthouse e deploy. Ver [ARCHITECTURE.md](ARCHITECTURE.md).

## Estrutura

```
apps/web            React + TypeScript, TanStack Router/Query, Axios, Tailwind, Playwright
packages/contracts  tipos REST + aritmética de ETH (bigint)
packages/mocks      MSW: handlers, fixtures, cenários, estado persistido
openspec/           specs e changes (OpenSpec)
docs/               ADR 0001 + spec enxuta (EARS + BDD)
.claude/skills/     skills do projeto + skills do OpenSpec
GLOSSARIO.md  RESEARCH.md  DIFERENCAS.md  REVIEW.md
```

## Setup

Requer Node ≥ 20.19.

```bash
npm install
npx playwright install chromium
npm run dev          # http://localhost:5173 com mocks (MSW)
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | desenvolvimento com mocks |
| `npm run build` / `npm run preview` | build de demonstração (mocks ativos) e preview em :4173 |
| `npm run typecheck` | tsc em todos os workspaces |
| `npm run test:e2e` | Playwright (desktop 1440 + mobile 390); relatório HTML em `apps/web/playwright-report` |
| `npm run validate:specs` | `openspec validate --all` |

## Mocks, cenários e reset

Mocks ativam com `VITE_MOCKS=true` (já definido nos modos `mocks` e `e2e`). Estado fica em `localStorage`. No console do navegador:

```js
__mocks.reset('default')                       // restaura o cenário conhecido
__mocks.setScenario('order-timeout-after-create')
```

Cenários: `default`, `empty` (catálogo vazio), `catalog-error` (503), `slow` (+2,5 s), `order-timeout-after-create` (pedido criado, resposta nunca chega), `payment-declined`. Para reproduzir o timeout: defina o cenário, adicione um NFT, vá a `/checkout`, confirme; o erro aparece após `VITE_ORDER_TIMEOUT_MS` (8 s; 1,5 s em `e2e`) e "Tentar novamente" recupera o mesmo pedido.

Credenciais fictícias: não há login nesta fatia.

## Contratos REST (resumo)

`GET /api/nfts` (q, collection, network, minPrice, maxPrice, sort, page) · `GET /api/nfts/:id` · `GET/PUT/DELETE /api/cart[/items/:nftId]` · `GET /api/cart/quote` · `POST /api/orders` (header `Idempotency-Key`; 201 novo, 200 reenvio, 409 `idempotency_conflict`, 409 `availability_conflict`, 422 `validation_error`) · `GET /api/orders/:id`. Tipos em `packages/contracts/src/index.ts`.

## Processo spec-driven

1. `GLOSSARIO.md` → 2 bounded contexts (Catálogo, Compra).
2. Feature da semana 5 com OpenSpec: `openspec/changes/catalog-url-state` (validada) → testes `e2e/catalogo-url.spec.ts`.
3. Semana 6: `RESEARCH.md` → `docs/adr/0001-pedido-idempotente.md` + `docs/pedido-idempotente-spec.md` → `e2e/pedido-idempotente.spec.ts`.
4. Comparação das ferramentas em `DIFERENCAS.md`; revisão em `REVIEW.md`.
