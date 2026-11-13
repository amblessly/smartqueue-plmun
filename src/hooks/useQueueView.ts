import { useCallback, useEffect, useRef, useState } from 'react';
import type { QueueView } from '@/types';
import { queueService } from '@/lib/queue/queue-service';

export function useQueueView(serviceId: string, ticketId: string) {
  const [view, setView] = useState<QueueView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await queueService.getQueueView(serviceId, ticketId);
      if (mounted.current) {
        setView(next);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'Could not load this queue ticket.');
        setLoading(false);
      }
    }
  }, [serviceId, ticketId]);

  useEffect(() => {
    mounted.current = true;
    queueService.startSimulator();
    void refresh();
    const off = queueService.subscribe(() => {
      void refresh();
    });
    return () => {
      mounted.current = false;
      off();
    };
  }, [refresh]);

  return { view, loading, error, refresh };
}
