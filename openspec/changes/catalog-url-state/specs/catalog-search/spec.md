## ADDED Requirements

### Requirement: Estado de busca na URL
O sistema SHALL representar busca, **Filtro**s, ordenação e página da lista de **NFT**s como parâmetros da URL da rota Início.

#### Scenario: Filtro sobrevive ao refresh
- **GIVEN** o colecionador aplicou a **Coleção** "Música" e a rede "Polygon" no catálogo
- **WHEN** a página é recarregada
- **THEN** a URL contém `collection=music&network=polygon`
- **AND** a lista exibe apenas os **NFT**s de Música na rede Polygon

#### Scenario: Navegação pelo histórico restaura a busca
- **GIVEN** o colecionador buscou "Ape", depois filtrou pela rede "Ethereum"
- **WHEN** ele volta uma entrada no histórico do navegador
- **THEN** a URL contém apenas `q=Ape`
- **AND** o filtro de rede aparece desmarcado

### Requirement: Filtro reinicia a paginação
Quando um **Filtro** ou a busca mudar, o sistema SHALL reiniciar a página para 1.

#### Scenario: Mudança de filtro na página 3
- **GIVEN** o colecionador está na página 3 de 4 do catálogo
- **WHEN** ele seleciona a **Coleção** "Fotografia" (4 **NFT**s no catálogo, 9 por página)
- **THEN** a URL contém `page=1`
- **AND** a lista mostra os 4 **NFT**s de Fotografia

### Requirement: Resultado vazio e falha
O sistema SHALL exibir estado vazio quando nenhum **NFT** atender aos parâmetros e estado de erro com nova tentativa quando a API falhar.

#### Scenario: Faixa de preço sem resultados
- **GIVEN** nenhum **NFT** custa entre 12,00 e 12,30 ETH na rede "Solana"
- **WHEN** o colecionador aplica essa faixa e essa rede
- **THEN** a lista exibe a mensagem "Nenhum NFT encontrado" e a ação "Limpar filtros"
