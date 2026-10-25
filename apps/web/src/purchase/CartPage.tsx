import { Link } from '@tanstack/react-router';
import { formatEth } from '@kurio/contracts';
import { NftArt } from '../components/NftArt';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { toApiError } from '../lib/api';
import { useNfts } from '../catalog/useNfts';
import { useCart, useQuote } from './useCart';

export function QuoteSummary() {
  const { data, isPending } = useQuote();
  if (isPending)
    return (
      <div aria-busy="true" aria-label="Carregando resumo" className="space-y-3 rounded-lg bg-surface p-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-5 w-full" />)}
      </div>
    );
  if (!data) return null;
  return (
    <dl className="h-fit space-y-2 rounded-lg bg-surface p-4 text-sm" aria-label="Resumo de valores">
      <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatEth(data.subtotal)} ETH</dd></div>
      <div className="flex justify-between"><dt>Desconto</dt><dd>{formatEth(data.discount)} ETH</dd></div>
      <div className="flex justify-between"><dt>Taxa de rede</dt><dd>{formatEth(data.networkFee)} ETH</dd></div>
      <div className="flex justify-between border-t border-line pt-2 font-bold text-accent">
        <dt>Total</dt><dd data-testid="quote-total">{formatEth(data.total)} ETH</dd>
      </div>
    </dl>
  );
}

export function CartPage() {
  const { cart, setQuantity, remove } = useCart();
  // O carrinho guarda só (nftId, quantidade); nome/arte vêm da listagem completa.
  const names = useNfts({ sort: 'name', page: 1 });
  const lookup = new Map((names.data?.items ?? []).map((n) => [n.id, n]));
  const items = cart.data?.items ?? [];
  const mutationError = setQuantity.error ? toApiError(setQuantity.error).message : null;

  return (
    <main className="mx-auto max-w-[1000px] px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Carrinho de NFTs</h1>
      {cart.isPending ? (
        <Skeleton className="h-32 w-full" />
      ) : items.length === 0 ? (
        <div className="rounded-lg bg-surface p-8 text-center">
          <p className="mb-3">Seu carrinho está vazio</p>
          <Link to="/" search={{ sort: 'recent', page: 1 }} className="text-accent underline">Explorar o catálogo</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div>
            {mutationError && <p role="alert" className="mb-3 text-danger">⚠ {mutationError}</p>}
            <ul className="space-y-3">
              {items.map((it) => {
                const nft = lookup.get(it.nftId);
                return (
                  <li key={it.nftId} className="flex flex-wrap items-center gap-4 rounded-lg bg-surface p-3" data-testid="cart-item">
                    {nft ? <NftArt nft={nft} className="h-16 w-16 rounded" /> : <Skeleton className="h-16 w-16" />}
                    <div className="min-w-32 flex-1 text-xs">
                      <p className="font-bold">{nft?.name ?? it.nftId}</p>
                      {nft && <p className="text-accent">{formatEth(nft.price)} ETH</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" aria-label="Diminuir quantidade" disabled={it.quantity <= 1} onClick={() => setQuantity.mutate({ nftId: it.nftId, quantity: it.quantity - 1 })}>−</Button>
                      <span aria-label="Quantidade" className="w-6 text-center">{it.quantity}</span>
                      <Button variant="outline" aria-label="Aumentar quantidade" onClick={() => setQuantity.mutate({ nftId: it.nftId, quantity: it.quantity + 1 })}>+</Button>
                    </div>
                    <Button variant="ghost" onClick={() => remove.mutate(it.nftId)} aria-label={`Remover ${nft?.name ?? it.nftId}`}>Remover</Button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="space-y-4">
            <QuoteSummary />
            <Link to="/checkout" className="block rounded-md bg-accent px-4 py-2 text-center text-xs font-bold text-accent-fg">
              IR PARA PAGAMENTO
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
