import type { CampusService, QueueTicket, QueueStatus, ServiceQueue } from '@/types';
import { DEMO_ACCOUNT, QUEUE_KEY } from '@/lib/config';
import { CAMPUS_SERVICES } from '@/lib/data/services';
import { addNotification } from '@/lib/notifications/notifications';
import { padNumber } from '@/lib/utils';

type QueueMeta = {
  lastSequence: number;
  updatedAt: string;
  lastAdvanceAt?: number;
};

type QueueState = {
  version: 3;
  tickets: QueueTicket[];
  meta: Record<string, QueueMeta>;
};

const DEMO_QUEUE_OWNER = 'demo-queue';
const DEMO_HISTORY_OWNER = DEMO_ACCOUNT.email.toLowerCase();
const EVENT = 'sq:queue-change';
const CHANNEL_NAME = 'smartqueue-queue';
const AUTO_KEY = 'sq_demo_autoplay_v1';

let channel: BroadcastChannel | null = null;
let simulatorStarted = false;

export class QueueError extends Error {
  code: 'ACTIVE_TICKET_EXISTS' | 'TICKET_NOT_FOUND' | 'TICKET_NOT_ACTIVE' | 'SERVICE_CLOSED' | 'UNKNOWN';

  constructor(code: QueueError['code'], message: string) {
    super(message);
    this.name = 'QueueError';
    this.code = code;
  }
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function nowIso(): string {
  return new Date().toISOString();
}

function displayNumber(service: CampusService, sequence: number): string {
  return `${service.prefix}-${padNumber(sequence)}`;
}

function serviceByCode(serviceId: string): CampusService {
  const service = CAMPUS_SERVICES.find((item) => item.id === serviceId);
  if (!service) throw new QueueError('UNKNOWN', 'That campus service was not found.');
  return service;
}

function counterFor(service: CampusService, sequence: number): string {
  const counter = ((sequence - 1) % service.counterCount) + 1;
  return `Counter ${String(counter).padStart(2, '0')}`;
}

function seedTicket(input: {
  service: CampusService;
  sequence: number;
  status: QueueStatus;
  ownerKey?: string;
  name?: string;
  createdAt: Date;
  calledAt?: Date;
  servedAt?: Date;
  completedAt?: Date;
}): QueueTicket {
  const { service, sequence, status } = input;
  const isComplete = status === 'COMPLETED' || status === 'CANCELLED';
  return {
    id: crypto.randomUUID(),
    serviceId: service.id,
    displayNumber: displayNumber(service, sequence),
    sequence,
    status,
    requestType: 'WALK_IN',
    requestLabel: 'Walk-in registration',
    details: '',
    student: {
      name: input.name ?? 'Walk-in student',
      studentId: '—',
    },
    isGuest: true,
    ownerKey: input.ownerKey ?? DEMO_QUEUE_OWNER,
    counter:
      status === 'SERVING' || status === 'CALLED' || isComplete
        ? counterFor(service, sequence)
        : undefined,
    createdAt: input.createdAt.toISOString(),
    calledAt: input.calledAt?.toISOString(),
    servedAt: input.servedAt?.toISOString(),
    completedAt: input.completedAt?.toISOString(),
    updatedAt: (input.completedAt ?? input.servedAt ?? input.calledAt ?? input.createdAt).toISOString(),
  };
}

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60000);
}

