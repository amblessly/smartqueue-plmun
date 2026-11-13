import { Bell } from 'lucide-react';
import { BrandWordmark } from '@/components/brand/Brand';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';
import { ownerKeyFor } from '@/lib/auth/owner';
import { initials } from '@/lib/utils';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/utils';

export function MobileTopBar() {
  const { session } = useSession();
  const ownerKey = ownerKeyFor(session);
  const { unread } = useNotifications(ownerKey || undefined);
  const scrollDirection = useScrollDirection(12);

  return (
    <header
      className={cn(
        'safe-top fixed left-3 right-3 top-3 z-30 rounded-2xl border border-ink-950/10 bg-cream-50/85 px-3 py-2 shadow-float backdrop-blur-xl transition-transform duration-300 ease-out will-change-transform lg:hidden',
        scrollDirection === 'down' ? '-translate-y-[140%]' : 'translate-y-0',
      )}
    >
      <div className="flex h-11 items-center justify-between gap-3">
        <a href="/dashboard" aria-label="SmartQueue home" className="min-w-0">
          <BrandWordmark compact />
        </a>
        <div className="flex items-center gap-1.5">
          <a
            href="/notifications"
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-950/5"
          >
            <Bell size={18} strokeWidth={1.8} />
            {unread > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bamboo-700 px-1 text-[0.5625rem] font-extrabold text-cream-50 ring-2 ring-cream-50">
                {unread > 9 ? '9+' : unread}
              </span>
            ) : null}
          </a>
          <a
            href="/profile"
            aria-label="Your profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-bamboo-900 text-[0.625rem] font-extrabold tracking-wide text-cream-50"
          >
            {initials(session?.name ?? 'Student')}
          </a>
        </div>
      </div>
    </header>
  );
}