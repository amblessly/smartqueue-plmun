import type {
  CampusService,
  JoinQueueInput,
  QueueStatus,
  QueueTicket,
  QueueView,
  ServiceQueue,
  TicketStudent,
} from '@/types';
import { BACKEND } from '@/lib/config';
import { CAMPUS_SERVICES, getService } from '@/lib/data/services';
import { getSupabase } from '@/lib/supabase/client';
import * as demo from '@/lib/queue/demo-engine';

const TOKEN_KEY = 'sq_ticket_tokens_v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readTokens(): Record<string, string> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveToken(ticketId: string, token?: string): void {
  if (!token || !isBrowser()) return;
  const tokens = readTokens();
  tokens[ticketId] = token;
  window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function getTicketToken(ticketId: string): string | undefined {
  return readTokens()[ticketId];
}

type SnapshotRow = {
  now_serving?: { id?: string; display_number: string; sequence: number; counter?: string } | null;
  called?: { id?: string; display_number: string; sequence: number; counter?: string } | null;
  up_next?: { id?: string; display_number: string; sequence: number; counter?: string } | null;
  waiting?: Array<{ id?: string; display_number: string; sequence: number }>;
  waiting_count?: number;
  active_count?: number;
  estimated_wait_minutes?: number;
  updated_at?: string;
};

