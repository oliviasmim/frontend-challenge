# ADR-0001: Confirmar a compra só com uma cotação vigente

## Status

Aceita (revisada por mim depois da sessão de Plan)

## Contexto

O colecionador vê a cotação, aceita aquele total e, no intervalo até apertar "confirmar", o
preço vigente ou a disponibilidade de uma edição do carrinho muda. Ele confirma achando que
paga um valor e o recibo mostra outro (RESEARCH.md: "Ninguém me avisou que tinha mudado").
O colecionador que compra no lançamento sente mais essa dor, porque não relê o resumo. Num
carrinho com várias edições ele também não consegue saber qual item mudou. O enunciado exige
(§3) "Revalidar preço, disponibilidade, cupom e taxas antes de confirmar a compra. Mudanças
devem exigir nova confirmação do usuário" e (§7) "O checkout impede a confirmação com uma
cotação desatualizada".

## Decisão

A cotação é a única referência para o pedido. Quando o preço vigente ou a disponibilidade de
uma edição do carrinho muda, a cotação passa a ser **desatualizada**: o checkout bloqueia a
confirmação, mostra qual edição mudou e só libera depois que o colecionador revê uma nova
cotação e confirma de novo. O carrinho nunca se perde nesse processo.

## Alternativas consideradas

- **Tolerar pequenas variações (ex.: até ~5%) sem pedir nova confirmação.** Descartada: o ~5%
  é hipótese sem dado, e o enunciado exige nova confirmação para qualquer mudança.
- **Atualizar o total em silêncio e deixar confirmar.** Descartada: é exatamente a dor
  ("confirmei achando que era 0,5 ETH").
- **Deixar o colecionador vigiar (recarregar a página, tirar print).** Descartada: a janela
  diminui, mas continua existindo, e quem compra no lançamento não tem tempo de vigiar.

## Consequências

**Positivas:**
- O colecionador nunca paga um valor diferente do que confirmou (núcleo do projeto).
- Num carrinho com várias edições, ele sabe qual item mudou em vez de ver só o total diferente.
- Falhas e mudanças não custam o carrinho, então ele não precisa remontar tudo.

**Negativas / trade-offs:**
- Mais um passo para o colecionador de lançamento: enquanto revê a cotação, a edição pode
  esgotar. Ainda não se sabe se ele aceita bem a nova confirmação ou se a vê como atrito (a investigar).
- A Compra depende de um sinal de mudança vindo do Catálogo (preço vigente e disponibilidade).
  Como isso cruza contextos, a forma do sinal precisa ser combinada antes da implementação.
- Fica fora a opção de "aceitar automaticamente" mudanças pequenas. Mudar isso exige uma ADR nova,
  e com dado real.
