import { ChevronRight, Clock3, MapPin, Users } from 'lucide-react';
import type { CampusService, ServiceQueue } from '@/types';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { getServiceStatus, SERVICE_STATUS_LABEL } from '@/lib/services/status';
import { cn, waitEstimate } from '@/lib/utils';

const statusStyles = {
  OPEN: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  BUSY: 'border-amber-200 bg-amber-50 text-amber-800',
  CLOSED: 'border-slate-200 bg-slate-100 text-slate-600',
};

export function ServiceCard({
  service,
  queue,
  href,
  className,
}: {
  service: CampusService;
  queue?: ServiceQueue;
  href: string;
  className?: string;
}) {
  const status = getServiceStatus(service, queue);
  const waiting = queue?.waitingCount ?? 0;
  const wait = queue?.estimatedWaitMinutes ?? 0;

  return (
    <a
      href={href}
      className={cn(
        'group flex flex-col rounded-2xl border border-ink-950/8 bg-white p-4.5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-bamboo-900/15 hover:shadow-card sm:p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <ServiceIcon service={service} />
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.12em]',
            statusStyles[status],
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              status === 'OPEN' && 'bg-emerald-500',
              status === 'BUSY' && 'bg-amber-500',
              status === 'CLOSED' && 'bg-slate-400',
            )}
            aria-hidden="true"
          />
          {SERVICE_STATUS_LABEL[status]}
        </span>
      </div>

      <h3 className="mt-4 text-[0.9375rem] font-bold tracking-[-0.02em] text-ink-950">{service.name}</h3>
      <p className="mt-1 line-clamp-2 text-[0.6875rem] font-medium leading-relaxed text-ink-500">
        {service.office}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4">
        <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-ink-700">
          <Users size={12} className="text-ink-400" aria-hidden="true" />
          {waiting === 0 ? 'No line' : `${waiting} waiting`}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-ink-700">
          <Clock3 size={12} className="text-ink-400" aria-hidden="true" />
          {status === 'CLOSED' ? 'Closed now' : waitEstimate(wait)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink-950/6 pt-3">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[0.625rem] font-medium text-ink-400">
          <MapPin size={11} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{service.location}</span>
        </span>
        <ChevronRight
          size={15}
          className="shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-bamboo-600"
          aria-hidden="true"
        />
      </div>
    </a>
  );
}
