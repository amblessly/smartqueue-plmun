import { Clock3, Radio, Users } from 'lucide-react';
import type { CampusService, ServiceQueue } from '@/types';
import { cn, waitEstimate } from '@/lib/utils';

export function QueueStats({
  service,
  queue,
  compact = false,
  className,
}: {
  service: CampusService;
  queue?: ServiceQueue;
  compact?: boolean;
  className?: string;
}) {
  const serving = queue?.nowServing?.displayNumber ?? '—';
  const waiting = queue?.waitingCount ?? 0;
  const wait = queue?.estimatedWaitMinutes ?? 0;

  const stats = [
    {
      label: 'Now serving',
      value: serving,
      icon: Radio,
      hint: queue?.nowServing?.counter ?? 'At the counter',
    },
    {
      label: 'In line',
      value: String(waiting),
      icon: Users,
      hint: waiting === 0 ? 'No one waiting' : 'Students ahead of you',
    },
    {
      label: 'Est. wait',
      value: waitEstimate(wait),
      icon: Clock3,
      hint: `~${service.avgServiceMinutes} min each`,
    },
  ];

  return (
    <div className={cn('grid gap-2.5 sm:grid-cols-3', className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cn(
              'rounded-xl border border-ink-950/8 bg-white',
              compact ? 'px-3 py-2.5' : 'px-3.5 py-3',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.5625rem] font-extrabold uppercase tracking-[0.13em] text-ink-400">
                {stat.label}
              </span>
              <Icon size={13} className="text-bamboo-500" aria-hidden="true" />
            </div>
            <p
              className={cn(
                'mt-1 font-extrabold tracking-[-0.04em] text-ink-950 tabular',
                compact ? 'text-lg' : 'text-[1.35rem]',
              )}
            >
              {stat.value}
            </p>
            <p className="mt-0.5 truncate text-[0.5625rem] font-medium text-ink-400">{stat.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
