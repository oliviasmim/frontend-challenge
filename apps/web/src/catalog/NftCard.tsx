import { formatEth, type Nft } from '@kurio/contracts';
import { NftArt } from '../components/NftArt';
import { Button } from '../components/ui/button';
import { useCart } from '../purchase/useCart';

export function NftCard({ nft }: { nft: Nft }) {
  const { quantityOf, setQuantity } = useCart();
  const inCart = quantityOf(nft.id);
  const soldOut = nft.available === 0;
  return (
    <li className="rounded-lg bg-surface p-3" data-testid="nft-card">
      <NftArt nft={nft} className="aspect-square w-full rounded-lg" />
      <h3 className="mt-3 text-xs">{nft.name}</h3>
      <p className="text-sm font-bold text-accent">
        {formatEth(nft.price)} ETH
        {nft.oldPrice && <span className="ml-2 font-normal text-muted line-through">{formatEth(nft.oldPrice)} ETH</span>}
      </p>
      <p className="text-xs text-muted">{soldOut ? 'Edição esgotada' : `${nft.available} disponíveis`}</p>
      <Button
        variant="outline"
        className="mt-2 w-full !py-1"
        disabled={soldOut || setQuantity.isPending}
        onClick={() => setQuantity.mutate({ nftId: nft.id, quantity: inCart + 1 })}
        aria-label={`Adicionar ${nft.name} ao carrinho`}
      >
        {inCart ? `No carrinho (${inCart}) · +1` : 'Adicionar'}
      </Button>
    </li>
  );
}
