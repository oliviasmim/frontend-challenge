import { http, HttpResponse, ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import { sameEth } from '@/lib/eth'
import { REALTIME_URL } from '@/lib/realtimeUrl'
import {
  EVENTO_NFT_UPDATED,
  type ErroApi,
  type ItemCarrinho,
  type NftUpdatedEvent,
  type PedidoRequest,
} from '@/compra/contratos'
import { cotacaoVigente, criarCotacao, criarPedido, db, resetDb } from './db'

const erro = (status: number, body: ErroApi) => HttpResponse.json(body, { status })

// ---------- Tempo real: Socket.IO simulado (@mswjs/socket.io-binding) ----------
const realtime = ws.link(`${REALTIME_URL}/*`)
type ClienteIo = ReturnType<typeof toSocketIo>['client']
const clientes = new Set<ClienteIo>()

function emitirParaTodos(evento: string, payload: unknown) {
  for (const cliente of clientes) cliente.emit(evento, payload)
}

const realtimeHandler = realtime.addEventListener('connection', (connection) => {
  const io = toSocketIo(connection)
  clientes.add(io.client)
  // O binding anuncia pingInterval de 25s; sem ping o cliente cai após ~30s.
  const ping = setInterval(() => connection.client.send('2'), 20_000)
  connection.client.addEventListener('close', () => {
    clientes.delete(io.client)
    clearInterval(ping)
  })
})

// ---------- REST ----------
export const handlers = [
  realtimeHandler,

  http.get('/api/cart', () => HttpResponse.json(db.carrinho)),

  http.post('/api/quotes', async ({ request }) => {
    const { items } = (await request.json()) as { items: ItemCarrinho[] }
    if (!Array.isArray(items) || items.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1)) {
      return erro(422, { code: 'VALIDACAO', message: 'Itens inválidos' })
    }
    return HttpResponse.json(criarCotacao(items))
  }),

  http.post('/api/orders', async ({ request }) => {
    const chave = request.headers.get('Idempotency-Key')
    if (!chave) return erro(422, { code: 'VALIDACAO', message: 'Idempotency-Key obrigatória' })
    const corpo = (await request.json()) as PedidoRequest
    const serializado = JSON.stringify(corpo)

    const anterior = db.idempotencia.get(chave)
    if (anterior) {
      if (anterior.corpo !== serializado) {
        return erro(409, { code: 'CONFLITO_IDEMPOTENCIA', message: 'Chave reutilizada com outro conteúdo' })
      }
      return HttpResponse.json(db.pedidos.get(anterior.orderId))
    }

    const cotacao = db.cotacoes.get(corpo.quoteId)
    if (!cotacao) return erro(404, { code: 'COTACAO_INEXISTENTE', message: 'Cotação inexistente' })
    const precosBatem =
      corpo.items.length === cotacao.lines.length &&
      corpo.items.every((item) => {
        const linha = cotacao.lines.find((l) => l.editionId === item.editionId)
        return !!linha && linha.quantity === item.quantity && sameEth(linha.unitPrice, item.quotedPrice)
      }) &&
      sameEth(corpo.total, cotacao.total)
    if (!precosBatem || !cotacaoVigente(cotacao)) {
      return erro(409, { code: 'COTACAO_DESATUALIZADA', message: 'A cotação não é mais vigente' })
    }

    const pedido = criarPedido(cotacao)
    db.idempotencia.set(chave, { orderId: pedido.orderId, corpo: serializado })
    return HttpResponse.json(pedido, { status: 201 })
  }),

  http.get('/api/orders/:orderId', ({ params }) => {
    const pedido = db.pedidos.get(String(params.orderId))
    return pedido ? HttpResponse.json(pedido) : HttpResponse.json({ message: 'Pedido inexistente' }, { status: 404 })
  }),

  // ---------- Controle de cenário (só existe na camada de mocks) ----------
  // Muda o dado simulado e emite o evento correspondente: REST e Socket.IO ficam coerentes (README §6).
  http.post('/api/__mock/editions/:editionId', async ({ params, request }) => {
    const edicao = db.edicoes.get(String(params.editionId))
    if (!edicao) return HttpResponse.json({ message: 'Edição inexistente' }, { status: 404 })
    const mudanca = (await request.json()) as { price?: string; available?: number }
    if (mudanca.price !== undefined) edicao.price = mudanca.price
    if (mudanca.available !== undefined) edicao.available = mudanca.available
    edicao.version += 1
    const evento: NftUpdatedEvent = {
      eventId: `nft.updated:${edicao.id}:${edicao.version}`,
      editionId: edicao.id,
      version: edicao.version,
      price: edicao.price,
      available: edicao.available,
    }
    emitirParaTodos(EVENTO_NFT_UPDATED, evento)
    return HttpResponse.json({ emitted: evento, clients: clientes.size })
  }),

  http.post('/api/__mock/reset', () => {
    resetDb()
    return new HttpResponse(null, { status: 204 })
  }),
]
