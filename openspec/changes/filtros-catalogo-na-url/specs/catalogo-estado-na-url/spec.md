# Spec Delta

## Purpose

Define como busca, filtros, ordenação e página do Catálogo ficam na URL, para que recarregar a página ou navegar pelo histórico do navegador restaure exatamente o mesmo catálogo.

## ADDED Requirements

### Requirement: Estado do catálogo restaurado a partir da URL
O Catálogo SHALL manter busca, categoria, edição, ordem e página na URL, e SHALL restaurar a partir dela, ao carregar a página, os mesmos controles e os mesmos NFTs, na mesma ordem e na mesma página.

#### Scenario: filtros sobrevivem ao refresh
- **GIVEN** o catálogo com 48 NFTs, 12 por página
- **AND** o colecionador buscou "ape", filtrou a categoria "Arte" e ordenou por "menor preço"
- **WHEN** ele recarrega a página
- **THEN** a URL continua com busca "ape", categoria "Arte" e ordem "menor preço"
- **AND** o catálogo mostra os mesmos NFTs, na mesma ordem, na página 1

### Requirement: Mudança de filtro reinicia a paginação
Ao adicionar ou trocar um filtro, o Catálogo MUST voltar para a página 1, MUST combinar o novo filtro com os filtros já ativos e MUST refletir na URL a página 1 e todos os filtros ativos.

#### Scenario: mudar um filtro volta para a página 1
- **GIVEN** o colecionador está na página 3 do catálogo filtrado pela categoria "Arte"
- **WHEN** ele adiciona o filtro de edição "disponível"
- **THEN** o catálogo mostra a página 1 com os dois filtros combinados
- **AND** a URL tem página 1, categoria "Arte" e edição "disponível"

### Requirement: Histórico do navegador restaura o estado anterior
Cada mudança de estado do Catálogo SHALL gerar uma entrada no histórico do navegador, e voltar ou avançar SHALL restaurar o catálogo e a URL correspondentes àquela entrada.

#### Scenario: voltar no histórico restaura o filtro anterior
- **GIVEN** o colecionador filtrou a categoria "Arte" e depois trocou para a categoria "Música"
- **WHEN** ele usa o botão voltar do navegador
- **THEN** o catálogo volta a mostrar a categoria "Arte"
- **AND** a URL tem a categoria "Arte"