function placeholderTicket(
  service: CampusService,
  row: { id?: string; display_number: string; sequence: number; counter?: string },
  status: QueueStatus,
): QueueTicket {
  return {
    id: row.id ?? `${service.id}-${row.sequence}`,
    serviceId: service.id,
    displayNumber: row.display_number,
    sequence: row.sequence,
    status,
    requestType: '—',
    requestLabel: '—',
    details: '',
    student: { name: 'Student', studentId: '—' },
    isGuest: false,
    ownerKey: '',
    counter: row.counter,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function snapshotToServiceQueue(service: CampusService, snapshot: SnapshotRow): ServiceQueue {
  const waiting = (snapshot.waiting ?? []).map((row) =>
    placeholderTicket(service, row, 'WAITING'),
  );
  const nowServing = snapshot.now_serving
    ? placeholderTicket(service, snapshot.now_serving, 'SERVING')
    : undefined;
  const calledTicket = snapshot.called
    ? placeholderTicket(service, snapshot.called, 'CALLED')
    : undefined;
  const upNext = snapshot.up_next
    ? placeholderTicket(service, snapshot.up_next, 'UP_NEXT')
    : undefined;
  const activeTickets = [
    ...(nowServing ? [nowServing] : []),
    ...(calledTicket ? [calledTicket] : []),
    ...(upNext ? [upNext] : []),
    ...waiting,
  ];
  return {
    serviceId: service.id,
    nowServing,
    calledTicket,
    upNext,
    waiting,
    activeTickets,
    waitingCount:
      snapshot.waiting_count ?? activeTickets.filter((ticket) => ticket.status !== 'SERVING').length,
    estimatedWaitMinutes:
      snapshot.estimated_wait_minutes ??
      (snapshot.active_count ?? activeTickets.length) * service.avgServiceMinutes,
    updatedAt: snapshot.updated_at ?? new Date().toISOString(),
  };
}

function rowToTicket(row: Record<string, unknown>, service: CampusService): QueueTicket {
  return {
    id: String(row.id),
    serviceId: service.id,
    displayNumber: String(row.display_number),
    sequence: Number(row.sequence),
    status: row.status as QueueStatus,
    requestType: String(row.request_type ?? ''),
    requestLabel: String(row.request_label ?? row.request_type ?? ''),
    details: String(row.details ?? ''),
    student: {
      name: String(row.student_name ?? row.guest_name ?? 'Student'),
      studentId: String(row.student_id ?? row.guest_student_id ?? '—'),
      email: row.email ? String(row.email) : undefined,
      phone: row.guest_contact ? String(row.guest_contact) : undefined,
    },
    isGuest: Boolean(row.is_guest),
    ownerKey: String(row.owner_id ?? ''),
    accessToken: row.access_token ? String(row.access_token) : undefined,
    counter: row.counter_label ? String(row.counter_label) : undefined,
    createdAt: String(row.created_at),
    calledAt: row.called_at ? String(row.called_at) : undefined,
    servedAt: row.served_at ? String(row.served_at) : undefined,
    completedAt: row.completed_at ? String(row.completed_at) : undefined,
    updatedAt: String(row.updated_at ?? row.created_at),
  };
}

async function supabaseSnapshot(serviceId: string): Promise<ServiceQueue> {
  const service = getService(serviceId);
  if (!service) throw new Error('Service not found.');
  const supabase = getSupabase();
  if (!supabase) throw new Error('SmartQueue is not connected to its queue server.');
  const { data, error } = await supabase.rpc('get_queue_snapshot', {
    p_service_id: serviceId,
  });
  if (error) throw new Error(error.message);
  return snapshotToServiceQueue(service, (data ?? {}) as SnapshotRow);
}

async function supabaseTicketView(ticketId: string): Promise<QueueView | null> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('SmartQueue is not connected to its queue server.');
  const token = getTicketToken(ticketId);
  const { data, error } = await supabase.rpc('get_ticket_view', {
    p_ticket_id: ticketId,
    p_access_token: token ?? null,
  });
  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as Record<string, unknown>;
  const service = getService(String(row.service_id));
  if (!service) return null;
  const ticket = rowToTicket(row, service);
  const snapshot = await supabaseSnapshot(service.id);
  const peopleAhead = Number(row.people_ahead ?? 0);
  return {
    queue: snapshot,
    ticket,
    peopleAhead,
    position: Number(row.position ?? peopleAhead + 1),
    estimatedWaitMinutes: Number(
      row.estimated_wait_minutes ?? peopleAhead * service.avgServiceMinutes,
    ),
  };
}

async function supabaseJoin(input: JoinQueueInput & { accessToken?: string }): Promise<QueueTicket> {
  const service = getService(input.serviceId);
  if (!service) throw new Error('Service not found.');
  const supabase = getSupabase();
  if (!supabase) throw new Error('SmartQueue is not connected to its queue server.');
  const { data, error } = await supabase.rpc('join_queue', {
    p_service_id: input.serviceId,
    p_request_type: input.requestType,
    p_request_label: input.requestLabel,
    p_details: input.details,
    p_student_name: input.student.name,
    p_student_id: input.student.studentId,
    p_email: input.student.email ?? null,
    p_phone: input.student.phone ?? null,
    p_is_guest: input.isGuest,
  });
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
  const ticket = rowToTicket(row, service);
  saveToken(ticket.id, ticket.accessToken);
  return ticket;
}

export const queueService = {
  isDemo: BACKEND === 'demo',

  async getAllServiceQueues(): Promise<Record<string, ServiceQueue>> {
    if (BACKEND === 'demo') return demo.getAllServiceQueues();
    const entries = await Promise.all(
      CAMPUS_SERVICES.map(async (service) => {
        const queue = await supabaseSnapshot(service.id);
        return [service.id, queue] as const;
      }),
    );
    return Object.fromEntries(entries);
  },

  async getServiceQueue(serviceId: string): Promise<ServiceQueue> {
    if (BACKEND === 'demo') return demo.getServiceQueue(serviceId);
    return supabaseSnapshot(serviceId);
  },

  async getQueueView(serviceId: string, ticketId: string): Promise<QueueView | null> {
    if (BACKEND === 'demo') return demo.getQueueView(serviceId, ticketId);
    return supabaseTicketView(ticketId);
  },

  async getTicket(ticketId: string): Promise<QueueTicket | null> {
    if (BACKEND === 'demo') return demo.getTicket(ticketId) ?? null;
    const view = await supabaseTicketView(ticketId);
    return view?.ticket ?? null;
  },

  async getActiveTickets(ownerKey: string): Promise<QueueTicket[]> {
    if (BACKEND === 'demo') return demo.getActiveTickets(ownerKey);
    const supabase = getSupabase();
    if (!supabase) return [];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('queue_tickets')
        .select('*')
        .eq('owner_id', user.id)
        .in('status', ['WAITING', 'UP_NEXT', 'CALLED', 'SERVING'])
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => {
        const service = getService(String(row.service_id));
        if (!service) throw new Error('Service not found.');
        return rowToTicket(row, service);
      });
    }

    const tokens = readTokens();
    const views = await Promise.all(
      Object.keys(tokens).map(async (ticketId) => {
        try {
          return await supabaseTicketView(ticketId);
        } catch {
          return null;
        }
      }),
    );
    return views
      .map((view) => view?.ticket)
      .filter((ticket): ticket is QueueTicket => Boolean(ticket && ticket.status !== 'COMPLETED'));
  },

  async getTicketHistory(ownerKey: string): Promise<QueueTicket[]> {
    if (BACKEND === 'demo') return demo.getTicketHistory(ownerKey);
    const supabase = getSupabase();
    if (!supabase) return [];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('queue_tickets')
      .select('*')
      .eq('owner_id', user.id)
      .in('status', ['COMPLETED', 'CANCELLED', 'SKIPPED', 'EXPIRED'])
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => {
      const service = getService(String(row.service_id));
      if (!service) throw new Error('Service not found.');
      return rowToTicket(row, service);
    });
  },

  async joinQueue(input: JoinQueueInput): Promise<QueueTicket> {
    if (BACKEND === 'demo') return demo.joinQueue(input);
    return supabaseJoin(input);
  },

  async cancelTicket(ticketId: string, ownerKey: string): Promise<void> {
    if (BACKEND === 'demo') {
      demo.cancelQueueTicket(ticketId, ownerKey);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) throw new Error('SmartQueue is not connected to its queue server.');
    const { error } = await supabase.rpc('cancel_ticket', {
      p_ticket_id: ticketId,
      p_access_token: getTicketToken(ticketId) ?? null,
    });
    if (error) throw new Error(error.message);
  },

  subscribe(callback: () => void): () => void {
    if (BACKEND === 'demo') return demo.subscribeQueue(callback);
    const supabase = getSupabase();
    if (!supabase) return () => {};
    const channel = supabase
      .channel('smartqueue-queue-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_tickets' },
        () => callback(),
      )
      .subscribe();
    const poll = window.setInterval(callback, 8000);
    return () => {
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  },

  startSimulator(): void {
    if (BACKEND === 'demo') demo.startQueueSimulator();
  },

  advanceDemoQueue(serviceId: string): void {
    if (BACKEND !== 'demo') return;
    demo.advanceQueue(serviceId, { force: true });
  },

  isAutoAdvanceEnabled(): boolean {
    return demo.isAutoAdvanceEnabled();
  },

  setAutoAdvanceEnabled(enabled: boolean): void {
    demo.setAutoAdvanceEnabled(enabled);
  },

  resetDemoQueue(): void {
    if (BACKEND === 'demo') demo.resetDemoQueue();
  },
};

export type QueueService = typeof queueService;

export function studentFromSession(input: {
  name: string;
  studentId: string;
  email?: string;
  phone?: string;
}): TicketStudent {
  return {
    name: input.name.trim(),
    studentId: input.studentId.trim(),
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
  };
}
