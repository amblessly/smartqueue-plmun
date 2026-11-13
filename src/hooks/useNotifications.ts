import { useCallback, useEffect, useState } from 'react';
import type { AppNotification } from '@/types';
import {
  listNotifications,
  subscribeNotifications,
  unreadNotificationCount,
} from '@/lib/notifications/notifications';

export function useNotifications(ownerKey: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(() => {
    if (!ownerKey) {
      setNotifications([]);
      setUnread(0);
      return;
    }
    setNotifications(listNotifications(ownerKey));
    setUnread(unreadNotificationCount(ownerKey));
  }, [ownerKey]);

  useEffect(() => {
    refresh();
    return subscribeNotifications(refresh);
  }, [refresh]);

  return { notifications, unread, refresh };
}