function createSeedState(): QueueState {
  const tickets: QueueTicket[] = [];
  const meta: Record<string, QueueMeta> = {};

  const seedPlan: Record<
    string,
    { serving: number; upNext?: number; waiting: number[]; lastSequence: number }
  > = {
    registrar: { serving: 18, upNext: 19, waiting: [20, 21, 22, 23], lastSequence: 23 },
    cashier: { serving: 18, upNext: 19, waiting: [20, 21], lastSequence: 21 },
    'student-affairs': { serving: 9, upNext: 10, waiting: [11], lastSequence: 11 },
    'id-services': { serving: 7, upNext: 8, waiting: [9, 10], lastSequence: 10 },
    guidance: { serving: 4, upNext: 5, waiting: [6], lastSequence: 6 },
    clinic: { serving: 3, upNext: 4, waiting: [], lastSequence: 4 },
  };

  for (const service of CAMPUS_SERVICES) {
    const plan = seedPlan[service.id];
    if (!plan) continue;
    meta[service.id] = { lastSequence: plan.lastSequence, updatedAt: nowIso() };

    tickets.push(
      seedTicket({
        service,
        sequence: plan.serving,
        status: 'SERVING',
        createdAt: minutesAgo(8),
        calledAt: minutesAgo(5),
        servedAt: minutesAgo(3),
      }),
    );

    if (plan.upNext) {
      tickets.push(
        seedTicket({
          service,
          sequence: plan.upNext,
          status: 'UP_NEXT',
          createdAt: minutesAgo(7),
        }),
      );
    }

    plan.waiting.forEach((sequence, index) => {
      tickets.push(
        seedTicket({
          service,
          sequence,
          status: 'WAITING',
          createdAt: minutesAgo(6 - index * 0.4),
        }),
      );
    });
  }

  const demoHistory: Array<{
    serviceId: string;
    sequence: number;
    daysAgo: number;
    requestType: string;
    requestLabel: string;
  }> = [
    {
      serviceId: 'cashier',
      sequence: 12,
      daysAgo: 5,
      requestType: 'PAYMENT',
      requestLabel: 'Tuition / fee payment',
    },
    {
      serviceId: 'registrar',
      sequence: 11,
      daysAgo: 8,
      requestType: 'COM',
      requestLabel: 'Certificate of Matriculation (COM)',
    },
    {
      serviceId: 'student-affairs',
      sequence: 6,
      daysAgo: 19,
      requestType: 'LOCAL_RENEW',
      requestLabel: 'Local scholarship — renewal',
    },
  ];

  for (const item of demoHistory) {
    const service = serviceByCode(item.serviceId);
    const created = minutesAgo(item.daysAgo * 24 * 60);
    const completed = minutesAgo(item.daysAgo * 24 * 60 - 27);
    const ticket: QueueTicket = {
      ...seedTicket({
        service,
        sequence: item.sequence,
        status: 'COMPLETED',
        ownerKey: DEMO_HISTORY_OWNER,
        name: DEMO_ACCOUNT.name,
        createdAt: created,
        calledAt: minutesAgo(item.daysAgo * 24 * 60 - 18),
        servedAt: minutesAgo(item.daysAgo * 24 * 60 - 15),
        completedAt: completed,
      }),
      isGuest: false,
      student: {
        name: DEMO_ACCOUNT.name,
        studentId: DEMO_ACCOUNT.studentId,
        email: DEMO_ACCOUNT.email,
        phone: DEMO_ACCOUNT.phone,
      },
      requestType: item.requestType,
      requestLabel: item.requestLabel,
      details: '',
    };
    tickets.push(ticket);
  }

  return { version: 3, tickets, meta };
}

function readState(): QueueState {
  if (!isBrowser()) return createSeedState();
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) {
      const seeded = createSeedState();
      writeState(seeded, false);
      return seeded;
    }
    const parsed = JSON.parse(raw) as QueueState;
    if (parsed.version !== 3 || !Array.isArray(parsed.tickets) || !parsed.meta) {
      const seeded = createSeedState();
      writeState(seeded, false);
      return seeded;
    }
    return parsed;
  } catch {
    return createSeedState();
  }
}

function writeState(state: QueueState, broadcast = true): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT));
  if (broadcast) {
    try {
      channel ??= new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'sync' });
    } catch {
      // BroadcastChannel is not available in some embedded browsers.
    }
  }
}

export function subscribeQueue(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === QUEUE_KEY) callback();
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', onStorage);
  try {
    channel ??= new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', callback);
  } catch {
    // Ignore.
  }
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

export function isActiveStatus(status: QueueStatus): boolean {
  return (
    status === 'WAITING' ||
    status === 'UP_NEXT' ||
    status === 'CALLED' ||
    status === 'SERVING'
  );
}

