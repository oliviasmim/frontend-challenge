import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { NftListResponse } from '@kurio/contracts';
import { api } from '../lib/api';
import type { CatalogSearch } from './search';

/** A key deriva dos params; o `signal` cancela respostas obsoletas. */
export function useNfts(params: CatalogSearch) {
  return useQuery<NftListResponse>({
    queryKey: ['nfts', params],
    queryFn: ({ signal }) => api.get<NftListResponse>('/nfts', { params, signal }).then((r) => r.data),
    placeholderData: keepPreviousData,
    retry: 1,
    staleTime: 15_000,
  });
}
