export type QueueStatus =
  | 'WAITING'
  | 'UP_NEXT'
  | 'CALLED'
  | 'SERVING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SKIPPED'
  | 'EXPIRED';

export type ActiveQueueStatus = Extract<
  QueueStatus,
  'WAITING' | 'UP_NEXT' | 'CALLED' | 'SERVING'
>;

export type TicketStudent = {
  name: string;
  studentId: string;
  email?: string;
  phone?: string;
};

export type QueueTicket = {
  id: string;
  serviceId: string;
  displayNumber: string;
  sequence: number;
  status: QueueStatus;
  requestType: string;
  requestLabel: string;
  details: string;
  student: TicketStudent;
  isGuest: boolean;
  ownerKey: string;
  accessToken?: string;
  counter?: string;
  createdAt: string;
  calledAt?: string;
  servedAt?: string;
  completedAt?: string;
  updatedAt: string;
  notifiedThreeAway?: boolean;
};

export type ServiceQueue = {
  serviceId: string;
  nowServing?: QueueTicket;
  calledTicket?: QueueTicket;
  upNext?: QueueTicket;
  waiting: QueueTicket[];
  activeTickets: QueueTicket[];
  waitingCount: number;
  estimatedWaitMinutes: number;
  updatedAt: string;
};

export type QueueView = {
  queue: ServiceQueue;
  ticket: QueueTicket;
  peopleAhead: number;
  position: number;
  estimatedWaitMinutes: number;
};

export type RequestType = {
  value: string;
  label: string;
  hint?: string;
};

export type ServiceHours = {
  label: string;
  days: string;
  time: string;
  verified: boolean;
  note?: string;
};

export type CampusService = {
  id: string;
  code: string;
  prefix: string;
  name: string;
  office: string;
  description: string;
  location: string;
  phoneExtension: string;
  hours: ServiceHours;
  counterCount: number;
  avgServiceMinutes: number;
  requestTypes: RequestType[];
  requirements: string[];
  notes?: string[];
  accent: 'green' | 'gold' | 'blue' | 'teal' | 'rose' | 'violet';
};

export type JoinQueueInput = {
  serviceId: string;
  requestType: string;
  requestLabel: string;
  details: string;
  student: TicketStudent;
  isGuest: boolean;
  ownerKey: string;
};

export type AppNotificationKind =
  | 'queue'
  | 'reminder'
  | 'called'
  | 'completed'
  | 'system';

export type AppNotification = {
  id: string;
  ownerKey: string;
  kind: AppNotificationKind;
  title: string;
  body: string;
  ticketId?: string;
  createdAt: string;
  read: boolean;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  studentId?: string;
  phone?: string;
  course?: string;
  yearLevel?: string;
  preferredServices: string[];
  onboardingComplete: boolean;
  isGuest: boolean;
  mode: 'demo' | 'supabase';
};

export type NotificationPreferences = {
  pushEnabled: boolean;
  remindersEnabled: boolean;
};

export type QueueServiceStatus = 'OPEN' | 'BUSY' | 'CLOSED';
