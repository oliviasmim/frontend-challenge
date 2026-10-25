# Kurio — marketplace de NFTs (monorepo)

Enunciado: `README.md` original do desafio (ver `CHALLENGE.md`). Desenvolvimento orientado a specs — use a skill `kurio-spec-driven`.

## Layout
- `apps/web` — React + TS, TanStack Router/Query, Axios, Tailwind, Playwright (`e2e/`).
- `packages/contracts` — tipos REST e utilitários de ETH.
- `packages/mocks` — MSW: handlers, fixtures, cenários.
- `openspec/` — specs e changes. `docs/` — ADRs e specs enxutas. `.claude/skills/` — skills.

## Comandos
`npm run dev` · `npm run build` · `npm run preview` · `npm run typecheck` · `npm run test:e2e` · `npm run validate:specs`

# Glossário — Marketplace de NFTs (Kurio)

Fonte única de significado: `CHALLENGE.md` (enunciado original do desafio; seções citadas como §). Cada termo aponta a seção de origem.

## Bounded contexts

| Contexto | Pasta | Responsabilidade (README) |
| --- | --- | --- |
| **Catálogo** | `apps/web/src/catalog/` | Descoberta: destaques, busca, filtros, ordenação, paginação e detalhe do NFT (§3 "Catálogo e detalhe") |
| **Compra** | `apps/web/src/purchase/` | Carrinho, cupom, cotação, pagamento, pedido e recibo (§3 "Carrinho", "Pagamento e confirmação") |

Contratos compartilhados vivem em `packages/contracts/`; a simulação de rede em `packages/mocks/`.

## Termos — Catálogo

| Termo | Significado neste contexto | Origem |
| --- | --- | --- |
| **NFT** | Obra digital listada para descoberta, com galeria, preço em ETH, edições e rede. Aqui é algo que se *vê e filtra*. | §1, §3 Detalhes do NFT |
| **Filtro** | Critério combinável (coleção, faixa de preço, rede) que vive na URL; mudar um filtro reinicia a paginação. | §3 "Catálogo e detalhe" |
| **Coleção** | Agrupamento temático de NFTs usado para filtrar (Arte digital, Música…). | Layout Figma, §3 |

## Termos — Compra

| Termo | Significado neste contexto | Origem |
| --- | --- | --- |
| **Item do carrinho** | Par (NFT, quantidade inteira) respeitando disponibilidade por NFT e edição. | §3 "Carrinho" |
| **Cotação** | Resposta da API com subtotal, desconto, taxa de rede e total; é a referência para finalizar o pedido. | §3 "Carrinho", §5 Cotação |
| **Pedido** | Compra com chave de idempotência; estados pendente, confirmado ou recusado (terminais: confirmado/recusado). | §3 "Pagamento e confirmação", §5 |

## Palavra que muda de sentido: **Edição**

- No **Catálogo**, *edição* é um atributo de apresentação do NFT ("edição indisponível" no detalhe, §3): o colecionador vê se existe exemplar.
- Na **Compra**, *edição* é **estoque reservável**: a disponibilidade por edição limita a quantidade do item do carrinho e é revalidada antes de confirmar (§3 "Carrinho", "Pagamento").

Outras palavras que também mudam: **Preço** (valor exibido no Catálogo vs. valor cotado/congelado no snapshot do recibo, §3) e **Total**.
