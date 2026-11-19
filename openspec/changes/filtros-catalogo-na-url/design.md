# Design

## Context

Ver proposal.md (Why). Hoje o repositório não tem código: só `README.md`, `GLOSSARIO.md` e `docs/`. Esta change mexe apenas em `src/catalogo/` e parte do princípio de que a change de fundação do app, separada e prévia, já está aplicada. A fundação deve entregar:

- router raiz do TanStack Router que exporte a rota raiz, para o Catálogo se pendurar via `getParentRoute`, e uma árvore de rotas que aceite rotas vindas dos contextos;
- `QueryClientProvider` montado e uma instância Axios compartilhada (baseURL da API simulada);
- MSW ativado por configuração, agregando os handlers que cada contexto exporta;
- Playwright configurado para Chromium (desktop e mobile), com `testMatch` que inclua `src/**/e2e/**/*.spec.ts` e app servido com mocks.

Se algum desses pontos de integração tiver outro nome ou formato na fundação, a change se adapta a ele sem mudar a spec.

A spec `catalogo-estado-na-url` é a fonte dos requisitos. Este documento não os repete.

## Goals / Non-Goals

**Goals:**
- A URL é a única fonte do estado do Catálogo; nenhum estado de filtro duplicado em `useState`/store.
- Parâmetros de busca tipados de ponta a ponta: URL → schema → query key → parâmetros Axios → handler MSW.
- Ordem determinística, para que "mesmos NFTs, na mesma ordem" seja verificável.

**Non-Goals:**
- Resultado vazio, falha da API, respostas fora de ordem, valores inválidos na URL e skeletons. Ficam para uma próxima change, com cenários escritos pelo dono.
- Tempo real (`nft.updated`) no catálogo.
- Detalhe do NFT, destaques e favoritos.
- Fidelidade visual fina ao Figma, além do necessário para os controles serem utilizáveis e acessíveis.

## Decisions

### 1. Rota code-based dentro de `src/catalogo/`, no caminho `/`
O glossário põe a tela Início no contexto Catálogo, e o README §3 lista catálogo, busca, filtros e ordenação na tela Início. Por isso o Catálogo é a rota `/`. A rota é declarada em `src/catalogo/rota.tsx` com `createRoute({ getParentRoute: () => rootRoute, path: '/' , validateSearch, ... })` e exportada para a fundação registrar.
- *Alternativa:* rotas file-based em `src/routes/`. Rejeitada porque obriga a mexer fora de `src/catalogo/`.
- *Alternativa:* caminho `/catalogo`. Rejeitada porque o README trata o catálogo como parte do Início.

### 2. Parâmetros de busca: nomes em pt-BR, valores como slug
Aprovado pelo dono:

| Parâmetro | Valores | Exemplo |
| --- | --- | --- |
| `busca` | texto livre | `ape` |
| `categoria` | slug da categoria | `arte`, `musica` |
| `edicao` | slug do estado da edição | `disponivel` |
| `ordem` | slug da ordenação | `menor-preco` |
| `pagina` | inteiro ≥ 1 | `1` |

Exemplo: `/?busca=ape&categoria=arte&ordem=menor-preco&pagina=1`. Os rótulos visíveis ("Arte", "Música", "disponível", "menor preço") vêm de um mapa slug → rótulo em `src/catalogo/`. Os testes verificam a URL pelo slug e a tela pelo rótulo.
- Só entram os valores que os cenários exigem: `arte`, `musica`, `disponivel`, `menor-preco`. Outras categorias e ordenações vêm com os dados da fixture e de próximas changes, sem regra nova nesta.
- *Alternativa:* rótulos crus na URL (`categoria=Arte`). Rejeitada por acento e espaço (`Música`, `menor preço`), que geram URL frágil.

### 3. `validateSearch` escrito à mão, sem nova dependência
Uma função em `src/catalogo/busca-na-url.ts` converte o objeto de busca bruto no tipo `BuscaCatalogo` (`pagina` vira número e campos ausentes ficam `undefined`). Assim não é preciso adicionar Zod ou o adapter ao `package.json`, que fica fora de `src/catalogo/`. O tratamento de valores inválidos está nos Non-Goals: nesta change, o mínimo é não quebrar, ignorando o que não reconhece e usando `pagina = 1` como padrão.
- *Alternativa:* `@tanstack/zod-adapter`. Fica para a fundação decidir; trocar depois não muda a spec.

