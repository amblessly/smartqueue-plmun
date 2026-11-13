import { useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { ownerKeyFor } from '@/lib/auth/owner';
import {
  getNotificationPreferences,
  getPushPermission,
  showBrowserNotification,
  subscribeNewNotifications,
} from '@/lib/notifications/notifications';
import { queueService } from '@/lib/queue/queue-service';

export function NotificationBridge() {
  const { session } = useSession();
  const ownerKey = ownerKeyFor(session);

  useEffect(() => {
    queueService.startSimulator();
  }, []);

  useEffect(() => {
    if (!ownerKey) return;
    return subscribeNewNotifications((notification) => {
      if (notification.ownerKey !== ownerKey) return;
      const preferences = getNotificationPreferences(ownerKey);
      if (!preferences.pushEnabled) return;
      if (!preferences.remindersEnabled && notification.kind === 'reminder') return;
      if (getPushPermission() !== 'granted') return;
      showBrowserNotification(notification);
    });
  }, [ownerKey]);

  return null;
}
