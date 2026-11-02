import { cn } from '../lib/cn';

interface Props { page: number; totalPages: number; onPage: (p: number) => void }

export function Pagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Paginação" className="mt-8 flex justify-end gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          aria-label={`Página ${p}`}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            'h-8 w-8 rounded border border-line text-xs',
            p === page ? 'bg-accent font-bold text-accent-fg' : 'hover:bg-surface-2',
          )}
        >
          {p}
        </button>
      ))}
    </nav>
  );
}
