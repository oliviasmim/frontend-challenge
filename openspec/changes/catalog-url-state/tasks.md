## 1. Contrato
- [ ] 1.1 Tipar `GET /api/nfts` (q, collection, network, minPrice, maxPrice, sort, page) em `packages/contracts`

## 2. Catálogo
- [ ] 2.1 `validateSearch` na rota Início normalizando params
- [ ] 2.2 Hook `useNfts(params)` com TanStack Query e cancelamento
- [ ] 2.3 Filtros reiniciam `page` para 1
- [ ] 2.4 Estados vazio e erro com "Tentar novamente"

## 3. Testes
- [ ] 3.1 Playwright: refresh, histórico, reinício de página, vazio
