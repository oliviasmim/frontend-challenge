# Confirmar só com cotação vigente: spec

**Bounded context (semana 5):** Compra (`src/compra/`)
**ADR relacionada:** [ADR-0001](adr/0001-confirmar-so-com-cotacao-vigente.md)
**Escala:** M

## Contexto

O colecionador já viu a cotação, aceitou mentalmente aquele total e está com o dedo no botão.
Nesse intervalo, o preço ou a disponibilidade de uma das edições muda. Ele olha só o total
e não volta à vitrine. Depois reclama: *"Eu fiquei irritado porque confirmei achando que era
0,5 ETH e no recibo veio outro valor. Ninguém me avisou que tinha mudado."* (RECONSTRUÇÃO, ver
RESEARCH.md). O que mais irrita, em ordem: pagar mais do que viu, descobrir que a edição
esgotou depois de já ter decidido e receber um aviso que ele não entende. O caso mais grave é
um carrinho com várias edições, em que fica difícil saber **qual** item mudou.

## Decisão

Quando o preço vigente ou a disponibilidade de uma edição do carrinho muda, a cotação passa a
ser desatualizada. O checkout informa qual edição mudou (de quanto para quanto, ou que esgotou),
atualiza o resumo e bloqueia a confirmação até o colecionador rever uma nova cotação. Antes de
enviar o pedido, a cotação é revalidada mais uma vez. Se algo mudou, a compra volta para nova
confirmação e o carrinho é preservado.

## Fora de escopo

- O que acontece depois do clique: o pedido **pendente** e a incerteza sobre o estado dele
  (outra dor, com pesquisa própria).
- Qualquer tolerância de variação ("até ~5% passa direto"). O ~5% é hipótese sem dado.
- Mudanças na vitrine e no detalhe do Catálogo. Esta spec só consome o sinal de mudança.
- Validar a dor com um colecionador real (pendente no checklist do RESEARCH.md).

## Critérios (EARS)

Revisados contra o `RESEARCH.md`. Cada critério aponta **a frase do RESEARCH** e **a seção do README** de onde veio.

1. **(Ubíqua)** O checkout deve usar o preço cotado de cada edição, e nunca o preço vigente,
   como o valor do pedido.
   *Origem:* RESEARCH "a dor aparece quando o preço vigente se afasta do preço cotado e o
   colecionador não percebe" · README §3 Carrinho "A cotação da API é a referência para finalizar o pedido".
2. **(Orientada a evento)** Quando o preço vigente ou a disponibilidade de uma edição do
   carrinho mudar, o checkout deve marcar a cotação como desatualizada, atualizar o resumo e
   informar qual edição mudou, com o valor anterior e o novo (ou que ela esgotou).
   *Origem:* RESEARCH "Ninguém me avisou que tinha mudado" · README §7 cenário, passos 2 e 3
   "A interface informa a alteração e atualiza o resumo".
3. **(Orientada a estado)** Enquanto a cotação estiver desatualizada, o checkout deve manter
   o botão de confirmar bloqueado e oferecer ao colecionador rever uma nova cotação.
   *Origem:* RESEARCH "Pagar mais do que viu. É a dor central" · README §7 passo 4 "O checkout
   impede a confirmação com uma cotação desatualizada" e §3 "Mudanças devem exigir nova confirmação do usuário".
4. **(Feature opcional)** Onde o carrinho tiver mais de uma edição, o checkout deve mostrar a
   edição que mudou separada das demais, com o subtotal anterior e o novo daquela edição.
   *Origem:* RESEARCH "O caso mais grave é o de um carrinho com vários itens de edições
   diferentes [...] fica difícil saber **qual** item mudou" · README §7 passo 3 "atualiza o resumo".
   *(Reescrito na revisão. A versão do agente falava de cupom, que nenhuma frase do colecionador menciona.)*
5. **(Comportamento indesejado)** Se a revalidação feita antes de enviar o pedido indicar
   mudança de preço ou disponibilidade, ou falhar, então o checkout não deve enviar o pedido,
   deve preservar os itens do carrinho e deve pedir nova confirmação.
   *Origem:* RESEARCH "Trabalho perdido [...] *Preservar os itens em falhas*" e "Descobrir que a
   edição esgotou depois de já ter decidido" · README §3 Pagamento "Revalidar preço,
   disponibilidade, cupom e taxas antes de confirmar a compra" e "Preservar os itens em falhas".

## Cenários (BDD)

Números fixos para virar teste: edição **"Aurora #3"** a 0,2 ETH e edição **"Maré #7"** a 0,3 ETH,
1 unidade de cada, sem cupom e com taxa de rede zero no cenário de teste.

```gherkin
Cenário: Preço de uma edição muda com a cotação aberta
  Dado que o carrinho tem "Aurora #3" a 0,2 ETH e "Maré #7" a 0,3 ETH e a cotação mostra total de 0,5 ETH
  Quando o preço vigente de "Aurora #3" sobe para 0,25 ETH
  Então o checkout informa que "Aurora #3" mudou de 0,2 ETH para 0,25 ETH
  E o resumo mostra o novo total de 0,55 ETH
  E o botão de confirmar fica bloqueado até o colecionador rever a nova cotação

Cenário: Colecionador revê a nova cotação e confirma
  Dado que a cotação ficou desatualizada porque "Aurora #3" subiu de 0,2 ETH para 0,25 ETH
  Quando o colecionador revê a nova cotação e confirma
  Então o pedido é enviado com o preço cotado de 0,25 ETH para "Aurora #3"
  E o recibo mostra o total de 0,55 ETH que o colecionador confirmou

Cenário: Edição esgota entre a cotação e a confirmação
  Dado que o carrinho tem "Aurora #3" e "Maré #7" e a cotação de 0,5 ETH está vigente
  Quando "Maré #7" esgota antes de o colecionador confirmar
  Então o checkout informa que "Maré #7" esgotou
  E nenhum pedido é enviado
  E "Aurora #3" continua no carrinho
```

O cenário 3 é o de **erro/limite**.

## Como eu vou saber que funcionou

`npx playwright test` roda os 3 cenários acima contra o app com a API simulada, e os 3 passam. A mudança
de preço e o esgotamento chegam pelo canal de tempo real simulado, não por chamada direta na tela.

## Decisão de fronteira (revisão)

O agente perguntou se usar o aviso de mudança que vem do Catálogo conta como "mexer em outro
contexto". **Decisão:** não conta. Compra só **escuta** o sinal de mudança de preço e
disponibilidade e não altera nada do Catálogo (vitrine e detalhe continuam fora de escopo).

## Linguagem ubíqua usada aqui

| Termo | O que significa neste projeto |
|---|---|
| Colecionador | A pessoa que navega e compra. Antes de fazer login, é visitante. |
| Carrinho | As edições e quantidades (inteiras) que o colecionador pretende comprar. Sobrevive a refresh e a falhas. |
| Edição | Uma tiragem de um NFT, com quantidade disponível própria. Pode esgotar. |
| Cotação | A resposta da API que valida cupom e disponibilidade e calcula desconto, taxa de rede e total. É a referência para finalizar o pedido. |
| Cotação desatualizada | Cotação cujo preço ou disponibilidade não bate mais com o vigente. Não pode confirmar a compra. |
| Preço vigente | Preço atual da edição no Catálogo. Muda a qualquer momento. |
| Preço cotado | Preço que a cotação fixou e que o pedido usa. Fica congelado no recibo. |
| Pedido | A compra enviada com uma chave de idempotência. Começa pendente e termina confirmado ou recusado. |
