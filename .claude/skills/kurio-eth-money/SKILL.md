---
name: kurio-eth-money
description: Regras de valores em ETH no Kurio. Use ao somar, multiplicar, comparar ou exibir preços, taxas e totais.
---

# Valores em ETH

- Trafegam como **string decimal** (`"1.19"`). Nunca `number`/`parseFloat`.
- Cálculo com os helpers de `packages/contracts/src/eth.ts` (`addEth`, `mulEth`, `pctEth`, `cmpEth`), que usam `bigint` com 18 casas.
- Exibição com `formatEth` (mínimo 2 casas, sem arredondar casas extras).
- Quantidades são inteiros.
- A cotação da API (`GET /api/cart/quote`) é a referência; a UI não recalcula totais.
- O recibo é um snapshot (`Order.quote`): mudanças no catálogo não o alteram.
