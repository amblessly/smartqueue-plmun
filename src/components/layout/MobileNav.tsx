import { cn } from '@/lib/utils';
import { NAV_ITEMS, isNavActive } from '@/components/layout/nav-items';
import { usePathname } from '@/hooks/usePathname';
import { useSession } from '@/hooks/useSession';
import { useTickets } from '@/hooks/useTickets';
import { useNotifications } from '@/hooks/useNotifications';
import { ownerKeyFor } from '@/lib/auth/owner';

export function MobileNav() {
  const pathname = usePathname();
  const { session } = useSession();
  const ownerKey = ownerKeyFor(session);
  const { active } = useTickets(ownerKey || undefined);
  const { unread } = useNotifications(ownerKey || undefined);

  return (
    <nav
      aria-label="Main navigation"
      className="safe-bottom fixed inset-x-3 bottom-[max(0.65rem,env(safe-area-inset-bottom))] z-40 mx-auto lg:hidden"
      style={{ maxWidth: '28rem' }}
    >
      <div className="rounded-2xl border border-white/10 bg-bamboo-950/96 px-1.5 pb-1.5 pt-1 shadow-[0_18px_50px_-12px_rgba(7,28,20,0.65)] backdrop-blur-xl">
        <ul className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const activeItem = isNavActive(pathname, item);
            const isQueue = item.href === '/queue';
            const isAlerts = item.href === '/notifications';
            const Icon = item.icon;
            return (
              <li key={item.href} className="min-w-0">
                <a
                  href={item.href}
                  aria-current={activeItem ? 'page' : undefined}
                  className={cn(
                    'relative flex min-w-0 flex-col items-center gap-1 rounded-xl px-0.5 py-2 transition-colors duration-150',
                    activeItem
                      ? 'bg-white/10 text-cream-50'
                      : 'text-bamboo-200/55 hover:bg-white/5 hover:text-cream-100',
                  )}
                >
                  <span className="relative">
                    <Icon
                      size={19}
                      strokeWidth={activeItem ? 2.1 : 1.7}
                      aria-hidden="true"
                    />
                    {isQueue && active.length > 0 ? (
                      <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-gold-400 px-0.5 text-[0.5rem] font-extrabold text-bamboo-950 ring-2 ring-bamboo-950">
                        {active.length}
                      </span>
                    ) : null}
                    {isAlerts && unread > 0 ? (
                      <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-cream-100 px-0.5 text-[0.5rem] font-extrabold text-bamboo-900 ring-2 ring-bamboo-950">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    ) : null}
                  </span>
                  <span className="w-full truncate text-center text-[0.5625rem] font-semibold tracking-[-0.01em]">
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
