# Proposal

## Why

O README (§3 "Catálogo e detalhe") exige que busca, filtros, ordenação e paginação façam parte do estado da URL, sobrevivam a refresh e à navegação pelo histórico, e que mudar um filtro reinicie a paginação. Sem isso, o colecionador perde o catálogo que montou ao recarregar ou ao voltar, e o teste E2E nº 1 do §9 ("restauração pelo histórico") não passa.

## What Changes

- O estado do Catálogo (busca, categoria, edição, ordem e página) passa a morar na URL como parâmetros de busca, e a URL é a única fonte desse estado.
- Ao abrir a URL do Catálogo, inclusive por refresh ou acesso direto, a tela é restaurada a partir desses parâmetros e a consulta à API usa exatamente esses valores.
- Toda mudança de busca, filtro ou ordem volta para a página 1.
- Cada mudança de estado cria uma entrada no histórico do navegador, então voltar e avançar restauram o catálogo anterior e o seguinte.
- A fixture MSW do Catálogo passa a ter 48 NFTs, com categorias "Arte" e "Música" e edições disponíveis e não disponíveis, para exercitar os cenários com 12 itens por página.
- Testes E2E Playwright cobrindo exatamente os três cenários de aceite.

Fora do escopo:
- Compra (carrinho, cotação, pedido) e qualquer outro bounded context.
- A fundação do app (Vite, `package.json`, `main.tsx`, router raiz, QueryClient, inicialização do MSW, config do Playwright), que fica numa change separada e prévia.
- Resultados vazios, falhas da API, respostas fora de ordem e valores inválidos na URL. O README pede esses comportamentos, mas eles não estão nos cenários aceitos e ficam para uma próxima change.

## Capabilities

### New Capabilities
- `catalogo-estado-na-url`: como busca, filtros, ordenação e página do Catálogo são representados na URL, restaurados por refresh e histórico, e como mudanças de filtro reiniciam a paginação.

### Modified Capabilities
- Nenhuma (não existem specs no projeto).

## Impact

- Código: só `src/catalogo/` (rota do catálogo, schema dos parâmetros de busca, consulta de listagem, componentes de filtro, ordenação e paginação, fixture e handler MSW do catálogo, testes E2E do catálogo).
- Dependência: precisa da change de fundação do app, ainda não criada, já aplicada. Ela deve oferecer o router raiz com um ponto de montagem para rotas de contexto, QueryClient, cliente Axios, MSW ativado por configuração e Playwright configurado.
- API simulada: contrato `GET` de listagem de NFTs com parâmetros de busca, categoria, edição, ordem, página e tamanho de página (README §5 "NFTs").
