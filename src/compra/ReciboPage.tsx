import { useQuery } from '@tanstack/react-query'
import { formatEth } from '@/lib/eth'
import { buscarPedido } from './api'

export function ReciboPage({ pedidoId }: { pedidoId: string }) {
  const pedido = useQuery({ queryKey: ['pedido', pedidoId], queryFn: ({ signal }) => buscarPedido(pedidoId, signal) })

  if (pedido.isPending) return <main className="p-10" aria-busy="true">Carregando pedido…</main>
  if (pedido.isError) return <main className="p-10" role="alert">Não foi possível carregar o pedido.</main>

  const p = pedido.data
  // A confirmação só aparece para pedido efetivamente confirmado na simulação (README §3).
  if (p.status !== 'confirmado') {
    return <main className="p-10">Pedido {p.status}.</main>
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-semibold">Pedido confirmado</h1>
      <p className="text-sm text-zinc-400">Transação {p.transactionRef}</p>
      <section aria-label="Itens do pedido" className="rounded-xl bg-zinc-800 p-4">
        <ul className="flex flex-col gap-2">
          {p.lines.map((l) => (
            <li key={l.editionId} className="flex justify-between" data-testid={`recibo-${l.editionId}`}>
              <span>
                {l.name} × {l.quantity}
              </span>
              <span>{formatEth(l.unitPrice)}</span>
            </li>
          ))}
        </ul>
      </section>
      <dl className="grid grid-cols-2 rounded-xl bg-zinc-800 p-4 text-sm">
        <dt>Taxa de rede</dt>
        <dd className="text-right">{formatEth(p.networkFee)}</dd>
        <dt className="font-semibold">Total</dt>
        <dd className="text-right font-semibold" data-testid="recibo-total">
          {formatEth(p.total)}
        </dd>
      </dl>
    </main>
  )
}
