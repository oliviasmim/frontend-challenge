import { useState } from 'react';
import { COLLECTIONS, NETWORKS, type NftListResponse } from '@kurio/contracts';
import { Button } from '../components/ui/button';
import { cn } from '../lib/cn';
import type { CatalogSearch } from './search';

interface Props {
  search: CatalogSearch;
  facets?: NftListResponse['facets'];
  onChange: (patch: Partial<CatalogSearch>) => void;
}

function FacetList({
  title, options, active, counts, onPick,
}: {
  title: string;
  options: { id: string; label: string }[];
  active?: string;
  counts?: Record<string, number>;
  onPick: (id?: string) => void;
}) {
  return (
    <>
      <h2 className="mb-2 mt-6 font-bold first:mt-0">{title}</h2>
      <ul className="space-y-1">
        {options.map((o) => {
          const on = active === o.id;
          return (
            <li key={o.id}>
              <button
                aria-pressed={on}
                onClick={() => onPick(on ? undefined : o.id)}
                className={cn(
                  'flex w-full justify-between rounded px-2 py-1 text-left',
                  on ? 'bg-accent/20 font-bold text-accent' : 'text-accent/80 hover:bg-surface-2',
                )}
              >
                <span>{on ? '✓ ' : ''}{o.label}</span>
                <span className="text-muted">({counts?.[o.id] ?? 0})</span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function Filters({ search, facets, onChange }: Props) {
  const [min, setMin] = useState(search.minPrice ?? '0.02');
  const [max, setMax] = useState(search.maxPrice ?? '12.30');
  return (
    <aside aria-label="Filtros" className="h-fit rounded-lg bg-surface p-4 text-sm">
      <FacetList
        title="Coleções"
        options={COLLECTIONS}
        active={search.collection}
        counts={facets?.collections}
        onPick={(id) => onChange({ collection: id as CatalogSearch['collection'] })}
      />

      <h2 className="mb-2 mt-6 font-bold">Faixa de preço</h2>
      <div className="space-y-2">
        <label className="block text-xs text-muted">
          Mínimo (ETH)
          <input type="range" min="0.02" max="12.30" step="0.01" value={min} onChange={(e) => setMin(e.target.value)} className="w-full accent-accent" />
        </label>
        <label className="block text-xs text-muted">
          Máximo (ETH)
          <input type="range" min="0.02" max="12.30" step="0.01" value={max} onChange={(e) => setMax(e.target.value)} className="w-full accent-accent" />
        </label>
        <p className="text-xs">Preço: {min} - {max} ETH</p>
        <Button className="!py-1" onClick={() => onChange({ minPrice: min, maxPrice: max })}>Aplicar</Button>
      </div>

      <FacetList
        title="Rede"
        options={NETWORKS}
        active={search.network}
        counts={facets?.networks}
        onPick={(id) => onChange({ network: id as CatalogSearch['network'] })}
      />
    </aside>
  );
}
