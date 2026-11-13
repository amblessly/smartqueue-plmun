import { useCallback, useEffect, useRef, useState } from 'react';
import type { QueueTicket } from '@/types';
import { queueService } from '@/lib/queue/queue-service';

export function useTickets(ownerKey: string | undefined) {
  const [active, setActive] = useState<QueueTicket[]>([]);
  const [history, setHistory] = useState<QueueTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!ownerKey) {
      setActive([]);
      setHistory([]);
      setLoading(false);
      return;
    }
    try {
      const [nextActive, nextHistory] = await Promise.all([
        queueService.getActiveTickets(ownerKey),
        queueService.getTicketHistory(ownerKey),
      ]);
      if (mounted.current) {
        setActive(nextActive);
        setHistory(nextHistory);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'Could not load your queues.');
        setLoading(false);
      }
    }
  }, [ownerKey]);

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

  return { active, history, loading, error, refresh };
}
