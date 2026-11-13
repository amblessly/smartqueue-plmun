import type { RequestType } from '@/types';
import { REQUEST_DRAFT_KEY } from '@/lib/config';

export type RequestDraft = {
  serviceId: string;
  requestType: string;
  requestLabel: string;
  details: string;
  studentName?: string;
  studentIdNumber?: string;
  contactPhone?: string;
  updatedAt: string;
};

export function saveRequestDraft(draft: RequestDraft): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REQUEST_DRAFT_KEY, JSON.stringify(draft));
}

export function getRequestDraft(serviceId: string): RequestDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(REQUEST_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as RequestDraft;
    return draft.serviceId === serviceId ? draft : null;
  } catch {
    return null;
  }
}

export function clearRequestDraft(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(REQUEST_DRAFT_KEY);
}

export function requestLabelFor(
  requestTypes: RequestType[],
  value: string,
  otherLabel = '',
): string {
  const match = requestTypes.find((item) => item.value === value);
  if (match) return match.label;
  return otherLabel.trim() || 'Other request';
}
