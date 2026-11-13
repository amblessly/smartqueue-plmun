import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Info,
  MapPin,
  ShieldCheck,
  Ticket,
  UserRound,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { StepIndicator } from '@/components/app/StepIndicator';
import { QueueStats } from '@/components/queue/QueueStats';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { useServiceQueues } from '@/hooks/useServiceQueues';
import { useSession } from '@/hooks/useSession';
import { useTickets } from '@/hooks/useTickets';
import { ownerKeyFor } from '@/lib/auth/owner';
import { updateProfile } from '@/lib/auth/session';
import { getService } from '@/lib/data/services';
import { getRequestDraft, requestLabelFor, saveRequestDraft } from '@/lib/queue/request-draft';
import {
  hasErrors,
  validateDetails,
  validateName,
  validatePhone,
  validateStudentId,
  type FieldErrors,
} from '@/lib/validation/forms';
import { waitEstimate } from '@/lib/utils';

export function RequestDetailsForm({ serviceId }: { serviceId: string }) {
  const service = getService(serviceId);
  const { session } = useSession();
  const ownerKey = ownerKeyFor(session);
  const { active } = useTickets(ownerKey || undefined);
  const { queues } = useServiceQueues();
  const queue = queues?.[serviceId];
  const activeTicket = active[0];

  const draft = useMemo(() => (service ? getRequestDraft(service.id) : null), [service]);

  const [requestType, setRequestType] = useState(draft?.requestType ?? '');
  const [details, setDetails] = useState(draft?.details ?? '');
  const [name, setName] = useState(draft?.studentName ?? session?.name ?? '');
  const [studentId, setStudentId] = useState(
    draft?.studentIdNumber ?? session?.studentId ?? '',
  );
  const [phone, setPhone] = useState(draft?.contactPhone ?? session?.phone ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    if (!name && session.name && !session.isGuest) setName(session.name);
    if (!studentId && session.studentId) setStudentId(session.studentId);
    if (!phone && session.phone) setPhone(session.phone);
  }, [session, name, studentId, phone]);

  if (!service || !session) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-xl font-bold text-ink-950">Request unavailable</h1>
        <p className="mt-2 text-sm text-ink-500">
          Choose a campus service before starting a queue request.
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

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const nextErrors: FieldErrors = {};
    if (!requestType) nextErrors.requestType = 'Choose what you need from this office.';
    const detailsError = validateDetails(details);
    if (detailsError) nextErrors.details = detailsError;
    const nameError = validateName(name);
    if (nameError) nextErrors.name = nameError;
    const idError = validateStudentId(studentId);
    if (idError) nextErrors.studentId = idError;
    const phoneError = validatePhone(phone);
    if (phoneError) nextErrors.phone = phoneError;
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    if (activeTicket) {
      setServerError('Finish or leave your current queue before starting another request.');
      return;
    }

    setSubmitting(true);
    try {
      if (!session.isGuest) {
        const changed =
          name.trim() !== (session.name ?? '') ||
          studentId.trim() !== (session.studentId ?? '') ||
          phone.trim() !== (session.phone ?? '');
        if (changed) {
          await updateProfile({
            name: name.trim(),
            studentId: studentId.trim(),
            phone: phone.trim() || undefined,
          });
        }
      }

      saveRequestDraft({
        serviceId: service.id,
        requestType,
        requestLabel: requestLabelFor(service.requestTypes, requestType),
        details: details.trim(),
        studentName: name.trim(),
        studentIdNumber: studentId.trim(),
        contactPhone: phone.trim(),
        updatedAt: new Date().toISOString(),
      });

      window.location.assign(`/queue/review/${service.id}`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not save your request.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <a
        href={`/services/${service.id}`}
        className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-ink-500 transition-colors hover:text-bamboo-800"
      >
        {service.name}
      </a>

      <div className="mt-4 rounded-2xl border border-ink-950/8 bg-white px-4 py-3.5 shadow-soft sm:px-5">
        <StepIndicator steps={['Service', 'Details', 'Review']} current={1} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <form onSubmit={submit} className="min-w-0 space-y-4" noValidate>
          <section className="rounded-2xl border border-ink-950/8 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-start gap-3">
              <ServiceIcon service={service} />
              <div className="min-w-0">
                <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.13em] text-ink-400">
                  Request details
                </p>
                <h1 className="mt-0.5 text-lg font-extrabold tracking-[-0.03em] text-ink-950">
                  {service.name}
                </h1>
                <p className="mt-0.5 flex items-center gap-1 text-[0.625rem] text-ink-400">
                  <MapPin size={11} aria-hidden="true" />
                  {service.location}
                </p>
              </div>
            </div>

            {activeTicket ? (
              <Alert tone="warning" className="mt-4" title="You already have a live queue">
                {activeTicket.displayNumber} is still active. You can only hold one queue at a
                time.{' '}
                <a href={`/queue/ticket/${activeTicket.id}`} className="font-bold underline underline-offset-2">
                  View your ticket
                </a>
              </Alert>
            ) : null}

            <div className="mt-5 space-y-4">
              <Select
                label="What do you need?"
                name="request-type"
                value={requestType}
                onChange={(value) => {
                  setRequestType(value);
                  setErrors((current) => ({ ...current, requestType: '' }));
                }}
                options={service.requestTypes.map((type) => ({ value: type.value, label: type.label }))}
                error={errors.requestType}
                required
              />

              <Textarea
                label="Anything the office should know?"
                name="request-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                maxLength={300}
                counter
                optional
                placeholder="Example: Requesting my COM for a scholarship application. I already have a receipt."
                hint="Keep it brief. Do not include passwords, grades, or other sensitive details."
                error={errors.details}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-950/8 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bamboo-50 text-bamboo-700 ring-1 ring-bamboo-100">
                <UserRound size={17} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-bold tracking-[-0.02em] text-ink-950">Who is this for?</h2>
                <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-500">
                  Staff use this to match the number to your record when you reach the counter.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <Input
                label="Full name"
                name="request-name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                error={errors.name}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Student ID"
                  name="request-student-id"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  error={errors.studentId}
                  placeholder="2024-10482"
                  required
                />
                <Input
                  label="Contact number"
                  name="request-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  error={errors.phone}
                  optional
                />
              </div>
              {session.isGuest ? (
                <p className="rounded-lg bg-cream-100 px-3 py-2 text-[0.625rem] leading-relaxed text-ink-500">
                  You’re using a guest session. Your ticket stays on this device. Signing in later
                  keeps your history across devices.
                </p>
              ) : (
                <p className="flex items-center gap-1.5 text-[0.625rem] text-ink-400">
                  <Check size={12} className="text-bamboo-500" aria-hidden="true" />
                  Prefilled from your account · {session.email}
                </p>
              )}
            </div>
          </section>

          {serverError ? (
            <Alert tone="error" title="We couldn’t continue">
              {serverError}
            </Alert>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={`/services/${service.id}`}
              className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-ink-950/12 bg-white px-5 text-sm font-semibold text-ink-700 transition-colors hover:bg-cream-50 sm:w-auto"
            >
              Back
            </a>
            <Button
              type="submit"
              size="lg"
              full
              loading={submitting}
              disabled={Boolean(activeTicket)}
              className="sm:flex-1"
            >
              Review request
            </Button>
          </div>
        </form>

        <aside className="min-w-0">
          <div className="space-y-3 lg:sticky lg:top-6">
            <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.13em] text-ink-400">
                  Live line
                </p>
                <Ticket size={14} className="text-bamboo-600" aria-hidden="true" />
              </div>
              <QueueStats service={service} queue={queue} compact className="mt-3 grid-cols-2 sm:grid-cols-2" />
              <div className="mt-3 flex items-center justify-between rounded-xl bg-cream-50 px-3 py-2.5">
                <span className="text-[0.625rem] text-ink-500">Est. wait if you join now</span>
                <span className="text-xs font-extrabold text-bamboo-900">
                  {waitEstimate(queue?.estimatedWaitMinutes ?? 0)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-ink-950/8 bg-cream-100/70 p-3.5">
              <p className="flex items-center gap-1.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.11em] text-ink-400">
                <Info size={11} aria-hidden="true" /> Before you join
              </p>
              <ul className="mt-2 space-y-1.5">
                {service.requirements.slice(0, 4).map((requirement) => (
                  <li key={requirement} className="flex items-start gap-1.5 text-[0.625rem] leading-relaxed text-ink-600">
                    <Check size={11} className="mt-0.5 shrink-0 text-bamboo-500" aria-hidden="true" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>

            <p className="flex items-start gap-1.5 px-1 text-[0.5625rem] leading-relaxed text-ink-400">
              <ShieldCheck size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
              This prototype stores your request on this device. Queue activity is simulated.
            </p>

            <a
              href={`/services/${service.id}`}
              className="hidden items-center justify-between rounded-xl border border-ink-950/8 bg-white px-3.5 py-3 text-[0.6875rem] font-semibold text-ink-600 transition-colors hover:bg-cream-50 lg:flex"
            >
              View office details
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
