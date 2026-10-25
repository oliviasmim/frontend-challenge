import { getRouteApi } from '@tanstack/react-router';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { NftArt } from '../components/NftArt';
import { toApiError } from '../lib/api';
import { Filters } from './Filters';
import { NftCard } from './NftCard';
import { Pagination } from './Pagination';
import { useNfts } from './useNfts';
import type { CatalogSearch } from './search';

const route = getRouteApi('/');
const HERO_ART = { name: 'Emerald Ape #042', art: { bg: '#e9efd8', skin: '#7a4a2a', accent: '#1f6b46' } };

export function CatalogPage() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const { data, isPending, isError, error, refetch, isFetching } = useNfts(search);

  /** Qualquer mudança de filtro, busca ou ordenação reinicia a página. */
  const change = (patch: Partial<CatalogSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }) });

  return (
    <>
      <section className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <p className="text-xs text-muted">Bem-vindo à Kurio</p>
          <h1 className="my-4 text-3xl font-bold leading-tight md:text-4xl">SEJA DONO DO FUTURO DA ARTE DIGITAL</h1>
          <p className="mb-6 max-w-md text-xs text-muted">
            Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
          </p>
          <a href="#catalogo" className="inline-block rounded-md bg-accent px-5 py-2 text-xs font-bold text-accent-fg">EXPLORAR</a>
        </div>
        <NftArt nft={HERO_ART} className="mx-auto aspect-square w-full max-w-[420px] rounded-2xl" />
      </section>

      <section id="catalogo" className="mx-auto grid max-w-[1200px] gap-6 px-4 pb-16 md:grid-cols-[220px_1fr]">
        <Filters search={search} facets={data?.facets} onChange={change} />

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                change({ q: String(new FormData(e.currentTarget).get('q') ?? '').trim() || undefined });
              }}
            >
              <label className="sr-only-live" htmlFor="q">Buscar NFTs</label>
              <input id="q" name="q" key={search.q ?? ''} defaultValue={search.q ?? ''} placeholder="Buscar NFTs…" className="rounded-md border border-line bg-surface px-3 py-2" />
            </form>
            <label className="flex items-center gap-2">
              Ordenar por:
              <select
                value={search.sort}
                onChange={(e) => change({ sort: e.target.value as CatalogSearch['sort'] })}
                className="rounded-md border border-line bg-surface px-2 py-1"
              >
                <option value="recent">Listados recentemente</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="name">Nome</option>
              </select>
            </label>
          </div>

          <div aria-live="polite" className="sr-only-live">{data ? `${data.total} NFTs encontrados` : ''}</div>

          {isError ? (
            <div role="alert" className="rounded-lg bg-surface p-8 text-center">
              <p className="mb-3">{toApiError(error).message}</p>
              <Button onClick={() => refetch()}>Tentar novamente</Button>
            </div>
          ) : isPending ? (
            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3" aria-busy="true" aria-label="Carregando NFTs">
              {Array.from({ length: 9 }, (_, i) => (
                <li key={i} className="rounded-lg bg-surface p-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="mt-3 h-3 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-1/3" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                  <Skeleton className="mt-2 h-7 w-full" />
                </li>
              ))}
            </ul>
          ) : data.items.length === 0 ? (
            <div className="rounded-lg bg-surface p-8 text-center">
              <p className="mb-3">Nenhum NFT encontrado</p>
              <Button variant="outline" onClick={() => navigate({ search: { sort: 'recent', page: 1 } })}>Limpar filtros</Button>
            </div>
          ) : (
            <>
              <ul className={`grid grid-cols-2 gap-4 lg:grid-cols-3 ${isFetching ? 'opacity-70' : ''}`}>
                {data.items.map((n) => <NftCard key={n.id} nft={n} />)}
              </ul>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPage={(page) => navigate({ search: (p) => ({ ...p, page }) })}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
