import { ChevronRight, Ticket } from 'lucide-react';
import { BrandWordmark } from '@/components/brand/Brand';
import { NAV_ITEMS, OfficialSiteLink, isNavActive } from '@/components/layout/nav-items';
import { usePathname } from '@/hooks/usePathname';
import { useSession } from '@/hooks/useSession';
import { useTickets } from '@/hooks/useTickets';
import { useNotifications } from '@/hooks/useNotifications';
import { ownerKeyFor } from '@/lib/auth/owner';
import { IS_DEMO } from '@/lib/config';
import { cn, initials } from '@/lib/utils';

export function DesktopSidebar() {
  const pathname = usePathname();
  const { session } = useSession();
  const ownerKey = ownerKeyFor(session);
  const { active } = useTickets(ownerKey || undefined);
  const { unread } = useNotifications(ownerKey || undefined);
  const activeTicket = active[0];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] flex-col border-r border-ink-950/8 bg-cream-50 lg:flex">
      <div className="px-6 pb-6 pt-7">
        <a href="/dashboard" aria-label="SmartQueue home" className="inline-flex">
          <BrandWordmark />
        </a>
        <p className="mt-5 flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-ink-400">
          <img src="/plmun-seal.jpg" alt="" width="18" height="19" className="h-[18px] w-auto" />
          PLMun campus services
        </p>
      </div>

      <nav className="flex-1 px-3.5" aria-label="Main navigation">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const activeItem = isNavActive(pathname, item);
            const isQueue = item.href === '/queue';
            const isAlerts = item.href === '/notifications';
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={activeItem ? 'page' : undefined}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150',
                    activeItem
                      ? 'bg-bamboo-900 text-cream-50 shadow-[0_10px_24px_-16px_rgba(7,28,20,0.8)]'
                      : 'text-ink-700 hover:bg-ink-950/5 hover:text-ink-950',
                  )}
                >
                  <Icon
                    size={18}
                    strokeWidth={activeItem ? 2 : 1.8}
                    className={cn(!activeItem && 'text-ink-400 group-hover:text-ink-700')}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{item.label}</span>
                  {isQueue && active.length > 0 ? (
                    <span
                      className={cn(
                        'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.625rem] font-extrabold',
                        activeItem ? 'bg-cream-50 text-bamboo-900' : 'bg-gold-100 text-gold-700',
                      )}
                    >
                      {active.length}
                    </span>
                  ) : null}
                  {isAlerts && unread > 0 ? (
                    <span
                      className={cn(
                        'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.625rem] font-extrabold',
                        activeItem ? 'bg-cream-50 text-bamboo-900' : 'bg-bamboo-100 text-bamboo-800',
                      )}
                    >
                      {unread > 9 ? '9+' : unread}
                    </span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>

        {activeTicket ? (
          <a
            href={`/queue/ticket/${activeTicket.id}`}
            className="mt-5 block rounded-2xl border border-bamboo-900/10 bg-white p-3.5 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow text-[0.5625rem] text-bamboo-600">Active queue</span>
              <Ticket size={14} className="text-bamboo-600" />
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div>
                <p className="text-xl font-extrabold tracking-[-0.04em] text-ink-950">
                  {activeTicket.displayNumber}
                </p>
                <p className="mt-0.5 truncate text-[0.6875rem] font-medium text-ink-500">
                  {activeTicket.status === 'UP_NEXT'
                    ? 'Up next'
                    : activeTicket.status === 'CALLED'
                      ? `Proceed to ${activeTicket.counter ?? 'counter'}`
                      : activeTicket.status === 'SERVING'
                        ? 'Being served'
                        : 'Waiting in line'}
                </p>
              </div>
            </div>
          </a>
        ) : null}
      </nav>

      <div className="space-y-3 border-t border-ink-950/8 p-4">
        <a
          href="/profile"
          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-ink-950/5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bamboo-100 text-xs font-extrabold text-bamboo-800">
            {initials(session?.name ?? 'Student')}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-ink-900">
              {session?.name ?? 'Student'}
            </span>
            <span className="mt-0.5 block truncate text-[0.625rem] text-ink-400">
              {session?.isGuest ? 'Guest session' : session?.email ?? 'Not signed in'}
            </span>
          </span>
        </a>
        <div className="flex items-center justify-between px-2">
          <OfficialSiteLink />
          {IS_DEMO ? (
            <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-ink-500">
              Prototype
            </span>
          ) : null}
        </div>
        <span className="sr-only">
          {unread > 0 ? `${unread} unread notifications` : 'No unread notifications'}
        </span>
      </div>
    </aside>
  );
}
