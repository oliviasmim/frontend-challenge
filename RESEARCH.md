<!--
  Artefato da SESSÃO 1 (Research). Isto NÃO é um documento de solução — se você escreveu
  a palavra "vamos construir" ou o nome de uma tecnologia neste arquivo, voltou cedo
  demais pro modo Plan. Feche esta sessão sem ter aberto um editor de código.

  Regra de sessão: abra um agente NOVO (ou `/clear`) só pra isto. Se ele tentar propor
  código ou arquitetura, pare e diga "ainda não, estamos só entendendo o problema".

  Ao final, este arquivo inteiro (não a conversa) é o que entra na sessão de Plan.
-->

# RESEARCH — Preço que muda entre ver a cotação e confirmar a compra

> **Aviso de origem.** Nenhum colecionador real foi entrevistado. Tudo o que está aqui
> sobre a pessoa e o que ela sente é **RECONSTRUÇÃO** a partir do enunciado (`README.md`,
> seções 3 e 7). Todo número é **HIPÓTESE** a validar. As frases entre aspas que vêm do
> enunciado estão marcadas como citação dele. As demais são reconstrução.

## Quem sente a dor

**O colecionador que compra no lançamento.** Ele quer uma edição limitada que pode esgotar
em minutos. Por isso decide rápido e **não relê o resumo** antes de confirmar.
*(RECONSTRUÇÃO)*

Existe também o colecionador que compra com calma e compara edições. Ele sente a mesma dor,
só que com menos intensidade, porque tem tempo de perceber a mudança.

O caso mais grave é o de **um carrinho com vários itens de edições diferentes**. Quando um
desses itens muda de preço ou de disponibilidade, o total do carrinho inteiro muda, e fica
difícil saber **qual** item mudou.

## Em que momento ela aparece

**No checkout, no intervalo entre ver a cotação e apertar "confirmar".** Ele já viu a
cotação, aceitou mentalmente aquele total e está com o dedo no botão. Nesse intervalo, o
preço ou a disponibilidade de uma das edições muda.

- Nesse momento ele olha **o total da cotação**, porque é o número que ele "aceitou". Não
  volta à vitrine para conferir o preço de cada item.
- O enunciado descreve esse cenário (seção 7, citação): *"1. Um NFT está no carrinho.
  2. Seu preço ou disponibilidade muda durante a navegação. 3. A interface informa a
  alteração e atualiza o resumo. 4. O checkout impede a confirmação com uma cotação
  desatualizada."*

**Fora do escopo desta pesquisa:** depois do clique, o pedido fica **pendente** e o
colecionador não sabe em que situação ele está. Isso também incomoda, mas é outra dor, com
outro momento e outra fala. Fica para uma pesquisa própria.

## O que essa pessoa diria, com as próprias palavras

*(RECONSTRUÇÃO, não é citação de colecionador real)*

> "Eu fiquei irritado porque confirmei achando que era 0,5 ETH e no recibo veio outro valor.
> Ninguém me avisou que tinha mudado."

Ordem do que mais irrita *(RECONSTRUÇÃO)*:

1. **Pagar mais do que viu.** É a dor central.
2. **Descobrir que a edição esgotou depois de já ter decidido.**
3. **Receber um aviso que ele não entende.** Também irrita, mas menos que as duas
   primeiras.

## O que isso custa hoje

| Custo | O que se sabe | Status |
|---|---|---|
| **Dinheiro** | Ele percebe qualquer diferença no total quando ela aparece no recibo. Uma alta de **~5%** já o faria repensar a compra. | HIPÓTESE, sem dado real |
| **Oportunidade** | Na compra de lançamento, quem recomeça do zero perde a edição, porque ela esgota enquanto ele refaz o carrinho. | RECONSTRUÇÃO |
| **Trabalho perdido** | O risco é perder o carrinho ou a cotação numa falha e ter que remontar tudo. O enunciado proíbe isso (citação, seção 3): *"Preservar os itens em falhas"*. | Exigência do enunciado |
| **Confiança** | Depois de uma experiência dessas, ele passa a desconfiar do marketplace e a conferir tudo à mão, ou desiste da compra. Em comunidades de NFT, uma reclamação pública é provável. | HIPÓTESE, sem dado real |
| **Erro** | Ele paga um valor diferente do que confirmou. O enunciado trata isso como inaceitável (citação, seção 3): *"Revalidar preço, disponibilidade, cupom e taxas antes de confirmar a compra. Mudanças devem exigir nova confirmação do usuário."* | Exigência do enunciado |

**A investigar:**
- Qual diferença de preço ele de fato percebe e qual o faz desistir. O limite de ~5% é chute.
- Com que frequência o preço muda no intervalo entre a cotação e a confirmação.
- Se ele aceita bem uma nova confirmação ou se ela é vista como mais um atrito.

## O que já foi tentado (se algo foi)

*(RECONSTRUÇÃO: gambiarras plausíveis, nenhuma foi observada)*

- **Recarregar a página antes de pagar.** Não resolve, porque o preço pode mudar entre o
  recarregar e o clique. A janela fica menor, mas continua existindo.
- **Tirar print do preço.** Não resolve, porque o print serve de prova depois, mas não impede
  que ele pague outro valor.

Nas duas, quem tem que vigiar o preço é o colecionador. E o colecionador de lançamento é
justamente quem não tem tempo de vigiar.

## Ligação com a semana 5

A dor vive no contexto **Compra** (do carrinho ao recibo), definido no glossário da semana 5.
Os termos envolvidos são **Carrinho**, **Cotação** e **Pedido**.

A mudança vem do contexto **Catálogo**. A palavra **Preço** tem um sentido em cada contexto,
e a dor está exatamente nessa diferença:

- no **Catálogo**, é o preço **vigente**, que muda a qualquer momento;
- na **Compra**, é o preço **cotado**, o valor que o colecionador aceitou.

A dor aparece quando o preço vigente se afasta do preço cotado e o colecionador não percebe.
Isso confirma o núcleo do projeto já registrado: *comprar sem pagar um valor diferente do que
confirmou*.

---

## Checklist de saída da sessão de Research

- [x] Não tem nenhuma palavra de solução técnica neste arquivo (nome de lib, de tabela, de
      endpoint). Se tiver, apague — isso é trabalho da sessão de Plan.
- [x] Uma pessoa que não conhece o seu projeto consegue ler isto e entender o problema.
- [ ] Você conseguiria mostrar este arquivo pra pessoa que sente a dor e ela diria "é
      isso mesmo" — não "não é bem assim".
      **Pendente:** não houve conversa com nenhum colecionador real. Fica aberto até
      validar com pelo menos um.