### 4. Toda mudança de estado é um `navigate` com push e `pagina: 1` explícita
Os controles chamam `navigate({ search: (prev) => ({ ...prev, <campo>: valor, pagina: 1 }) })`. O padrão do TanStack Router é push, então cada mudança cria uma entrada no histórico, o que satisfaz o cenário do voltar. Só a paginação altera `pagina` sem zerar.
- `pagina=1` sempre aparece explícita depois de uma mudança, como pede o cenário 2.
- **Busca de texto:** grava na URL ao enviar (Enter ou botão), não a cada tecla. Isso evita uma entrada no histórico por caractere. Um campo local guarda só o rascunho do texto e é ressincronizado com `busca` quando a URL muda (voltar/avançar).
- *Alternativa:* debounce com `replace: true`. Rejeitada porque, nesse caso, voltar não restauraria a busca anterior de forma previsível.

### 5. Consulta derivada só da URL
`useCatalogoNfts(busca: BuscaCatalogo)` usa `useQuery({ queryKey: ['catalogo', 'nfts', busca], queryFn: ({ signal }) => http.get('/nfts', { params: {...busca, porPagina: 12}, signal }) })`. O componente lê `Route.useSearch()` e passa o resultado. Como a chave é o próprio estado da URL, refresh e histórico refazem ou reaproveitam a mesma consulta, sem sincronização manual. O `signal` já deixa o caminho pronto para cancelamento, mas tratar respostas fora de ordem continua nos Non-Goals.
- `porPagina` é fixo em 12 e não vai para a URL, porque nenhum cenário pede que o usuário mude esse valor.

### 6. Contrato e mock do catálogo dentro de `src/catalogo/`
- `src/catalogo/api/contrato.ts`: tipos `NftResumo` (id, nome, categoria, edição/disponibilidade, `precoVigente` como string decimal em ETH) e `PaginaDeNfts` (`itens`, `pagina`, `porPagina`, `total`).
- `src/catalogo/mocks/fixture-nfts.ts`: 48 NFTs determinísticos, sem aleatoriedade. Inclui nomes com "ape" em categorias diferentes, NFTs de "Arte" suficientes para ter pelo menos 3 páginas, NFTs de "Música", e edições disponíveis e não disponíveis dentro de "Arte".
- `src/catalogo/mocks/handlers.ts`: `GET /nfts` filtra por `busca` (substring sem diferença de maiúsculas), `categoria` e `edicao`, ordena e pagina. `menor-preco` compara as strings decimais sem converter para `number` (ex.: escala para `BigInt`), com **desempate por `id`** para manter a ordem estável entre requisições.

### 7. Testes E2E em `src/catalogo/e2e/`
Um arquivo `estado-na-url.spec.ts` com exatamente os três cenários. Os testes interagem pela UI, usando papéis e labels acessíveis, e checam a URL (`page.url()` / `expect(page).toHaveURL`) e a lista renderizada. Usam `page.reload()` e `page.goBack()` de verdade e passam pelo handler MSW. Para "mesmos NFTs, na mesma ordem", a lista de nomes é capturada antes e depois do refresh e as duas são comparadas.

## Risks / Trade-offs

- [A fundação ainda não existe e pode expor pontos de integração diferentes] → A tarefa 1 confere esses pontos antes de começar. Ajustes de nome ficam nos imports, sem mudar a spec.
- [Busca só gravada no envio pode surpreender quem espera filtro "ao digitar"] → Escolha deliberada a favor do histórico limpo. Se o dono quiser busca ao digitar, isso vira uma próxima change com cenário próprio.
- [Valores inválidos na URL ficam sem regra definida] → A conversão é tolerante (ignora o desconhecido, `pagina` padrão 1) e não quebra. O comportamento oficial fica para a próxima change.
- [Comparar preços como string pode errar a ordem] → Comparação decimal exata no handler, mais um cenário E2E que confere a ordem antes e depois do refresh.
