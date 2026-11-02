import { cn } from '../../lib/cn';

export const Skeleton = ({ className }: { className?: string }) => (
  <div aria-hidden="true" className={cn('skeleton', className)} />
);
