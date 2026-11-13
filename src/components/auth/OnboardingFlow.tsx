import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  LoaderCircle,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { BrandMark } from '@/components/brand/Brand';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { useSession } from '@/hooks/useSession';
import { completeOnboarding } from '@/lib/auth/session';
import { CAMPUS_SERVICES, COURSE_OPTIONS, YEAR_LEVELS } from '@/lib/data/services';
import {
  hasErrors,
  validateName,
  validatePhone,
  validateStudentId,
  type FieldErrors,
} from '@/lib/validation/forms';
import { firstName } from '@/lib/utils';

const STEPS = ['About you', 'School', 'Services'] as const;

export function OnboardingFlow() {
  const { session, loading } = useSession();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [preferred, setPreferred] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      window.location.replace('/login?next=/onboarding');
      return;
    }
    if (session.isGuest) {
      window.location.replace('/dashboard');
      return;
    }
    if (session.onboardingComplete) {
      window.location.replace('/dashboard');
      return;
    }
    setName((value) => value || session.name || '');
    setStudentId((value) => value || session.studentId || '');
    setPhone((value) => value || session.phone || '');
    setCourse((value) => value || session.course || '');
    setYearLevel((value) => value || session.yearLevel || '');
    setPreferred((value) => (value.length ? value : session.preferredServices));
  }, [loading, session]);

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  const toggleService = (id: string) => {
    setPreferred((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  const nextStep = () => {
    setServerError(null);
    if (step === 0) {
      const nextErrors: FieldErrors = {};
      const nameError = validateName(name);
      if (nameError) nextErrors.name = nameError;
      const idError = validateStudentId(studentId);
      if (idError) nextErrors.studentId = idError;
      const phoneError = validatePhone(phone);
      if (phoneError) nextErrors.phone = phoneError;
      setErrors(nextErrors);
      if (hasErrors(nextErrors)) return;
    }
    if (step === 1) {
      if (!course) {
        setErrors({ course: 'Choose your course.' });
        return;
      }
      if (!yearLevel) {
        setErrors({ yearLevel: 'Choose your year level.' });
        return;
      }
      setErrors({});
    }
    setStep((value) => Math.min(STEPS.length - 1, value + 1));
  };

  const skip = async () => {
    if (!session) return;
    setSaving(true);
    setServerError(null);
    try {
      await completeOnboarding({
        name: name.trim() || session.name,
        studentId: studentId.trim() || session.studentId || '',
        phone: phone.trim() || session.phone,
        course: course || session.course,
        yearLevel: yearLevel || session.yearLevel,
        preferredServices: preferred,
      });
      window.location.assign('/dashboard');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not save your setup.');
      setSaving(false);
    }
  };

  const finish = async () => {
    if (!session) return;
    setSaving(true);
    setServerError(null);
    try {
      await completeOnboarding({
        name: name.trim(),
        studentId: studentId.trim(),
        phone: phone.trim(),
        course,
        yearLevel,
        preferredServices: preferred,
      });
      window.location.assign('/dashboard');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not save your setup.');
      setSaving(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream-50">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-500" role="status">
          <LoaderCircle size={16} className="animate-[spin_0.8s_linear_infinite]" />
          Preparing your setup
        </p>
      </div>
    );
  }

  const firstNameValue = firstName(name || session.name);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-cream-50">
      <div
        className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(43,122,88,0.12),transparent_65%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-5 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <a href="/dashboard" aria-label="SmartQueue home" className="inline-flex items-center gap-2.5">
            <BrandMark size={34} />
            <span className="text-[1rem] font-extrabold tracking-[-0.035em] text-ink-950">SmartQueue</span>
          </a>
          <button
            type="button"
            onClick={skip}
            disabled={saving}
            className="rounded-lg px-3 py-2 text-[0.6875rem] font-semibold text-ink-500 transition-colors hover:bg-ink-950/5 hover:text-ink-800 disabled:opacity-50"
          >
            Skip for now
          </button>
        </header>

        <main className="my-auto py-8" id="main-content">
          <div className="grid overflow-hidden rounded-2xl border border-ink-950/8 bg-white shadow-card lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="relative hidden flex-col justify-between overflow-hidden bg-bamboo-950 p-7 text-cream-50 lg:flex">
              <img
                src="/campus-background.png"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-25"
                width="1600"
                height="1200"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,28,20,0.65)_0%,rgba(7,28,20,0.95)_78%)]" />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[0.5625rem] font-bold uppercase tracking-[0.13em] text-bamboo-200">
                  <Sparkles size={11} aria-hidden="true" /> Quick setup
                </span>
                <h1 className="mt-5 text-[2.1rem] font-extrabold leading-[1.02] tracking-[-0.05em]">
                  A couple of details,
                  <span className="block font-display italic text-cream-100/85">then you’re set.</span>
                </h1>
                <p className="mt-3 max-w-xs text-xs leading-relaxed text-cream-100/60">
                  This helps us prefill your queue requests and show the services you use most.
                  You can change everything later in your profile.
                </p>
              </div>

              <ol className="relative mt-8 space-y-3">
                {STEPS.map((label, index) => {
                  const done = index < step;
                  const active = index === step;
                  return (
                    <li key={label} className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-extrabold ${
                          done
                            ? 'bg-bamboo-400 text-bamboo-950'
                            : active
                              ? 'bg-cream-50 text-bamboo-900'
                              : 'bg-white/10 text-cream-100/40'
                        }`}
                      >
                        {done ? <Check size={13} strokeWidth={3} /> : index + 1}
                      </span>
                      <span
                        className={`text-xs font-semibold ${active ? 'text-cream-50' : done ? 'text-cream-100/75' : 'text-cream-100/35'}`}
                      >
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </aside>

            <div className="p-5 sm:p-7 lg:p-9">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.15em] text-ink-400">
                  Step {step + 1} of {STEPS.length}
                </p>
                <p className="text-[0.625rem] font-semibold text-ink-400">
                  {firstNameValue ? `Hi, ${firstNameValue}` : 'Welcome'}
                </p>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream-200">
                <div
                  className="h-full rounded-full bg-bamboo-700 transition-[width] duration-400"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {step === 0 ? (
                <div className="mt-7 animate-fade-up">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bamboo-50 text-bamboo-700 ring-1 ring-bamboo-100">
                    <UserRound size={19} aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-xl font-extrabold tracking-[-0.035em] text-ink-950">
                    Tell us about you.
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                    We use this on your queue ticket so staff can match your request to your record.
                  </p>

                  <div className="mt-5 space-y-4">
                    <Input
                      label="Full name"
                      name="onboarding-name"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      error={errors.name}
                      required
                    />
                    <Input
                      label="Student ID"
                      name="onboarding-student-id"
                      placeholder="2024-10482"
                      value={studentId}
                      onChange={(event) => setStudentId(event.target.value)}
                      error={errors.studentId}
                      hint="Your PLMun student number. Used only for your queue requests."
                      required
                    />
                    <Input
                      label="Contact number"
                      name="onboarding-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="0917 000 0000"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      error={errors.phone}
                      optional
                    />
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="mt-7 animate-fade-up">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bamboo-50 text-bamboo-700 ring-1 ring-bamboo-100">
                    <GraduationCap size={19} aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-xl font-extrabold tracking-[-0.035em] text-ink-950">
                    Where are you in school?
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                    This helps offices understand the context of your request. It does not change
                    what you need to bring.
                  </p>

                  <div className="mt-5 space-y-4">
                    <Select
                      label="Course / program"
                      name="onboarding-course"
                      value={course}
                      onChange={setCourse}
                      options={[...COURSE_OPTIONS]}
                      error={errors.course}
                      required
                    />
                    <Select
                      label="Year level"
                      name="onboarding-year"
                      value={yearLevel}
                      onChange={setYearLevel}
                      options={[...YEAR_LEVELS]}
                      error={errors.yearLevel}
                      required
                    />
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="mt-7 animate-fade-up">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bamboo-50 text-bamboo-700 ring-1 ring-bamboo-100">
                    <Sparkles size={19} aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-xl font-extrabold tracking-[-0.035em] text-ink-950">
                    Which offices do you visit?
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                    Pick up to three. They’ll appear first on your dashboard. You can change this
                    anytime.
                  </p>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {CAMPUS_SERVICES.map((service) => {
                      const selected = preferred.includes(service.id);
                      const disabled = !selected && preferred.length >= 3;
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleService(service.id)}
                          disabled={disabled}
                          aria-pressed={selected}
                          className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                            selected
                              ? 'border-bamboo-500 bg-bamboo-50 ring-1 ring-bamboo-500/20'
                              : 'border-ink-950/10 bg-white hover:border-ink-950/20'
                          } ${disabled ? 'cursor-not-allowed opacity-45' : ''}`}
                        >
                          <ServiceIcon service={service} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.75rem] font-bold text-ink-950">
                              {service.name}
                            </span>
                            <span className="mt-0.5 block truncate text-[0.5625rem] text-ink-400">
                              {service.location}
                            </span>
                          </span>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? 'border-bamboo-600 bg-bamboo-600 text-cream-50'
                                : 'border-ink-950/15 bg-white text-transparent'
                            }`}
                            aria-hidden="true"
                          >
                            <Check size={11} strokeWidth={3} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[0.625rem] text-ink-400">
                    {preferred.length}/3 selected. This is optional.
                  </p>
                </div>
              ) : null}

              {serverError ? (
                <Alert tone="error" className="mt-4">
                  {serverError}
                </Alert>
              ) : null}

              <div className="mt-7 flex items-center gap-2.5">
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setErrors({});
                      setStep((value) => Math.max(0, value - 1));
                    }}
                    disabled={saving}
                  >
                    Back
                  </Button>
                ) : null}
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={nextStep} className="flex-1">
                    Continue
                  </Button>
                ) : (
                  <Button type="button" onClick={finish} loading={saving} className="flex-1">
                    Finish setup
                  </Button>
                )}
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-[0.5625rem] leading-relaxed text-ink-400">
            SmartQueue is an independent student prototype. Your details stay on this device in
            prototype mode.
          </p>
        </main>
      </div>
    </div>
  );
}
