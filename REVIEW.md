# REVIEW.md: semanas 5 e 6

Feature do RPI: **confirmar só com cotação vigente** (contexto **Compra**, `src/compra/`), README §7 e §3
"Pagamento e confirmação". Research, Plan e Implement rodaram em **3 sessões separadas do Claude
Code** (`claude -p`, sessões novas). Cada uma recebeu só o artefato da anterior.

## O que eu pedi na sessão de Plan

Colei só o conteúdo do `RESEARCH.md`, o nome do contexto (Compra) e 4 termos do glossário
(Carrinho, Cotação, Pedido, Preço cotado), com o prompt "Sessão 2 — Plan" de
`aula11/starter/prompts-rpi.md` e os templates de ADR e de spec enxuta.

## O que o agente devolveu

- `docs/adr/0001-confirmar-so-com-cotacao-vigente.md`: decisão clara e 3 alternativas descartadas,
  todas com motivo tirado do RESEARCH (por exemplo, "tolerar ~5%" foi descartada porque os 5% são hipótese).
- `docs/confirmar-so-com-cotacao-vigente-spec.md`: 5 EARS (um de cada padrão) e 3 cenários BDD.
- **Uma pergunta:** usar o aviso de mudança que vem do Catálogo quebra a regra de "um contexto só"?

## O que eu rejeitei ou reescrevi, e por quê

| O quê | Antes (agente) | Depois (eu) | Por quê |
|---|---|---|---|
| EARS 4 (feature opcional) | "Onde houver cupom, mostrar se o desconto mudou" | "Onde o carrinho tiver mais de uma edição, mostrar a edição que mudou separada, com subtotal anterior e novo" | Nenhuma frase do colecionador no RESEARCH fala de cupom. A dor dele é "fica difícil saber **qual** item mudou". Critério sem origem não entra. |
| EARS 5 | revalidação cobria "preço, disponibilidade, **cupom ou taxa**" | só preço e disponibilidade | Mesmo motivo: o resto não tem frase de origem no RESEARCH. Fica para outra spec. |
| Todos os EARS | sem origem | cada um com *Origem:* frase do RESEARCH + seção do README | Exigência da revisão. É o que mostra que o critério resolve a dor, não só que soa bem. |
| BDD 1 e 2 | "o preço de uma das edições **sobe**", sem número | "Aurora #3" de 0,2 para 0,25 ETH, total de 0,5 para 0,55 ETH | Cenário sem número não vira teste. |
| BDD (todos) | misturava "eu" e "o colecionador" | sempre "o colecionador" | Linguagem ubíqua do glossário. |
| "Como vou saber" | "na semana 8 viram testes" | `npx playwright test` roda os 3 cenários | Na faixa completa, a verificação é agora. |
| Pergunta de fronteira | aberta | **Decidido:** Compra só *escuta* o sinal e não altera o Catálogo | Registrado em "Decisão de fronteira" na spec. |
| ADR | Status: Proposta | Status: Aceita | Revisada. |

O cenário 3 (edição esgota) é o de **erro/limite** e foi mantido como o agente escreveu, só com nomes.

## Sessão de Implement

Recebeu só a ADR e a spec revisadas. **Parou e perguntou 3 coisas antes de codar**:
1. o formato do evento de mudança;
2. o que fazer com a edição esgotada;
3. de onde vem o novo total.

Aceitei as 3 recomendações: formato do README §7; a edição esgotada fica no carrinho e bloqueia a
confirmação; o total vem da nova cotação da API, nunca de uma conta na tela.

- **Resultado:** `npx playwright test` → **6 passed**, ou seja, 3 cenários × desktop e mobile. Conferi rodando de novo
  por conta própria. `tsc` também passa.
- A mudança de preço e o esgotamento chegam pelo **socket.io-client**. O teste altera o dado no mock
  (`POST /api/__mock/editions/:id`, handler MSW) e o mock emite `nft.updated`. A tela não é chamada direto.
- **Não segui à risca:** a sessão de Implement **leu o `RESEARCH.md` do disco** por conta própria (o arquivo
  está no repo). A separação "só o artefato anterior" valeu para o que eu colei, mas não para o que
  o agente foi buscar. Da próxima vez, rodaria o Implement numa cópia sem o RESEARCH.
- **Limites conhecidos:**
  - no mock, o pedido já nasce confirmado (pendente fica fora da spec);
  - o carrinho do mock fica em memória e não sobrevive a refresh;
  - o critério 5 está implementado, mas sem cenário de teste.

## O que foi rascunhado pelo agente no meu lugar

O `GLOSSARIO.md`, os cenários "à mão" da semana 5 e as respostas da sessão de Research foram
**rascunhados pelo Claude e revisados por mim**. No `RESEARCH.md`, nenhum colecionador real foi
entrevistado: o que é reconstrução e o que é hipótese está marcado lá.