function activeTicketsForService(state: QueueState, serviceId: string): QueueTicket[] {
  return state.tickets
    .filter((ticket) => ticket.serviceId === serviceId && isActiveStatus(ticket.status))
    .sort((a, b) => a.sequence - b.sequence);
}

export function computeServiceQueue(
  state: QueueState,
  service: CampusService,
): ServiceQueue {
  const activeTickets = activeTicketsForService(state, service.id);
  const nowServing = activeTickets.find((ticket) => ticket.status === 'SERVING');
  const calledTicket = activeTickets.find((ticket) => ticket.status === 'CALLED');
  const upNext = activeTickets.find((ticket) => ticket.status === 'UP_NEXT');
  const waiting = activeTickets.filter((ticket) => ticket.status === 'WAITING');
  const waitingCount = activeTickets.filter((ticket) => ticket.status !== 'SERVING').length;

  return {
    serviceId: service.id,
    nowServing,
    calledTicket,
    upNext,
    waiting,
    activeTickets,
    waitingCount,
    estimatedWaitMinutes: activeTickets.length * service.avgServiceMinutes,
    updatedAt: state.meta[service.id]?.updatedAt ?? nowIso(),
  };
}

export function getServiceQueue(serviceId: string): ServiceQueue {
  const service = serviceByCode(serviceId);
  return computeServiceQueue(readState(), service);
}

export function getAllServiceQueues(): Record<string, ServiceQueue> {
  const state = readState();
  return Object.fromEntries(
    CAMPUS_SERVICES.map((service) => [service.id, computeServiceQueue(state, service)]),
  );
}

export function getTicket(ticketId: string): QueueTicket | undefined {
  return readState().tickets.find((ticket) => ticket.id === ticketId);
}

