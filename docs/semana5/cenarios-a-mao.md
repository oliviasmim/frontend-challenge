# Semana 5: cenários escritos antes de abrir o agente

Feature: **busca e filtros do catálogo na URL** (contexto **Catálogo**, `src/catalogo/`).

Regra em uma frase (README §3 "Catálogo e detalhe"): busca, filtros, ordenação e página ficam
na URL. Recarregar a página ou usar voltar/avançar do navegador restaura exatamente o mesmo
catálogo. Mudar um filtro volta para a página 1.

> Escritos sem o agente, com os termos do `GLOSSARIO.md` e números concretos. Este arquivo
> é a referência para o `DIFERENCAS.md`: compara o que eu escrevi com o que a ferramenta devolveu.

```gherkin
Cenário: filtros sobrevivem ao refresh
  Dado o catálogo com 48 NFTs, 12 por página
  E o colecionador buscou "ape", filtrou a categoria "Arte" e ordenou por "menor preço"
  Quando ele recarrega a página
  Então a URL continua com busca "ape", categoria "Arte" e ordem "menor preço"
  E o catálogo mostra os mesmos NFTs, na mesma ordem, na página 1

Cenário: mudar um filtro volta para a página 1
  Dado o colecionador está na página 3 do catálogo filtrado pela categoria "Arte"
  Quando ele adiciona o filtro de edição "disponível"
  Então o catálogo mostra a página 1 com os dois filtros combinados
  E a URL tem página 1, categoria "Arte" e edição "disponível"

Cenário: voltar no histórico restaura o filtro anterior
  Dado o colecionador filtrou a categoria "Arte" e depois trocou para a categoria "Música"
  Quando ele usa o botão voltar do navegador
  Então o catálogo volta a mostrar a categoria "Arte"
  E a URL tem a categoria "Arte"
```
