import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> { label: string; error?: string }

/** Campo com label e mensagem de erro associadas (aria-describedby). */
export function Field({ label, error, className, ...p }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-muted">{label}</label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn('rounded-md border border-line bg-surface-2 px-3 py-2 text-sm', error && 'border-danger', className)}
        {...p}
      />
      {error && <p id={`${id}-err`} role="alert" className="text-xs text-danger">⚠ {error}</p>}
    </div>
  );
}
