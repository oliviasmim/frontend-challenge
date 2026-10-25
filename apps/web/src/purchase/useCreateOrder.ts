import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IDEMPOTENCY_HEADER, type CartItem, type CreateOrderBody, type Order } from '@kurio/contracts';
import { api } from '../lib/api';
import { attemptFor, rememberOrder } from './idempotency';
import { cartKey, quoteKey } from './useCart';

const TIMEOUT = Number(import.meta.env.VITE_ORDER_TIMEOUT_MS ?? 8000);

/** Reenvio reutiliza a chave da tentativa: o servidor devolve o mesmo pedido. */
export function useCreateOrder(items: CartItem[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: Omit<CreateOrderBody, 'items'>) => {
      const { key } = attemptFor(items);
      return api
        .post<Order>('/orders', { ...form, items }, { headers: { [IDEMPOTENCY_HEADER]: key }, timeout: TIMEOUT })
        .then((r) => r.data);
    },
    onSuccess: (order) => {
      rememberOrder(items, order.id);
      qc.setQueryData(['order', order.id], order);
      void qc.invalidateQueries({ queryKey: cartKey });
      void qc.invalidateQueries({ queryKey: quoteKey });
    },
  });
}
