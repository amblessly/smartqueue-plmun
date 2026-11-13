import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  BellRing,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Info,
  LoaderCircle,
  Settings2,
  Ticket,
  Volume2,
} from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNotifications } from '@/hooks/useNotifications';
import { useSession } from '@/hooks/useSession';
import { ownerKeyFor } from '@/lib/auth/owner';
import {
  getNotificationPreferences,
  getPushPermission,
  markAllNotificationsRead,
  markNotificationRead,
  requestPushPermission,
  saveNotificationPreferences,
  type PushPermissionState,
} from '@/lib/notifications/notifications';
import type { AppNotification, AppNotificationKind } from '@/types';
import { cn, relativeTime } from '@/lib/utils';

const kindStyles: Record<
  AppNotificationKind,
  { icon: typeof Bell; wrap: string; label: string }
> = {
  queue: { icon: Ticket, wrap: 'bg-bamboo-50 text-bamboo-700 ring-bamboo-100', label: 'Queue' },
  reminder: { icon: BellRing, wrap: 'bg-amber-50 text-amber-700 ring-amber-100', label: 'Reminder' },
  called: { icon: Volume2, wrap: 'bg-emerald-50 text-emerald-700 ring-emerald-100', label: 'Your turn' },
  completed: {
    icon: CheckCircle2,
    wrap: 'bg-bamboo-50 text-bamboo-700 ring-bamboo-100',
    label: 'Completed',
  },
  system: { icon: Info, wrap: 'bg-slate-100 text-slate-600 ring-slate-200', label: 'System' },
};

function dayLabel(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return new Intl.DateTimeFormat('en-PH', { month: 'long', day: 'numeric' }).format(date);
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-50',
        checked ? 'border-bamboo-700 bg-bamboo-700' : 'border-ink-950/15 bg-cream-200',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-5.5' : 'translate-x-0.5',
        )}
        aria-hidden="true"
      />
    </button>
  );
}

