import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Cart, Quote } from '@kurio/contracts';
import { api } from '../lib/api';

export const cartKey = ['cart'] as const;
export const quoteKey = ['quote'] as const;

export function useCart() {
  const qc = useQueryClient();
  const cart = useQuery({
    queryKey: cartKey,
    queryFn: ({ signal }) => api.get<Cart>('/cart', { signal }).then((r) => r.data),
  });

  const onDone = (data: Cart) => {
    qc.setQueryData(cartKey, data);
    void qc.invalidateQueries({ queryKey: quoteKey });
  };

  const setQuantity = useMutation({
    mutationFn: ({ nftId, quantity }: { nftId: string; quantity: number }) =>
      api.put<Cart>(`/cart/items/${nftId}`, { quantity }).then((r) => r.data),
    onSuccess: onDone,
  });
  const remove = useMutation({
    mutationFn: (nftId: string) => api.delete<Cart>(`/cart/items/${nftId}`).then((r) => r.data),
    onSuccess: onDone,
  });

  const count = cart.data?.items.reduce((n, i) => n + i.quantity, 0) ?? 0;
  const quantityOf = (id: string) => cart.data?.items.find((i) => i.nftId === id)?.quantity ?? 0;
  return { cart, count, quantityOf, setQuantity, remove };
}

export function useQuote() {
  return useQuery({
    queryKey: quoteKey,
    queryFn: ({ signal }) => api.get<Quote>('/cart/quote', { signal }).then((r) => r.data),
  });
}
