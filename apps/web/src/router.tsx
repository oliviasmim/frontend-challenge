import { createRootRoute, createRoute, createRouter, Link } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { CatalogPage } from './catalog/CatalogPage';
import { validateCatalogSearch } from './catalog/search';
import { CartPage } from './purchase/CartPage';
import { CheckoutPage } from './purchase/CheckoutPage';
import { ConfirmationPage } from './purchase/ConfirmationPage';

const root = createRootRoute({
  component: Layout,
  notFoundComponent: () => (
    <main className="mx-auto max-w-[600px] px-4 py-16 text-center">
      <h1 className="mb-3 text-2xl font-bold">Página não encontrada</h1>
      <Link to="/" search={{ sort: 'recent', page: 1 }} className="text-accent underline">Voltar ao início</Link>
    </main>
  ),
});

const index = createRoute({
  getParentRoute: () => root, path: '/', validateSearch: validateCatalogSearch, component: CatalogPage,
});
const cart = createRoute({ getParentRoute: () => root, path: '/cart', component: CartPage });
const checkout = createRoute({ getParentRoute: () => root, path: '/checkout', component: CheckoutPage });
const order = createRoute({ getParentRoute: () => root, path: '/order/$orderId', component: ConfirmationPage });

export const router = createRouter({ routeTree: root.addChildren([index, cart, checkout, order]) });

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
