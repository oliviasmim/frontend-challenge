# Tasks

## 1. Pré-requisito: fundação do app

- [ ] 1.1 Confirmar que a change de fundação está aplicada e verificar que existem: rota raiz exportada, `QueryClientProvider` montado, instância Axios compartilhada, agregação de handlers MSW por contexto e Playwright com `testMatch` cobrindo `src/**/e2e/**/*.spec.ts`. Se faltar algo, parar e avisar o dono, sem criar nada fora de `src/catalogo/`.

## 2. Contrato e mocks do catálogo

- [ ] 2.1 Criar `src/catalogo/api/contrato.ts` com `NftResumo`, `PaginaDeNfts` e `BuscaCatalogo` (`busca`, `categoria`, `edicao`, `ordem`, `pagina`), com preço como string decimal, e verificar que a checagem de tipos passa.
- [ ] 2.2 Criar `src/catalogo/mocks/fixture-nfts.ts` com 48 NFTs determinísticos, incluindo nomes com "ape", categorias "Arte" e "Música", pelo menos 3 páginas de "Arte" (≥ 25 NFTs) e edições disponíveis e não disponíveis dentro de "Arte". Verificar as contagens com `satisfies`/asserções no próprio arquivo e com a checagem de tipos.
- [ ] 2.3 Criar `src/catalogo/mocks/handlers.ts` com `GET /nfts` (filtro por `busca`, `categoria`, `edicao`; ordem `menor-preco` com comparação decimal exata e desempate por `id`; paginação com `porPagina`), exportar para a fundação, e verificar com um teste Playwright em `src/catalogo/e2e/handler-nfts.spec.ts` que faz `fetch` pela página. O teste confere que `categoria=arte&pagina=3` retorna a página 3 e que `ordem=menor-preco` vem em ordem crescente.

## 3. Rota, URL e consulta

- [ ] 3.1 Criar `src/catalogo/busca-na-url.ts` com `validarBuscaCatalogo` (converte `pagina` para inteiro ≥ 1 com padrão 1, ignora valores desconhecidos) e o mapa slug → rótulo (`arte`→"Arte", `musica`→"Música", `disponivel`→"disponível", `menor-preco`→"menor preço"). Verificar com a checagem de tipos.
- [ ] 3.2 Criar `src/catalogo/consultas.ts` com `useCatalogoNfts(busca)` (query key `['catalogo','nfts', busca]`, Axios com `params` + `porPagina: 12` + `signal`) e verificar com a checagem de tipos.
- [ ] 3.3 Criar `src/catalogo/rota.tsx` (rota `/` com `validateSearch`) e `src/catalogo/PaginaCatalogo.tsx`, que lê `Route.useSearch()` e lista os NFTs, registrar a rota na árvore da fundação, e verificar abrindo diretamente `/?categoria=arte&pagina=3` no navegador com mocks: aparecem 12 NFTs de "Arte" da página 3.

## 4. Controles e cenários de aceite

- [ ] 4.1 Criar os controles em `src/catalogo/componentes/` (busca com envio, seletor de categoria, filtro de edição, seletor de ordem, paginação), todos com label acessível. Cada mudança faz `navigate` com push e `pagina: 1`, só a paginação muda `pagina` sem zerar, e o rascunho da busca se ressincroniza quando a URL muda. Verificar manualmente que cada controle altera a URL e cria uma entrada no histórico.
- [ ] 4.2 Escrever em `src/catalogo/e2e/estado-na-url.spec.ts` o cenário "filtros sobrevivem ao refresh" e verificar que passa no Chromium desktop e mobile.
- [ ] 4.3 Escrever no mesmo arquivo o cenário "mudar um filtro volta para a página 1" e verificar que passa no Chromium desktop e mobile.
- [ ] 4.4 Escrever no mesmo arquivo o cenário "voltar no histórico restaura o filtro anterior" e verificar que passa no Chromium desktop e mobile.

## 5. Verificação integrada

- [ ] 5.1 Rodar a checagem de tipos, o lint e a suíte Playwright completa e verificar que tudo passa. Confirmar com `git status` que só `src/catalogo/` (e esta change em `openspec/`) foi alterado.
- [ ] 5.2 Rodar `openspec validate filtros-catalogo-na-url --strict` e verificar que passa.

## Workflow follow-up

- Arquivar a change depois da revisão do dono, para criar a spec `openspec/specs/catalogo-estado-na-url/`.
- Abrir a próxima change do Catálogo para resultado vazio, falhas, respostas fora de ordem e valores inválidos na URL, com cenários escritos pelo dono.
