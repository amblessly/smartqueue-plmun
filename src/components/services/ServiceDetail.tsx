import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Clock3,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { QueueStats } from '@/components/queue/QueueStats';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { ServiceStatusBadge } from '@/components/ui/StatusBadge';
import { useServiceQueues } from '@/hooks/useServiceQueues';
import { useSession } from '@/hooks/useSession';
import { useTickets } from '@/hooks/useTickets';
import { ownerKeyFor } from '@/lib/auth/owner';
import { getService } from '@/lib/data/services';
import { getServiceStatus } from '@/lib/services/status';
import { saveRequestDraft } from '@/lib/queue/request-draft';
import { cn, waitEstimate } from '@/lib/utils';

export function ServiceDetail({ serviceId }: { serviceId: string }) {
  const service = getService(serviceId);
  const { session } = useSession();
  const ownerKey = ownerKeyFor(session);
  const { active } = useTickets(ownerKey || undefined);
  const { queues, loading } = useServiceQueues();
  const [selected, setSelected] = useState('');
  const [error, setError] = useState<string | null>(null);

  const queue = queues?.[serviceId];
  const status = service ? getServiceStatus(service, queue) : 'CLOSED';
  const activeTicket = active[0];
  const activeService = activeTicket ? getService(activeTicket.serviceId) : undefined;

  const selectedType = useMemo(
    () => service?.requestTypes.find((type) => type.value === selected),
    [service, selected],
  );

  if (!service) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-xl font-bold text-ink-950">Service not found</h1>
        <p className="mt-2 text-sm text-ink-500">
          That campus service is not part of this prototype yet.
        </p>
        <a
          href="/services"
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-bamboo-900 px-4 text-xs font-bold text-cream-50"
        >
          Browse services
        </a>
      </div>
    );
  }

  const continueToDetails = () => {
    if (!selectedType) {
      setError('Choose what you need from this office.');
      return;
    }
    saveRequestDraft({
      serviceId: service.id,
      requestType: selectedType.value,
      requestLabel: selectedType.label,
      details: '',
      updatedAt: new Date().toISOString(),
    });
    window.location.assign(`/queue/request/${service.id}?type=${encodeURIComponent(selectedType.value)}`);
  };

  return (
    <>
      <a
        href="/services"
        className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-ink-500 transition-colors hover:text-bamboo-800"
      >
        All services
      </a>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-ink-950/8 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3.5">
                <ServiceIcon service={service} size="lg" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[1.6rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-ink-950 sm:text-[1.9rem]">
                      {service.name}
                    </h1>
                    <ServiceStatusBadge status={status} />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-ink-500">{service.office}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
                <p className="rounded-lg bg-cream-100 px-2.5 py-1.5 text-[0.5625rem] font-bold uppercase tracking-[0.1em] text-ink-500">
                  {service.code}
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-500">{service.description}</p>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
              <div className="flex items-start gap-2.5 rounded-xl bg-cream-50 p-3">
                <MapPin size={14} className="mt-0.5 shrink-0 text-bamboo-600" aria-hidden="true" />
                <div>
                  <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-ink-400">Where</p>
                  <p className="mt-0.5 text-[0.6875rem] font-semibold leading-relaxed text-ink-800">{service.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-cream-50 p-3">
                <Clock3 size={14} className="mt-0.5 shrink-0 text-bamboo-600" aria-hidden="true" />
                <div>
                  <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-ink-400">Hours</p>
                  <p className="mt-0.5 text-[0.6875rem] font-semibold leading-relaxed text-ink-800">
                    {service.hours.days} · {service.hours.time}
                  </p>
                  <p className="mt-0.5 text-[0.5625rem] text-ink-400">
                    {service.hours.verified ? 'Verified from PLMun' : 'Confirm with the office'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-cream-50 p-3">
                <Phone size={14} className="mt-0.5 shrink-0 text-bamboo-600" aria-hidden="true" />
                <div>
                  <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-ink-400">Local</p>
                  <p className="mt-0.5 text-[0.6875rem] font-semibold leading-relaxed text-ink-800">
                    loc. {service.phoneExtension}
                  </p>
                  <p className="mt-0.5 text-[0.5625rem] text-ink-400">Ask the operator</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-950/8 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow text-bamboo-600">Live queue</p>
                <h2 className="mt-1.5 text-base font-bold tracking-[-0.02em] text-ink-950">
                  How the line looks right now
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2 py-1 text-[0.5rem] font-bold uppercase tracking-[0.1em] text-ink-400">
                <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-emerald-500" aria-hidden="true" />
                Simulated
              </span>
            </div>

            <QueueStats service={service} queue={queue} className="mt-4" />

            <p className="mt-3 flex items-start gap-1.5 text-[0.625rem] leading-relaxed text-ink-400">
              <Info size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
              Estimates use an average of {service.avgServiceMinutes} minutes per student and{' '}
              {service.counterCount} {service.counterCount === 1 ? 'counter' : 'counters'}. Actual
              timing depends on the office.
            </p>

            {!loading && queue?.waiting.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {queue.waiting.slice(0, 6).map((ticket) => (
                  <span
                    key={ticket.id}
                    className="rounded-md bg-cream-100 px-1.5 py-1 text-[0.5625rem] font-bold text-ink-500 tabular"
                  >
                    {ticket.displayNumber}
                  </span>
                ))}
                {queue.waiting.length > 6 ? (
                  <span className="rounded-md px-1.5 py-1 text-[0.5625rem] font-semibold text-ink-400">
                    +{queue.waiting.length - 6}
                  </span>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-ink-950/8 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-bamboo-600">What do you need?</p>
                <h2 className="mt-1.5 text-base font-bold tracking-[-0.02em] text-ink-950">
                  Choose a request type
                </h2>
              </div>
              <span className="hidden text-[0.5625rem] font-semibold text-ink-400 sm:block">Step 1 of 3</span>
            </div>

            <fieldset className="mt-4">
              <legend className="sr-only">Request type</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {service.requestTypes.map((type) => {
                  const isSelected = selected === type.value;
                  return (
                    <label
                      key={type.value}
                      className={cn(
                        'flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-all',
                        isSelected
                          ? 'border-bamboo-500 bg-bamboo-50 ring-1 ring-bamboo-500/20'
                          : 'border-ink-950/10 bg-white hover:border-ink-950/20 hover:bg-cream-50/60',
                      )}
                    >
                      <input
                        type="radio"
                        name="request-type"
                        value={type.value}
                        checked={isSelected}
                        onChange={() => {
                          setSelected(type.value);
                          setError(null);
                        }}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          'mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border',
                          isSelected
                            ? 'border-bamboo-600 bg-bamboo-600 text-cream-50'
                            : 'border-ink-950/20 bg-white text-transparent',
                        )}
                        aria-hidden="true"
                      >
                        <Check size={10} strokeWidth={3} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.75rem] font-bold leading-snug text-ink-900">
                          {type.label}
                        </span>
                        {type.hint ? (
                          <span className="mt-0.5 block text-[0.625rem] leading-relaxed text-ink-400">
                            {type.hint}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {error ? (
              <Alert tone="error" className="mt-3">
                {error}
              </Alert>
            ) : null}
          </section>

          <section className="rounded-2xl border border-ink-950/8 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bamboo-50 text-bamboo-700 ring-1 ring-bamboo-100">
                <BadgeCheck size={15} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-ink-950">What to bring</h2>
                <p className="mt-0.5 text-[0.6875rem] text-ink-400">
                  Confirm requirements at the counter before your turn.
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {service.requirements.map((requirement) => (
                <li key={requirement} className="flex items-start gap-2 text-xs leading-relaxed text-ink-600">
                  <Check size={13} className="mt-0.5 shrink-0 text-bamboo-500" aria-hidden="true" />
                  {requirement}
                </li>
              ))}
              <li className="flex items-start gap-2 text-xs leading-relaxed text-ink-600">
                <Check size={13} className="mt-0.5 shrink-0 text-bamboo-500" aria-hidden="true" />
                Any form or reference number the office gave you
              </li>
            </ul>

            {service.notes?.length ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                {service.notes.map((note) => (
                  <p key={note} className="flex items-start gap-2 text-[0.6875rem] leading-relaxed text-amber-900">
                    <Info size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {note}
                  </p>
                ))}
              </div>
            ) : null}
          </section>

          <p className="px-1 text-[0.5625rem] leading-relaxed text-ink-400">
            Office information is based on public PLMun pages and the University’s Citizen’s
            Charter. Hours and requirements can change; confirm with the office when in doubt.
          </p>
        </div>

        <aside className="min-w-0">
          <div className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-card sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.14em] text-ink-400">
                  Your ticket
                </p>
                <Ticket size={14} className="text-bamboo-600" aria-hidden="true" />
              </div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">Now serving</p>
                  <p className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-ink-950 tabular">
                    {queue?.nowServing?.displayNumber ?? '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">Est. wait</p>
                  <p className="mt-1 text-sm font-extrabold text-bamboo-800">
                    {waitEstimate(queue?.estimatedWaitMinutes ?? 0)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 rounded-xl bg-cream-50 p-3">
                <div className="flex items-center justify-between text-[0.6875rem]">
                  <span className="text-ink-500">Request</span>
                  <span className="max-w-[10rem] truncate font-semibold text-ink-900">
                    {selectedType?.label ?? 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[0.6875rem]">
                  <span className="text-ink-500">Students waiting</span>
                  <span className="font-semibold text-ink-900">{queue?.waitingCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-[0.6875rem]">
                  <span className="text-ink-500">Counters</span>
                  <span className="font-semibold text-ink-900">{service.counterCount}</span>
                </div>
              </div>

              {activeTicket ? (
                <div className="mt-4">
                  <Alert tone="warning">
                    You already have {activeTicket.displayNumber} at{' '}
                    {activeService?.name ?? 'another service'}. Finish or leave it first.
                  </Alert>
                  <a
                    href={`/queue/ticket/${activeTicket.id}`}
                    className="mt-2 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-ink-950/12 bg-cream-50 text-xs font-bold text-ink-800 hover:bg-cream-100"
                  >
                    View active ticket
                  </a>
                </div>
              ) : (
                <>
                  <Button
                    type="button"
                    full
                    size="lg"
                    className="mt-4"
                    onClick={continueToDetails}
                    disabled={status === 'CLOSED'}
                  >
                    Continue
                  </Button>
                  {status === 'CLOSED' ? (
                    <p className="mt-2 text-center text-[0.625rem] font-medium text-ink-400">
                      This office is closed right now. Queue joining is paused.
                    </p>
                  ) : (
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[0.5625rem] font-medium text-ink-400">
                      <ShieldCheck size={11} aria-hidden="true" />
                      No payment is collected in SmartQueue.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="mt-3 rounded-xl border border-ink-950/8 bg-cream-100/70 px-3.5 py-3">
              <p className="flex items-center gap-1.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.11em] text-ink-400">
                <Users size={11} aria-hidden="true" /> Same line for everyone
              </p>
              <p className="mt-1 text-[0.625rem] leading-relaxed text-ink-500">
                Digital, QR, kiosk, and walk-in tickets all join this one queue.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
