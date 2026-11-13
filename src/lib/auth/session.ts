import type { SessionUser } from '@/types';
import {
  BACKEND,
  DEMO_ACCOUNT,
  OFFICIAL_ADDRESS,
  PROFILES_KEY,
  SESSION_KEY,
} from '@/lib/config';
import { titleCase } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase/client';

const SESSION_EVENT = 'sq:session-change';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

function getProfiles(): Record<string, SessionUser> {
  return readJson<Record<string, SessionUser>>(PROFILES_KEY, {});
}

function saveProfile(user: SessionUser): void {
  const profiles = getProfiles();
  profiles[user.email.toLowerCase()] = user;
  writeJson(PROFILES_KEY, profiles);
}

export function onSessionChange(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY) callback();
  };
  window.addEventListener(SESSION_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(SESSION_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

export function getCachedSession(): SessionUser | null {
  if (!isBrowser()) return null;
  if (BACKEND === 'supabase') return null;
  const session = readJson<SessionUser | null>(SESSION_KEY, null);
  if (!session) return null;
  return session.mode === 'demo' ? session : null;
}

export async function getSession(): Promise<SessionUser | null> {
  if (!isBrowser()) return null;

  if (BACKEND === 'demo') {
    return getCachedSession();
  }

  const supabase = getSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const session: SessionUser = {
    id: user.id,
    email: user.email ?? profile?.email ?? '',
    name: profile?.full_name ?? (user.user_metadata?.full_name as string) ?? titleCase(user.email ?? 'Student'),
    studentId: profile?.student_id ?? undefined,
    phone: profile?.phone ?? undefined,
    course: profile?.course ?? undefined,
    yearLevel: profile?.year_level ?? undefined,
    preferredServices: profile?.preferred_services ?? [],
    onboardingComplete: profile?.onboarding_completed ?? false,
    isGuest: false,
    mode: 'supabase',
  };

  const raw = readJson<SessionUser | null>(SESSION_KEY, null);
  if (JSON.stringify(raw) !== JSON.stringify(session)) {
    writeJson(SESSION_KEY, session);
  }
  return session;
}

function buildDemoSession(
  email: string,
  name: string,
  onboardingComplete: boolean,
): SessionUser {
  const normalizedEmail = email.trim().toLowerCase();
  const profiles = getProfiles();
  const existing = profiles[normalizedEmail];
  if (existing) {
    const session = {
      ...existing,
      onboardingComplete: existing.onboardingComplete || onboardingComplete,
      isGuest: false,
      mode: 'demo' as const,
    };
    saveProfile(session);
    return session;
  }

  const isDemoAccount = normalizedEmail === DEMO_ACCOUNT.email;
  return {
    id: `demo-${normalizedEmail.replace(/[^a-z0-9]/g, '-')}`,
    email: normalizedEmail,
    name: isDemoAccount ? DEMO_ACCOUNT.name : name || titleCase(normalizedEmail.split('@')[0]),
    studentId: isDemoAccount ? DEMO_ACCOUNT.studentId : undefined,
    phone: isDemoAccount ? DEMO_ACCOUNT.phone : undefined,
    course: isDemoAccount ? DEMO_ACCOUNT.course : undefined,
    yearLevel: isDemoAccount ? DEMO_ACCOUNT.yearLevel : undefined,
    preferredServices: isDemoAccount ? [...DEMO_ACCOUNT.preferredServices] : [],
    onboardingComplete: isDemoAccount ? true : onboardingComplete,
    isGuest: false,
    mode: 'demo',
  };
}

export async function signIn(
  email: string,
  password: string,
): Promise<SessionUser> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.endsWith('@plmun.edu.ph')) {
    throw new Error('Use your PLMun email address (ending in @plmun.edu.ph).');
  }
  if (password.length < 8) {
    throw new Error('Your password must be at least 8 characters.');
  }

  if (BACKEND === 'demo') {
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    const session = buildDemoSession(normalizedEmail, '', true);
    writeJson(SESSION_KEY, session);
    saveProfile(session);
    return session;
  }

  const supabase = getSupabase();
  if (!supabase) throw new Error('SmartQueue is not connected to Supabase yet.');
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });
  if (error) throw new Error(error.message);
  const session = await getSession();
  if (!session) throw new Error('We could not load your account. Try again.');
  return session;
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
}): Promise<SessionUser> {
  const email = input.email.trim().toLowerCase();
  if (!email.endsWith('@plmun.edu.ph')) {
    throw new Error('Use your PLMun email address (ending in @plmun.edu.ph).');
  }
  if (input.name.trim().length < 2) {
    throw new Error('Enter your full name.');
  }
  if (input.password.length < 8) {
    throw new Error('Choose a password with at least 8 characters.');
  }

  if (BACKEND === 'demo') {
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    const profiles = getProfiles();
    if (profiles[email]) {
      throw new Error('An account with this email already exists. Sign in instead.');
    }
    const session = buildDemoSession(email, input.name, false);
    writeJson(SESSION_KEY, session);
    saveProfile(session);
    return session;
  }

  const supabase = getSupabase();
  if (!supabase) throw new Error('SmartQueue is not connected to Supabase yet.');
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: { full_name: input.name.trim() },
      emailRedirectTo: `${window.location.origin}/onboarding`,
    },
  });
  if (error) throw new Error(error.message);
  if (!data.session) {
    throw new Error('Check your email to confirm your account, then sign in.');
  }
  await supabase.from('profiles').upsert({
    id: data.user?.id,
    email,
    full_name: input.name.trim(),
    onboarding_completed: false,
  });
  const session = await getSession();
  if (!session) throw new Error('We could not finish creating your account.');
  return session;
}

