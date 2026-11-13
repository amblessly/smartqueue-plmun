import {
  ArrowUpRight,
  Bell,
  Home,
  LayoutGrid,
  Ticket,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: Home,
    match: (pathname) => pathname === '/dashboard' || pathname === '/',
  },
  {
    href: '/services',
    label: 'Services',
    icon: LayoutGrid,
    match: (pathname) =>
      pathname.startsWith('/services') || pathname.startsWith('/queue/request'),
  },
  {
    href: '/queue',
    label: 'My Queue',
    icon: Ticket,
    match: (pathname) => pathname === '/queue' || pathname.startsWith('/queue/ticket'),
  },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
  return item.match(pathname);
}

export function OfficialSiteLink({ className }: { className?: string }) {
  return (
    <a
      href="https://plmun.edu.ph/"
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition-colors hover:text-bamboo-700',
        className,
      )}
    >
      Official PLMun website
      <ArrowUpRight size={13} aria-hidden="true" />
    </a>
  );
}
