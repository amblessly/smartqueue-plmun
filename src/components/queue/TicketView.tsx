import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  CheckCircle2,
  ChevronDown,
  Clock3,
  DoorOpen,
  Info,
  MapPin,
  Radio,
  ShieldCheck,
  Sparkles,
  Ticket,
  TriangleAlert,
  Users,
  XCircle,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { QueueStatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { DemoControls } from '@/components/queue/DemoControls';
import { NotificationPermissionCard } from '@/components/queue/NotificationPermissionCard';
import { useSession } from '@/hooks/useSession';
import { useTicketView } from '@/hooks/useTicketView';
import { ownerKeyFor } from '@/lib/auth/owner';
import { getService } from '@/lib/data/services';
import { queueService } from '@/lib/queue/queue-service';
import {
  cn,
  formatDateTime,
  formatTime,
  relativeTime,
  waitEstimate,
} from '@/lib/utils';

function ticketIdFromPath(): string {
  if (typeof window === 'undefined') return '';
  const match = window.location.pathname.match(/\/queue\/ticket\/([^/]+)\/?$/);
  if (!match) return '';
  const value = decodeURIComponent(match[1]);
  return value === 'shell' ? '' : value;
}

function statusCopy(status: string): { title: string; body: string } {
  switch (status) {
    case 'WAITING':
      return {
        title: 'You’re in the queue.',
        body: 'You can step away. Keep this page open so you don’t miss your turn.',
      };
    case 'UP_NEXT':
      return {
        title: 'You’re next in line.',
        body: 'Stay close to the office. Your number should be called soon.',
      };
    case 'CALLED':
      return {
        title: 'It’s your turn.',
        body: 'Please proceed to the counter shown below.',
      };
    case 'SERVING':
      return {
        title: 'You’re being served.',
        body: 'Your number is at the counter right now.',
      };
    case 'COMPLETED':
      return {
        title: 'Request completed.',
        body: 'This queue is finished. You can get a new number whenever you need one.',
      };
    case 'CANCELLED':
      return {
        title: 'You left the queue.',
        body: 'This ticket is closed. You can get a new number any time.',
      };
    case 'SKIPPED':
      return {
        title: 'This number was skipped.',
        body: 'The office called this number and it was not claimed. Ask at the counter if you still need help.',
      };
    case 'EXPIRED':
      return {
        title: 'This ticket expired.',
        body: 'The queue closed before this number was served. Please get a new number or ask the office.',
      };
    default:
      return {
        title: 'Queue ticket',
        body: 'The latest ticket information is shown below.',
      };
  }
}

export function TicketView() {
  const { session } = useSession();
  const ownerKey = ownerKeyFor(session);
  const [ticketId, setTicketId] = useState(() => ticketIdFromPath());
  const { view, ticket, loading, error, refresh } = useTicketView(ticketId);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setTicketId(ticketIdFromPath());
  }, []);

  const current = view?.ticket ?? ticket;
  const service = current ? getService(current.serviceId) : undefined;

  const leaveQueue = async () => {
    if (!current || !ownerKey) return;
    setLeaving(true);
    setLeaveError(null);
    try {
      await queueService.cancelTicket(current.id, ownerKey);
      setConfirmLeave(false);
      await refresh();
    } catch (err) {
      setLeaveError(err instanceof Error ? err.message : 'Could not leave this queue.');
    } finally {
      setLeaving(false);
    }
  };

  if (!session) return null;

  if (loading && !current) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-4 h-[30rem] rounded-2xl" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!current || !service) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-100 text-ink-400">
          <Ticket size={24} />
        </span>
        <h1 className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-ink-950">
          Ticket not found
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          {error ?? 'This queue ticket is not available on this device. It may have been created in another browser.'}
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <a
            href="/queue"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-bamboo-900 px-4 text-xs font-bold text-cream-50 hover:bg-bamboo-800"
          >
            My queue
          </a>
          <a
            href="/services"
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-ink-950/12 bg-white px-4 text-xs font-semibold text-ink-700 hover:bg-cream-50"
          >
            Browse services
          </a>
        </div>
      </div>
    );
  }

  const status = current.status;
  const isActive =
    status === 'WAITING' || status === 'UP_NEXT' || status === 'CALLED' || status === 'SERVING';
  const isMine = current.ownerKey === ownerKey;
  const called = status === 'CALLED' || status === 'SERVING';
  const peopleAhead = view?.peopleAhead ?? 0;
  const wait = view?.estimatedWaitMinutes ?? 0;
  const total = view?.queue.activeTickets.length ?? 0;
  const progress = total > 0 ? Math.max(8, Math.min(100, ((total - peopleAhead) / total) * 100)) : 8;
  const copy = statusCopy(status);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <a
          href={isActive ? '/queue' : '/queue?tab=history'}
          className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-ink-500 transition-colors hover:text-bamboo-800"
        >
          {isActive ? 'My queue' : 'Queue history'}
        </a>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-2.5 py-1 text-[0.5625rem] font-bold uppercase tracking-[0.1em] text-ink-500">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isActive ? 'animate-soft-pulse bg-emerald-500' : 'bg-ink-300',
            )}
            aria-hidden="true"
          />
          {isActive ? 'Live updates on' : 'Closed ticket'}
        </span>
      </div>

      <div className="mx-auto mt-4 max-w-2xl">
        <section
          className={cn(
            'overflow-hidden rounded-2xl border bg-white shadow-card',
            isActive ? 'border-bamboo-900/12' : 'border-ink-950/8',
          )}
          aria-labelledby="ticket-heading"
        >
          <div
            className={cn(
              'relative px-5 py-4 text-cream-50 sm:px-6',
              called ? 'bg-emerald-800' : 'bg-bamboo-950',
            )}
          >
            <div
              className="absolute inset-0 opacity-10 [background-image:radial-gradient(rgba(245,242,233,0.8)_0.7px,transparent_0.7px)] [background-size:18px_18px]"
              aria-hidden="true"
            />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <ServiceIcon service={service} size="sm" className="h-8 w-8" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold tracking-[-0.02em]">{service.name}</p>
                  <p className="mt-0.5 truncate text-[0.625rem] text-cream-100/55">{service.office}</p>
                </div>
              </div>
              <QueueStatusBadge status={status} />
            </div>

            <div className="relative mt-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.16em] text-cream-100/50">
                  Your queue number
                </p>
                <p
                  id="ticket-heading"
                  className="mt-1 text-[3.8rem] font-extrabold leading-[0.86] tracking-[-0.07em] tabular sm:text-[4.6rem]"
                >
                  {current.displayNumber}
                </p>
              </div>
              <div className="pb-1 text-right">
                <p className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-cream-100/45">
                  {called ? 'Counter' : 'Now serving'}
                </p>
                <p className="mt-1 text-xl font-extrabold tracking-[-0.04em] tabular">
                  {called ? current.counter ?? 'Counter' : view?.queue.nowServing?.displayNumber ?? '—'}
                </p>
                {!called ? (
                  <p className="mt-0.5 text-[0.5625rem] text-cream-100/50">
                    {peopleAhead} ahead · {waitEstimate(wait)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative bg-white px-5 py-5 sm:px-6">
            <span className="ticket-notch -left-3 top-0" aria-hidden="true" />
            <span className="ticket-notch -right-3 top-0" aria-hidden="true" />

            <div className="text-center">
              <h2 className="text-lg font-extrabold tracking-[-0.03em] text-ink-950">{copy.title}</h2>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-500">{copy.body}</p>
            </div>

            {isActive ? (
              <>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-[0.625rem] font-semibold">
                    <span className="text-ink-500">
                      {called
                        ? status === 'SERVING'
                          ? 'At the counter now'
                          : 'Your number has been called'
                        : peopleAhead === 0
                          ? 'You’re next'
                          : `${peopleAhead} student${peopleAhead === 1 ? '' : 's'} ahead`}
                    </span>
                    <span className="text-bamboo-800">{Math.round(progress)}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream-200">
                    <div
                      className={cn(
                        'h-full rounded-full transition-[width] duration-500',
                        called ? 'bg-emerald-500' : 'bg-bamboo-600',
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 divide-x divide-ink-950/8 rounded-xl border border-ink-950/8 bg-cream-50/70 py-3">
                  <div className="px-2 text-center">
                    <p className="flex items-center justify-center gap-1 text-[0.5rem] font-extrabold uppercase tracking-[0.1em] text-ink-400">
                      <Radio size={9} aria-hidden="true" /> Serving
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-ink-950 tabular">
                      {view?.queue.nowServing?.displayNumber ?? '—'}
                    </p>
                  </div>
                  <div className="px-2 text-center">
                    <p className="flex items-center justify-center gap-1 text-[0.5rem] font-extrabold uppercase tracking-[0.1em] text-ink-400">
                      <Users size={9} aria-hidden="true" /> Ahead
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-ink-950 tabular">{peopleAhead}</p>
                  </div>
                  <div className="px-2 text-center">
                    <p className="flex items-center justify-center gap-1 text-[0.5rem] font-extrabold uppercase tracking-[0.1em] text-ink-400">
                      <Clock3 size={9} aria-hidden="true" /> Wait
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-ink-950">{waitEstimate(wait)}</p>
                  </div>
                </div>

                {status === 'CALLED' ? (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                    <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-emerald-700">
                      Go to
                    </p>
                    <p className="mt-0.5 text-base font-extrabold tracking-[-0.03em] text-emerald-950">
                      {current.counter ?? 'the assigned counter'} · {service.name}
                    </p>
                  </div>
                ) : null}

                {status === 'WAITING' || status === 'UP_NEXT' ? (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-bamboo-50 px-3.5 py-3">
                    <BellRing size={14} className="mt-0.5 shrink-0 text-bamboo-700" aria-hidden="true" />
                    <p className="text-[0.6875rem] leading-relaxed text-bamboo-900">
                      {status === 'UP_NEXT'
                        ? 'Stay near the office. Your number is next.'
                        : 'You can step away. We’ll update this ticket as the line moves.'}
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-5">
                {status === 'COMPLETED' ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center">
                    <CheckCircle2 size={26} className="mx-auto text-emerald-600" aria-hidden="true" />
                    <p className="mt-2 text-[0.6875rem] font-semibold text-emerald-900">
                      Served at {service.name}
                      {current.counter ? ` · ${current.counter}` : ''}
                    </p>
                    <p className="mt-0.5 text-[0.5625rem] text-emerald-700">
                      {current.completedAt ? formatDateTime(current.completedAt) : 'Completed'}
                    </p>
                  </div>
                ) : status === 'CANCELLED' ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
                    <XCircle size={26} className="mx-auto text-slate-500" aria-hidden="true" />
                    <p className="mt-2 text-[0.6875rem] font-semibold text-slate-700">
                      Closed {current.updatedAt ? relativeTime(current.updatedAt) : ''}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-center">
                    <TriangleAlert size={26} className="mx-auto text-amber-600" aria-hidden="true" />
                    <p className="mt-2 text-[0.6875rem] font-semibold text-amber-900">
                      This ticket is no longer active.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 border-t border-dashed border-ink-950/12 pt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-ink-400">
                    Request
                  </p>
                  <p className="mt-0.5 truncate text-xs font-bold text-ink-900">{current.requestLabel}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-ink-400">
                    Joined
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] font-semibold text-ink-700">
                    {formatTime(current.createdAt)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails((value) => !value)}
                aria-expanded={showDetails}
                className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg bg-cream-50 px-3 py-2 text-[0.625rem] font-semibold text-ink-600 transition-colors hover:bg-cream-100"
              >
                Ticket details
                <ChevronDown
                  size={13}
                  className={cn('transition-transform', showDetails && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>

              {showDetails ? (
                <dl className="mt-2 space-y-2 rounded-lg border border-ink-950/6 px-3 py-3 text-[0.625rem]">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-ink-400">Name</dt>
                    <dd className="text-right font-semibold text-ink-800">{current.student.name}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-ink-400">Student ID</dt>
                    <dd className="text-right font-semibold text-ink-800">{current.student.studentId}</dd>
                  </div>
                  {current.details ? (
                    <div>
                      <dt className="text-ink-400">Notes</dt>
                      <dd className="mt-0.5 leading-relaxed text-ink-700">{current.details}</dd>
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-ink-400">Ticket ID</dt>
                    <dd className="max-w-[60%] truncate text-right font-mono text-[0.5625rem] text-ink-500">
                      {current.id}
                    </dd>
                  </div>
                </dl>
              ) : null}
            </div>
          </div>
        </section>

        {isActive ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <NotificationPermissionCard ownerKey={ownerKey} compact />
            <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-soft">
              <p className="flex items-center gap-1.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-ink-400">
                <MapPin size={11} aria-hidden="true" /> Where to go
              </p>
              <p className="mt-1.5 text-xs font-bold text-ink-900">{service.name}</p>
              <p className="mt-0.5 text-[0.625rem] leading-relaxed text-ink-500">{service.location}</p>
              <p className="mt-2 flex items-center gap-1 text-[0.5625rem] text-ink-400">
                <Clock3 size={10} aria-hidden="true" />
                {service.hours.days} · {service.hours.time}
              </p>
              <p className="mt-2 text-[0.5625rem] leading-relaxed text-ink-400">
                Confirm the counter with staff when you arrive.
              </p>
            </div>
          </div>
        ) : null}

        {isMine && isActive ? (
          <div className="mt-4 rounded-2xl border border-ink-950/8 bg-white p-4 shadow-soft">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold text-ink-900">Need to leave this queue?</p>
                <p className="mt-0.5 text-[0.625rem] text-ink-500">
                  Leaving frees your spot. You can get a new number afterward.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmLeave(true)}
                className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-[0.6875rem] font-bold text-red-700 transition-colors hover:bg-red-100"
              >
                <DoorOpen size={13} aria-hidden="true" />
                Leave queue
              </button>
            </div>
            {leaveError ? (
              <p className="mt-2 text-[0.625rem] font-medium text-red-600" role="alert">
                {leaveError}
              </p>
            ) : null}
          </div>
        ) : null}

        {!isActive ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href="/services"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-bamboo-900 px-4 text-xs font-bold text-cream-50 transition-colors hover:bg-bamboo-800"
            >
              <Sparkles size={14} aria-hidden="true" />
              Get a new number
            </a>
            <a
              href="/dashboard"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-ink-950/12 bg-white px-4 text-xs font-semibold text-ink-700 transition-colors hover:bg-cream-50"
            >
              Back to home
            </a>
          </div>
        ) : null}

        {isActive ? (
          <div className="mt-4">
            <DemoControls serviceId={service.id} onReset={refresh} />
          </div>
        ) : null}

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
          <Info size={13} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
          <p className="text-[0.625rem] leading-relaxed text-amber-900/80">
            Prototype notice: this ticket and the queue activity around it are simulated on this
            device. SmartQueue is not an official PLMun service.
          </p>
        </div>

        {isActive ? (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.5625rem] text-ink-400">
            <ShieldCheck size={11} aria-hidden="true" />
            Last updated {view ? relativeTime(view.queue.updatedAt) : 'just now'} · updates
            automatically
          </p>
        ) : null}
      </div>

      <Modal
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        title="Leave this queue?"
        description={`${current.displayNumber} at ${service.name} will be cancelled. You can get a new number afterward.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmLeave(false)} disabled={leaving}>
              Keep my place
            </Button>
            <Button variant="danger" onClick={leaveQueue} loading={leaving}>
              Leave queue
            </Button>
          </>
        }
      >
        <Alert tone="warning">
          If your number is already being called, leaving may mean starting over at the end of the
          line.
        </Alert>
      </Modal>
    </>
  );
}
