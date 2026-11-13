import {
  ArrowRight,
  BellRing,
  CalendarDays,
  ChevronRight,
  Clock3,
  History,
  LayoutGrid,
  Radio,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { ActiveTicketCard } from '@/components/queue/ActiveTicketCard';
import { NotificationPermissionCard } from '@/components/queue/NotificationPermissionCard';
import { InstallCard } from '@/components/pwa/InstallCard';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { QueueStatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSession } from '@/hooks/useSession';
import { useServiceQueues } from '@/hooks/useServiceQueues';
import { useTickets } from '@/hooks/useTickets';
import { ownerKeyFor } from '@/lib/auth/owner';
import { CAMPUS_SERVICES, getService } from '@/lib/data/services';
import { getServiceStatus } from '@/lib/services/status';
import {
  cn,
  formatLongDate,
  firstName,
  greeting,
  relativeTime,
  waitEstimate,
} from '@/lib/utils';

export function DashboardView() {
  const { session } = useSession();
  const ownerKey = ownerKeyFor(session);
  const { active, history, loading } = useTickets(ownerKey || undefined);
  const { queues } = useServiceQueues();

  if (!session) return null;

  const activeTicket = active[0];
  const preferredIds = session.preferredServices.length
    ? session.preferredServices
    : ['registrar', 'cashier', 'student-affairs'];
  const preferred = preferredIds
    .map((id) => getService(id))
    .filter((service): service is NonNullable<typeof service> => Boolean(service))
    .slice(0, 3);

  const openCount = CAMPUS_SERVICES.filter(
    (service) => getServiceStatus(service, queues?.[service.id]) === 'OPEN',
  ).length;

  return (
    <>
      <PageHeader
        eyebrow={formatLongDate(new Date())}
        title={`${greeting()}, ${firstName(session.name)}.`}
        description={
          activeTicket
            ? 'Your queue is live. You can step away — this page updates as the line moves.'
            : 'Here’s your campus queue at a glance. Pick an office when you’re ready.'
        }
        actions={
          <>
            <a
              href="/queue"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-ink-950/10 bg-white px-3.5 text-[0.8125rem] font-semibold text-ink-800 shadow-soft transition-colors hover:bg-cream-50"
            >
              <Ticket size={15} aria-hidden="true" />
              My queue
            </a>
            <a
              href="/services"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-bamboo-900 px-4 text-[0.8125rem] font-semibold text-cream-50 transition-colors hover:bg-bamboo-800"
            >
              <Sparkles size={15} aria-hidden="true" />
              Get a number
            </a>
          </>
        }
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          {loading && !activeTicket ? (
            <Skeleton className="h-[22rem] rounded-2xl" />
          ) : activeTicket ? (
            <ActiveTicketCard ticket={activeTicket} variant="hero" />
          ) : (
            <section className="relative overflow-hidden rounded-2xl bg-bamboo-950 text-cream-50 shadow-card">
              <img
                src="/campus-background.png"
                alt=""
                width="1600"
                height="1200"
                className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-45"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(7,28,20,0.97)_0%,rgba(7,28,20,0.88)_52%,rgba(7,28,20,0.55)_100%)]"></div>
              <div className="relative p-5 sm:p-7">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[0.5625rem] font-bold uppercase tracking-[0.13em] text-white backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  {openCount} of {CAMPUS_SERVICES.length} services open
                </span>

                <h2 className="mt-5 max-w-md text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.05em] text-white sm:text-[2.35rem]">
                  No queue yet.
                  <span className="block font-display italic text-white">
                    What do you need today?
                  </span>
                </h2>
                <p className="mt-3 max-w-md text-xs leading-relaxed text-white sm:text-[0.8125rem]">
                  Get a number before you leave, then head over when the line gets close to yours.
                  No separate digital lane — you join the same queue as walk-ins.
                </p>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <a
                    href="/services"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[0.8125rem] font-bold text-[#1C1917] transition-[background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-black active:text-white"
                  >
                    Choose a service
                  </a>
                  <a
                    href="/queue"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    View past queues
                  </a>
                </div>

                <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-[0.625rem] font-medium text-white">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={12} aria-hidden="true" /> One shared line
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BellRing size={12} aria-hidden="true" /> Alerts when you’re close
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={12} aria-hidden="true" /> Guest access available
                  </span>
                </div>
              </div>
            </section>
          )}

          <section aria-labelledby="preferred-heading">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 id="preferred-heading" className="text-sm font-extrabold tracking-[-0.02em] text-ink-950">
                  Your usual offices
                </h2>
                <p className="mt-0.5 text-[0.6875rem] text-ink-400">
                  Live queue counts are simulated in this prototype.
                </p>
              </div>
              <a
                href="/services"
                className="inline-flex shrink-0 items-center gap-1 text-[0.6875rem] font-bold text-bamboo-800 hover:text-bamboo-600"
              >
                All services
              </a>
            </div>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {preferred.map((service) => {
                const queue = queues?.[service.id];
                const serving = queue?.nowServing?.displayNumber ?? '—';
                const wait = queue?.estimatedWaitMinutes ?? 0;
                const status = getServiceStatus(service, queue);
                return (
                  <a
                    key={service.id}
                    href={`/services/${service.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-ink-950/8 bg-white p-3.5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-bamboo-900/15 hover:shadow-card"
                  >
                    <ServiceIcon service={service} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink-950">{service.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[0.625rem] font-medium text-ink-400">
                        <Radio size={10} aria-hidden="true" />
                        Now {serving}
                        <span className="text-ink-300">·</span>
                        {waitEstimate(wait)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        status === 'OPEN' ? 'bg-emerald-500' : status === 'BUSY' ? 'bg-amber-500' : 'bg-slate-400',
                      )}
                      aria-label={status === 'OPEN' ? 'Open' : status === 'BUSY' ? 'Busy' : 'Closed'}
                    />
                  </a>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="recent-heading" className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-soft sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="recent-heading" className="flex items-center gap-2 text-sm font-extrabold tracking-[-0.02em] text-ink-950">
                <History size={15} className="text-bamboo-600" aria-hidden="true" />
                Recent activity
              </h2>
              <a
                href="/queue?tab=history"
                className="inline-flex shrink-0 items-center gap-1 text-[0.6875rem] font-bold text-bamboo-800 hover:text-bamboo-600"
              >
                View all
              </a>
            </div>

            {loading ? (
              <div className="mt-4 space-y-2.5">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : history.length === 0 ? (
              <p className="mt-4 rounded-xl bg-cream-50 px-4 py-5 text-center text-xs text-ink-500">
                Your completed queues will show up here.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-ink-950/6">
                {history.slice(0, 3).map((ticket) => {
                  const service = getService(ticket.serviceId);
                  return (
                    <li key={ticket.id}>
                      <a
                        href={`/queue/ticket/${ticket.id}`}
                        className="group flex items-center gap-3 py-3 transition-colors hover:bg-cream-50/70"
                      >
                        {service ? <ServiceIcon service={service} size="sm" /> : null}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-ink-900">
                            {service?.name ?? 'Campus service'}
                          </p>
                          <p className="mt-0.5 truncate text-[0.625rem] text-ink-400">
                            {ticket.requestLabel} · {relativeTime(ticket.createdAt)}
                          </p>
                        </div>
                        <span className="text-xs font-extrabold tracking-[-0.02em] text-ink-700 tabular">
                          {ticket.displayNumber}
                        </span>
                        <QueueStatusBadge status={ticket.status} size="sm" className="hidden sm:inline-flex" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <NotificationPermissionCard ownerKey={ownerKey} />

          <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-soft sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xs font-extrabold tracking-[-0.01em] text-ink-950">
                <Radio size={14} className="text-bamboo-600" aria-hidden="true" />
                Campus live
              </h2>
              <span className="inline-flex items-center gap-1 text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-emerald-700">
                <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-emerald-500" aria-hidden="true" />
                Simulated
              </span>
            </div>

            <ul className="mt-3 space-y-1.5">
              {CAMPUS_SERVICES.slice(0, 5).map((service) => {
                const queue = queues?.[service.id];
                const wait = queue?.estimatedWaitMinutes ?? 0;
                return (
                  <li key={service.id}>
                    <a
                      href={`/services/${service.id}`}
                      className="flex items-center gap-2.5 rounded-lg px-1.5 py-2 transition-colors hover:bg-cream-50"
                    >
                      <ServiceIcon service={service} size="sm" className="h-7 w-7" />
                      <span className="min-w-0 flex-1 truncate text-[0.6875rem] font-semibold text-ink-800">
                        {service.name}
                      </span>
                      <span className="text-[0.625rem] font-bold text-ink-500 tabular">
                        {queue?.nowServing?.displayNumber ?? '—'}
                      </span>
                      <span className="w-14 text-right text-[0.5625rem] font-medium text-ink-400">
                        {waitEstimate(wait)}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <a
              href="/services"
              className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-ink-950/8 bg-cream-50 px-3 py-2 text-[0.625rem] font-bold text-ink-700 transition-colors hover:bg-cream-100"
            >
              <LayoutGrid size={12} aria-hidden="true" />
              See all services
            </a>
          </div>

          <InstallCard />

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
            <p className="flex items-center gap-1.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.13em] text-amber-800">
              <CalendarDays size={12} aria-hidden="true" /> Prototype build
            </p>
            <p className="mt-1 text-[0.625rem] leading-relaxed text-amber-900/80">
              SmartQueue is an independent student project, not an official PLMun service. Queue
              numbers and office activity are simulated.
            </p>
          </div>

          <div className="hidden items-center gap-2 px-1 text-[0.5625rem] text-ink-400 xl:flex">
            <Clock3 size={11} aria-hidden="true" />
            Live updates every few seconds while this tab is open.
          </div>
        </aside>
      </div>
    </>
  );
}
