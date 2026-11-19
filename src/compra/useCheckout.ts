import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSocket } from '@/lib/socket'
import { buscarCarrinho, enviarPedido, pedirCotacao } from './api'
import { EVENTO_NFT_UPDATED, type Cotacao, type NftUpdatedEvent, type Pedido } from './contratos'
import { compararCotacoes, cotacaoConfirmavel, mudancaDoEvento, pedidoDaCotacao, type Mudanca } from './cotacao'

type ResultadoConfirmacao =
  | { tipo: 'enviado'; pedido: Pedido }
  | { tipo: 'mudou'; nova: Cotacao; mudancas: Mudanca[]; totalMudou: boolean }

export function useCheckout({ onPedidoEnviado }: { onPedidoEnviado: (pedido: Pedido) => void }) {
  const queryClient = useQueryClient()

  const carrinho = useQuery({ queryKey: ['carrinho'], queryFn: ({ signal }) => buscarCarrinho(signal) })
  const items = carrinho.data?.items

  // Cada revisão é uma cotação nova pedida à API. A cotação só muda por evento ou revalidação.
  const [revisao, setRevisao] = useState(0)
  const cotacaoKey = ['cotacao', items, revisao] as const
  const cotacao = useQuery({
    queryKey: cotacaoKey,
    queryFn: ({ signal }) => pedirCotacao(items!, signal),
    enabled: !!items,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })

  /** A cotação que o colecionador viu e aceitou: a referência do pedido. */
  const [aceita, setAceita] = useState<Cotacao | null>(null)
  const [mudancas, setMudancas] = useState<Record<string, Mudanca>>({})
  const [falhaRevalidacao, setFalhaRevalidacao] = useState<string | null>(null)
  const [totalMudou, setTotalMudou] = useState(false)

  // A primeira cotação exibida é a que o colecionador está vendo e aceitando.
  useEffect(() => {
    if (!aceita && cotacao.data) setAceita(cotacao.data)
  }, [aceita, cotacao.data])

  // ---- Critério 2: escutar o sinal de mudança (Socket.IO) ----
  const aceitaRef = useRef(aceita)
  aceitaRef.current = aceita
  const versoes = useRef(new Map<string, number>())
  const eventosVistos = useRef(new Set<string>())

  useEffect(() => {
    const socket = getSocket()
    const aoAtualizar = (evento: NftUpdatedEvent) => {
      const base = aceitaRef.current
      if (!base) return
      const linha = base.lines.find((l) => l.editionId === evento.editionId)
      if (!linha) return // edição fora do carrinho
      // Tolerar duplicatas e eventos antigos (README §7).
      if (eventosVistos.current.has(evento.eventId)) return
      const versaoConhecida = Math.max(versoes.current.get(evento.editionId) ?? 0, linha.version)
      if (evento.version <= versaoConhecida) return
      eventosVistos.current.add(evento.eventId)
      versoes.current.set(evento.editionId, evento.version)

      const mudanca = mudancaDoEvento(base, evento)
      setMudancas((atual) => {
        const proximo = { ...atual }
        if (mudanca) proximo[evento.editionId] = mudanca
        else delete proximo[evento.editionId]
        return proximo
      })
      setRevisao((r) => r + 1) // pede nova cotação à API para atualizar o resumo
    }
    socket.on(EVENTO_NFT_UPDATED, aoAtualizar)
    return () => {
      socket.off(EVENTO_NFT_UPDATED, aoAtualizar)
    }
  }, [])

  // ---- Critério 5: revalidar antes de enviar ----
  const chaves = useRef(new Map<string, string>())
  const chaveDe = (quoteId: string) => {
    let chave = chaves.current.get(quoteId)
    if (!chave) {
      chave = crypto.randomUUID()
      chaves.current.set(quoteId, chave)
    }
    return chave
  }

  const confirmar = useMutation({
    mutationFn: async (base: Cotacao): Promise<ResultadoConfirmacao> => {
      const nova = await pedirCotacao(items!)
      const comparacao = compararCotacoes(base, nova)
      if (comparacao.mudancas.length > 0 || comparacao.totalMudou) {
        return { tipo: 'mudou', nova, ...comparacao }
      }
      const pedido = await enviarPedido(pedidoDaCotacao(base), chaveDe(base.quoteId))
      return { tipo: 'enviado', pedido }
    },
    onSuccess: (resultado) => {
      if (resultado.tipo === 'enviado') {
        onPedidoEnviado(resultado.pedido)
        return
      }
      // Não envia; os itens do carrinho ficam como estão; pede nova confirmação.
      const proxima = revisao + 1
      queryClient.setQueryData(['cotacao', items, proxima], resultado.nova)
      setRevisao(proxima)
      setMudancas(Object.fromEntries(resultado.mudancas.map((m) => [m.editionId, m])))
      setTotalMudou(resultado.totalMudou)
    },
    onError: () => {
      setFalhaRevalidacao('Não foi possível revalidar a cotação. Nenhum pedido foi enviado e seus itens continuam no carrinho.')
      setRevisao((r) => r + 1)
    },
  })

  const atual = cotacao.data ?? null
  const desatualizada =
    Object.keys(mudancas).length > 0 ||
    totalMudou ||
    falhaRevalidacao !== null ||
    (aceita !== null && atual !== null && atual.quoteId !== aceita.quoteId)

  const podeRever = desatualizada && atual !== null && !cotacao.isFetching
  const rever = () => {
    if (!atual) return
    setAceita(atual)
    setMudancas({})
    setTotalMudou(false)
    setFalhaRevalidacao(null)
  }

  // Critério 3: só confirma com a cotação vigente, já revista, e sem edição esgotada.
  const podeConfirmar =
    !desatualizada &&
    aceita !== null &&
    atual?.quoteId === aceita.quoteId &&
    !cotacao.isFetching &&
    cotacaoConfirmavel(aceita) &&
    !confirmar.isPending

  return {
    carrinho,
    cotacao,
    aceita,
    atual,
    mudancas: Object.values(mudancas),
    totalMudou,
    falhaRevalidacao,
    desatualizada,
    podeRever,
    rever,
    podeConfirmar,
    confirmar: () => aceita && confirmar.mutate(aceita),
    confirmando: confirmar.isPending,
  }
}
