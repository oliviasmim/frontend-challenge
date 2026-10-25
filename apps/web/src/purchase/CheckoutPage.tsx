import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { NETWORKS, type CreateOrderBody, type Network } from '@kurio/contracts';
import { Button } from '../components/ui/button';
import { Field } from '../components/ui/input';
import { toApiError } from '../lib/api';
import { QuoteSummary } from './CartPage';
import { useCart } from './useCart';
import { useCreateOrder } from './useCreateOrder';

type Form = Omit<CreateOrderBody, 'items'>;

function validate(f: Form): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.collectorName.trim()) e.collectorName = 'Informe seu nome';
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'E-mail inválido';
  if (!f.wallet.trim()) e.wallet = 'Informe o endereço da carteira';
  return e;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const items = cart.data?.items ?? [];
  const order = useCreateOrder(items);
  const [form, setForm] = useState<Form>({ collectorName: '', email: '', wallet: '', network: 'ethereum' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState(false);
  /** Guarda síncrona: dois cliques no mesmo tick não esperam o re-render de `isPending`. */
  const inFlight = useRef(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const review = (e: FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    setReviewing(Object.keys(v).length === 0);
  };

  const confirm = () => {
    if (inFlight.current) return;
    inFlight.current = true;
    order.mutate(form, {
      onSuccess: (o) => navigate({ to: '/order/$orderId', params: { orderId: o.id } }),
      onError: (err) => setErrors(toApiError(err).fields ?? {}),
      onSettled: () => { inFlight.current = false; },
    });
  };

  if (cart.isSuccess && items.length === 0 && !order.isSuccess)
    return (
      <main className="mx-auto max-w-[600px] px-4 py-10 text-center">
        <p className="mb-3">Seu carrinho está vazio.</p>
        <Link to="/" search={{ sort: 'recent', page: 1 }} className="text-accent underline">Voltar ao catálogo</Link>
      </main>
    );

  const apiErr = order.error ? toApiError(order.error) : null;

  return (
    <main className="mx-auto grid max-w-[1000px] gap-6 px-4 py-10 md:grid-cols-[1fr_320px]">
      <section>
        <h1 className="mb-6 text-2xl font-bold">Pagamento</h1>
        <form onSubmit={review} noValidate className="space-y-4">
          <Field label="Nome do colecionador" value={form.collectorName} error={errors.collectorName} onChange={(e) => set('collectorName', e.target.value)} />
          <Field label="E-mail" type="email" value={form.email} error={errors.email} onChange={(e) => set('email', e.target.value)} />
          <Field label="Endereço da carteira" value={form.wallet} error={errors.wallet} onChange={(e) => set('wallet', e.target.value)} />
          <div className="flex flex-col gap-1">
            <label htmlFor="network" className="text-xs text-muted">Rede</label>
            <select id="network" value={form.network} onChange={(e) => set('network', e.target.value as Network)} className="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm">
              {NETWORKS.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>
          {!reviewing && <Button type="submit">Revisar pedido</Button>}
        </form>

        {reviewing && (
          <div className="mt-6 space-y-3 rounded-lg bg-surface p-4 text-sm" aria-label="Revisão do pedido">
            <p>Confira os dados e o total ao lado antes de confirmar.</p>
            {apiErr && (
              <div role="alert" className="text-danger">
                ⚠ {apiErr.message}{apiErr.code === 'transient_failure' && ' Seus itens foram preservados.'}
              </div>
            )}
            <Button onClick={confirm} disabled={order.isPending}>
              {order.isPending ? 'Processando…' : apiErr ? 'Tentar novamente' : 'Confirmar compra'}
            </Button>
            <Button variant="ghost" onClick={() => setReviewing(false)} disabled={order.isPending}>Editar dados</Button>
          </div>
        )}
      </section>
      <QuoteSummary />
    </main>
  );
}
