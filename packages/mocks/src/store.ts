import type { Cart, Nft, Order } from '@kurio/contracts';
import { buildNfts } from './fixtures';

export type Scenario =
  | 'default' | 'empty' | 'catalog-error' | 'slow'
  | 'order-timeout-after-create' | 'payment-declined';

export interface MockState {
  scenario: Scenario;
  /** latência base em ms; "slow" soma 2500 */
  latencyMs: number;
  nfts: Nft[];
  cart: Cart;
  orders: Record<string, Order>;
  idempotency: Record<string, { fingerprint: string; orderId: string }>;
  /** o timeout após criação acontece uma única vez por cenário */
  timeoutConsumed: boolean;
  seq: number;
}

const KEY = 'kurio:mocks:v1';

const initial = (): MockState => ({
  scenario: 'default', latencyMs: 150, nfts: buildNfts(),
  cart: { items: [] }, orders: {}, idempotency: {}, timeoutConsumed: false, seq: 0,
});

let memory: MockState | null = null;
const ls = (): Storage | null => {
  try { return globalThis.localStorage ?? null; } catch { return null; }
};

export function getState(): MockState {
  const storage = ls();
  if (storage) {
    const raw = storage.getItem(KEY);
    if (raw) return JSON.parse(raw) as MockState;
    const fresh = initial();
    storage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  }
  return (memory ??= initial());
}

export function saveState(s: MockState) {
  const storage = ls();
  if (storage) storage.setItem(KEY, JSON.stringify(s));
  else memory = s;
}

export function update(fn: (s: MockState) => void): MockState {
  const s = getState();
  fn(s);
  saveState(s);
  return s;
}

/** Restaura integralmente o cenário conhecido. */
export function resetState(scenario: Scenario = 'default') {
  saveState({ ...initial(), scenario });
}
