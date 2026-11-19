import './index.css'

async function ligarMocks() {
  if (import.meta.env.VITE_MOCKS !== 'true') return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}

// O app (e com ele o socket.io-client) só é carregado DEPOIS do MSW iniciar: o engine.io-client
// guarda a referência de `globalThis.WebSocket` ao ser avaliado, e o MSW precisa tê-la trocado antes.
ligarMocks()
  .then(() => import('./app/App'))
  .then(({ montarApp }) => montarApp(document.getElementById('root')!))
