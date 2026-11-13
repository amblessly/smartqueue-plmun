import type { QueueStatus, QueueServiceStatus } from '@/types';
import { cn } from '@/lib/utils';

const queueStyles: Record<QueueStatus, { label: string; className: string; dot: string }> = {
  WAITING: {
    label: 'Waiting',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  UP_NEXT: {
    label: 'Up next',
    className: 'bg-gold-100 text-gold-700 border-gold-200',
    dot: 'bg-gold-500',
  },
  CALLED: {
    label: 'Called',
    className: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
  },
  SERVING: {
    label: 'Serving',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-bamboo-50 text-bamboo-800 border-bamboo-200',
    dot: 'bg-bamboo-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  SKIPPED: {
    label: 'Skipped',
    className: 'bg-orange-50 text-orange-800 border-orange-200',
    dot: 'bg-orange-500',
  },
  EXPIRED: {
    label: 'Expired',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
};

const serviceStyles: Record<QueueServiceStatus, { label: string; className: string; dot: string }> = {
  OPEN: {
    label: 'Open',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  BUSY: {
    label: 'Busy',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
};

export function QueueStatusBadge({
  status,
  className,
  size = 'md',
}: {
  status: QueueStatus;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const style = queueStyles[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-[0.12em]',
        size === 'sm' ? 'px-2 py-0.5 text-[0.5625rem]' : 'px-2.5 py-1 text-[0.625rem]',
        style.className,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  );
}

export function ServiceStatusBadge({
  status,
  className,
}: {
  status: QueueServiceStatus;
  className?: string;
}) {
  const style = serviceStyles[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.12em]',
        style.className,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  );
}
