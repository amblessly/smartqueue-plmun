import { useMemo, useState } from 'react';
import { ArrowRight, LayoutGrid, Search, Ticket, X } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { ServiceCard } from '@/components/app/ServiceCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ServiceCardSkeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { useServiceQueues } from '@/hooks/useServiceQueues';
import { useSession } from '@/hooks/useSession';
import { useTickets } from '@/hooks/useTickets';
import { ownerKeyFor } from '@/lib/auth/owner';
import { CAMPUS_SERVICES, getService } from '@/lib/data/services';
import { getServiceStatus } from '@/lib/services/status';
import { cn } from '@/lib/utils';

type Filter = 'ALL' | 'OPEN' | 'SHORT';

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'All services' },
  { value: 'OPEN', label: 'Open now' },
  { value: 'SHORT', label: 'Short wait' },
];

export function ServicesDirectory() {
  const { session } = useSession();
  const ownerKey = ownerKeyFor(session);
  const { active } = useTickets(ownerKey || undefined);
  const { queues, loading, error } = useServiceQueues();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');

  const activeTicket = active[0];
  const activeService = activeTicket ? getService(activeTicket.serviceId) : undefined;

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return CAMPUS_SERVICES.filter((service) => {
      if (trimmed) {
        const haystack = [
          service.name,
          service.office,
          service.location,
          service.description,
          ...service.requestTypes.map((type) => type.label),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(trimmed)) return false;
      }
      const queue = queues?.[service.id];
      const status = getServiceStatus(service, queue);
      if (filter === 'OPEN' && status === 'CLOSED') return false;
      if (filter === 'SHORT' && (queue?.estimatedWaitMinutes ?? 99) > 12) return false;
      return true;
    });
  }, [query, filter, queues]);

  return (
    <>
      <PageHeader
        eyebrow="Campus services"
        title="Find the office you need."
        description="Each service has one shared queue for online, QR, kiosk, and walk-in students. Pick a service to see the current line."
        actions={
          <a
            href="/queue"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-ink-950/10 bg-white px-3.5 text-[0.8125rem] font-semibold text-ink-800 shadow-soft transition-colors hover:bg-cream-50"
          >
            <Ticket size={15} aria-hidden="true" />
            My queue
          </a>
        }
      />

      {activeTicket ? (
        <Alert tone="warning" className="mt-5" title="You already have an active queue">
          {activeTicket.displayNumber} at {activeService?.name ?? 'a campus service'} is still open.
          Finish or leave that queue before getting a new number.{' '}
          <a href={`/queue/ticket/${activeTicket.id}`} className="font-bold underline underline-offset-2">
            View ticket
          </a>
        </Alert>
      ) : null}

      <div className="mt-5 rounded-2xl border border-ink-950/8 bg-white p-3 shadow-soft sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="service-search" className="sr-only">
              Search campus services
            </label>
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <input
              id="service-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search office, document, or request"
              className="h-11 w-full rounded-xl border border-ink-950/10 bg-cream-50 pl-10 pr-10 text-sm text-ink-950 transition-colors placeholder:text-ink-400 hover:border-ink-950/20 focus:border-bamboo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-bamboo-500/10"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-950/5 hover:text-ink-700"
              >
                <X size={15} />
              </button>
            ) : null}
          </div>

          <div className="flex shrink-0 gap-1 overflow-x-auto rounded-xl bg-cream-100 p-1 no-scrollbar" role="group" aria-label="Filter services">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
                className={cn(
                  'min-h-9 whitespace-nowrap rounded-lg px-3 text-[0.6875rem] font-bold transition-colors',
                  filter === item.value
                    ? 'bg-white text-ink-950 shadow-soft'
                    : 'text-ink-500 hover:text-ink-800',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[0.6875rem] font-medium text-ink-400" aria-live="polite">
          {loading ? 'Checking the lines…' : `${results.length} service${results.length === 1 ? '' : 's'}`}
        </p>
        <p className="inline-flex items-center gap-1.5 text-[0.5625rem] font-semibold uppercase tracking-[0.11em] text-ink-400">
          <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-emerald-500" aria-hidden="true" />
          Simulated live counts
        </p>
      </div>

      {error ? (
        <Alert tone="error" className="mt-4" title="Queue information is unavailable">
          {error} You can still open a service and try again.
        </Alert>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {loading && !queues
          ? Array.from({ length: 6 }).map((_, index) => <ServiceCardSkeleton key={index} />)
          : results.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                queue={queues?.[service.id]}
                href={`/services/${service.id}`}
              />
            ))}
      </div>

      {!loading && results.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid size={22} />}
          title="No services match that search"
          description="Try a different office name or clear the filters. You can also browse every campus service."
          action={
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilter('ALL');
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-bamboo-900 px-4 text-xs font-bold text-cream-50 hover:bg-bamboo-800"
            >
              Clear search and filters
            </button>
          }
        />
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-bamboo-900/10 bg-bamboo-900 p-5 text-cream-50 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow text-bamboo-300">One queue per service</p>
            <h2 className="mt-2 text-lg font-bold tracking-[-0.03em] sm:text-xl">
              Online or walk-in, the number is the same.
            </h2>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-cream-100/60">
              If six students are already waiting when you join, your number is the next one — not
              number one. Digital tickets do not skip the line.
            </p>
          </div>
          <a
            href="/queue"
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 text-[0.75rem] font-semibold text-cream-50 transition-colors hover:bg-white/10"
          >
            Check my queue
          </a>
        </div>
      </section>
    </>
  );
}