export async function continueAsGuest(): Promise<SessionUser> {
  if (!isBrowser()) throw new Error('Guest sessions are only available in the browser.');
  const session: SessionUser = {
    id: `guest-${crypto.randomUUID()}`,
    email: '',
    name: 'Guest student',
    preferredServices: [],
    onboardingComplete: true,
    isGuest: true,
    mode: BACKEND,
  };
  await new Promise((resolve) => window.setTimeout(resolve, 350));
  writeJson(SESSION_KEY, session);
  return session;
}

export function saveSession(session: SessionUser): void {
  const existing = getProfiles();
  existing[session.email.toLowerCase()] = session;
  writeJson(PROFILES_KEY, existing);
  writeJson(SESSION_KEY, session);
}

export async function updateProfile(
  patch: Partial<
    Pick<
      SessionUser,
      | 'name'
      | 'studentId'
      | 'phone'
      | 'course'
      | 'yearLevel'
      | 'preferredServices'
      | 'onboardingComplete'
    >
  >,
): Promise<SessionUser> {
  const current = await getSession();
  if (!current) throw new Error('Your session has ended. Sign in again.');

  const updated: SessionUser = { ...current, ...patch };

  if (BACKEND === 'supabase' && !current.isGuest) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('SmartQueue is not connected to Supabase yet.');
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updated.name,
        student_id: updated.studentId ?? null,
        phone: updated.phone ?? null,
        course: updated.course ?? null,
        year_level: updated.yearLevel ?? null,
        preferred_services: updated.preferredServices,
        onboarding_completed: updated.onboardingComplete,
      })
      .eq('id', current.id);
    if (error) throw new Error(error.message);
  }

  saveSession(updated);
  return updated;
}

export async function completeOnboarding(
  input: Pick<
    SessionUser,
    'name' | 'studentId' | 'phone' | 'course' | 'yearLevel' | 'preferredServices'
  >,
): Promise<SessionUser> {
  return updateProfile({ ...input, onboardingComplete: true });
}

export async function signOut(): Promise<void> {
  if (BACKEND === 'supabase') {
    const supabase = getSupabase();
    await supabase?.auth.signOut();
  }
  if (!isBrowser()) return;
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function demoAccountDetails() {
  return {
    ...DEMO_ACCOUNT,
    address: OFFICIAL_ADDRESS,
  };
}
