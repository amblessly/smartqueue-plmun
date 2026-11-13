import { useEffect, useState, useRef } from 'react';

const CHECK_URL = '/favicon.svg';
const CHECK_INTERVAL = 60_000; // check less frequently
const GRACE_PERIOD = 15_000; // 15s grace before showing offline

export function useOnlineStatus() {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  const [reconnected, setReconnected] = useState(false);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let checkTimer: ReturnType<typeof setTimeout> | null = null;
    let consecutiveFailures = 0;
    const REQUIRED_FAILURES = 3; // need 3 consecutive failures

    const doCheck = async () => {
      try {
        const res = await fetch(CHECK_URL, { method: 'HEAD', cache: 'no-store' });
        if (!mountedRef.current) return;
        if (res.ok) {
          consecutiveFailures = 0;
          if (online === false) {
            if (graceTimerRef.current) {
              clearTimeout(graceTimerRef.current);
              graceTimerRef.current = null;
            }
            setOnline(true);
            setReconnected(true);
            window.setTimeout(() => setReconnected(false), 3200);
          }
        } else {
          consecutiveFailures++;
          if (consecutiveFailures >= REQUIRED_FAILURES && online === true) {
            graceTimerRef.current = window.setTimeout(() => {
              if (mountedRef.current) setOnline(false);
            }, GRACE_PERIOD);
          }
        }
      } catch {
        if (!mountedRef.current) return;
        consecutiveFailures++;
        if (consecutiveFailures >= REQUIRED_FAILURES && online === true) {
          graceTimerRef.current = window.setTimeout(() => {
            if (mountedRef.current) setOnline(false);
          }, GRACE_PERIOD);
        }
      }
    };

    const onOnline = async () => {
      await doCheck();
    };

    const onOffline = () => {
      consecutiveFailures = REQUIRED_FAILURES;
      graceTimerRef.current = window.setTimeout(() => {
        if (mountedRef.current) setOnline(false);
      }, GRACE_PERIOD);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    doCheck();
    checkTimer = window.setInterval(doCheck, CHECK_INTERVAL);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      if (checkTimer) window.clearInterval(checkTimer);
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    };
  }, [online]);

  return { online, reconnected };
}
