import type { CampusService, QueueServiceStatus, ServiceQueue } from '@/types';
import { IS_DEMO } from '@/lib/config';

function isWithinTypicalHours(date: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= 8 * 60 && minutes < 17 * 60;
}

export function getServiceStatus(
  _service: CampusService,
  queue?: ServiceQueue,
  now = new Date(),
): QueueServiceStatus {
  if (!IS_DEMO && !isWithinTypicalHours(now)) return 'CLOSED';
  if (queue && queue.waitingCount >= 8) return 'BUSY';
  return 'OPEN';
}

export function isServiceJoinable(service: CampusService, queue?: ServiceQueue): boolean {
  return getServiceStatus(service, queue) !== 'CLOSED';
}

export const SERVICE_STATUS_LABEL: Record<QueueServiceStatus, string> = {
  OPEN: 'Open',
  BUSY: 'Busy',
  CLOSED: 'Closed',
};

export const SERVICE_STATUS_DOT: Record<QueueServiceStatus, string> = {
  OPEN: 'bg-emerald-500',
  BUSY: 'bg-amber-500',
  CLOSED: 'bg-slate-400',
};
