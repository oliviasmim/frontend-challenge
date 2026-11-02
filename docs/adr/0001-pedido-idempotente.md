# ADR 0001 — Pedido idempotente no pagamento

- Status: aceita
- Contexto da decisão: Compra (`apps/web/src/purchase/`)

## Contexto
O colecionador pode disparar a confirmação várias vezes (clique repetido, timeout, refresh). Cada envio não pode criar um novo pedido (RESEARCH §1–2; README §3, §5).

## Decisão
1. A UI gera uma **chave de idempotência** por tentativa de compra e a guarda em `sessionStorage` até o pedido chegar a um estado terminal ou a composição do carrinho mudar.
2. `POST /api/orders` exige o header `Idempotency-Key`. Mesma chave + mesmo conteúdo ⇒ devolve o **mesmo pedido** (200, `Idempotent-Replayed: true`). Mesma chave + conteúdo diferente ⇒ **409 `idempotency_conflict`**.
3. O botão fica desabilitado enquanto a mutation estiver em andamento; reenvio após erro reutiliza a mesma chave.
4. Após refresh, a UI consulta `GET /api/orders/:id` (id guardado com a chave) para recuperar o estado.
5. Os itens só saem do carrinho quando o pedido estiver `confirmed`.

## Alternativas descartadas
- **Só desabilitar o botão:** não cobre timeout nem refresh.
- **Deduplicar por conteúdo no servidor:** impede recompra legítima do mesmo item.
- **Chave nova a cada clique:** é o defeito que queremos evitar.

## Consequências
- O mock (MSW) guarda `idempotencyKey → {hash do corpo, pedido}` com persistência local e reset.
- O contrato REST ganha um header e o erro 409.
- Chave persistida por sessão do navegador, não por usuário (limitação documentada).

## Tecnologias da stack envolvidas
TanStack Query (mutation), Axios (header), MSW (handler), Playwright (cenários).
