# filtros-catalogo-na-url Specification

**Approved**: pendente (o spec ainda não foi aprovado)

Contexto: **Catálogo** (`src/catalogo/`). Origem: README §3 "Catálogo e detalhe", 1º e 2º itens.
Cenários de partida: `docs/semana5/cenarios-a-mao.md`, os três, sem acréscimo.

## Problem Statement

Hoje a busca, os Filtros, a ordenação e a página do Catálogo não têm onde morar além da memória da
tela. Quando o colecionador recarrega a página ou usa voltar/avançar, ele perde o que montou e
precisa refazer a busca. O README §3 exige que esse estado esteja na URL, sobreviva a refresh e ao
histórico, e que mudar um Filtro reinicie a paginação.

## Goals

- [ ] Recarregar o Catálogo mostra os mesmos NFTs, na mesma ordem e na mesma página, sem nenhuma ação do colecionador (cenário 1).
- [ ] Mudar um Filtro sempre leva à página 1, com os Filtros combinados (cenário 2).
- [ ] Voltar e avançar no navegador restauram o estado do Catálogo de cada entrada do histórico (cenário 3).

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Carrinho, Cotação, Pedido | Contexto Compra; esta feature só mexe no Catálogo (CLAUDE.md). |
| Atualizar o preço vigente pelo evento `nft.updated` | É outra regra do README §7; esta feature trata do estado da consulta, não do dado do NFT. |
| Detalhe do NFT, favoritos, destaques | Outras linhas do README §3. |
| Layout e aparência dos controles de busca, Filtro, ordenação e paginação | O Figma define a composição; este spec define comportamento. |
| Posição de rolagem ao voltar no histórico | Não está nos cenários nem no README; ver Q7 se quiser incluir. |

---

## Assumptions & Open Questions

Defaults que eu escolhi e você pode corrigir:

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| O que "combinados" significa no cenário 2 | Filtros de tipos diferentes (categoria, Edição) se somam: o NFT precisa atender a todos (E lógico). | É a leitura direta de "os dois filtros combinados" e de "filtros combináveis" (README §3). | n |
| "Exatamente o mesmo catálogo" depois do refresh | Os mesmos parâmetros vão para a API e o Catálogo mostra o que ela devolve, na ordem dela. Se o preço vigente mudou entre uma carga e outra (`nft.updated`), a ordem por "menor preço" pode mudar, e isso não é falha desta feature. | O preço do Catálogo é vivo (glossário). O cenário 1 parte de dados estáveis. | n |
| Quais categorias, valores de Edição e ordenações existem | Os do Figma e das fixtures; o spec cita só os dos cenários: categorias "Arte" e "Música", Edição "disponível", ordem "menor preço". | Não consegui abrir o Figma (o conector não está autorizado nesta sessão). | n |
| 12 NFTs por página | Tamanho fixo, fora da URL. | Vem do "Dado" do cenário 1; nada pede que o colecionador escolha. | n |
| Cada mudança de busca, Filtro, ordenação ou página cria uma entrada nova no histórico (push), sem substituir a atual | Push em toda mudança. | O cenário 3 só funciona se a troca de Filtro criar entrada; aplicar a mesma regra a ordenação e página deixa o "voltar" previsível. Depende de Q3 para a busca. | n |
| Critério de "avançar" | Incluído (CATURL-10). | Está na sua frase de descrição ("voltar/avançar... restaura"); não é cenário novo. | n |

**Open questions** (bloqueiam a aprovação; recomendação primeiro):

