import { sameEth, type EthString } from '@/lib/eth'
import type { Cotacao, NftUpdatedEvent, PedidoRequest } from './contratos'

/** O que mudou numa edição do carrinho em relação à cotação que o colecionador aceitou. */
export type Mudanca =
  | { editionId: string; name: string; kind: 'preco'; previousPrice: EthString; newPrice: EthString }
  | { editionId: string; name: string; kind: 'esgotou'; previousPrice: EthString }

/**
 * Critério 2: traduz um `nft.updated` em mudança relativa à cotação aceita.
 * Devolve `null` se o evento não afeta o carrinho ou não muda nada.
 */
export function mudancaDoEvento(aceita: Cotacao, evento: NftUpdatedEvent): Mudanca | null {
  const linha = aceita.lines.find((l) => l.editionId === evento.editionId)
  if (!linha) return null
  if (linha.available && evento.available < linha.quantity) {
    return { editionId: linha.editionId, name: linha.name, kind: 'esgotou', previousPrice: linha.unitPrice }
  }
  if (!sameEth(evento.price, linha.unitPrice)) {
    return {
      editionId: linha.editionId,
      name: linha.name,
      kind: 'preco',
      previousPrice: linha.unitPrice,
      newPrice: evento.price,
    }
  }
  return null
}

/** Critério 5: compara a cotação aceita com a revalidação feita antes de enviar. */
export function compararCotacoes(aceita: Cotacao, nova: Cotacao): { mudancas: Mudanca[]; totalMudou: boolean } {
  const mudancas: Mudanca[] = []
  for (const antes of aceita.lines) {
    const depois = nova.lines.find((l) => l.editionId === antes.editionId)
    if (!depois || (antes.available && !depois.available)) {
      mudancas.push({ editionId: antes.editionId, name: antes.name, kind: 'esgotou', previousPrice: antes.unitPrice })
    } else if (!sameEth(antes.unitPrice, depois.unitPrice)) {
      mudancas.push({
        editionId: antes.editionId,
        name: antes.name,
        kind: 'preco',
        previousPrice: antes.unitPrice,
        newPrice: depois.unitPrice,
      })
    }
  }
  return { mudancas, totalMudou: !sameEth(aceita.total, nova.total) }
}

export function cotacaoConfirmavel(cotacao: Cotacao): boolean {
  return cotacao.lines.length > 0 && cotacao.lines.every((l) => l.available)
}

/** Critério 1: o pedido leva o preço COTADO de cada edição, nunca o vigente. */
export function pedidoDaCotacao(cotacao: Cotacao): PedidoRequest {
  return {
    quoteId: cotacao.quoteId,
    items: cotacao.lines.map((l) => ({ editionId: l.editionId, quantity: l.quantity, quotedPrice: l.unitPrice })),
    total: cotacao.total,
  }
}
