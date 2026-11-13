import type { AppNotification, AppNotificationKind, NotificationPreferences } from '@/types';

const KEY = 'sq_notifications_v1';
const PREFS_KEY = 'sq_notification_prefs_v1';
const EVENT = 'sq:notifications-change';
const NEW_EVENT = 'sq:notification-new';
const CHANNEL_NAME = 'smartqueue-notifications';

let channel: BroadcastChannel | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readAll(): AppNotification[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: AppNotification[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 120)));
  window.dispatchEvent(new Event(EVENT));
  try {
    channel ??= new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: 'sync' });
  } catch {
    // BroadcastChannel is not available in some embedded browsers.
  }
}

export function listNotifications(ownerKey: string): AppNotification[] {
  return readAll()
    .filter((item) => item.ownerKey === ownerKey)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function unreadNotificationCount(ownerKey: string): number {
  return listNotifications(ownerKey).filter((item) => !item.read).length;
}

export function addNotification(input: {
  ownerKey: string;
  kind: AppNotificationKind;
  title: string;
  body: string;
  ticketId?: string;
}): AppNotification {
  const notification: AppNotification = {
    id: crypto.randomUUID(),
    ownerKey: input.ownerKey,
    kind: input.kind,
    title: input.title,
    body: input.body,
    ticketId: input.ticketId,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const items = readAll();
  items.unshift(notification);
  writeAll(items);
  if (isBrowser()) {
    window.dispatchEvent(
      new CustomEvent<AppNotification>(NEW_EVENT, { detail: notification }),
    );
  }
  return notification;
}

export function markNotificationRead(id: string): void {
  const items = readAll().map((item) => (item.id === id ? { ...item, read: true } : item));
  writeAll(items);
}

export function markAllNotificationsRead(ownerKey: string): void {
  const items = readAll().map((item) =>
    item.ownerKey === ownerKey ? { ...item, read: true } : item,
  );
  writeAll(items);
}

export function subscribeNotifications(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) callback();
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

export function subscribeNewNotifications(
  callback: (notification: AppNotification) => void,
): () => void {
  if (!isBrowser()) return () => {};
  const handler = (event: Event) => {
    callback((event as CustomEvent<AppNotification>).detail);
  };
  window.addEventListener(NEW_EVENT, handler);
  return () => window.removeEventListener(NEW_EVENT, handler);
}

export function getNotificationPreferences(ownerKey: string): NotificationPreferences {
  if (!isBrowser()) return { pushEnabled: false, remindersEnabled: true };
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, NotificationPreferences>) : {};
    return all[ownerKey] ?? { pushEnabled: false, remindersEnabled: true };
  } catch {
    return { pushEnabled: false, remindersEnabled: true };
  }
}

export function saveNotificationPreferences(
  ownerKey: string,
  preferences: NotificationPreferences,
): void {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, NotificationPreferences>) : {};
    all[ownerKey] = preferences;
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Storage may be unavailable in private mode.
  }
}

export type PushPermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

export function getPushPermission(): PushPermissionState {
  if (!isBrowser() || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestPushPermission(): Promise<PushPermissionState> {
  if (!isBrowser() || !('Notification' in window)) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

export function showBrowserNotification(notification: AppNotification): void {
  if (!isBrowser() || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const options: NotificationOptions = {
    body: notification.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: notification.id,
    data: {
      url: notification.ticketId ? `/queue/ticket/${notification.ticketId}` : '/notifications',
    },
  };

  try {
    const native = new Notification(notification.title, options);
    native.onclick = () => {
      window.focus();
      if (notification.ticketId) {
        window.location.href = `/queue/ticket/${notification.ticketId}`;
      } else {
        window.location.href = '/notifications';
      }
      native.close();
    };
  } catch {
    // Notification constructor is unsupported on some mobile browsers.
    navigator.serviceWorker?.ready
      .then((registration) =>
        registration.showNotification(notification.title, options),
      )
      .catch(() => {});
  }
}
