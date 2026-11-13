import { cn } from '@/lib/utils';

type BrandMarkProps = {
  className?: string;
  size?: number;
  title?: string;
};

export function BrandMark({ className, size = 36, title }: BrandMarkProps) {
  return (
    <img
      src="/smartqueue-logo.png"
      alt={title ?? "SmartQueue logo"}
      className={cn('shrink-0 object-contain', className)}
      style={{ width: size, height: size }}
    />
  );
}

export function BrandWordmark({
  light = false,
  compact = false,
  className,
}: {
  light?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandMark size={compact ? 30 : 36} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'text-[1.05rem] font-extrabold tracking-[-0.035em]',
            light ? 'text-white' : 'text-ink-950',
          )}
        >
          SmartQueue
        </span>
        {!compact ? (
          <span
            className={cn(
              'mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em]',
              light ? 'text-white' : 'text-ink-400',
            )}
          >
            for PLMun
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function PlmunIdentifier({
  light = false,
  showSeal = true,
  className,
}: {
  light?: boolean;
  showSeal?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      {showSeal ? (
        <img
          src="/plmun-seal.jpg"
          alt=""
          width="34"
          height="35"
          className="h-8 w-auto object-contain"
          loading="lazy"
        />
      ) : null}
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            'text-[0.5625rem] font-bold uppercase tracking-[0.16em]',
            light ? 'text-white' : 'text-ink-400',
          )}
        >
          Pamantasan ng Lungsod ng Muntinlupa
        </span>
        <span
          className={cn(
            'text-[0.6875rem] font-semibold',
            light ? 'text-white' : 'text-ink-700',
          )}
        >
          PLMun campus services
        </span>
      </span>
    </span>
  );
}
