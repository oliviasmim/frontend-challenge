/**
 * Valores em ETH trafegam como strings decimais (README §3) e as contas são feitas em
 * inteiros (wei, 18 casas) para não perder precisão.
 */
const DECIMALS = 18
const SCALE = 10n ** BigInt(DECIMALS)

export type EthString = string

export function toWei(value: EthString): bigint {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(value.trim())
  if (!match) throw new Error(`Valor ETH inválido: "${value}"`)
  const [, whole, fraction = ''] = match
  if (fraction.length > DECIMALS) throw new Error(`Mais de ${DECIMALS} casas: "${value}"`)
  return BigInt(whole) * SCALE + BigInt(fraction.padEnd(DECIMALS, '0'))
}

export function fromWei(wei: bigint): EthString {
  const whole = wei / SCALE
  const fraction = (wei % SCALE).toString().padStart(DECIMALS, '0').replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : whole.toString()
}

export function addEth(...values: EthString[]): EthString {
  return fromWei(values.reduce((sum, v) => sum + toWei(v), 0n))
}

export function multiplyEth(value: EthString, quantity: number): EthString {
  if (!Number.isInteger(quantity)) throw new Error('Quantidades são inteiras')
  return fromWei(toWei(value) * BigInt(quantity))
}

export function sameEth(a: EthString, b: EthString): boolean {
  return toWei(a) === toWei(b)
}

/** "0.25" -> "0,25 ETH" (sem arredondar). */
export function formatEth(value: EthString): string {
  return `${fromWei(toWei(value)).replace('.', ',')} ETH`
}
