# Spec — Pedido idempotente no pagamento

Contexto: Compra. Termos: **Item do carrinho**, **Cotação**, **Pedido** (GLOSSARIO.md). Decisão: [ADR 0001](adr/0001-pedido-idempotente.md).

## Critérios EARS

| # | Padrão | Critério | Origem (RESEARCH → README) |
| --- | --- | --- | --- |
| 1 | Ubíquo | O sistema SHALL associar cada tentativa de compra a uma chave de idempotência única. | RESEARCH §2 (situações 1–4) → §5 "Pedidos: criação idempotente" |
| 2 | Orientado a evento | WHEN o colecionador confirma a compra, o sistema SHALL criar o **Pedido** com estado `pending` ou `confirmed`. | §1 "Quando" → §3 Pagamento |
| 3 | Indesejado | IF a confirmação for disparada de novo com a mesma chave e o mesmo conteúdo, THEN o sistema SHALL devolver o mesmo **Pedido** sem criar outro. | Situações 1 e 2 → §3, §6 |
| 4 | Estado | WHILE o envio do **Pedido** estiver em andamento, o sistema SHALL manter o botão de confirmar desabilitado. | Situação 1 → §3 |
| 5 | Opcional | WHERE a chave for reutilizada com itens ou quantidades diferentes, o sistema SHALL recusar com conflito e manter o **Item do carrinho** intacto. | Situação 4 → §5 |

## Cenários BDD

```gherkin
# language: pt
Funcionalidade: Pedido idempotente no pagamento

  Cenário: Clique repetido gera um único pedido
    Dado que o carrinho tem 1 "Emerald Ape #042" a 1.19 ETH
    Quando o colecionador clica duas vezes em "Confirmar compra"
    Então existe exatamente 1 pedido
    E a confirmação exibe o total de 1.19 ETH mais a taxa de rede

  Cenário: Timeout após criar o pedido recupera o mesmo pedido
    Dado que o carrinho tem 1 "Emerald Ape #042" a 1.19 ETH
    E a resposta da criação do pedido expira por timeout
    Quando o colecionador vê o erro e clica em "Tentar novamente"
    Então o pedido confirmado tem o mesmo identificador do pedido criado antes do timeout
    E existe exatamente 1 pedido

  Cenário: Mesma chave com quantidade diferente é recusada
    Dado que um pedido foi criado com 1 "Emerald Ape #042"
    Quando a mesma chave é reenviada com 2 "Emerald Ape #042"
    Então a resposta é conflito de idempotência
    E o pedido original permanece com quantidade 1
```
