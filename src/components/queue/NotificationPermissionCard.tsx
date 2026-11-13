import { useEffect, useState } from 'react';
import { BellRing, Check, LoaderCircle, Smartphone } from 'lucide-react';
import {
  getNotificationPreferences,
  getPushPermission,
  requestPushPermission,
  saveNotificationPreferences,
  type PushPermissionState,
} from '@/lib/notifications/notifications';
import { cn } from '@/lib/utils';

export function NotificationPermissionCard({
  ownerKey,
  compact = false,
  className,
}: {
  ownerKey: string;
  compact?: boolean;
  className?: string;
}) {
  const [permission, setPermission] = useState<PushPermissionState>('default');
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerKey) return;
    setPermission(getPushPermission());
    setEnabled(getNotificationPreferences(ownerKey).pushEnabled);
  }, [ownerKey]);

  const turnOn = async () => {
    if (!ownerKey) return;
    setBusy(true);
    setMessage(null);
    const next = permission === 'granted' ? permission : await requestPushPermission();
    setPermission(next);
    if (next === 'granted') {
      saveNotificationPreferences(ownerKey, {
        ...getNotificationPreferences(ownerKey),
        pushEnabled: true,
      });
      setEnabled(true);
      setMessage('Alerts are on for this device.');
    } else if (next === 'denied') {
      setMessage('Notifications are blocked. You can allow them in your browser settings.');
    } else if (next === 'unsupported') {
      setMessage('This browser does not support notifications. In-app updates still work.');
    }
    setBusy(false);
  };

  const turnOff = () => {
    if (!ownerKey) return;
    saveNotificationPreferences(ownerKey, {
      ...getNotificationPreferences(ownerKey),
      pushEnabled: false,
    });
    setEnabled(false);
    setMessage('Alerts are off. You can turn them back on any time.');
  };

  if (!ownerKey) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-bamboo-900/10 bg-bamboo-900 text-cream-50',
        compact ? 'p-4' : 'p-5',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-bamboo-200">
          {enabled ? <Check size={18} /> : <BellRing size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn('font-bold tracking-[-0.02em]', compact ? 'text-sm' : 'text-[0.9375rem]')}>
            {enabled ? 'Alerts are on' : 'Know before it’s your turn'}
          </p>
          <p className={cn('mt-1 leading-relaxed text-cream-100/65', compact ? 'text-[0.6875rem]' : 'text-xs')}>
            {enabled
              ? 'We’ll notify you when you’re almost up and when your number is called.'
              : 'Turn on alerts so you can step away from the line without missing your number.'}
          </p>
        </div>
        {enabled ? (
          <button
            type="button"
            onClick={turnOff}
            className="shrink-0 rounded-lg border border-white/20 px-2.5 py-1.5 text-[0.625rem] font-bold text-cream-100 transition-colors hover:bg-white/10"
          >
            Turn off
          </button>
        ) : (
          <button
            type="button"
            onClick={turnOn}
            disabled={busy || permission === 'unsupported'}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-cream-50 px-3 py-2 text-[0.625rem] font-bold text-bamboo-900 transition-colors hover:bg-white disabled:opacity-50"
          >
            {busy ? (
              <LoaderCircle size={13} className="animate-[spin_0.8s_linear_infinite]" />
            ) : (
              <Smartphone size={13} />
            )}
            Turn on
          </button>
        )}
      </div>
      {message ? (
        <p className="mt-2.5 text-[0.625rem] font-medium leading-relaxed text-bamboo-200" role="status">
          {message}
        </p>
      ) : null}
      {permission === 'denied' && !message ? (
        <p className="mt-2.5 text-[0.625rem] font-medium leading-relaxed text-bamboo-200">
          Notifications are blocked in this browser. In-app updates will still appear.
        </p>
      ) : null}
    </div>
  );
}
