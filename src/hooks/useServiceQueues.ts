import { useCallback, useEffect, useRef, useState } from 'react';
import type { ServiceQueue } from '@/types';
import { queueService } from '@/lib/queue/queue-service';

export function useServiceQueues() {
  const [queues, setQueues] = useState<Record<string, ServiceQueue> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await queueService.getAllServiceQueues();
      if (mounted.current) {
        setQueues(next);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'Could not load queue information.');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    queueService.startSimulator();
    void refresh();
    const off = queueService.subscribe(() => {
      void refresh();
    });
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      mounted.current = false;
      off();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  return { queues, loading, error, refresh };
}
