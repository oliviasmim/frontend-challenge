/** ETH trafega como string decimal; o cálculo usa inteiros (18 casas) para não perder precisão. */
const DECIMALS = 18;
const SCALE = 10n ** BigInt(DECIMALS);

export function ethToUnits(value: string): bigint {
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(value.trim());
  if (!m) throw new Error(`Valor ETH inválido: ${value}`);
  const [, sign, int = '0', frac = ''] = m;
  const units = BigInt(int) * SCALE + BigInt(frac.padEnd(DECIMALS, '0').slice(0, DECIMALS));
  return sign ? -units : units;
}

export function unitsToEth(units: bigint): string {
  const neg = units < 0n;
  const abs = neg ? -units : units;
  const int = abs / SCALE;
  const frac = (abs % SCALE).toString().padStart(DECIMALS, '0').replace(/0+$/, '');
  return `${neg ? '-' : ''}${int}${frac ? '.' + frac : ''}`;
}

export const addEth = (a: string, b: string) => unitsToEth(ethToUnits(a) + ethToUnits(b));
export const mulEth = (a: string, qty: number) => unitsToEth(ethToUnits(a) * BigInt(qty));
/** Percentual em pontos-base (500 = 5%). */
export const pctEth = (a: string, bps: number) => unitsToEth((ethToUnits(a) * BigInt(bps)) / 10000n);
export const cmpEth = (a: string, b: string) => {
  const d = ethToUnits(a) - ethToUnits(b);
  return d === 0n ? 0 : d < 0n ? -1 : 1;
};

/** Apresentação com 2 casas mínimas (1.19), mantendo mais casas quando existirem. */
export function formatEth(value: string): string {
  const [i, f = ''] = value.split('.');
  return `${i}.${f.padEnd(2, '0')}`;
}
