---
name: kurio-mock-scenarios
description: Como criar ou alterar handlers, fixtures e cenários MSW do Kurio (packages/mocks). Use ao mexer em respostas simuladas, falhas de rede ou nos testes que dependem delas.
---

# Mocks MSW

- Toda resposta fictícia vive em `packages/mocks/src/`. **Nunca** em componente, hook ou no cliente Axios (`apps/web/src/lib/api.ts`).
- Estado em `store.ts` (persistido em `localStorage` para sobreviver a refresh). `resetState(cenario)` restaura um cenário conhecido.
- Cenários: `default`, `empty`, `catalog-error`, `slow`, `order-timeout-after-create`, `payment-declined`. Novo cenário ⇒ adicione ao tipo `Scenario`, ao handler e documente no README.
- Fixtures são determinísticas (sem `Math.random`/`Date.now`): os testes dependem dos números.
- Testes ativam cenários com `openWith(page, path, scenario)` (`apps/web/e2e/helpers.ts`), que chama `window.__mocks.reset`.
- Contratos tipados vêm de `@kurio/contracts`; mude o contrato lá primeiro.
