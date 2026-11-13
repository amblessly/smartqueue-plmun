import { useCallback, useEffect, useState } from 'react';
import type { SessionUser } from '@/types';
import { getCachedSession, getSession, onSessionChange } from '@/lib/auth/session';

export function useSession() {
  const [session, setSession] = useState<SessionUser | null>(() => getCachedSession());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const next = await getSession();
    setSession(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const next = await getSession();
      if (active) {
        setSession(next);
        setLoading(false);
      }
    })();
    const off = onSessionChange(() => {
      void getSession().then((next) => {
        if (active) setSession(next);
      });
    });
    return () => {
      active = false;
      off();
    };
  }, []);

  return { session, loading, refresh, setSession };
}