| # | Pergunta | Recomendação | Por quê |
| - | -------- | ------------ | ------- |
| Q1 | Ainda não existe app (`src/` vazio). Esta feature precisa de router, cliente HTTP, MSW e fixtures com 48 NFTs, que não são do Catálogo. Como fica a cerca de "um bounded context só"? (a) uma feature de fundação separada antes desta; (b) esta feature cria o mínimo fora de `src/catalogo/`; (c) esta feature fica só em `src/catalogo/` e os testes esperam a fundação. | (a) fundação separada | Mantém a regra do CLAUDE.md sem bloquear testes. Você já escolheu isso no exercício do OpenSpec, mas lá era outro contexto, então confirmo aqui. |
| Q2 | O README §3 também pede resultado vazio, falha da API e respostas fora de ordem (ex.: o colecionador volta de "Música" para "Arte" e a resposta de "Música" chega depois). E §4 pede acesso direto, o que inclui URL com valor inválido (`pagina=99`, categoria inexistente). Seus cenários não cobrem nada disso. (a) fica fora desta feature; (b) você escreve os cenários e eu incluo. | (b) pelo menos a resposta fora de ordem | Sem ela, voltar no histórico pode mostrar os NFTs da categoria errada com a URL certa, o que quebra o cenário 3 na prática. Vazio, falha e URL inválida podem ficar para outra feature. |
| Q3 | Quando a busca vai para a URL? (a) quando o colecionador envia (Enter ou botão); (b) a cada tecla, com espera curta (ex.: 300 ms), substituindo a entrada do histórico enquanto digita. | (a) ao enviar | Uma entrada de histórico por busca enviada; com (b), "voltar" passaria por "a", "ap", "ape". |
| Q4 | Mudar a busca ou a ordenação também volta para a página 1? Sua regra só fala de Filtro. | Sim, as duas | Na página 3 de "ape", trocar para "menor preço" e ficar na página 3 mostra NFTs que o colecionador não pediu. |
| Q5 | Categoria aceita um valor só ou vários? O cenário 3 diz "trocou para Música", o que sugere um só. | Um só | Segue a palavra do cenário; vários valores mudaria a forma da URL. |
| Q6 | O cenário 2 diz "a URL tem página 1". A página 1 aparece escrita na URL (`pagina=1`) ou pode ser omitida por ser o padrão? | Escrita na URL | É o que o cenário diz ao pé da letra; o teste fica direto. |
| Q7 | Voltar no histórico deve restaurar também a posição de rolagem da lista? | Não, fica fora | Não está nos cenários nem no README. |

---

## User Stories

### P1: Estado do Catálogo sobrevive ao refresh ⭐ MVP

**User Story**: Como colecionador, quero que a busca, os Filtros, a ordenação e a página fiquem na URL, para recarregar a página sem perder o Catálogo que montei.

**Why P1**: É a primeira frase da regra do README §3 e o cenário 1.

**Acceptance Criteria**:

1. WHEN o colecionador muda a busca, um Filtro, a ordenação ou a página THEN the Catálogo SHALL escrever na URL o valor atual de cada um deles (CATURL-01)
2. WHEN o colecionador recarrega uma URL do Catálogo com busca "ape", categoria "Arte" e ordem "menor preço" THEN the Catálogo SHALL manter na URL busca "ape", categoria "Arte" e ordem "menor preço" (CATURL-02)
3. WHEN o colecionador recarrega uma URL do Catálogo THEN the Catálogo SHALL mostrar nos controles de busca, Filtro, ordenação e página os mesmos valores que estão na URL (CATURL-03)
4. WHEN o colecionador recarrega uma URL do Catálogo THEN the Catálogo SHALL mostrar os mesmos NFTs, na mesma ordem e na mesma página que mostrava antes do refresh (CATURL-04)

**Independent Test**: Com as fixtures de 48 NFTs e 12 por página, buscar "ape", filtrar a categoria "Arte", ordenar por "menor preço", anotar os NFTs da página 1, recarregar e comparar URL, controles e a lista de NFTs na ordem.

---

### P1: Mudar um Filtro volta para a página 1 ⭐ MVP

**User Story**: Como colecionador, quero que mudar um Filtro me leve para a página 1, para não cair numa página que não existe ou que pula NFTs do novo resultado.

**Why P1**: É a segunda frase da regra do README §3 e o cenário 2.

**Acceptance Criteria**:

1. WHEN o colecionador adiciona, troca ou remove um Filtro THEN the Catálogo SHALL mostrar a página 1 do novo resultado (CATURL-05)
2. WHEN o colecionador adiciona um Filtro de tipo diferente dos que estão ativos THEN the Catálogo SHALL mostrar só os NFTs que atendem a todos os Filtros ativos (CATURL-06)
3. WHEN o colecionador, na página 3 do Catálogo com categoria "Arte", adiciona o Filtro de Edição "disponível" THEN the Catálogo SHALL deixar na URL página 1, categoria "Arte" e Edição "disponível" (CATURL-07)

**Independent Test**: Filtrar a categoria "Arte", ir para a página 3, adicionar Edição "disponível" e conferir: página 1 na tela e na URL, os dois Filtros na URL, e todo NFT mostrado é da categoria "Arte" com Edição disponível.