export function NotificationsPage() {
  const { session } = useSession();
  const ownerKey = ownerKeyFor(session);
  const { notifications, unread, refresh } = useNotifications(ownerKey || undefined);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [permission, setPermission] = useState<PushPermissionState>('default');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerKey) return;
    const prefs = getNotificationPreferences(ownerKey);
    setPushEnabled(prefs.pushEnabled);
    setRemindersEnabled(prefs.remindersEnabled);
    setPermission(getPushPermission());
  }, [ownerKey]);

  const visible = useMemo(
    () => (filter === 'unread' ? notifications.filter((item) => !item.read) : notifications),
    [filter, notifications],
  );

  const groups = useMemo(() => {
    const map = new Map<string, AppNotification[]>();
    for (const item of visible) {
      const key = dayLabel(item.createdAt);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [visible]);

  const markAll = () => {
    if (!ownerKey) return;
    markAllNotificationsRead(ownerKey);
    refresh();
  };

  const togglePush = async () => {
    if (!ownerKey) return;
    setMessage(null);
    if (pushEnabled) {
      const next = { ...getNotificationPreferences(ownerKey), pushEnabled: false };
      saveNotificationPreferences(ownerKey, next);
      setPushEnabled(false);
      setMessage('Device alerts are off.');
      return;
    }

    setBusy(true);
    const nextPermission = permission === 'granted' ? permission : await requestPushPermission();
    setPermission(nextPermission);
    if (nextPermission === 'granted') {
      const next = { ...getNotificationPreferences(ownerKey), pushEnabled: true };
      saveNotificationPreferences(ownerKey, next);
      setPushEnabled(true);
      setMessage('Device alerts are on.');
    } else if (nextPermission === 'denied') {
      setMessage('Notifications are blocked in your browser settings.');
    } else if (nextPermission === 'unsupported') {
      setMessage('This browser does not support device notifications.');
    }
    setBusy(false);
  };

  const toggleReminders = () => {
    if (!ownerKey) return;
    const next = {
      ...getNotificationPreferences(ownerKey),
      remindersEnabled: !remindersEnabled,
    };
    saveNotificationPreferences(ownerKey, next);
    setRemindersEnabled(next.remindersEnabled);
  };

  if (!session) return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/home';
    }
  };

  return (
    <>
      <div className="mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-950/10 bg-white px-3.5 py-2 text-[0.75rem] font-semibold text-ink-700 shadow-soft transition-colors hover:bg-cream-50"
        >
          <ArrowLeft size={15} aria-hidden="true" /> Back
        </button>
      </div>
      <PageHeader
        eyebrow="Notifications"
        title="What’s happening with your queue."
        description="Updates about your place in line, your turn, and completed requests. In-app notifications always work."
        actions={
          notifications.length > 0 ? (
            <button
              type="button"
              onClick={markAll}
              disabled={unread === 0}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-ink-950/10 bg-white px-3.5 text-[0.75rem] font-semibold text-ink-700 shadow-soft transition-colors hover:bg-cream-50 disabled:opacity-50"
            >
              <CheckCheck size={15} aria-hidden="true" />
              Mark all read
            </button>
          ) : null
        }
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-xl border border-ink-950/8 bg-white p-1 shadow-soft" role="group" aria-label="Filter notifications">
              <button
                type="button"
                onClick={() => setFilter('all')}
                aria-pressed={filter === 'all'}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-[0.6875rem] font-bold transition-colors',
                  filter === 'all' ? 'bg-bamboo-900 text-cream-50' : 'text-ink-500 hover:text-ink-900',
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                aria-pressed={filter === 'unread'}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[0.6875rem] font-bold transition-colors',
                  filter === 'unread' ? 'bg-bamboo-900 text-cream-50' : 'text-ink-500 hover:text-ink-900',
                )}
              >
                Unread
                {unread > 0 ? (
                  <span
                    className={cn(
                      'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.5rem] font-extrabold',
                      filter === 'unread' ? 'bg-cream-50 text-bamboo-900' : 'bg-gold-100 text-gold-700',
                    )}
                  >
                    {unread > 9 ? '9+' : unread}
                  </span>
                ) : null}
              </button>
            </div>
            <p className="text-[0.625rem] font-medium text-ink-400" aria-live="polite">
              {visible.length} {visible.length === 1 ? 'notification' : 'notifications'}
            </p>
          </div>

          <div className="mt-3">
            {visible.length === 0 ? (
              <EmptyState
                icon={<Bell size={22} />}
                title={filter === 'unread' ? 'Nothing unread' : 'No notifications yet'}
                description={
                  filter === 'unread'
                    ? 'You’re all caught up. Switch to All to see older updates.'
                    : 'Queue updates will appear here when you join a line and when your number gets close.'
                }
                action={
                  filter === 'unread' ? (
                    <button
                      type="button"
                      onClick={() => setFilter('all')}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-bamboo-900 px-4 text-xs font-bold text-cream-50 hover:bg-bamboo-800"
                    >
                      Show all notifications
                    </button>
                  ) : (
                    <a
                      href="/services"
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-bamboo-900 px-4 text-xs font-bold text-cream-50 hover:bg-bamboo-800"
                    >
                      Browse services
                    </a>
                  )
                }
              />
            ) : (
              <div className="space-y-5">
                {groups.map(([day, items]) => (
                  <section key={day}>
                    <h2 className="px-1 text-[0.625rem] font-extrabold uppercase tracking-[0.13em] text-ink-400">
                      {day}
                    </h2>
                    <ul className="mt-2 space-y-2">
                      {items.map((notification) => {
                        const style = kindStyles[notification.kind];
                        const Icon = style.icon;
                        const href = notification.ticketId
                          ? `/queue/ticket/${notification.ticketId}`
                          : '/services';
                        return (
                          <li key={notification.id}>
                            <a
                              href={href}
                              onClick={() => {
                                markNotificationRead(notification.id);
                                refresh();
                              }}
                              className={cn(
                                'group flex items-start gap-3 rounded-xl border bg-white p-3.5 shadow-soft transition-all hover:-translate-y-px hover:shadow-card sm:p-4',
                                notification.read ? 'border-ink-950/8 opacity-80' : 'border-bamboo-900/15',
                              )}
                            >
                              <span
                                className={cn(
                                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1',
                                  style.wrap,
                                )}
                              >
                                <Icon size={16} aria-hidden="true" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-bold leading-snug text-ink-950">
                                    {notification.title}
                                  </p>
                                  {!notification.read ? (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-bamboo-600" aria-label="Unread" />
                                  ) : null}
                                </div>
                                <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-500">
                                  {notification.body}
                                </p>
                                <div className="mt-1.5 flex items-center gap-2">
                                  <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                                    {style.label}
                                  </span>
                                  <span className="text-[0.5625rem] text-ink-300">·</span>
                                  <span className="text-[0.5625rem] text-ink-400">
                                    {relativeTime(notification.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight
                                size={15}
                                className="mt-1 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-bamboo-600"
                                aria-hidden="true"
                              />
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-soft sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-xs font-extrabold tracking-[-0.01em] text-ink-950">
                <Settings2 size={14} className="text-bamboo-600" aria-hidden="true" />
                Alert settings
              </h2>
              <span className="rounded-full bg-cream-100 px-2 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.1em] text-ink-400">
                This device
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.75rem] font-bold text-ink-900">Device notifications</p>
                  <p className="mt-0.5 text-[0.625rem] leading-relaxed text-ink-500">
                    Show a browser notification when your number moves.
                  </p>
                </div>
                <Toggle
                  checked={pushEnabled}
                  onChange={togglePush}
                  disabled={busy || permission === 'unsupported'}
                  label="Device notifications"
                />
              </div>

              <div className="h-px bg-ink-950/6" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.75rem] font-bold text-ink-900">Reminders</p>
                  <p className="mt-0.5 text-[0.625rem] leading-relaxed text-ink-500">
                    Nudges when you’re a few students away from your turn.
                  </p>
                </div>
                <Toggle
                  checked={remindersEnabled}
                  onChange={toggleReminders}
                  label="Queue reminders"
                />
              </div>
            </div>

            {busy ? (
              <p className="mt-3 flex items-center gap-1.5 text-[0.625rem] text-ink-400" role="status">
                <LoaderCircle size={12} className="animate-[spin_0.8s_linear_infinite]" />
                Updating permission…
              </p>
            ) : null}
            {message ? (
              <p className="mt-3 rounded-lg bg-cream-50 px-2.5 py-2 text-[0.625rem] font-medium text-ink-600" role="status">
                {message}
              </p>
            ) : null}
            {permission === 'denied' ? (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[0.625rem] leading-relaxed text-amber-900">
                Device notifications are blocked. Allow them in your browser site settings to turn
                this on.
              </p>
            ) : null}

            <p className="mt-4 border-t border-ink-950/6 pt-3 text-[0.5625rem] leading-relaxed text-ink-400">
              In-app notifications are always available. SmartQueue does not send email or SMS in
              this prototype.
            </p>
          </div>

          <div className="rounded-xl border border-ink-950/8 bg-cream-100/70 p-4">
            <p className="flex items-center gap-1.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-ink-400">
              <BellRing size={11} aria-hidden="true" /> Five alerts per queue
            </p>
            <ul className="mt-2 space-y-1.5 text-[0.625rem] leading-relaxed text-ink-500">
              <li>When your ticket is created.</li>
              <li>When you’re a few students away.</li>
              <li>When you’re next in line.</li>
              <li>When your number is called.</li>
              <li>When the request is completed.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
            <p className="text-[0.5625rem] font-extrabold uppercase tracking-[0.12em] text-amber-800">
              Prototype
            </p>
            <p className="mt-1 text-[0.625rem] leading-relaxed text-amber-900/80">
              Queue events are simulated on this device. Alerts only appear while the browser
              allows them.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
