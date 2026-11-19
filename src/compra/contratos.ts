import type { EthString } from '@/lib/eth'

/**
 * Contratos tipados da Compra (transporte ↔ estado ↔ interface).
 * Os handlers MSW reutilizam estes mesmos tipos (README §6).
 */

export type ItemCarrinho = {
  editionId: string
  quantity: number
}

export type Carrinho = {
  items: ItemCarrinho[]
}

export type LinhaCotacao = {
  editionId: string
  name: string
  quantity: number
  /** Preço cotado: o valor que a cotação fixou. É o que o pedido usa. */
  unitPrice: EthString
  subtotal: EthString
  /** A edição tem quantidade disponível para esta linha? */
  available: boolean
  /** Versão da edição no momento da cotação (para descartar eventos antigos). */
  version: number
}

export type Cotacao = {
  quoteId: string
  lines: LinhaCotacao[]
  subtotal: EthString
  discount: EthString
  networkFee: EthString
  total: EthString
  createdAt: string
}

export type PedidoRequest = {
  quoteId: string
  items: Array<{ editionId: string; quantity: number; quotedPrice: EthString }>
  total: EthString
}

export type EstadoPedido = 'pendente' | 'confirmado' | 'recusado'

export type Pedido = {
  orderId: string
  status: EstadoPedido
  quoteId: string
  /** Snapshot congelado: alterações posteriores no catálogo não mudam o recibo. */
  lines: LinhaCotacao[]
  subtotal: EthString
  discount: EthString
  networkFee: EthString
  total: EthString
  transactionRef: string
  createdAt: string
}

export type ErroApi = {
  code: 'COTACAO_DESATUALIZADA' | 'COTACAO_INEXISTENTE' | 'CONFLITO_IDEMPOTENCIA' | 'VALIDACAO'
  message: string
}

/**
 * Sinal de mudança vindo do Catálogo, evento Socket.IO `nft.updated` (README §7).
 * Forma combinada na sessão de implementação: identidade estável (eventId), recurso
 * afetado (editionId) e versão. A Compra só ESCUTA este sinal; quem o emite é a
 * camada de rede (mocks), nunca a tela.
 */
export type NftUpdatedEvent = {
  eventId: string
  editionId: string
  version: number
  /** Preço vigente, string decimal. */
  price: EthString
  /** Quantidade disponível da edição (inteiro). */
  available: number
}

export const EVENTO_NFT_UPDATED = 'nft.updated'
