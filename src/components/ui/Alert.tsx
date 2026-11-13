import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertTone = 'info' | 'warning' | 'error' | 'success';

const tones: Record<AlertTone, { wrap: string; icon: string; Icon: typeof Info }> = {
  info: {
    wrap: 'border-bamboo-200 bg-bamboo-50 text-bamboo-900',
    icon: 'text-bamboo-600',
    Icon: Info,
  },
  warning: {
    wrap: 'border-amber-200 bg-amber-50 text-amber-950',
    icon: 'text-amber-600',
    Icon: TriangleAlert,
  },
  error: {
    wrap: 'border-red-200 bg-red-50 text-red-900',
    icon: 'text-red-600',
    Icon: AlertCircle,
  },
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    icon: 'text-emerald-600',
    Icon: CheckCircle2,
  },
};

export function Alert({
  tone = 'info',
  title,
  children,
  action,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const style = tones[tone];
  const Icon = style.Icon;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-2.5 rounded-xl border px-3.5 py-3', style.wrap, className)}
    >
      <Icon size={16} className={cn('mt-0.5 shrink-0', style.icon)} aria-hidden="true" />
      <div className="min-w-0 flex-1 text-xs leading-relaxed">
        {title ? <p className="font-bold">{title}</p> : null}
        <div className={cn(title && 'mt-0.5', 'opacity-90')}>{children}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
