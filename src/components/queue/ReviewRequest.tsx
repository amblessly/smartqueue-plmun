import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BellRing,
  Clock3,
  Edit3,
  Info,
  MapPin,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/app/StepIndicator';
import { QueueStats } from '@/components/queue/QueueStats';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { useServiceQueues } from '@/hooks/useServiceQueues';
import { useSession } from '@/hooks/useSession';
import { useTickets } from '@/hooks/useTickets';
import { ownerKeyFor } from '@/lib/auth/owner';
import { getService } from '@/lib/data/services';
import { clearRequestDraft, getRequestDraft } from '@/lib/queue/request-draft';
import { queueService, studentFromSession } from '@/lib/queue/queue-service';
import { cn, pluralize, waitEstimate } from '@/lib/utils';

export function ReviewRequest({ serviceId }: { serviceId: string }) {
  const service = getService(serviceId);
  const { session } = useSession();
  const ownerKey = ownerKeyFor(session);
  const { active, refresh } = useTickets(ownerKey || undefined);
  const { queues } = useServiceQueues();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const draft = useMemo(() => (service ? getRequestDraft(service.id) : null), [service]);
  const queue = queues?.[serviceId];
  const activeTicket = active[0];

  useEffect(() => {
    if (joined) return;
    if (!session) return;
    if (!service) return;
    if (!draft) {
      window.location.replace(`/services/${serviceId}`);
    }
  }, [draft, joined, service, serviceId, session]);

  if (!service || !session) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-xl font-bold text-ink-950">Request unavailable</h1>
        <p className="mt-2 text-sm text-ink-500">Start again from the campus services directory.</p>
        <a
          href="/services"
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-bamboo-900 px-4 text-xs font-bold text-cream-50"
        >
          Browse services
        </a>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center" role="status">
        <p className="text-sm text-ink-500">Taking you back to your request…</p>
      </div>
    );
  }

  const studentName = draft.studentName || session.name;
  const studentId = draft.studentIdNumber || session.studentId || '';
  const phone = draft.contactPhone || session.phone;
  const ahead = queue?.waitingCount ?? 0;

  const join = async () => {
    if (!studentId.trim()) {
      setError('Add your student ID before joining.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await queueService.joinQueue({
        serviceId: service.id,
        requestType: draft.requestType,
        requestLabel: draft.requestLabel,
        details: draft.details,
        student: studentFromSession({
          name: studentName,
          studentId,
          email: session.email || undefined,
          phone,
        }),
        isGuest: session.isGuest,
        ownerKey,
      });
      clearRequestDraft();
      setJoined(true);
      window.location.assign(`/queue/ticket/${ticket.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'We could not add you to the queue. Check the line and try again.',
      );
      setSubmitting(false);
      void refresh();
    }
  };

  return (
    <>
      <a
        href={`/queue/request/${service.id}`}
        className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-ink-500 transition-colors hover:text-bamboo-800"
      >
        Edit request details
      </a>

      <div className="mt-4 rounded-2xl border border-ink-950/8 bg-white px-4 py-3.5 shadow-soft sm:px-5">
        <StepIndicator steps={['Service', 'Details', 'Review']} current={2} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-ink-950/8 bg-white p-5 shadow-soft sm:p-6">
            <p className="eyebrow text-bamboo-600">Review</p>
            <h1 className="mt-2 text-[1.5rem] font-extrabold leading-[1.08] tracking-[-0.04em] text-ink-950 sm:text-[1.75rem]">
              One last look before you join.
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-ink-500">
              Check the service and request below. Your number will join the same line as walk-ins
              and other digital tickets.
            </p>

            <div className="mt-5 rounded-xl border border-ink-950/8 bg-cream-50/70">
              <div className="flex items-start gap-3 border-b border-dashed border-ink-950/12 p-4">
                <ServiceIcon service={service} />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-ink-400">
                    Service
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-ink-950">{service.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[0.625rem] text-ink-400">
                    <MapPin size={11} aria-hidden="true" />
                    {service.location}
                  </p>
                </div>
                <a
                  href={`/services/${service.id}`}
                  className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white hover:text-bamboo-700"
                  aria-label="Change service"
                >
                  <Edit3 size={14} />
                </a>
              </div>

              <dl className="divide-y divide-ink-950/6">
                <div className="flex items-start justify-between gap-4 px-4 py-3">
                  <dt className="text-[0.6875rem] font-medium text-ink-500">Request</dt>
                  <dd className="max-w-[65%] text-right text-[0.75rem] font-bold text-ink-900">
                    {draft.requestLabel}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 px-4 py-3">
                  <dt className="text-[0.6875rem] font-medium text-ink-500">Name</dt>
                  <dd className="max-w-[65%] text-right text-[0.75rem] font-bold text-ink-900">
                    {studentName}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 px-4 py-3">
                  <dt className="text-[0.6875rem] font-medium text-ink-500">Student ID</dt>
                  <dd className="max-w-[65%] text-right text-[0.75rem] font-bold text-ink-900">
                    {studentId || 'Not provided'}
                  </dd>
                </div>
                {phone ? (
                  <div className="flex items-start justify-between gap-4 px-4 py-3">
                    <dt className="text-[0.6875rem] font-medium text-ink-500">Contact</dt>
                    <dd className="max-w-[65%] text-right text-[0.75rem] font-bold text-ink-900">{phone}</dd>
                  </div>
                ) : null}
                {draft.details ? (
                  <div className="px-4 py-3">
                    <dt className="text-[0.6875rem] font-medium text-ink-500">Notes</dt>
                    <dd className="mt-1 text-[0.75rem] leading-relaxed text-ink-700">{draft.details}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-bamboo-200 bg-bamboo-50 px-3.5 py-3">
              <BellRing size={14} className="mt-0.5 shrink-0 text-bamboo-700" aria-hidden="true" />
              <p className="text-[0.6875rem] leading-relaxed text-bamboo-900">
                After joining, keep the ticket page open for live updates. You can step away and
                come back when you’re almost up.
              </p>
            </div>

            {activeTicket ? (
              <Alert tone="warning" className="mt-4" title="You already have an active queue">
                {activeTicket.displayNumber} is still open. Finish or leave it before joining
                another queue.{' '}
                <a
                  href={`/queue/ticket/${activeTicket.id}`}
                  className="font-bold underline underline-offset-2"
                >
                  Open {activeTicket.displayNumber}
                </a>
              </Alert>
            ) : null}

            {error ? (
              <Alert tone="error" className="mt-4" title="We couldn’t add you to the queue">
                {error}
              </Alert>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a
                href={`/queue/request/${service.id}`}
                className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-ink-950/12 bg-white px-5 text-sm font-semibold text-ink-700 transition-colors hover:bg-cream-50"
              >
                Edit
              </a>
              <Button
                type="button"
                size="lg"
                full
                loading={submitting}
                disabled={Boolean(activeTicket)}
                onClick={join}
                className="sm:flex-1"
              >
                <Ticket size={16} aria-hidden="true" />
                Join the queue
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-950/8 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-950">
              <Info size={15} className="text-bamboo-600" aria-hidden="true" />
              What happens next
            </h2>
            <ol className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                { title: 'Get your number', body: 'A ticket is created at the end of the line.' },
                { title: 'Track the line', body: 'Your ticket updates as students are served.' },
                { title: 'Come back', body: 'Head to the counter when your number is called.' },
              ].map((item, index) => (
                <li key={item.title} className="rounded-xl bg-cream-50 p-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bamboo-900 text-[0.5625rem] font-extrabold text-cream-50">
                    {index + 1}
                  </span>
                  <p className="mt-2 text-[0.6875rem] font-bold text-ink-900">{item.title}</p>
                  <p className="mt-0.5 text-[0.625rem] leading-relaxed text-ink-500">{item.body}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="min-w-0">
          <div className="space-y-3 lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-2xl border border-bamboo-900/12 bg-white shadow-card">
              <div className="bg-bamboo-900 px-4 py-3.5 text-cream-50">
                <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.14em] text-bamboo-300">
                  Your place in line
                </p>
                <p className="mt-1 text-3xl font-extrabold tracking-[-0.05em] tabular">
                  {ahead === 0 ? 'Next' : ahead + 1}
                </p>
                <p className="mt-0.5 text-[0.625rem] text-cream-100/60">
                  {ahead === 0 ? 'You’ll be first in line' : `Behind ${pluralize(ahead, 'student')}`}
                </p>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.625rem] text-ink-500">Now serving</span>
                  <span className="text-sm font-extrabold text-ink-950 tabular">
                    {queue?.nowServing?.displayNumber ?? '—'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[0.625rem] text-ink-500">Estimated wait</span>
                  <span className="text-sm font-extrabold text-bamboo-800">
                    {waitEstimate(queue?.estimatedWaitMinutes ?? 0)}
                  </span>
                </div>
                <div className={cn('mt-3 flex items-center gap-1.5 rounded-lg bg-cream-50 px-2.5 py-2 text-[0.5625rem] font-medium text-ink-500')}>
                  <Users size={11} aria-hidden="true" />
                  One shared line · digital + walk-in
                </div>
              </div>
            </div>

            <QueueStats service={service} queue={queue} compact />

            <div className="rounded-xl border border-ink-950/8 bg-cream-100/70 p-3.5">
              <p className="flex items-center gap-1.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.11em] text-ink-400">
                <Clock3 size={11} aria-hidden="true" /> Office hours
              </p>
              <p className="mt-1 text-[0.6875rem] font-semibold text-ink-800">
                {service.hours.days} · {service.hours.time}
              </p>
              <p className="mt-0.5 text-[0.5625rem] leading-relaxed text-ink-400">{service.hours.note}</p>
            </div>

            <p className="flex items-start gap-1.5 px-1 text-[0.5625rem] leading-relaxed text-ink-400">
              <ShieldCheck size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
              Queue timing and activity in this prototype are simulated. Confirm details with the
              office.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
