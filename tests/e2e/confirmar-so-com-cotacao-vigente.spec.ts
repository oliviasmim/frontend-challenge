import { expect, test, type Page, type Request } from '@playwright/test'

/**
 * Spec: docs/confirmar-so-com-cotacao-vigente-spec.md (ADR-0001).
 * Números do BDD: "Aurora #3" a 0,2 ETH e "Maré #7" a 0,3 ETH, 1 unidade de cada,
 * sem cupom e taxa de rede zero.
 *
 * As mudanças chegam pelo canal de tempo real simulado: o teste altera o dado no mock
 * (handler MSW) e o mock emite `nft.updated` pelo socket.io-client. A tela não é tocada.
 */

async function abrirCheckoutComCotacaoDe0_5(page: Page) {
  await page.goto('/checkout')
  await expect(page.getByTestId('tempo-real')).toHaveText('Tempo real: conectado')
  await expect(page.getByTestId('total')).toHaveText('0,5 ETH')
  await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeEnabled()
}

/** Muda o dado no servidor simulado; o mock emite `nft.updated` via Socket.IO. */
async function mudarEdicaoNoServidor(page: Page, editionId: string, mudanca: { price?: string; available?: number }) {
  const resposta = await page.evaluate(
    async ([id, body]) => {
      const r = await fetch(`/api/__mock/editions/${id}`, { method: 'POST', body: JSON.stringify(body) })
      return r.json()
    },
    [editionId, mudanca] as const,
  )
  expect(resposta.clients, 'o evento precisa ter um socket conectado para receber').toBeGreaterThan(0)
}

function registrarPedidosEnviados(page: Page): Request[] {
  const pedidos: Request[] = []
  page.on('request', (req) => {
    if (req.method() === 'POST' && new URL(req.url()).pathname === '/api/orders') pedidos.push(req)
  })
  return pedidos
}

test('Cenário: Preço de uma edição muda com a cotação aberta', async ({ page }) => {
  await abrirCheckoutComCotacaoDe0_5(page)

  await mudarEdicaoNoServidor(page, 'aurora-3', { price: '0.25' })

  const aviso = page.getByRole('alert')
  await expect(aviso).toContainText('Aurora #3 mudou de 0,2 ETH para 0,25 ETH')
  await expect(page.getByTestId('total')).toHaveText('0,55 ETH')
  const confirmar = page.getByRole('button', { name: 'Confirmar compra' })
  await expect(confirmar).toBeDisabled()

  // Critério 4: a edição que mudou aparece separada, com subtotal anterior e novo.
  const mudaram = page.getByTestId('itens-mudaram')
  await expect(mudaram).toContainText('Aurora #3')
  await expect(mudaram).toContainText('Subtotal: 0,2 ETH → 0,25 ETH')
  await expect(page.getByTestId('itens-demais')).toContainText('Maré #7')

  // Continua bloqueado até o colecionador rever a nova cotação.
  await expect(confirmar).toBeDisabled()
  await page.getByRole('button', { name: 'Revisar nova cotação' }).click()
  await expect(confirmar).toBeEnabled()
})

test('Cenário: Colecionador revê a nova cotação e confirma', async ({ page }) => {
  const pedidos = registrarPedidosEnviados(page)
  await abrirCheckoutComCotacaoDe0_5(page)
  await mudarEdicaoNoServidor(page, 'aurora-3', { price: '0.25' })
  await expect(page.getByRole('alert')).toContainText('Aurora #3 mudou de 0,2 ETH para 0,25 ETH')

  await page.getByRole('button', { name: 'Revisar nova cotação' }).click()
  await page.getByRole('button', { name: 'Confirmar compra' }).click()

  await expect(page).toHaveURL(/\/pedidos\//)
  expect(pedidos).toHaveLength(1)
  const corpo = pedidos[0].postDataJSON()
  expect(corpo.items).toContainEqual({ editionId: 'aurora-3', quantity: 1, quotedPrice: '0.25' })
  expect(corpo.total).toBe('0.55')
  expect(pedidos[0].headers()['idempotency-key']).toBeTruthy()

  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible()
  await expect(page.getByTestId('recibo-aurora-3')).toContainText('0,25 ETH')
  await expect(page.getByTestId('recibo-total')).toHaveText('0,55 ETH')
})

test('Cenário: Edição esgota entre a cotação e a confirmação', async ({ page }) => {
  const pedidos = registrarPedidosEnviados(page)
  await abrirCheckoutComCotacaoDe0_5(page)

  await mudarEdicaoNoServidor(page, 'mare-7', { available: 0 })

  await expect(page.getByRole('alert')).toContainText('Maré #7 esgotou')
  const confirmar = page.getByRole('button', { name: 'Confirmar compra' })
  await expect(confirmar).toBeDisabled()

  // Mesmo depois de rever, não dá para confirmar com edição esgotada.
  await page.getByRole('button', { name: 'Revisar nova cotação' }).click()
  await expect(confirmar).toBeDisabled()
  await expect(page.getByText('Há uma edição esgotada no carrinho')).toBeVisible()

  // Nenhum pedido é enviado.
  expect(pedidos).toHaveLength(0)

  // "Aurora #3" continua no carrinho (na tela e na API).
  await expect(page.getByTestId('itens')).toContainText('Aurora #3')
  const carrinho = await page.evaluate(async () => (await fetch('/api/cart')).json())
  expect(carrinho.items).toContainEqual({ editionId: 'aurora-3', quantity: 1 })
})
