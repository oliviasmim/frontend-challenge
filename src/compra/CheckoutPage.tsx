import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { formatEth } from '@/lib/eth'
import { useSocketStatus } from '@/lib/useSocketStatus'
import type { Cotacao, LinhaCotacao } from './contratos'
import type { Mudanca } from './cotacao'
import { useCheckout } from './useCheckout'

export function CheckoutPage() {
  const navigate = useNavigate()
  const tempoReal = useSocketStatus()
  const checkout = useCheckout({
    onPedidoEnviado: (pedido) => navigate({ to: '/pedidos/$pedidoId', params: { pedidoId: pedido.orderId } }),
  })
  const { atual, aceita, mudancas, desatualizada } = checkout

  if (checkout.carrinho.isError || (checkout.cotacao.isError && !atual)) {
    return (
      <Pagina>
        <p role="alert">Não foi possível carregar a cotação. Seus itens continuam no carrinho.</p>
      </Pagina>
    )
  }

  const linhas = atual?.lines ?? []
  const idsMudados = new Set(mudancas.map((m) => m.editionId))
  // Critério 4: com mais de uma edição, a que mudou aparece separada das demais.
  const separar = linhas.length > 1 && idsMudados.size > 0
  const temEsgotada = aceita !== null && aceita.lines.some((l) => !l.available)

  return (
    <Pagina>
      <p className="text-xs text-zinc-400" data-testid="tempo-real">
        Tempo real: {tempoReal}
      </p>

      {desatualizada && (
        <section role="alert" aria-labelledby="aviso-titulo" className="rounded-xl border border-amber-400 bg-amber-400/10 p-4">
          <h2 id="aviso-titulo" className="font-semibold text-amber-200">
            A cotação ficou desatualizada
          </h2>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {mudancas.map((m) => (
              <li key={m.editionId}>{textoMudanca(m)}</li>
            ))}
            {checkout.totalMudou && <li>Taxas ou total da compra mudaram.</li>}
            {checkout.falhaRevalidacao && <li>{checkout.falhaRevalidacao}</li>}
          </ul>
          <p className="mt-2 text-sm">Revise a nova cotação antes de confirmar a compra.</p>
        </section>
      )}

      {!atual ? (
        <p aria-busy="true">Carregando cotação…</p>
      ) : separar ? (
        <>
          <ListaItens titulo="Itens que mudaram" linhas={linhas.filter((l) => idsMudados.has(l.editionId))} aceita={aceita} mostrarAnterior testId="itens-mudaram" />
          <ListaItens titulo="Demais itens" linhas={linhas.filter((l) => !idsMudados.has(l.editionId))} aceita={aceita} testId="itens-demais" />
        </>
      ) : (
        <ListaItens titulo="Itens do carrinho" linhas={linhas} aceita={aceita} mostrarAnterior={idsMudados.size > 0} testId="itens" />
      )}

      {atual && <Resumo cotacao={atual} atualizando={checkout.cotacao.isFetching} />}

      {temEsgotada && !desatualizada && (
        <p id="motivo-bloqueio" className="text-sm text-amber-200">
          Há uma edição esgotada no carrinho. A compra não pode ser confirmada enquanto ela estiver esgotada.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {desatualizada && (
          <Button variant="outline" onClick={checkout.rever} disabled={!checkout.podeRever}>
            Revisar nova cotação
          </Button>
        )}
        <Button
          size="lg"
          onClick={checkout.confirmar}
          disabled={!checkout.podeConfirmar}
          aria-describedby={desatualizada ? 'aviso-titulo' : temEsgotada ? 'motivo-bloqueio' : undefined}
        >
          {checkout.confirmando ? 'Revalidando cotação…' : 'Confirmar compra'}
        </Button>
      </div>
    </Pagina>
  )
}

function textoMudanca(m: Mudanca): string {
  return m.kind === 'esgotou'
    ? `${m.name} esgotou`
    : `${m.name} mudou de ${formatEth(m.previousPrice)} para ${formatEth(m.newPrice)}`
}

function Pagina({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      {children}
    </main>
  )
}

function ListaItens({
  titulo,
  linhas,
  aceita,
  mostrarAnterior = false,
  testId,
}: {
  titulo: string
  linhas: LinhaCotacao[]
  aceita: Cotacao | null
  mostrarAnterior?: boolean
  testId: string
}) {
  return (
    <section aria-label={titulo} data-testid={testId} className="rounded-xl bg-zinc-800 p-4">
      <h2 className="mb-3 font-semibold">{titulo}</h2>
      <ul className="flex flex-col gap-3">
        {linhas.map((linha) => {
          const anterior = aceita?.lines.find((l) => l.editionId === linha.editionId)
          return (
            <li key={linha.editionId} className="flex flex-wrap items-baseline justify-between gap-2">
              <span>
                {linha.name} <span className="text-sm text-zinc-400">× {linha.quantity}</span>
                {!linha.available && (
                  <span className="ml-2 rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-200">Esgotada</span>
                )}
              </span>
              <span className="text-sm">
                {mostrarAnterior && anterior ? (
                  <>
                    Subtotal: <s aria-label={`antes ${formatEth(anterior.subtotal)}`}>{formatEth(anterior.subtotal)}</s>{' '}
                    → {linha.available ? formatEth(linha.subtotal) : 'esgotada'}
                  </>
                ) : (
                  formatEth(linha.subtotal)
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Resumo({ cotacao, atualizando }: { cotacao: Cotacao; atualizando: boolean }) {
  return (
    <section aria-label="Resumo da cotação" aria-busy={atualizando} className="rounded-xl bg-zinc-800 p-4">
      <h2 className="mb-3 font-semibold">Resumo</h2>
      <dl className="grid grid-cols-2 gap-y-1 text-sm">
        <dt>Subtotal</dt>
        <dd className="text-right">{formatEth(cotacao.subtotal)}</dd>
        <dt>Desconto</dt>
        <dd className="text-right">{formatEth(cotacao.discount)}</dd>
        <dt>Taxa de rede</dt>
        <dd className="text-right">{formatEth(cotacao.networkFee)}</dd>
        <dt className="text-base font-semibold">Total</dt>
        <dd className="text-right text-base font-semibold" data-testid="total">
          {formatEth(cotacao.total)}
        </dd>
      </dl>
      {atualizando && <p className="mt-2 text-xs text-zinc-400">Atualizando cotação…</p>}
    </section>
  )
}
