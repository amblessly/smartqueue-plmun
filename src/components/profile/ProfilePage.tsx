import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BellRing,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  DoorOpen,
  History,
  LoaderCircle,
  LogOut,
  Mail,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
} from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { InstallCard } from '@/components/pwa/InstallCard';
import { NotificationPermissionCard } from '@/components/queue/NotificationPermissionCard';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { useSession } from '@/hooks/useSession';
import { useTickets } from '@/hooks/useTickets';
import { ownerKeyFor } from '@/lib/auth/owner';
import { signOut, updateProfile } from '@/lib/auth/session';
import { IS_DEMO } from '@/lib/config';
import { CAMPUS_SERVICES, COURSE_OPTIONS, YEAR_LEVELS } from '@/lib/data/services';
import { queueService } from '@/lib/queue/queue-service';
import { cn, initials } from '@/lib/utils';
import {
  hasErrors,
  validateName,
  validatePhone,
  validateStudentId,
  type FieldErrors,
} from '@/lib/validation/forms';

export function ProfilePage() {
  const { session, loading } = useSession();
  const ownerKey = ownerKeyFor(session);
  const { active, history } = useTickets(ownerKey || undefined);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [preferred, setPreferred] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [confirmGuestUpgrade, setConfirmGuestUpgrade] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!session) return;
    setName(session.name ?? '');
    setStudentId(session.studentId ?? '');
    setPhone(session.phone ?? '');
    setCourse(session.course ?? '');
    setYearLevel(session.yearLevel ?? '');
    setPreferred(session.preferredServices);
  }, [session]);

  const completedCount = useMemo(
    () => history.filter((ticket) => ticket.status === 'COMPLETED').length,
    [history],
  );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink-500">
        Loading profile…
      </div>
    );
  }
  if (!session) {
    if (typeof window !== 'undefined') window.location.assign('/login');
    return null;
  }

  const beginEdit = () => {
    setEditing(true);
    setMessage(null);
    setServerError(null);
    setErrors({});
    setName(session.name ?? '');
    setStudentId(session.studentId ?? '');
    setPhone(session.phone ?? '');
    setCourse(session.course ?? '');
    setYearLevel(session.yearLevel ?? '');
    setPreferred(session.preferredServices);
  };

  const togglePreferred = (id: string) => {
    setPreferred((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setServerError(null);

    const nextErrors: FieldErrors = {};
    const nameError = validateName(name);
    if (nameError) nextErrors.name = nameError;
    const idError = validateStudentId(studentId);
    if (idError) nextErrors.studentId = idError;
    const phoneError = validatePhone(phone);
    if (phoneError) nextErrors.phone = phoneError;
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        studentId: studentId.trim(),
        phone: phone.trim() || undefined,
        course: course || undefined,
        yearLevel: yearLevel || undefined,
        preferredServices: preferred,
      });
      setEditing(false);
      setMessage('Profile updated.');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const endSession = async () => {
    await signOut();
    window.location.assign('/login');
  };

  const upgradeGuest = async () => {
    await signOut();
    window.location.assign('/login?next=/onboarding');
  };

  const resetDemo = () => {
    if (!window.confirm('Reset the simulated queues and notifications? Your account stays signed in.')) {
      return;
    }
    setResetting(true);
    queueService.resetDemoQueue();
    setMessage('Demo queues and notifications were reset.');
    setResetting(false);
  };

  const handleBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/home';
  };

  return (
    <>
      <div className="mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-950/10 bg-white px-3.5 py-2 text-[0.75rem] font-semibold text-ink-700 shadow-soft transition-colors hover:bg-cream-50"
        >
          <ArrowLeft size={15} aria-hidden="true" /> Back
        </button>
      </div>
      <PageHeader
        eyebrow="My Profile"
        title="My Profile"
        description="Manage your personal information and account settings."
        actions={
          !editing ? (
            <button
              type="button"
              onClick={beginEdit}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-bamboo-900 px-4 text-[0.8125rem] font-semibold text-cream-50 transition-colors hover:bg-bamboo-800"
            >
              <Pencil size={14} aria-hidden="true" />
              Edit profile
            </button>
          ) : null
        }
      />

      {message ? (
        <Alert tone="success" className="mt-4">
          {message}
        </Alert>
      ) : null}
      {serverError ? (
        <Alert tone="error" className="mt-4">
          {serverError}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-2xl border border-ink-950/8 bg-white shadow-soft">
            <div className="relative overflow-hidden bg-bamboo-950 px-5 py-5 text-cream-50 sm:px-6">
              <div
                className="absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(245,242,233,0.7)_0.7px,transparent_0.7px)] [background-size:20px_20px]"
                aria-hidden="true"
              />
              <div className="relative flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cream-50 text-lg font-extrabold text-bamboo-900">
                  {initials(session.name || 'Guest')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-extrabold tracking-[-0.03em]">
                      {session.name}
                    </h2>
                    <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.1em] text-cream-100/75">
                      {session.isGuest ? 'Guest' : IS_DEMO ? 'Prototype account' : 'PLMun account'}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-[0.6875rem] text-cream-100/55">
                    <Mail size={12} aria-hidden="true" />
                    {session.isGuest ? 'No email · guest access' : session.email}
                  </p>
                  <p className="mt-0.5 text-[0.625rem] text-cream-100/40">
                    {session.isGuest
                      ? 'Your queue history stays on this device.'
                      : [session.course, session.yearLevel].filter(Boolean).join(' · ') ||
                        'Add your course and year level'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-ink-950/6 border-b border-ink-950/6 sm:grid-cols-4">
              <div className="px-4 py-3">
                <p className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">Student ID</p>
                <p className="mt-1 truncate text-xs font-bold text-ink-900">{session.studentId || '—'}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">Contact</p>
                <p className="mt-1 truncate text-xs font-bold text-ink-900">{session.phone || '—'}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">Active</p>
                <p className="mt-1 text-xs font-bold text-ink-900">{active.length}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">Completed</p>
                <p className="mt-1 text-xs font-bold text-ink-900">{completedCount}</p>
              </div>
            </div>

            {editing ? (
              <form onSubmit={save} className="p-5 sm:p-6" noValidate>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-[-0.02em] text-ink-950">
                    <UserRound size={15} className="text-bamboo-600" aria-hidden="true" />
                    Edit your details
                  </h2>
                  <span className="text-[0.5625rem] font-medium text-ink-400">Saved on this device</span>
                </div>

                <div className="mt-4 space-y-4">
                  <Input
                    label="Full name"
                    name="profile-name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    error={errors.name}
                    required
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Student ID"
                      name="profile-student-id"
                      value={studentId}
                      onChange={(event) => setStudentId(event.target.value)}
                      error={errors.studentId}
                      required
                    />
                    <Input
                      label="Contact number"
                      name="profile-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      error={errors.phone}
                      optional
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Course / program"
                      name="profile-course"
                      value={course}
                      onChange={setCourse}
                      options={[...COURSE_OPTIONS]}
                      optional
                    />
                    <Select
                      label="Year level"
                      name="profile-year"
                      value={yearLevel}
                      onChange={setYearLevel}
                      options={[...YEAR_LEVELS]}
                      optional
                    />
                  </div>

                  <div>
                    <p className="text-[0.8125rem] font-semibold text-ink-800">Preferred offices</p>
                    <p className="mt-0.5 text-[0.625rem] text-ink-400">
                      Pick up to three to show first on your dashboard.
                    </p>
                    <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      {CAMPUS_SERVICES.map((service) => {
                        const selected = preferred.includes(service.id);
                        const disabled = !selected && preferred.length >= 3;
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => togglePreferred(service.id)}
                            disabled={disabled}
                            aria-pressed={selected}
                            className={cn(
                              'flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all',
                              selected
                                ? 'border-bamboo-500 bg-bamboo-50 ring-1 ring-bamboo-500/20'
                                : 'border-ink-950/10 bg-white hover:border-ink-950/20',
                              disabled && 'cursor-not-allowed opacity-45',
                            )}
                          >
                            <ServiceIcon service={service} size="sm" />
                            <span className="min-w-0 flex-1 truncate text-[0.6875rem] font-bold text-ink-900">
                              {service.name}
                            </span>
                            <span
                              className={cn(
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                                selected
                                  ? 'border-bamboo-600 bg-bamboo-600 text-cream-50'
                                  : 'border-ink-950/15 text-transparent',
                              )}
                              aria-hidden="true"
                            >
                              <Check size={11} strokeWidth={3} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditing(false);
                      setErrors({});
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={saving}>
                    Save changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-[-0.02em] text-ink-950">
                    <UserRound size={15} className="text-bamboo-600" aria-hidden="true" />
                    Account details
                  </h2>
                  <button
                    type="button"
                    onClick={beginEdit}
                    className="inline-flex items-center gap-1 text-[0.625rem] font-bold text-bamboo-800 hover:text-bamboo-600"
                  >
                    <Pencil size={11} aria-hidden="true" />
                    Edit
                  </button>
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">Full name</dt>
                    <dd className="mt-1 text-xs font-semibold text-ink-900">{session.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">Email</dt>
                    <dd className="mt-1 truncate text-xs font-semibold text-ink-900">
                      {session.email || 'Guest session'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">Student ID</dt>
                    <dd className="mt-1 text-xs font-semibold text-ink-900">{session.studentId || 'Not added'}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">Contact number</dt>
                    <dd className="mt-1 text-xs font-semibold text-ink-900">{session.phone || 'Not added'}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">Course</dt>
                    <dd className="mt-1 text-xs font-semibold text-ink-900">{session.course || 'Not added'}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">Year level</dt>
                    <dd className="mt-1 text-xs font-semibold text-ink-900">{session.yearLevel || 'Not added'}</dd>
                  </div>
                </dl>

                <div className="mt-5 border-t border-ink-950/6 pt-4">
                  <p className="text-[0.5625rem] font-bold uppercase tracking-[0.11em] text-ink-400">
                    Preferred offices
                  </p>
                  {session.preferredServices.length === 0 ? (
                    <p className="mt-1.5 text-[0.6875rem] text-ink-400">
                      No preferred offices yet. Edit your profile to choose up to three.
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {session.preferredServices.map((id) => {
                        const service = CAMPUS_SERVICES.find((item) => item.id === id);
                        return service ? (
                          <a
                            key={id}
                            href={`/services/${id}`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-ink-950/8 bg-cream-50 px-2.5 py-1 text-[0.625rem] font-semibold text-ink-700 transition-colors hover:bg-cream-100"
                          >
                            <ServiceIcon service={service} size="sm" className="h-5 w-5 rounded-md" />
                            {service.name}
                          </a>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-soft sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-[-0.02em] text-ink-950">
                <History size={15} className="text-bamboo-600" aria-hidden="true" />
                Your queue record
              </h2>
              <a
                href="/queue"
                className="inline-flex items-center gap-1 text-[0.625rem] font-bold text-bamboo-800 hover:text-bamboo-600"
              >
                Open queue
              </a>
            </div>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-xl bg-cream-50 p-3">
                <p className="flex items-center gap-1.5 text-[0.5625rem] font-bold uppercase tracking-[0.1em] text-ink-400">
                  <Ticket size={11} aria-hidden="true" /> Active
                </p>
                <p className="mt-1 text-xl font-extrabold text-ink-950">{active.length}</p>
              </div>
              <div className="rounded-xl bg-cream-50 p-3">
                <p className="flex items-center gap-1.5 text-[0.5625rem] font-bold uppercase tracking-[0.1em] text-ink-400">
                  <CheckCircle2 size={11} aria-hidden="true" /> Completed
                </p>
                <p className="mt-1 text-xl font-extrabold text-ink-950">{completedCount}</p>
              </div>
              <div className="rounded-xl bg-cream-50 p-3">
                <p className="flex items-center gap-1.5 text-[0.5625rem] font-bold uppercase tracking-[0.1em] text-ink-400">
                  <CalendarDays size={11} aria-hidden="true" /> All tickets
                </p>
                <p className="mt-1 text-xl font-extrabold text-ink-950">{history.length}</p>
              </div>
            </div>
          </section>

          {IS_DEMO ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
                    <Sparkles size={14} aria-hidden="true" />
                    Prototype tools
                  </h2>
                  <p className="mt-1 text-[0.625rem] leading-relaxed text-amber-900/75">
                    Reset the simulated queues, notifications, and seeded history. Your account
                    stays signed in.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetDemo}
                  disabled={resetting}
                  className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 text-[0.625rem] font-bold text-amber-900 transition-colors hover:bg-amber-100 disabled:opacity-50"
                >
                  <RotateCcw size={12} aria-hidden="true" />
                  Reset
                </button>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-4">
          {session.isGuest ? (
            <div className="rounded-2xl border border-bamboo-200 bg-bamboo-50 p-4 sm:p-5">
              <p className="flex items-center gap-1.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-bamboo-800">
                <Sparkles size={11} aria-hidden="true" /> Guest session
              </p>
              <p className="mt-1.5 text-xs font-bold text-ink-900">Keep your queue history</p>
              <p className="mt-1 text-[0.625rem] leading-relaxed text-ink-500">
                Create a PLMun account to keep your past queues and details across devices. This
                will end your current guest session.
              </p>
              <button
                type="button"
                onClick={() => setConfirmGuestUpgrade(true)}
                className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-bamboo-900 px-3 text-[0.6875rem] font-bold text-cream-50 transition-colors hover:bg-bamboo-800"
              >
                Create an account
              </button>
            </div>
          ) : null}

          <NotificationPermissionCard ownerKey={ownerKey} />

          <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xs font-extrabold text-ink-950">
                <BellRing size={14} className="text-bamboo-600" aria-hidden="true" />
                Notification settings
              </h2>
              <a
                href="/notifications"
                className="text-[0.625rem] font-bold text-bamboo-800 hover:text-bamboo-600"
              >
                Open
              </a>
            </div>
            <p className="mt-1.5 text-[0.625rem] leading-relaxed text-ink-500">
              Change reminders, device alerts, and permission in the notifications page.
            </p>
          </div>

          <InstallCard />

          <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-soft">
            <p className="flex items-center gap-1.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-ink-400">
              <ShieldCheck size={11} aria-hidden="true" /> Data & privacy
            </p>
            <p className="mt-1.5 text-[0.625rem] leading-relaxed text-ink-500">
              {IS_DEMO
                ? 'In this prototype, your profile, tickets, and notifications are stored only in this browser. Clearing site data removes them.'
                : 'Your profile and queue records are stored in the configured Supabase project.'}
            </p>
            <p className="mt-2 text-[0.5625rem] leading-relaxed text-ink-400">
              SmartQueue never asks for your PLMun password outside the sign-in form and does not
              collect payments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.75rem] font-bold text-red-700 transition-colors hover:bg-red-100"
          >
            <LogOut size={14} aria-hidden="true" />
            {session.isGuest ? 'End guest session' : 'Sign out'}
          </button>

          <div className="flex items-center gap-2 px-1 text-[0.5625rem] text-ink-400">
            {resetting ? (
              <LoaderCircle size={11} className="animate-[spin_0.8s_linear_infinite]" />
            ) : (
              <ShieldCheck size={11} aria-hidden="true" />
            )}
            SmartQueue prototype · Not an official PLMun service
          </div>
        </aside>
      </div>

      <Modal
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        title={session.isGuest ? 'End this guest session?' : 'Sign out of SmartQueue?'}
        description={
          session.isGuest
            ? 'Your guest ticket and history stay on this device, but you may not be able to reopen them without this session.'
            : 'Your account stays on this device. You can sign in again anytime.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmSignOut(false)}>
              Stay signed in
            </Button>
            <Button variant="danger" onClick={endSession}>
              {session.isGuest ? 'End session' : 'Sign out'}
            </Button>
          </>
        }
      />

      <Modal
        open={confirmGuestUpgrade}
        onClose={() => setConfirmGuestUpgrade(false)}
        title="Create a SmartQueue account?"
        description="This ends your guest session and takes you to account creation. Any active guest ticket stays on this device but will no longer be linked to your session."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmGuestUpgrade(false)}>
              Not now
            </Button>
            <Button onClick={upgradeGuest}>
              <DoorOpen size={14} aria-hidden="true" />
              Continue
            </Button>
          </>
        }
      />
    </>
  );
}