---

### P1: Voltar e avançar restauram o Catálogo ⭐ MVP

**User Story**: Como colecionador, quero usar voltar e avançar do navegador para rever o Catálogo como estava, sem refazer a busca.

**Why P1**: É o "navegação pelo histórico" do README §3 e o cenário 3.

**Acceptance Criteria**:

1. WHEN o colecionador muda um Filtro, a ordenação ou a página THEN the Catálogo SHALL criar uma nova entrada no histórico do navegador (CATURL-08)
2. WHEN o colecionador filtrou a categoria "Arte", trocou para "Música" e usa o botão voltar THEN the Catálogo SHALL mostrar os NFTs da categoria "Arte" com a categoria "Arte" na URL e no controle de Filtro (CATURL-09)
3. WHEN o colecionador usa o botão avançar depois de voltar THEN the Catálogo SHALL mostrar os NFTs, os controles e a URL da entrada seguinte do histórico (CATURL-10)

**Independent Test**: Filtrar "Arte", trocar para "Música", voltar (confere "Arte" na URL, no controle e nos NFTs), avançar (confere "Música" nos três).

---

## Edge Cases

Pendentes de Q2; nenhum entra como critério até você responder:

- Resposta da API fora de ordem depois de mudanças rápidas ou de voltar no histórico.
- Resultado vazio para a combinação de busca e Filtros.
- Falha da API ao carregar uma página do Catálogo.
- URL com página além da última ou com valor de Filtro/ordenação que não existe.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| CATURL-01 | P1: Estado sobrevive ao refresh | - | Pending |
| CATURL-02 | P1: Estado sobrevive ao refresh | - | Pending |
| CATURL-03 | P1: Estado sobrevive ao refresh | - | Pending |
| CATURL-04 | P1: Estado sobrevive ao refresh | - | Pending |
| CATURL-05 | P1: Mudar Filtro volta para página 1 | - | Pending |
| CATURL-06 | P1: Mudar Filtro volta para página 1 | - | Pending |
| CATURL-07 | P1: Mudar Filtro volta para página 1 | - | Pending |
| CATURL-08 | P1: Voltar e avançar | - | Pending |
| CATURL-09 | P1: Voltar e avançar | - | Pending |
| CATURL-10 | P1: Voltar e avançar | - | Pending |

**Coverage:** 10 total, 0 mapped to tasks, 10 unmapped (fase Tasks ainda não começou).

### Implicit-requirement dimensions

| Dimension | Resolução |
| --------- | --------- |
| Input validation & bounds | Pendente: Q2 (URL com valor inválido). |
| Failure / partial-failure states | Pendente: Q2 (falha da API, vazio). |
| Concurrency / ordering | Pendente: Q2 (resposta fora de ordem). |
| State-transition integrity | CATURL-05, CATURL-08 a CATURL-10. |
| Idempotency, auth, data lifecycle, observability, external dependency | N/A: o Catálogo só lê, é público e não guarda nada além da URL. |

### Request, frase por frase

| Frase do pedido | Onde caiu |
| --------------- | --------- |
| "busca, filtros, ordenação e página ficam na URL" | CATURL-01 |
| "recarregar a página... restaura exatamente o mesmo catálogo" | CATURL-02 a CATURL-04; assumption sobre preço vivo |
| "usar voltar/avançar do navegador restaura exatamente o mesmo catálogo" | CATURL-08 a CATURL-10 |
| "mudar um filtro volta para a página 1" | CATURL-05, CATURL-07; Q4 para busca e ordenação |

---

## Sources

- `README.md` §3 "Catálogo e detalhe" - a regra; §4 - acesso direto e respostas obsoletas (Q2).
- `docs/semana5/cenarios-a-mao.md` - os três cenários de partida.
- `CLAUDE.md` - glossário (NFT, Edição, Filtro, Preço vigente, colecionador) e a cerca de um contexto (Q1).
- Figma do README - define a composição dos controles. Nenhum frame foi exportado para `captures/`: o conector do Figma não está autorizado nesta sessão, e esta feature não desenha tela nova.

---

## Success Criteria

- [ ] Os três cenários de `docs/semana5/cenarios-a-mao.md` passam como testes Playwright contra os mocks MSW.
- [ ] Nenhum dos três cenários depende de estado guardado fora da URL.
