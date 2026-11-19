import { http } from '@/lib/http'
import type { Carrinho, Cotacao, ItemCarrinho, Pedido, PedidoRequest } from './contratos'

export async function buscarCarrinho(signal?: AbortSignal): Promise<Carrinho> {
  const { data } = await http.get<Carrinho>('/cart', { signal })
  return data
}

export async function pedirCotacao(items: ItemCarrinho[], signal?: AbortSignal): Promise<Cotacao> {
  const { data } = await http.post<Cotacao>('/quotes', { items }, { signal })
  return data
}

export async function enviarPedido(body: PedidoRequest, idempotencyKey: string): Promise<Pedido> {
  const { data } = await http.post<Pedido>('/orders', body, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return data
}

export async function buscarPedido(orderId: string, signal?: AbortSignal): Promise<Pedido> {
  const { data } = await http.get<Pedido>(`/orders/${orderId}`, { signal })
  return data
}
