import {
  GraduationCap,
  HeartHandshake,
  Landmark,
  Stethoscope,
  Wallet,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';
import type { CampusService } from '@/types';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  registrar: Landmark,
  cashier: Wallet,
  'student-affairs': GraduationCap,
  'id-services': CreditCard,
  guidance: HeartHandshake,
  clinic: Stethoscope,
};

const accentMap: Record<CampusService['accent'], string> = {
  green: 'bg-bamboo-50 text-bamboo-700 ring-bamboo-100',
  gold: 'bg-amber-50 text-amber-700 ring-amber-100',
  teal: 'bg-teal-50 text-teal-700 ring-teal-100',
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
};

export function ServiceIcon({
  service,
  size = 'md',
  className,
}: {
  service: Pick<CampusService, 'id' | 'accent'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const Icon = iconMap[service.id] ?? Landmark;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl ring-1',
        accentMap[service.accent],
        size === 'sm' && 'h-9 w-9',
        size === 'md' && 'h-11 w-11',
        size === 'lg' && 'h-14 w-14 rounded-2xl',
        className,
      )}
      aria-hidden="true"
    >
      <Icon size={size === 'lg' ? 25 : size === 'sm' ? 17 : 20} strokeWidth={1.8} />
    </span>
  );
}
