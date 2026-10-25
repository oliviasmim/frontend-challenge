import { http, HttpResponse, delay } from 'msw';
import {
  IDEMPOTENCY_HEADER, NETWORK_FEE_BPS, addEth, cmpEth, mulEth, pctEth,
  type ApiError, type CartItem, type CreateOrderBody, type Nft, type NftListResponse,
  type Order, type Quote, type SortKey,
} from '@kurio/contracts';
import { PAGE_SIZE } from './fixtures';
import { getState, resetState, update, type MockState, type Scenario } from './store';

const err = (status: number, e: ApiError) => HttpResponse.json(e, { status });

async function latency(s: MockState) {
  await delay(s.latencyMs + (s.scenario === 'slow' ? 2500 : 0));
}

function sortNfts(list: Nft[], sort: SortKey): Nft[] {
  const l = [...list];
  if (sort === 'price-asc') return l.sort((a, b) => cmpEth(a.price, b.price));
  if (sort === 'price-desc') return l.sort((a, b) => cmpEth(b.price, a.price));
  if (sort === 'name') return l.sort((a, b) => a.name.localeCompare(b.name));
  return l.sort((a, b) => b.listedAt.localeCompare(a.listedAt));
}

function quoteFor(s: MockState, items: CartItem[]): Quote {
  const lines = items.map((it) => {
    const nft = s.nfts.find((n) => n.id === it.nftId)!;
    return {
      nftId: nft.id, name: nft.name, unitPrice: nft.price, quantity: it.quantity,
      lineTotal: mulEth(nft.price, it.quantity),
    };
  });
  const subtotal = lines.reduce((acc, l) => addEth(acc, l.lineTotal), '0');
  const networkFee = pctEth(subtotal, NETWORK_FEE_BPS);
  return { lines, subtotal, discount: '0', networkFee, total: addEth(subtotal, networkFee) };
}

const fingerprint = (b: CreateOrderBody) =>
  JSON.stringify({
    i: [...b.items].sort((a, c) => a.nftId.localeCompare(c.nftId)),
    w: b.wallet, n: b.network,
  });

