import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import { CheckoutPage } from '@/compra/CheckoutPage'
import { ReciboPage } from '@/compra/ReciboPage'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => <main className="p-10">Página não encontrada.</main>,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/checkout' })
  },
})

const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/checkout', component: CheckoutPage })

const reciboRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pedidos/$pedidoId',
  component: function Recibo() {
    const { pedidoId } = reciboRoute.useParams()
    return <ReciboPage pedidoId={pedidoId} />
  },
})

export const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute, checkoutRoute, reciboRoute]) })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
