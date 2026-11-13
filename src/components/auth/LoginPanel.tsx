import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { useSession } from '@/hooks/useSession';
import { continueAsGuest, signIn, signUp } from '@/lib/auth/session';
import { DEMO_ACCOUNT, IS_DEMO } from '@/lib/config';
import {
  hasErrors,
  validateEmail,
  validateName,
  validatePassword,
  type FieldErrors,
} from '@/lib/validation/forms';
import { safeNext } from '@/lib/utils';

type Mode = 'signin' | 'signup' | 'guest';

function destinationFor(next: string, onboardingComplete: boolean): string {
  if (!onboardingComplete) return '/onboarding';
  return safeNext(next);
}

export function LoginPanel() {
  const { session, loading } = useSession();
  const [mode, setMode] = useState<Mode>('signin');
  const [next, setNext] = useState('/dashboard');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('next');
    if (requested && requested.startsWith('/') && !requested.startsWith('//')) {
      setNext(requested);
    }
    if (params.get('guest') === '1') setMode('guest');
  }, []);

  useEffect(() => {
    if (loading || !session) return;
    window.location.replace(destinationFor(next, session.onboardingComplete || session.isGuest));
  }, [loading, session, next]);

  const useDemo = () => {
    setMode('signin');
    setEmail(DEMO_ACCOUNT.email);
    setPassword('studentdemo1');
    setErrors({});
    setServerError(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const nextErrors: FieldErrors = {};
    if (mode === 'signup') {
      const nameError = validateName(name);
      if (nameError) nextErrors.name = nameError;
    }
    const emailError = validateEmail(email);
    if (emailError) nextErrors.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const created = await signUp({ name, email, password });
        window.location.assign(destinationFor(next, created.onboardingComplete));
        return;
      }
      const signedIn = await signIn(email, password);
      window.location.assign(destinationFor(next, signedIn.onboardingComplete));
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Something went wrong. Try again.');
      setSubmitting(false);
    }
  };

  const startGuest = async () => {
    setServerError(null);
    setGuestLoading(true);
    try {
      await continueAsGuest();
      window.location.assign(safeNext(next, '/dashboard'));
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not start a guest session.');
      setGuestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[18rem] items-center justify-center rounded-2xl border border-ink-950/8 bg-white p-6 sm:min-h-[26rem]">
        <p className="text-sm font-medium text-ink-400" role="status">
          Checking your session…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-ink-950/8 bg-cream-100 p-1" role="tablist" aria-label="Account access">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            onClick={() => {
              setMode('signin');
              setServerError(null);
              setErrors({});
            }}
            className={`rounded-lg px-3.5 py-2 text-[0.75rem] font-bold transition-colors ${
              mode === 'signin' ? 'bg-white text-ink-950 shadow-soft' : 'text-ink-500 hover:text-ink-800'
            }`}
          >
            Sign in
          </button>

        </div>
        <a
          href="/"
          className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-ink-500 transition-colors hover:text-bamboo-800"
        >
          Home
        </a>
      </div>

      {mode === 'guest' ? (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-bamboo-200 bg-bamboo-50 px-2.5 py-1 text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-bamboo-800">
            <Sparkles size={11} aria-hidden="true" /> No account needed
          </span>
          <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.02] tracking-[-0.05em] text-ink-950">
            Get a number as a guest.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">
            You can join a campus queue right away. Your ticket and history stay on this device, so
            keep this browser and this phone with you.
          </p>

          <div className="mt-2 space-y-2">
            <div className="flex items-start gap-3 rounded-xl border border-ink-950/8 bg-cream-50 p-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-bamboo-600" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-ink-900">Same line as everyone else</p>
                <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-500">
                  Online, QR, kiosk, and walk-in entries all share one queue per service.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-ink-950/8 bg-cream-50 p-3">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-bamboo-600" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-ink-900">You can sign in anytime</p>
                <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-500">
                  Use your PLMun email to access your account and view your saved queue history across devices.
                </p>
              </div>
            </div>
          </div>

          {serverError ? (
            <Alert tone="error" className="mt-4">
              {serverError}
            </Alert>
          ) : null}

          <Button
            type="button"
            size="lg"
            full
            loading={guestLoading}
            onClick={startGuest}
            className="mt-4"
          >
            Continue as guest
          </Button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            className="mt-2 w-full rounded-xl py-2 text-xs font-semibold text-ink-500 transition-colors hover:bg-ink-950/5 hover:text-ink-800"
          >
            Use my PLMun account instead
          </button>
        </div>
      ) : (
        <div className="mt-3 sm:mt-5">
          <h1 className="text-[1.5rem] sm:text-[2rem] font-extrabold leading-[1.02] tracking-[-0.05em] text-ink-950">
            Welcome to SmartQueue!
          </h1>
          <p className="mt-2 sm:mt-2.5 text-sm leading-relaxed text-ink-500">
            Enter your PLMun email to receive a verification code and access your account.
          </p>

          

          <form onSubmit={submit} className="mt-3 space-y-2 sm:space-y-3" noValidate>
            {mode === 'signup' ? (
              <Input
                label="Full name"
                name="name"
                autoComplete="name"
                placeholder="Juan Dela Cruz"
                value={name}
                onChange={(event) => setName(event.target.value)}
                error={errors.name}
                leadingIcon={<UserRound size={16} />}
                required
              />
            ) : null}

            <Input
              label="PLMun email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="juan.delacruz@plmun.edu.ph"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
              leadingIcon={<Mail size={16} />}
               inputClassName="!pl-14"
              required
            />

            {serverError ? (
              <Alert tone="error" title="We couldn’t continue">
                {serverError}
              </Alert>
            ) : null}

            <Button type="submit" size="md" full loading={submitting} className="min-h-9 sm:min-h-11">
              Send code
            </Button>
          </form>

          <div className="my-2 flex items-center gap-2" aria-hidden="true">
            <span className="h-px flex-1 bg-ink-950/8" />
            <span className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-ink-400">or</span>
            <span className="h-px flex-1 bg-ink-950/8" />
          </div>

          <button
            type="button"
            onClick={() => {
              setMode('guest');
              setServerError(null);
              setErrors({});
            }}
            style={{ backgroundColor: '#E8E3D8', color: '#1C1917' }} className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors hover:bg-[#1C1917] hover:text-white"
          >
            <Sparkles size={14} className="text-bamboo-600" aria-hidden="true" />
            Continue as guest
          </button>

          <p className="mt-2 text-center text-[0.5625rem] leading-relaxed text-ink-400">
            By continuing, you agree this is a student prototype. SmartQueue is not an official
            PLMun service, and queue activity is simulated.
          </p>
        </div>
      )}
    </div>
  );
}
