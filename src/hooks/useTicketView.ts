import { useCallback, useEffect, useRef, useState } from 'react';
import type { QueueTicket, QueueView } from '@/types';
import { queueService } from '@/lib/queue/queue-service';

export function useTicketView(ticketId: string) {
  const [view, setView] = useState<QueueView | null>(null);
  const [ticket, setTicket] = useState<QueueTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!ticketId) {
      if (mounted.current) {
        setError('That queue ticket was not found.');
        setLoading(false);
      }
      return;
    }
    try {
      const nextTicket = await queueService.getTicket(ticketId);
      if (!mounted.current) return;
      if (!nextTicket) {
        setTicket(null);
        setView(null);
        setError('That queue ticket was not found on this device.');
        setLoading(false);
        return;
      }
      setTicket(nextTicket);
      const nextView = await queueService.getQueueView(nextTicket.serviceId, nextTicket.id);
      if (!mounted.current) return;
      setView(nextView);
      setError(null);
      setLoading(false);
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof Error ? err.message : 'Could not load this queue ticket.');
      setLoading(false);
    }
  }, [ticketId]);

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

  return { view, ticket, loading, error, refresh };
}
