import { ArrowRight, BellRing, Clock3, MapPin, Radio, Users } from 'lucide-react';
import type { QueueTicket } from '@/types';
import { QueueStatusBadge } from '@/components/ui/StatusBadge';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { Skeleton } from '@/components/ui/Skeleton';
import { useQueueView } from '@/hooks/useQueueView';
import { getService } from '@/lib/data/services';
import { cn, formatTime, waitEstimate } from '@/lib/utils';

export function ActiveTicketCard({
  ticket,
  variant = 'default',
  className,
}: {
  ticket: QueueTicket;
  variant?: 'default' | 'hero';
  className?: string;
}) {
  const service = getService(ticket.serviceId);
  const { view, loading } = useQueueView(ticket.serviceId, ticket.id);
  const current = view?.ticket ?? ticket;
  const peopleAhead = view?.peopleAhead ?? 0;
  const wait = view?.estimatedWaitMinutes ?? 0;
  const nowServing = view?.queue.nowServing?.displayNumber ?? '—';
  const total = view?.queue.activeTickets.length ?? 0;
  const progress = total > 0 ? Math.max(8, Math.min(100, ((total - peopleAhead) / total) * 100)) : 8;
  const called = current.status === 'CALLED' || current.status === 'SERVING';

  if (!service) return null;

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-bamboo-900/10 bg-white shadow-card',
        className,
      )}
      aria-labelledby={`active-ticket-${ticket.id}`}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-1',
          called ? 'bg-emerald-500' : current.status === 'UP_NEXT' ? 'bg-gold-400' : 'bg-bamboo-600',
        )}
        aria-hidden="true"
      />
      <div className={cn('p-5 sm:p-6', variant === 'hero' && 'sm:p-7')}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <ServiceIcon service={service} />
            <div className="min-w-0">
              <p className="truncate text-[0.6875rem] font-bold uppercase tracking-[0.13em] text-ink-400">
                Active queue
              </p>
              <h2
                id={`active-ticket-${ticket.id}`}
                className="mt-0.5 truncate text-sm font-bold tracking-[-0.02em] text-ink-950"
              >
                {service.name}
              </h2>
            </div>
          </div>
          <QueueStatusBadge status={current.status} />
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.16em] text-ink-400">
              Your number
            </p>
            <p
              className={cn(
                'font-extrabold leading-none tracking-[-0.065em] text-ink-950 tabular',
                variant === 'hero' ? 'text-[3.6rem] sm:text-[4.25rem]' : 'text-[3rem]',
              )}
            >
              {current.displayNumber}
            </p>
            <p className="mt-1.5 text-[0.6875rem] font-medium text-ink-500">
              {current.requestLabel}
            </p>
          </div>

          {called ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-right">
              <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.13em] text-emerald-700">
                {current.status === 'SERVING' ? 'Being served' : 'Proceed to'}
              </p>
              <p className="mt-0.5 text-lg font-extrabold tracking-[-0.03em] text-emerald-950">
                {current.counter ?? 'Counter'}
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-cream-100 px-4 py-3 text-right">
              <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.13em] text-ink-400">
                Estimated wait
              </p>
              <p className="mt-0.5 text-lg font-extrabold tracking-[-0.03em] text-bamboo-900">
                {waitEstimate(wait)}
              </p>
            </div>
          )}
        </div>

        {loading && !view ? (
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16 sm:block" />
          </div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <div className="rounded-xl border border-ink-950/8 bg-cream-50 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">
                  <Radio size={11} aria-hidden="true" /> Now serving
                </p>
                <p className="mt-1 text-lg font-extrabold tracking-[-0.03em] text-ink-950 tabular">
                  {nowServing}
                </p>
              </div>
              <div className="rounded-xl border border-ink-950/8 bg-cream-50 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">
                  <Users size={11} aria-hidden="true" /> People ahead
                </p>
                <p className="mt-1 text-lg font-extrabold tracking-[-0.03em] text-ink-950 tabular">
                  {peopleAhead}
                </p>
              </div>
              <div className="col-span-2 rounded-xl border border-ink-950/8 bg-cream-50 px-3 py-2.5 sm:col-span-1">
                <p className="flex items-center gap-1.5 text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">
                  <MapPin size={11} aria-hidden="true" /> Counter
                </p>
                <p className="mt-1 truncate text-sm font-bold tracking-[-0.02em] text-ink-950">
                  {current.counter ?? 'Assigned when called'}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-[0.625rem] font-semibold">
                <span className="text-ink-500">
                  {called
                    ? current.status === 'SERVING'
                      ? 'You’re at the counter'
                      : 'Your number was called'
                    : peopleAhead === 0
                      ? 'You’re next in line'
                      : `${peopleAhead} student${peopleAhead === 1 ? '' : 's'} ahead of you`}
                </span>
                <span className="text-bamboo-800">{Math.round(progress)}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-200">
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-500',
                    called ? 'bg-emerald-500' : 'bg-bamboo-600',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-950/8 pt-4">
          <p className="inline-flex items-center gap-1.5 text-[0.625rem] font-medium text-ink-400">
            <Clock3 size={12} aria-hidden="true" />
            Joined at {formatTime(current.createdAt)}
          </p>
          <a
            href={`/queue/ticket/${ticket.id}`}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-bamboo-900 px-3.5 text-[0.6875rem] font-bold text-cream-50 transition-colors hover:bg-bamboo-800"
          >
            View live ticket
          </a>
        </div>

        {!called && current.status === 'WAITING' ? (
          <p className="mt-3 flex items-start gap-1.5 text-[0.625rem] leading-relaxed text-ink-400">
            <BellRing size={12} className="mt-0.5 shrink-0 text-bamboo-500" aria-hidden="true" />
            You can step away. Keep this page open to receive live updates.
          </p>
        ) : null}
      </div>
    </section>
  );
}
