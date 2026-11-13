import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StepIndicator({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn('flex items-center gap-2', className)} aria-label="Request progress">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-extrabold',
                done && 'bg-bamboo-700 text-cream-50',
                active && 'bg-bamboo-900 text-cream-50 ring-4 ring-bamboo-900/10',
                !done && !active && 'bg-cream-200 text-ink-400',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : index + 1}
            </span>
            <span
              className={cn(
                'hidden truncate text-[0.6875rem] font-semibold sm:block',
                active ? 'text-ink-950' : done ? 'text-ink-600' : 'text-ink-400',
              )}
            >
              {step}
            </span>
            {index < steps.length - 1 ? (
              <span className={cn('ml-auto h-px flex-1', done ? 'bg-bamboo-400' : 'bg-ink-950/10')} aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
