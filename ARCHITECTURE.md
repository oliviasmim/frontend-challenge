# Arquitetura

## Decisões
- **Monorepo npm workspaces**: `contracts` e `mocks` são consumidos como TypeScript fonte (sem build).
- **Bounded contexts** como pastas: `catalog/` e `purchase/` (GLOSSARIO.md). `edição` significa coisas diferentes em cada um.
- **URL é o estado do catálogo** (`validateSearch`); qualquer filtro/busca/ordenação reinicia `page=1`.
- **Pedido idempotente** — ver `docs/adr/0001-pedido-idempotente.md`.
- **Mocks só na rede** (MSW); cliente Axios e componentes não têm respostas fictícias.

## Cache e retries
Queries: `staleTime` 15 s, 1 retry, sem refetch ao focar a janela, `keepPreviousData` na listagem (evita piscar), cancelamento por `signal`. Mutations: **sem retry automático**. Após mutation de carrinho: `setQueryData` + invalidação da cotação. Após pedido: invalida carrinho e cotação.

## Limitações e desvios do Figma
- Arte dos NFTs é SVG gerado (os PNGs do Figma não estão disponíveis como assets separados).
- Seções editoriais (Diário, newsletter, banners), abas "Novos lançamentos/Em alta" e rodapé completo foram omitidas (§3: fora do escopo).
- Botão "Adicionar" no card (não desenhado) permite montar o carrinho sem a tela de detalhe.
- Sem autenticação: o carrinho e pedidos são do navegador. Sem Socket.IO, cupom, favoritos, perfil, carteiras.
- Sem testes de regressão visual, Lighthouse, lint e deploy.
- Chave de idempotência por aba (`sessionStorage`), não por usuário.
