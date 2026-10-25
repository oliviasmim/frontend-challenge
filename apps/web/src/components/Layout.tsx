import { Link, Outlet } from '@tanstack/react-router';
import { useCart } from '../purchase/useCart';

export function Layout() {
  const { count } = useCart();
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 text-xs">
          <Link to="/" search={{ sort: 'recent', page: 1 }} className="font-bold tracking-widest">KURIO</Link>
          <nav aria-label="Principal" className="flex items-center gap-6">
            <Link to="/" search={{ sort: 'recent', page: 1 }} className="border-b-2 border-accent pb-1 font-bold text-accent">Início</Link>
            <Link to="/cart" aria-label={`Carrinho, ${count} itens`}>
              🛒 <span data-testid="cart-count" className="ml-1 rounded-full bg-accent px-1.5 text-accent-fg">{count}</span>
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="mt-10 border-t border-line py-6 text-center text-xs text-muted">
        © 2026 Kurio. Propriedade digital para todos.
      </footer>
    </>
  );
}
