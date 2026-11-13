import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  History,
  Radio,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { ActiveTicketCard } from '@/components/queue/ActiveTicketCard';
import { DemoControls } from '@/components/queue/DemoControls';
import { NotificationPermissionCard } from '@/components/queue/NotificationPermissionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { QueueStatusBadge } from '@/components/ui/StatusBadge';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSession } from '@/hooks/useSession';
import { useTickets } from '@/hooks/useTickets';
import { ownerKeyFor } from '@/lib/auth/owner';
import { getService } from '@/lib/data/services';
import { cn, formatDateTime, relativeTime } from '@/lib/utils';

type Tab = 'active' | 'history';

export function QueuePage() {
  const { session } = useSession();
  const ownerKey = ownerKeyFor(session);
  const { active, history, loading, error } = useTickets(ownerKey || undefined);
  const [tab, setTab] = useState<Tab>('active');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'history') setTab('history');
  }, []);

  const switchTab = (next: Tab) => {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === 'history') url.searchParams.set('tab', 'history');
    else url.searchParams.delete('tab');
    window.history.replaceState({}, '', url);
  };

  const activeCount = active.length;
  const historyCount = history.length;

  const historyGroups = useMemo(() => {
    const groups = new Map<string, typeof history>();
    for (const ticket of history) {
      const key = new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric' }).format(
        new Date(ticket.createdAt),
      );
      const current = groups.get(key) ?? [];
      current.push(ticket);
      groups.set(key, current);
    }
    return Array.from(groups.entries());
  }, [history]);

  if (!session) return null;

  return (
    <>
      <PageHeader
        eyebrow="My queue"
        title="Your place in line."
        description="Everything you’ve joined, live and past. Keep this tab open to see updates as they happen."
        actions={
          <a
            href="/services"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-bamboo-900 px-4 text-[0.8125rem] font-semibold text-cream-50 transition-colors hover:bg-bamboo-800"
          >
            <Sparkles size={15} aria-hidden="true" />
            Get a number
          </a>
        }
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-full rounded-xl border border-ink-950/8 bg-white p-1 shadow-soft sm:w-auto" role="tablist" aria-label="Queue views">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'active'}
            onClick={() => switchTab('active')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[0.75rem] font-bold transition-all duration-300 sm:flex-none',
              tab === 'active' ? 'bg-bamboo-900 text-cream-50' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            <Radio size={14} aria-hidden="true" />
            Active
            {activeCount > 0 ? (
              <span
                className={cn(
                  'ml-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[0.5625rem] font-extrabold',
                  tab === 'active' ? 'bg-cream-50 text-bamboo-900' : 'bg-gold-100 text-gold-700',
                )}
              >
                {activeCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'history'}
            onClick={() => switchTab('history')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[0.75rem] font-bold transition-all duration-300 sm:flex-none',
              tab === 'history' ? 'bg-bamboo-900 text-cream-50' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            <History size={14} aria-hidden="true" />
            History
            {historyCount > 0 ? (
              <span
                className={cn(
                  'ml-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[0.5625rem] font-extrabold',
                  tab === 'history' ? 'bg-cream-50 text-bamboo-900' : 'bg-cream-200 text-ink-500',
                )}
              >
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            ) : null}
          </button>
        </div>

        <p className="inline-flex items-center gap-1.5 px-1 text-[0.5625rem] font-semibold uppercase tracking-[0.11em] text-ink-400">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              activeCount > 0 ? 'animate-soft-pulse bg-emerald-500' : 'bg-ink-300',
            )}
            aria-hidden="true"
          />
          {activeCount > 0 ? 'Live updates on' : 'No active queue'}
        </p>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800" role="alert">
          {error}
        </div>
      ) : null}

      <div key={tab} className="tab-content-transition">
      {tab === 'active' ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-4">
            {loading ? (
              <Skeleton className="h-[24rem] rounded-2xl" />
            ) : active.length === 0 ? (
              <EmptyState
                icon={<Ticket size={22} />}
                title="No active queue"
                description="When you get a number, the live ticket will appear here. You can step away and come back to check your place."
                action={
                  <a
                    href="/services"
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-bamboo-900 px-4 text-xs font-bold text-cream-50 hover:bg-bamboo-800"
                  >
                    Browse campus services
                  </a>
                }
              />
            ) : (
              active.map((ticket) => <ActiveTicketCard key={ticket.id} ticket={ticket} variant="hero" />)
            )}

            {active.length > 0 ? (
              <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-soft sm:p-5">
                <h2 className="text-sm font-extrabold tracking-[-0.02em] text-ink-950">How live updates work</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {[
                    'The line moves when the office serves or calls a number.',
                    'Your ticket updates in this browser without a refresh.',
                    'Turn on alerts to get notified when you’re close.',
                  ].map((text, index) => (
                    <div key={text} className="rounded-xl bg-cream-50 p-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bamboo-900 text-[0.5625rem] font-extrabold text-cream-50">
                        {index + 1}
                      </span>
                      <p className="mt-2 text-[0.625rem] leading-relaxed text-ink-500">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <DemoControls />
          </div>

          <aside className="min-w-0 space-y-4">
            <NotificationPermissionCard ownerKey={ownerKey} />
            <div className="rounded-2xl border border-ink-950/8 bg-cream-100/70 p-4">
              <p className="flex items-center gap-1.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-ink-400">
                <Clock3 size={11} aria-hidden="true" /> One queue at a time
              </p>
              <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-ink-500">
                You can hold one active queue. Leave your current ticket before joining another
                service.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
              <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-amber-800">
                Simulated data
              </p>
              <p className="mt-1 text-[0.625rem] leading-relaxed text-amber-900/80">
                Queue activity in this prototype is generated on this device. It is not connected
                to PLMun offices.
              </p>
            </div>
          </aside>
        </div>
      ) : (
        <div className="mt-4">
          {loading ? (
            <div className="space-y-2.5">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              icon={<History size={22} />}
              title="No past queues yet"
              description="Completed, cancelled, and skipped tickets will be listed here for your reference."
              action={
                <a
                  href="/services"
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-bamboo-900 px-4 text-xs font-bold text-cream-50 hover:bg-bamboo-800"
                >
                  Get your first number
                </a>
              }
            />
          ) : (
            <div className="space-y-5">
              {historyGroups.map(([month, tickets]) => (
                <section key={month}>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-[0.6875rem] font-extrabold uppercase tracking-[0.13em] text-ink-400">
                      {month}
                    </h2>
                    <span className="text-[0.5625rem] text-ink-400">
                      {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </div>
                  <ul className="mt-2 divide-y divide-ink-950/6 overflow-hidden rounded-2xl border border-ink-950/8 bg-white shadow-soft">
                    {tickets.map((ticket) => {
                      const service = getService(ticket.serviceId);
                      return (
                        <li key={ticket.id}>
                          <a
                            href={`/queue/ticket/${ticket.id}`}
                            className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-cream-50"
                          >
                            {service ? <ServiceIcon service={service} size="sm" /> : null}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <p className="truncate text-xs font-bold text-ink-950">
                                  {service?.name ?? 'Campus service'}
                                </p>
                                <QueueStatusBadge status={ticket.status} size="sm" />
                              </div>
                              <p className="mt-0.5 truncate text-[0.625rem] text-ink-400">
                                {ticket.requestLabel} · {formatDateTime(ticket.createdAt)}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-extrabold tracking-[-0.03em] text-ink-800 tabular">
                                {ticket.displayNumber}
                              </p>
                              <p className="mt-0.5 text-[0.5625rem] text-ink-400">
                                {relativeTime(ticket.createdAt)}
                              </p>
                            </div>
                            <ChevronRight
                              size={14}
                              className="shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-bamboo-600"
                              aria-hidden="true"
                            />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
}
