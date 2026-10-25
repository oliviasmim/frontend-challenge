# RESEARCH — Pedido duplicado no pagamento

> Domínio: marketplace de NFTs do Desafio Frontend. Contexto: **Compra**. Sem nomes de tecnologia.

## 1. A dor

- **Quem sente:** o colecionador que está pagando um pedido (README §3 "Pagamento e confirmação": "Impedir pedidos duplicados em cliques repetidos ou reenvios após timeout").
- **Quando:** no passo final de pagamento, ao tocar em "Confirmar compra". A resposta demora, a conexão cai ou ele clica de novo achando que não funcionou.
- **Quanto custa:** NFTs de edição limitada custam de 0,39 a 2,29 ETH cada (layout). Dois pedidos para o mesmo item cobram o colecionador duas vezes, consomem edição escassa que outra pessoa poderia comprar e exigem estorno manual. Com o pedido em dúvida, ele não sabe se pagou: a confiança no marketplace cai.

## 2. Situações observadas (do enunciado)

1. **Clique repetido:** dois cliques seguidos em "Confirmar compra" (§3).
2. **Timeout após criação:** o servidor criou o pedido, mas o colecionador não recebeu a resposta e tenta reenviar (§3 "reenvios após timeout"; §6 "timeout após criação do pedido, com recuperação").
3. **Recarregar com pedido pendente:** ele atualiza a página e precisa recuperar o mesmo pedido, não criar outro (§3 "recuperação após refresh"; §7).
4. **Mesma tentativa com conteúdo alterado:** reenviar a mesma tentativa mudando itens ou quantidades deve ser recusado como conflito (§5 "reutilizar a chave com conteúdo diferente deve gerar conflito").

## 3. O que o colecionador precisa

- Ver que o pedido está sendo processado, sem poder disparar outro.
- Após erro de rede, reenviar e receber **o mesmo pedido**.
- Itens preservados no carrinho enquanto o pedido não for confirmado (§3 "Preservar os itens em falhas").
- Ver a confirmação só quando o pedido estiver de fato confirmado.

## 4. Fora do problema

Cotação desatualizada, sessão expirada e pagamento recusado são problemas vizinhos, tratados em outros documentos.

## 5. Perguntas em aberto

- Por quanto tempo uma tentativa continua "a mesma"? (enunciado não define; assumir a vida do carrinho)
- Se o reenvio chegar após o pedido já recusado, o que ele vê? (assumir: o estado terminal "recusado" e opção de nova tentativa com nova tentativa explícita)
