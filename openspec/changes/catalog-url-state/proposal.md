## Why

O colecionador filtra o catálogo (coleção "Música", rede "Polygon", faixa 0,02–12,30 ETH), recarrega a página ou volta pelo histórico e perde a busca. README §3 "Catálogo e detalhe": busca, filtros, ordenação e paginação devem compor o estado da URL e sobreviver a refresh e histórico.

## What Changes

- Busca, **Filtro**s, ordenação e página passam a ser *search params* da rota Início.
- Mudar qualquer **Filtro** reinicia a página para 1.
- Consultas refletem os parâmetros enviados à API; respostas obsoletas são descartadas.
- Resultado vazio e falha têm estado próprio.

Fora de escopo: carrinho, pedido, detalhe do NFT (contexto Compra).

## Impact

- Contexto: Catálogo (`apps/web/src/catalog/`).
- Contrato: `GET /api/nfts` (`packages/contracts`).