export const handlers = [
  http.get('*/api/nfts', async ({ request }) => {
    const s = getState();
    await latency(s);
    if (s.scenario === 'catalog-error')
      return err(503, { code: 'transient_failure', message: 'Catálogo indisponível' });
    const u = new URL(request.url).searchParams;
    const q = u.get('q')?.toLowerCase();
    const collection = u.get('collection');
    const network = u.get('network');
    const min = u.get('minPrice');
    const max = u.get('maxPrice');
    const page = Math.max(1, Number(u.get('page') ?? 1) || 1);
    const sort = (u.get('sort') ?? 'recent') as SortKey;

    const base = s.scenario === 'empty' ? [] : s.nfts;
    const filtered = base.filter((n) =>
      (!q || n.name.toLowerCase().includes(q)) &&
      (!collection || n.collection === collection) &&
      (!network || n.network === network) &&
      (!min || cmpEth(n.price, min) >= 0) &&
      (!max || cmpEth(n.price, max) <= 0));
    const sorted = sortNfts(filtered, sort);
    const facets: NftListResponse['facets'] = { collections: {}, networks: {} };
    for (const n of base) {
      facets.collections[n.collection] = (facets.collections[n.collection] ?? 0) + 1;
      facets.networks[n.network] = (facets.networks[n.network] ?? 0) + 1;
    }
    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const body: NftListResponse = {
      items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
      page, pageSize: PAGE_SIZE, total: sorted.length, totalPages, facets,
    };
    return HttpResponse.json(body);
  }),

  http.get('*/api/nfts/:id', async ({ params }) => {
    const s = getState();
    await latency(s);
    const nft = s.nfts.find((n) => n.id === params.id);
    return nft ? HttpResponse.json(nft) : err(404, { code: 'not_found', message: 'NFT não encontrado' });
  }),

  http.get('*/api/cart', async () => {
    const s = getState();
    await latency(s);
    return HttpResponse.json(s.cart);
  }),

  http.put('*/api/cart/items/:nftId', async ({ params, request }) => {
    const s = getState();
    await latency(s);
    const { quantity } = (await request.json()) as { quantity: number };
    const nft = s.nfts.find((n) => n.id === params.nftId);
    if (!nft) return err(404, { code: 'not_found', message: 'NFT não encontrado' });
    if (!Number.isInteger(quantity) || quantity < 1)
      return err(422, {
        code: 'validation_error', message: 'Quantidade inválida', fields: { quantity: 'Use um inteiro ≥ 1' },
      });
    if (quantity > nft.available)
      return err(409, { code: 'availability_conflict', message: `Só restam ${nft.available} exemplares` });
    const next = update((st) => {
      const it = st.cart.items.find((i) => i.nftId === nft.id);
      if (it) it.quantity = quantity;
      else st.cart.items.push({ nftId: nft.id, quantity });
    });
    return HttpResponse.json(next.cart);
  }),

  http.delete('*/api/cart/items/:nftId', async ({ params }) => {
    await latency(getState());
    const next = update((st) => {
      st.cart.items = st.cart.items.filter((i) => i.nftId !== params.nftId);
    });
    return HttpResponse.json(next.cart);
  }),

  http.get('*/api/cart/quote', async () => {
    const s = getState();
    await latency(s);
    return HttpResponse.json(quoteFor(s, s.cart.items));
  }),

  http.post('*/api/orders', async ({ request }) => {
    const s = getState();
    await latency(s);
    const key = request.headers.get(IDEMPOTENCY_HEADER);
    if (!key) return err(422, { code: 'validation_error', message: 'Idempotency-Key obrigatório' });
    const body = (await request.json()) as CreateOrderBody;
    const fp = fingerprint(body);

    const prior = s.idempotency[key];
    if (prior) {
      if (prior.fingerprint !== fp)
        return err(409, { code: 'idempotency_conflict', message: 'Chave já usada com conteúdo diferente' });
      return HttpResponse.json(s.orders[prior.orderId], { headers: { 'Idempotent-Replayed': 'true' } });
    }

    const fields: Record<string, string> = {};
    if (!body.collectorName?.trim()) fields.collectorName = 'Informe seu nome';
    if (!/^\S+@\S+\.\S+$/.test(body.email ?? '')) fields.email = 'E-mail inválido';
    if (!body.wallet?.trim()) fields.wallet = 'Informe a carteira';
    if (Object.keys(fields).length)
      return err(422, { code: 'validation_error', message: 'Dados inválidos', fields });

    for (const it of body.items) {
      const nft = s.nfts.find((n) => n.id === it.nftId);
      if (!nft || it.quantity > nft.available)
        return err(409, { code: 'availability_conflict', message: `${nft?.name ?? it.nftId} esgotado` });
    }

    const declined = s.scenario === 'payment-declined';
    let order!: Order;
    update((st) => {
      st.seq += 1;
      order = {
        id: `ord-${String(st.seq).padStart(4, '0')}`,
        status: declined ? 'declined' : 'confirmed',
        createdAt: new Date(Date.UTC(2026, 9, 1, 12, st.seq)).toISOString(),
        body, quote: quoteFor(st, body.items),
        txHash: `0x${(st.seq * 7919).toString(16).padStart(8, '0')}${'ab'.repeat(28)}`,
      };
      st.orders[order.id] = order;
      st.idempotency[key] = { fingerprint: fp, orderId: order.id };
      if (!declined) {
        for (const it of body.items) {
          const nft = st.nfts.find((n) => n.id === it.nftId)!;
          nft.available -= it.quantity;
        }
        // remove do carrinho apenas itens e quantidades comprados
        st.cart.items = st.cart.items
          .map((c) => ({
            ...c, quantity: c.quantity - (body.items.find((b) => b.nftId === c.nftId)?.quantity ?? 0),
          }))
          .filter((c) => c.quantity > 0);
      }
    });

    if (s.scenario === 'order-timeout-after-create' && !s.timeoutConsumed) {
      update((st) => { st.timeoutConsumed = true; });
      // o pedido existe, mas a resposta nunca chega: o cliente estoura o timeout
      await delay('infinite');
    }
    return HttpResponse.json(order, { status: 201 });
  }),

  http.get('*/api/orders/:id', async ({ params }) => {
    const s = getState();
    await latency(s);
    const order = s.orders[params.id as string];
    return order ? HttpResponse.json(order) : err(404, { code: 'not_found', message: 'Pedido não encontrado' });
  }),

  /** Controle de cenários (somente mocks). */
  http.post('*/api/__mocks/reset', async ({ request }) => {
    const { scenario } = (await request.json().catch(() => ({}))) as { scenario?: Scenario };
    resetState(scenario ?? 'default');
    return HttpResponse.json({ ok: true });
  }),
  http.get('*/api/__mocks/orders', () => HttpResponse.json(Object.values(getState().orders))),
];
