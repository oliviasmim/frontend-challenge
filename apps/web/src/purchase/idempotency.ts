import type { CartItem } from '@kurio/contracts';

const KEY = 'kurio:order-attempt';
interface Attempt { fingerprint: string; key: string; orderId?: string }

const fingerprint = (items: CartItem[]) =>
  JSON.stringify([...items].sort((a, b) => a.nftId.localeCompare(b.nftId)));

const read = (): Attempt | null => {
  try { return JSON.parse(sessionStorage.getItem(KEY) ?? 'null'); } catch { return null; }
};
const write = (a: Attempt | null) => {
  try {
    if (a) sessionStorage.setItem(KEY, JSON.stringify(a));
    else sessionStorage.removeItem(KEY);
  } catch { /* storage indisponível: a chave vale só nesta aba */ }
};

/** A mesma composição do carrinho reutiliza a mesma chave (ADR 0001). */
export function attemptFor(items: CartItem[]): Attempt {
  const fp = fingerprint(items);
  const cur = read();
  if (cur && cur.fingerprint === fp) return cur;
  const fresh = { fingerprint: fp, key: crypto.randomUUID() };
  write(fresh);
  return fresh;
}

export const rememberOrder = (items: CartItem[], orderId: string) =>
  write({ ...attemptFor(items), orderId });
