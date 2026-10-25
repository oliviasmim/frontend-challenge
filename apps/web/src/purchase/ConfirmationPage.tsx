import { Link, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { formatEth, type Order } from '@kurio/contracts';
import { Skeleton } from '../components/ui/skeleton';
import { api, toApiError } from '../lib/api';

export function ConfirmationPage() {
  const { orderId } = useParams({ from: '/order/$orderId' });
  const q = useQuery({
    queryKey: ['order', orderId],
    queryFn: ({ signal }) => api.get<Order>(`/orders/${orderId}`, { signal }).then((r) => r.data),
  });

  if (q.isPending)
    return <main className="mx-auto max-w-[600px] px-4 py-10"><Skeleton className="h-48 w-full" /></main>;
  if (q.isError)
    return <main role="alert" className="mx-auto max-w-[600px] px-4 py-10">⚠ {toApiError(q.error).message}</main>;

  const o = q.data;
  if (o.status === 'declined')
    return (
      <main className="mx-auto max-w-[600px] px-4 py-10" role="alert">
        <h1 className="mb-3 text-2xl font-bold text-danger">Pagamento recusado</h1>
        <p className="mb-4">Seus itens continuam no carrinho.</p>
        <Link to="/cart" className="text-accent underline">Voltar ao carrinho</Link>
      </main>
    );
  if (o.status === 'pending')
    return <main className="mx-auto max-w-[600px] px-4 py-10">Pedido {o.id} em processamento…</main>;

  return (
    <main className="mx-auto max-w-[600px] px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">Pedido confirmado ✓</h1>
      <p className="mb-6 text-xs text-muted">
        Pedido <span data-testid="order-id">{o.id}</span> · transação <span className="break-all">{o.txHash}</span>
      </p>
      <ul className="mb-4 space-y-1 text-sm">
        {o.quote.lines.map((l) => (
          <li key={l.nftId} className="flex justify-between">
            <span>{l.quantity}× {l.name}</span><span>{formatEth(l.lineTotal)} ETH</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-1 rounded-lg bg-surface p-4 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatEth(o.quote.subtotal)} ETH</dd></div>
        <div className="flex justify-between"><dt>Taxa de rede</dt><dd>{formatEth(o.quote.networkFee)} ETH</dd></div>
        <div className="flex justify-between font-bold text-accent">
          <dt>Total</dt><dd data-testid="receipt-total">{formatEth(o.quote.total)} ETH</dd>
        </div>
      </dl>
    </main>
  );
}
