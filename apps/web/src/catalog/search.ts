import { COLLECTIONS, NETWORKS, type CollectionId, type Network, type NftListQuery, type SortKey } from '@kurio/contracts';

export interface CatalogSearch {
  q?: string;
  collection?: CollectionId;
  network?: Network;
  minPrice?: string;
  maxPrice?: string;
  sort: SortKey;
  page: number;
}

const SORTS: SortKey[] = ['recent', 'price-asc', 'price-desc', 'name'];
const DEC = /^\d+(\.\d{1,18})?$/;
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

/** A URL é a fonte da verdade; valores inválidos voltam ao padrão. */
export function validateCatalogSearch(raw: Record<string, unknown>): CatalogSearch {
  const collection = str(raw.collection);
  const network = str(raw.network);
  const min = str(raw.minPrice);
  const max = str(raw.maxPrice);
  const page = Number(raw.page);
  const out: CatalogSearch = {
    sort: SORTS.includes(raw.sort as SortKey) ? (raw.sort as SortKey) : 'recent',
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
  const q = str(raw.q);
  if (q) out.q = q;
  if (collection && COLLECTIONS.some((c) => c.id === collection)) out.collection = collection as CollectionId;
  if (network && NETWORKS.some((n) => n.id === network)) out.network = network as Network;
  if (min && DEC.test(min)) out.minPrice = min;
  if (max && DEC.test(max)) out.maxPrice = max;
  return out;
}

export const toQuery = (s: CatalogSearch): NftListQuery => ({ ...s });
