import type { SessionUser } from '@/types';

/** The owner key used by the queue and notification stores. */
export function ownerKeyFor(session: SessionUser | null): string {
  if (!session) return '';
  if (session.isGuest) return session.id;
  if (session.mode === 'demo') return session.email.toLowerCase();
  return session.id;
}
