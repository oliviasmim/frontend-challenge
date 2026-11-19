import { addEth, multiplyEth, sameEth } from '@/lib/eth'
import type { Carrinho, Cotacao, ItemCarrinho, LinhaCotacao, Pedido } from '@/compra/contratos'

/**
 * Estado simulado em memória. Cada carregamento de página começa do cenário conhecido
 * abaixo (números do BDD da spec), o que isola cada teste Playwright.
 */
type EdicaoMock = { id: string; name: string; price: string; available: number; version: number }

export const NETWORK_FEE = '0'

function cenarioInicial() {
  return {
    edicoes: new Map<string, EdicaoMock>([
      ['aurora-3', { id: 'aurora-3', name: 'Aurora #3', price: '0.2', available: 5, version: 1 }],
      ['mare-7', { id: 'mare-7', name: 'Maré #7', price: '0.3', available: 3, version: 1 }],
    ]),
    carrinho: { items: [{ editionId: 'aurora-3', quantity: 1 }, { editionId: 'mare-7', quantity: 1 }] } as Carrinho,
    cotacoes: new Map<string, Cotacao>(),
    pedidos: new Map<string, Pedido>(),
    /** chave de idempotência -> { orderId, corpo serializado } */
    idempotencia: new Map<string, { orderId: string; corpo: string }>(),
  }
}

export let db = cenarioInicial()
export const resetDb = () => {
  db = cenarioInicial()
}

let seq = 0
const novoId = (prefixo: string) => `${prefixo}_${Date.now().toString(36)}${(++seq).toString(36)}`

export function criarCotacao(items: ItemCarrinho[]): Cotacao {
  const lines: LinhaCotacao[] = items.map((item) => {
    const e = db.edicoes.get(item.editionId)
    if (!e) throw new Error(`Edição inexistente: ${item.editionId}`)
    return {
      editionId: e.id,
      name: e.name,
      quantity: item.quantity,
      unitPrice: e.price,
      subtotal: multiplyEth(e.price, item.quantity),
      available: e.available >= item.quantity,
      version: e.version,
    }
  })
  // Linhas esgotadas não entram no total.
  const subtotal = addEth('0', ...lines.filter((l) => l.available).map((l) => l.subtotal))
  const cotacao: Cotacao = {
    quoteId: novoId('q'),
    lines,
    subtotal,
    discount: '0',
    networkFee: NETWORK_FEE,
    total: addEth(subtotal, NETWORK_FEE),
    createdAt: new Date().toISOString(),
  }
  db.cotacoes.set(cotacao.quoteId, cotacao)
  return cotacao
}

/** A cotação ainda bate com preço e disponibilidade vigentes? */
export function cotacaoVigente(cotacao: Cotacao): boolean {
  return cotacao.lines.every((l) => {
    const e = db.edicoes.get(l.editionId)
    return !!e && l.available && e.available >= l.quantity && sameEth(e.price, l.unitPrice)
  })
}

export function criarPedido(cotacao: Cotacao): Pedido {
  const pedido: Pedido = {
    orderId: novoId('ord'),
    // Simplificação: o ciclo pendente -> confirmado está fora do escopo desta spec.
    status: 'confirmado',
    quoteId: cotacao.quoteId,
    lines: structuredClone(cotacao.lines),
    subtotal: cotacao.subtotal,
    discount: cotacao.discount,
    networkFee: cotacao.networkFee,
    total: cotacao.total,
    transactionRef: `0xsim${(++seq).toString(16).padStart(8, '0')}`,
    createdAt: new Date().toISOString(),
  }
  db.pedidos.set(pedido.orderId, pedido)
  return pedido
}

export { novoId }