export function getActiveTickets(ownerKey: string): QueueTicket[] {
  return readState()
    .tickets.filter((ticket) => ticket.ownerKey === ownerKey && isActiveStatus(ticket.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getTicketHistory(ownerKey: string): QueueTicket[] {
  return readState()
    .tickets.filter(
      (ticket) =>
        ticket.ownerKey === ownerKey &&
        (ticket.status === 'COMPLETED' ||
          ticket.status === 'CANCELLED' ||
          ticket.status === 'SKIPPED' ||
          ticket.status === 'EXPIRED'),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getQueueView(serviceId: string, ticketId: string): {
  queue: ServiceQueue;
  ticket: QueueTicket;
  peopleAhead: number;
  position: number;
  estimatedWaitMinutes: number;
} | null {
  const service = serviceByCode(serviceId);
  const state = readState();
  const ticket = state.tickets.find((item) => item.id === ticketId);
  if (!ticket) return null;
  const queue = computeServiceQueue(state, service);
  const active = isActiveStatus(ticket.status);
  const peopleAhead = active
    ? queue.activeTickets.filter((item) => item.sequence < ticket.sequence).length
    : 0;
  return {
    queue,
    ticket,
    peopleAhead,
    position: active ? peopleAhead + 1 : 0,
    estimatedWaitMinutes: active ? peopleAhead * service.avgServiceMinutes : 0,
  };
}

export function findActiveTicketForOwner(ownerKey: string): QueueTicket | undefined {
  return getActiveTickets(ownerKey)[0];
}

export function joinQueue(input: {
  serviceId: string;
  requestType: string;
  requestLabel: string;
  details: string;
  student: { name: string; studentId: string; email?: string; phone?: string };
  isGuest: boolean;
  ownerKey: string;
}): QueueTicket {
  const service = serviceByCode(input.serviceId);
  const state = readState();

  const existing = state.tickets.find(
    (ticket) => ticket.ownerKey === input.ownerKey && isActiveStatus(ticket.status),
  );
  if (existing) {
    throw new QueueError(
      'ACTIVE_TICKET_EXISTS',
      `You already have an active queue: ${existing.displayNumber} at ${
        CAMPUS_SERVICES.find((item) => item.id === existing.serviceId)?.name ?? 'a service'
      }.`,
    );
  }

  const serviceTickets = state.tickets.filter((ticket) => ticket.serviceId === service.id);
  const highest = serviceTickets.reduce((max, ticket) => Math.max(max, ticket.sequence), 0);
  const sequence = Math.max(state.meta[service.id]?.lastSequence ?? 0, highest) + 1;
  const createdAt = nowIso();

  const ticket: QueueTicket = {
    id: crypto.randomUUID(),
    serviceId: service.id,
    displayNumber: displayNumber(service, sequence),
    sequence,
    status: 'WAITING',
    requestType: input.requestType,
    requestLabel: input.requestLabel,
    details: input.details.trim().slice(0, 300),
    student: input.student,
    isGuest: input.isGuest,
    ownerKey: input.ownerKey,
    createdAt,
    updatedAt: createdAt,
  };

  state.tickets.push(ticket);
  state.meta[service.id] = {
    lastSequence: sequence,
    updatedAt: createdAt,
    lastAdvanceAt: state.meta[service.id]?.lastAdvanceAt,
  };
  writeState(state);

  addNotification({
    ownerKey: input.ownerKey,
    kind: 'queue',
    title: "You're in the queue.",
    body: `Your ticket ${ticket.displayNumber} for ${service.name} has been created.`,
    ticketId: ticket.id,
  });

  return ticket;
}

export function cancelQueueTicket(ticketId: string, ownerKey: string): QueueTicket {
  const state = readState();
  const ticket = state.tickets.find((item) => item.id === ticketId);
  if (!ticket) throw new QueueError('TICKET_NOT_FOUND', 'We could not find that queue ticket.');
  if (ticket.ownerKey !== ownerKey) {
    throw new QueueError('TICKET_NOT_FOUND', 'We could not find that queue ticket.');
  }
  if (!isActiveStatus(ticket.status)) {
    throw new QueueError('TICKET_NOT_ACTIVE', 'This queue ticket is no longer active.');
  }

  ticket.status = 'CANCELLED';
  ticket.updatedAt = nowIso();
  ticket.completedAt = ticket.updatedAt;
  state.meta[ticket.serviceId] = {
    ...state.meta[ticket.serviceId],
    updatedAt: ticket.updatedAt,
  };
  writeState(state);

  addNotification({
    ownerKey,
    kind: 'system',
    title: 'You left the queue.',
    body: `Ticket ${ticket.displayNumber} was cancelled. You can get a new number any time.`,
    ticketId: ticket.id,
  });

  return ticket;
}

function notifyOwner(ticket: QueueTicket, service: CampusService, kind: 'upnext' | 'called' | 'completed' | 'away', extra?: string) {
  if (ticket.ownerKey === DEMO_QUEUE_OWNER) return;
  if (kind === 'upnext') {
    addNotification({
      ownerKey: ticket.ownerKey,
      kind: 'reminder',
      title: 'You’re almost up!',
      body: `${ticket.displayNumber} is next in line at ${service.name}.`,
      ticketId: ticket.id,
    });
  }
  if (kind === 'called') {
    addNotification({
      ownerKey: ticket.ownerKey,
      kind: 'called',
      title: "It's your turn!",
      body: `Please proceed to ${ticket.counter ?? 'the counter'} for ${service.name}.`,
      ticketId: ticket.id,
    });
  }
  if (kind === 'completed') {
    addNotification({
      ownerKey: ticket.ownerKey,
      kind: 'completed',
      title: 'Request completed.',
      body: `Your ${ticket.displayNumber} queue at ${service.name} has been completed.`,
      ticketId: ticket.id,
    });
  }
  if (kind === 'away') {
    addNotification({
      ownerKey: ticket.ownerKey,
      kind: 'reminder',
      title: "You're getting close.",
      body: extra ?? `${ticket.displayNumber} is moving up at ${service.name}.`,
      ticketId: ticket.id,
    });
  }
}

/**
 * Moves a queue forward one controlled step.
 * This is the prototype equivalent of a staff action. In production the same
 * transition happens through a Supabase RPC protected by staff RLS.
 */
export function advanceQueue(serviceId: string, options?: { force?: boolean }): void {
  const service = serviceByCode(serviceId);
  const state = readState();
  const meta = state.meta[service.id] ?? { lastSequence: 0, updatedAt: nowIso() };
  const now = Date.now();
  if (!options?.force && meta.lastAdvanceAt && now - meta.lastAdvanceAt < 2500) {
    return;
  }

  const active = activeTicketsForService(state, service.id);
  const oldStatuses = new Map(active.map((ticket) => [ticket.id, ticket.status]));

  const serving = active.find((ticket) => ticket.status === 'SERVING');
  if (serving) {
    serving.status = 'COMPLETED';
    serving.completedAt = nowIso();
    serving.updatedAt = serving.completedAt;
  }

  const called = active.find((ticket) => ticket.status === 'CALLED');
  if (called) {
    called.status = 'SERVING';
    called.servedAt = nowIso();
    called.updatedAt = called.servedAt;
  }

  const upNext = active.find((ticket) => ticket.status === 'UP_NEXT');
  if (upNext) {
    upNext.status = 'CALLED';
    upNext.calledAt = nowIso();
    upNext.counter = counterFor(service, upNext.sequence);
    upNext.updatedAt = upNext.calledAt;
  }

  const nextWaiting = active.find((ticket) => ticket.status === 'WAITING');
  if (nextWaiting) {
    nextWaiting.status = 'UP_NEXT';
    nextWaiting.updatedAt = nowIso();
  }

  state.meta[service.id] = {
    lastSequence: Math.max(meta.lastSequence, ...active.map((ticket) => ticket.sequence), 0),
    updatedAt: nowIso(),
    lastAdvanceAt: now,
  };
  writeState(state);

  for (const ticket of active) {
    const before = oldStatuses.get(ticket.id);
    const after = ticket.status;
    if (before === after) {
      const ahead = active.filter(
        (item) => item.sequence < ticket.sequence && isActiveStatus(item.status),
      ).length;
      if (
        after === 'WAITING' &&
        ahead <= 3 &&
        ahead > 0 &&
        !ticket.notifiedThreeAway &&
        ticket.ownerKey !== DEMO_QUEUE_OWNER
      ) {
        ticket.notifiedThreeAway = true;
        const updated = readState();
        const item = updated.tickets.find((entry) => entry.id === ticket.id);
        if (item) item.notifiedThreeAway = true;
        writeState(updated);
        notifyOwner(
          ticket,
          service,
          'away',
          `${ticket.displayNumber} is now ${ahead} student${ahead === 1 ? '' : 's'} away at ${service.name}.`,
        );
      }
      continue;
    }
    if (before === 'WAITING' || before === 'UP_NEXT') {
      if (after === 'UP_NEXT') notifyOwner(ticket, service, 'upnext');
      if (after === 'CALLED') notifyOwner(ticket, service, 'called');
    }
    if (after === 'COMPLETED') notifyOwner(ticket, service, 'completed');
  }
}

export function isAutoAdvanceEnabled(): boolean {
  if (!isBrowser()) return true;
  try {
    return window.localStorage.getItem(AUTO_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setAutoAdvanceEnabled(enabled: boolean): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTO_KEY, String(enabled));
  window.dispatchEvent(new Event(EVENT));
}

export function startQueueSimulator(): void {
  if (!isBrowser() || simulatorStarted) return;
  simulatorStarted = true;
  window.setInterval(() => {
    if (!isAutoAdvanceEnabled()) return;
    if (document.visibilityState === 'hidden') return;
    const state = readState();
    const relevantServices = new Set(
      state.tickets
        .filter(
          (ticket) =>
            isActiveStatus(ticket.status) &&
            ticket.ownerKey !== DEMO_QUEUE_OWNER,
        )
        .map((ticket) => ticket.serviceId),
    );
    for (const serviceId of relevantServices) {
      advanceQueue(serviceId);
    }
  }, 12000);
}

export function resetDemoQueue(): void {
  if (!isBrowser()) return;
  const seeded = createSeedState();
  writeState(seeded);
  window.localStorage.removeItem('sq_notifications_v1');
  window.dispatchEvent(new Event('sq:notifications-change'));
}

export function estimatedWaitLabel(minutes: number): string {
  if (minutes <= 0) return 'No wait';
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `~${hours} hr ${rest} min` : `~${hours} hr`;
}
